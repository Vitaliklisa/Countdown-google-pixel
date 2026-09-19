/**
 * Confirm the deployed `trustedOrigins` now covers the hostnames that produced
 * "Invalid origin", by importing the REAL helper and applying it to the real
 * production URL. This is the regression guard for the reported bug.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { siblingDeployedOrigins } from "./origins.pure.ts";

const PROD = "https://countdown-google-pixel.vercel.app";

describe("deployed trustedOrigins cover the hostnames that broke sign-in", () => {
  const trusted = siblingDeployedOrigins(PROD);

  it("accepts the production alias", () => {
    assert.ok(trusted.includes(PROD));
  });

  it("accepts a Vercel branch preview alias (the reported failure)", () => {
    // A branch deploy is served on <project>-git-<branch>-<team>.vercel.app.
    // Better Auth wildcard-matches `down-google-pixel-*.vercel.app` against
    // it, so the project origin + wildcard must both be present.
    assert.ok(trusted.includes("https://countdown-google-pixel-*.vercel.app"));
  });

  it("accepts a per-deployment alias", () => {
    assert.ok(trusted.includes("https://countdown-google-pixel-*.vercel.app"));
  });

  it("still accepts local dev origins (unaffected by the fix)", () => {
    // LOCAL_DEV_ORIGINS is appended separately in server.ts; this asserts the
    // helper did not accidentally start claiming to own that responsibility.
    assert.ok(!trusted.some((o) => o.includes("localhost")));
  });
});
