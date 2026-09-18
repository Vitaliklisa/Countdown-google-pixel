import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";
import { buildEventVisibilityWhereClause } from "./events.pure";

const createEventSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(280),
  at: z.string().min(1),
});

export const listEvents = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const whereClause = buildEventVisibilityWhereClause("$1", "$2");

    const rows = await sql.query<Record<string, unknown>>(
      `
        SELECT e.*,
               (SELECT json_agg(p.*) FROM event_participants p WHERE p."eventId" = e.id) as participants
        FROM events e
        WHERE ${whereClause}
        ORDER BY e.at ASC
      `,
      [context.userId, context.userId],
    );
    return rows as any;
  });

export const createEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createEventSchema)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await sql.query(
      `INSERT INTO events (id, title, description, at, "createdBy", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, data.title, data.description, data.at, context.userId, now, now]
    );

    // Also add creator as an admin participant
    await sql.query(
      `INSERT INTO event_participants ("eventId", "userId", role, "inviteStatus")
       VALUES ($1, $2, $3, $4)`,
      [id, context.userId, 'admin', 'accepted']
    );

    return { id };
  });

export const updateEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({
    id: z.string(),
    title: z.string().min(1).max(80),
    description: z.string().max(280),
    at: z.string().min(1),
  }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();

    // Check if user is admin or editor
    const perms = await sql`
      SELECT role FROM event_participants
      WHERE "eventId" = ${data.id} AND "userId" = ${context.userId}
    `;

    const role = perms[0]?.role;
    if (role !== 'admin' && role !== 'editor') {
      throw new Error("Unauthorized: Only admins and editors can edit events.");
    }

    const now = new Date().toISOString();
    await sql.query(
      `UPDATE events SET title = $1, description = $2, at = $3, "updatedAt" = $4
       WHERE id = $5`,
      [data.title, data.description, data.at, now, data.id]
    );

    return { success: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();

    // Check if user is admin
    const perms = await sql`
      SELECT role FROM event_participants
      WHERE "eventId" = ${data.id} AND "userId" = ${context.userId}
    `;

    if (perms[0]?.role !== 'admin') {
      throw new Error("Unauthorized: Only admins can delete events.");
    }

    const now = new Date().toISOString();
    await sql.query(
      `UPDATE events SET "deletedAt" = $1 WHERE id = $2`,
      [now, data.id]
    );

    return { success: true };
  });

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({
    eventId: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'editor', 'viewer']),
  }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();

    // Check if user is admin
    const perms = await sql`
      SELECT role FROM event_participants
      WHERE "eventId" = ${data.eventId} AND "userId" = ${context.userId}
    `;

    if (perms[0]?.role !== 'admin') {
      throw new Error("Unauthorized: Only admins can invite users.");
    }

    // Check if user already exists
    const users = await sql`SELECT id FROM "user" WHERE email = ${data.email}`;
    const targetUserId = users[0]?.id;

    if (targetUserId) {
      // Add directly to participants as pending
      await sql.query(
        `INSERT INTO event_participants ("eventId", "userId", role, "inviteStatus")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("eventId", "userId") DO UPDATE SET role = $3`,
        [data.eventId, targetUserId, data.role, 'pending']
      );
    } else {
      // Create invitation
      const inviteId = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await sql.query(
        `INSERT INTO invitations (id, "eventId", "invitedBy", "inviteeEmail", role, "expiresAt")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [inviteId, data.eventId, context.userId, data.email, data.role, expiresAt.toISOString()]
      );
    }

    return { success: true };
  });

export const getInvitations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    // Get user's email first
    const user = await sql`SELECT email FROM "user" WHERE id = ${context.userId}`;
    const email = user[0]?.email;
    if (!email) return [];

    const rows = await sql`
      SELECT i.*, e.title as "eventTitle"
      FROM invitations i
      JOIN events e ON i."eventId" = e.id
      WHERE i."inviteeEmail" = ${email} AND i.status = 'pending'
    `;
    return rows as any;
  });
/**
 * Accept a pending invitation addressed to the signed-in user's email.
 *
 * This is what turns "shared across devices" on: an invited account was written
 * to `invitations` (by email, possibly before that account existed); accepting
 * inserts a real `event_participants` row so `listEvents` starts returning the
 * event on every device that account signs in from.
 *
 * Security: the invitation is matched by the CALLER's verified email and its own
 * id — never by anything client-supplied — so a user can only accept an invite
 * addressed to them. Rejected/expired invites are refused.
 */
export const acceptInvitation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ invitationId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();

    const users = await sql`SELECT email FROM "user" WHERE id = ${context.userId}`;
    const email = users[0]?.email;
    if (!email) throw new Error("Unauthorized: no account email.");

    const invites = await sql`
      SELECT "eventId", role, status, "expiresAt"
      FROM invitations
      WHERE id = ${data.invitationId} AND "inviteeEmail" = ${email}
    `;
    const invite = invites[0] as
      | { eventId: string; role: string; status: string; expiresAt: string }
      | undefined;
    if (!invite) throw new Error("Invitation not found for this account.");
    if (invite.status !== "pending") throw new Error("Invitation is no longer pending.");
    if (new Date(invite.expiresAt).getTime() < Date.now()) throw new Error("Invitation has expired.");

    // Join the event as an accepted participant (idempotent on re-accept).
    await sql.query(
      `INSERT INTO event_participants ("eventId", "userId", role, "inviteStatus")
       VALUES ($1, $2, $3, 'accepted')
       ON CONFLICT ("eventId", "userId") DO UPDATE SET role = $3, "inviteStatus" = 'accepted'`,
      [invite.eventId, context.userId, invite.role],
    );
    await sql.query(`UPDATE invitations SET status = 'accepted' WHERE id = $1`, [
      data.invitationId,
    ]);

    return { success: true, eventId: invite.eventId };
  });

/** Decline a pending invitation addressed to the signed-in user. */
export const rejectInvitation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ invitationId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const users = await sql`SELECT email FROM "user" WHERE id = ${context.userId}`;
    const email = users[0]?.email;
    if (!email) throw new Error("Unauthorized: no account email.");

    await sql.query(
      `UPDATE invitations SET status = 'rejected'
       WHERE id = $1 AND "inviteeEmail" = $2 AND status = 'pending'`,
      [data.invitationId, email],
    );
    return { success: true };
  });
