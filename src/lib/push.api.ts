import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

/**
 * Device push-token registry.
 *
 * On native (Capacitor) the app calls `registerPush()` on startup, which asks
 * FCM for a token and posts it here. The server stores it per (token, user) so a
 * later server event — "someone edited your shared event" — can look up every
 * device belonging to a participant and fan out a notification.
 *
 * NOTE: this module only *stores* tokens. Actually *sending* a push needs FCM
 * credentials (a service-account JSON) which are not configured here — see
 * ANDROID.md "Push notifications" for the last mile. The write path is real and
 * testable today; the send path is the deliberate remaining step because it
 * needs your Firebase project's key.
 *
 * This file is `*.api.ts`, not `*.server.ts`, on purpose: the client imports it
 * to call the RPCs, and the bundler's import-protection denies any `*.server.*`
 * module reached from client code. The genuinely server-only helper lives in
 * push.server.ts.
 */

export const registerDeviceToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      token: z.string().min(8),
      platform: z.enum(["android", "ios", "web"]).default("android"),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const now = new Date().toISOString();
    // Token is the PK: one account -> many devices, and FCM rotates tokens, so
    // re-registration refreshes the row instead of colliding.
    await sql.query(
      `INSERT INTO device_tokens (token, "userId", platform, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (token) DO UPDATE SET "userId" = $2, platform = $3, "updatedAt" = $4`,
      [data.token, context.userId, data.platform, now],
    );
    return { success: true };
  });

export const unregisterDeviceToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ token: z.string().min(8) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    // Scoped by userId so one user cannot delete another user's token row.
    await sql.query(`DELETE FROM device_tokens WHERE token = $1 AND "userId" = $2`, [
      data.token,
      context.userId,
    ]);
    return { success: true };
  });
