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
export function buildEventVisibilityWhereClause(
  creatorUserIdParam: string,
  participantUserIdParam: string,
): string {
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
