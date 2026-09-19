import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * The sibling-origin derivation is what fixes "Invalid origin" in production, so
 * it is tested directly rather than trusted by eye. It is imported from the
 * dependency-free module — `server.ts` pulls in Better Auth + `pg` and the `@/`
 * alias, none of which this runner can resolve.
 */
import { siblingDeployedOrigins } from "./origins.pure.ts";

describe("siblingDeployedOrigins", () => {
  it("trusts the configured origin itself", () => {
    const out = siblingDeployedOrigins("https://countdown-google-pixel.vercel.app");
    assert.ok(out.includes("https://countdown-google-pixel.vercel.app"));
  });

  it("adds the www variant of a custom domain", () => {
    const out = siblingDeployedOrigins("https://until.example.com");
    assert.ok(out.includes("https://until.example.com"));
    assert.ok(out.includes("https://www.until.example.com"));
  });

  it("collapses a Vercel branch alias to the project origin", () => {
    const out = siblingDeployedOrigins(
      "https://countdown-google-pixel-git-main-vhomenko.vercel.app",
    );
    assert.ok(
      out.includes("https://countdown-google-pixel.vercel.app"),
      "a -git-<branch> alias must also trust the project origin",
    );
  });

  it("covers Vercel preview/deployment aliases via a wildcard", () => {
    const out = siblingDeployedOrigins("https://countdown-google-pixel.vercel.app");
    assert.ok(
      out.includes("https://countdown-google-pixel-*.vercel.app"),
      "preview + per-deployment hostnames must be covered",
    );
  });

  it("does not invent origins for a non-Vercel host", () => {
    const out = siblingDeployedOrigins("https://until.example.com");
    assert.ok(!out.some((o) => o.includes("vercel.app")));
  });

  it("returns an empty list for an unparseable base URL", () => {
    assert.deepEqual(siblingDeployedOrigins("not a url"), []);
  });
});
