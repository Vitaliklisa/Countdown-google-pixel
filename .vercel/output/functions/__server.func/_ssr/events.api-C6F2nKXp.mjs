import { r as createServerFn } from "./ssr.mjs";
import { Qt as string, Vt as _enum, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-DV8XdeM_.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-FHwo2eyz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events.api-C6F2nKXp.js
/**
* Pure SQL-building helpers for the events API.
*
* Dependency-free on purpose: `node --test` (how this project runs unit tests)
* resolves nothing but relative paths — it has no tsconfig-path or package
* alias support — so a helper that lives in a module importing `@/lib/db` or
* `zod` cannot be unit-tested. Keeping the string-building here makes the
* visibility rule testable in isolation.
*/
/**
* The WHERE clause restricting events to those a user may see: ones they
* created OR are a participant of, **and** that are not soft-deleted.
*
* The parentheses around the OR are load-bearing: bare `a OR b AND c` binds the
* AND to `b` only, so soft-deleted events the user created would leak back in.
*/
function buildEventVisibilityWhereClause(creatorUserIdParam, participantUserIdParam) {
	return `(
      e."createdBy" = ${creatorUserIdParam}
      OR EXISTS (
        SELECT 1
        FROM event_participants ep
        WHERE ep."eventId" = e.id
          AND ep."userId" = ${participantUserIdParam}
      )
    ) AND e."deletedAt" IS NULL`;
}
var createEventSchema = object({
	title: string().min(1).max(80),
	description: string().max(280),
	at: string().min(1)
});
var listEvents_createServerFn_handler = createServerRpc({
	id: "8afbac895d59a41477d32649fe71a1da0c8c6fd440647bc3bc09500df9664b82",
	name: "listEvents",
	filename: "src/lib/events.api.ts"
}, (opts) => listEvents.__executeServer(opts));
var listEvents = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listEvents_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const whereClause = buildEventVisibilityWhereClause("$1", "$2");
	return await sql.query(`
        SELECT e.*,
               (SELECT json_agg(p.*) FROM event_participants p WHERE p."eventId" = e.id) as participants
        FROM events e
        WHERE ${whereClause}
        ORDER BY e.at ASC
      `, [context.userId, context.userId]);
});
var createEvent_createServerFn_handler = createServerRpc({
	id: "f21ae7d2695373c2f548b37306591c539f7a5e8e94f571522c2712a09232e856",
	name: "createEvent",
	filename: "src/lib/events.api.ts"
}, (opts) => createEvent.__executeServer(opts));
var createEvent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(createEventSchema).handler(createEvent_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const id = crypto.randomUUID();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql.query(`INSERT INTO events (id, title, description, at, "createdBy", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
		id,
		data.title,
		data.description,
		data.at,
		context.userId,
		now,
		now
	]);
	await sql.query(`INSERT INTO event_participants ("eventId", "userId", role, "inviteStatus")
       VALUES ($1, $2, $3, $4)`, [
		id,
		context.userId,
		"admin",
		"accepted"
	]);
	return { id };
});
var updateEvent_createServerFn_handler = createServerRpc({
	id: "bf58e941e166b21a858534c9bd7fe29ef1d4e42b9ca8ecf75787328d176b896e",
	name: "updateEvent",
	filename: "src/lib/events.api.ts"
}, (opts) => updateEvent.__executeServer(opts));
var updateEvent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	title: string().min(1).max(80),
	description: string().max(280),
	at: string().min(1)
})).handler(updateEvent_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const role = (await sql`
      SELECT role FROM event_participants
      WHERE "eventId" = ${data.id} AND "userId" = ${context.userId}
    `)[0]?.role;
	if (role !== "admin" && role !== "editor") throw new Error("Unauthorized: Only admins and editors can edit events.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql.query(`UPDATE events SET title = $1, description = $2, at = $3, "updatedAt" = $4
       WHERE id = $5`, [
		data.title,
		data.description,
		data.at,
		now,
		data.id
	]);
	return { success: true };
});
var deleteEvent_createServerFn_handler = createServerRpc({
	id: "fda746ddc54219a8ce2260a10efc5382af55b6851385e578118f3ba0a8859242",
	name: "deleteEvent",
	filename: "src/lib/events.api.ts"
}, (opts) => deleteEvent.__executeServer(opts));
var deleteEvent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(deleteEvent_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	if ((await sql`
      SELECT role FROM event_participants
      WHERE "eventId" = ${data.id} AND "userId" = ${context.userId}
    `)[0]?.role !== "admin") throw new Error("Unauthorized: Only admins can delete events.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql.query(`UPDATE events SET "deletedAt" = $1 WHERE id = $2`, [now, data.id]);
	return { success: true };
});
var inviteUser_createServerFn_handler = createServerRpc({
	id: "fc56863d614659ca6b116680c799d86dfe625934fcc576736a056b53b3ed90d6",
	name: "inviteUser",
	filename: "src/lib/events.api.ts"
}, (opts) => inviteUser.__executeServer(opts));
var inviteUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	eventId: string(),
	email: string().email(),
	role: _enum([
		"admin",
		"editor",
		"viewer"
	])
})).handler(inviteUser_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	if ((await sql`
      SELECT role FROM event_participants
      WHERE "eventId" = ${data.eventId} AND "userId" = ${context.userId}
    `)[0]?.role !== "admin") throw new Error("Unauthorized: Only admins can invite users.");
	const targetUserId = (await sql`SELECT id FROM "user" WHERE email = ${data.email}`)[0]?.id;
	if (targetUserId) await sql.query(`INSERT INTO event_participants ("eventId", "userId", role, "inviteStatus")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("eventId", "userId") DO UPDATE SET role = $3`, [
		data.eventId,
		targetUserId,
		data.role,
		"pending"
	]);
	else {
		const inviteId = crypto.randomUUID();
		const expiresAt = /* @__PURE__ */ new Date();
		expiresAt.setDate(expiresAt.getDate() + 30);
		await sql.query(`INSERT INTO invitations (id, "eventId", "invitedBy", "inviteeEmail", role, "expiresAt")
         VALUES ($1, $2, $3, $4, $5, $6)`, [
			inviteId,
			data.eventId,
			context.userId,
			data.email,
			data.role,
			expiresAt.toISOString()
		]);
	}
	return { success: true };
});
var getInvitations_createServerFn_handler = createServerRpc({
	id: "9053c9586e5893fe0c4641ff5b841ec184a4b8d14022c905331a3df79c9d0ad5",
	name: "getInvitations",
	filename: "src/lib/events.api.ts"
}, (opts) => getInvitations.__executeServer(opts));
var getInvitations = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getInvitations_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const email = (await sql`SELECT email FROM "user" WHERE id = ${context.userId}`)[0]?.email;
	if (!email) return [];
	return await sql`
      SELECT i.*, e.title as "eventTitle"
      FROM invitations i
      JOIN events e ON i."eventId" = e.id
      WHERE i."inviteeEmail" = ${email} AND i.status = 'pending'
    `;
});
var acceptInvitation_createServerFn_handler = createServerRpc({
	id: "9779599942a6bef44eb071567bdb5e1f0030481baa5c9369d4dab8d7f7911996",
	name: "acceptInvitation",
	filename: "src/lib/events.api.ts"
}, (opts) => acceptInvitation.__executeServer(opts));
var acceptInvitation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ invitationId: string().min(1) })).handler(acceptInvitation_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const email = (await sql`SELECT email FROM "user" WHERE id = ${context.userId}`)[0]?.email;
	if (!email) throw new Error("Unauthorized: no account email.");
	const invite = (await sql`
      SELECT "eventId", role, status, "expiresAt"
      FROM invitations
      WHERE id = ${data.invitationId} AND "inviteeEmail" = ${email}
    `)[0];
	if (!invite) throw new Error("Invitation not found for this account.");
	if (invite.status !== "pending") throw new Error("Invitation is no longer pending.");
	if (new Date(invite.expiresAt).getTime() < Date.now()) throw new Error("Invitation has expired.");
	await sql.query(`INSERT INTO event_participants ("eventId", "userId", role, "inviteStatus")
       VALUES ($1, $2, $3, 'accepted')
       ON CONFLICT ("eventId", "userId") DO UPDATE SET role = $3, "inviteStatus" = 'accepted'`, [
		invite.eventId,
		context.userId,
		invite.role
	]);
	await sql.query(`UPDATE invitations SET status = 'accepted' WHERE id = $1`, [data.invitationId]);
	return {
		success: true,
		eventId: invite.eventId
	};
});
var rejectInvitation_createServerFn_handler = createServerRpc({
	id: "571f8bdb3ed6c441b77e1a98027422fa39ff4a9df4196e3b3e396d5b3d85cd17",
	name: "rejectInvitation",
	filename: "src/lib/events.api.ts"
}, (opts) => rejectInvitation.__executeServer(opts));
var rejectInvitation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ invitationId: string().min(1) })).handler(rejectInvitation_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const email = (await sql`SELECT email FROM "user" WHERE id = ${context.userId}`)[0]?.email;
	if (!email) throw new Error("Unauthorized: no account email.");
	await sql.query(`UPDATE invitations SET status = 'rejected'
       WHERE id = $1 AND "inviteeEmail" = $2 AND status = 'pending'`, [data.invitationId, email]);
	return { success: true };
});
//#endregion
export { acceptInvitation_createServerFn_handler, createEvent_createServerFn_handler, deleteEvent_createServerFn_handler, getInvitations_createServerFn_handler, inviteUser_createServerFn_handler, listEvents_createServerFn_handler, rejectInvitation_createServerFn_handler, updateEvent_createServerFn_handler };
