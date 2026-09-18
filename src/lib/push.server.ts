import { getSql } from "@/lib/db";

/**
 * Server-only push helpers (no client import path).
 *
 * Kept apart from `push.api.ts` because that module is imported by client code
 * to call the registration RPCs; this one touches the database directly and must
 * never be pulled into a client bundle.
 */

/**
 * Every push token belonging to a set of user ids — the fan-out list for
 * notifying participants when a shared event changes.
 *
 * The send half (calling FCM with these tokens) needs a Firebase service
 * account key, which is not configured here — see ANDROID.md.
 */
export async function tokensForUsers(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return [];
  const sql = await getSql();
  const rows = await sql.query<{ token: string }>(
    `SELECT token FROM device_tokens WHERE "userId" = ANY($1::text[])`,
    [userIds],
  );
  return rows.map((r) => r.token);
}
