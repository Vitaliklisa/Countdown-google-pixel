import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEventVisibilityWhereClause } from "./events.pure.ts";

describe("buildEventVisibilityWhereClause", () => {
  // Whitespace-insensitive: the helper is multi-line for readability, and the
  // property that matters is grouping, not formatting.
  const squash = (s: string) => s.replace(/\s+/g, " ").trim();

  it("selects events the user created or participates in", () => {
    const clause = squash(buildEventVisibilityWhereClause("$1", "$2"));
    assert.ok(clause.includes('e."createdBy" = $1'), "creator check present");
    assert.ok(clause.includes('ep."userId" = $2'), "participant check present");
  });

  it("applies the soft-delete filter to the whole OR group, not just the EXISTS", () => {
    // The regression this guards: without the outer parens, `a OR b AND c` binds
    // the AND to `b` only, so deleted events the user created would come back.
    const clause = squash(buildEventVisibilityWhereClause("$1", "$2"));
    assert.ok(
      clause.startsWith('( e."createdBy"'),
      "the creator check must be inside the parenthesised group",
    );
    // Two parens close before AND: the EXISTS subquery, then the OR group.
    const closingParensBeforeAnd = clause.indexOf(") ) AND");
    assert.ok(
      closingParensBeforeAnd !== -1,
      "expect )) before AND (subquery close + OR-group close)",
    );
    assert.ok(
      clause.indexOf('AND e."deletedAt" IS NULL') > closingParensBeforeAnd,
      "the deleted filter must apply after the group closes",
    );
  });
});
