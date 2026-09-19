/**
 * Origin-trust helpers for Better Auth (dependency-free, unit-testable).
 *
 * Lives apart from `server.ts` because that module imports Better Auth, `pg` and
 * the `@/` path alias, none of which `node --test` can resolve — so a helper
 * defined there cannot be tested. This file imports nothing, so it can.
 */

/**
 * The set of origins a deployed app should accept, derived from its configured
 * `BETTER_AUTH_URL`.
 *
 * Trusting ONLY the exact configured origin breaks the other hostnames the SAME
 * deployment legitimately answers on, and sign-in then fails with "Invalid
 * origin":
 *   • Vercel branch/preview URLs  `<project>-git-<branch>-<team>.vercel.app`
 *   • per-deployment URLs         `<project>-<hash>-<team>.vercel.app`
 *   • the apex/www pair           `example.com`  +  `www.example.com`
 *
 * Still a closed set derived from configuration — never a blanket trust.
 */
export function siblingDeployedOrigins(base: string): string[] {
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return [];
  }
  const { protocol, hostname } = url;
  const out: string[] = [`${protocol}//${hostname}`];

  // Apex <-> www, so switching between them does not break sign-in.
  const siblingHost = hostname.startsWith("www.") ? hostname.slice(4) : `www.${hostname}`;
  out.push(`${protocol}//${siblingHost}`);

  // Vercel hostnames for the same project. The project name is whatever precedes
  // the first `-git-` segment, so strip that rather than encoding the whole shape
  // in one regex — string ops stay readable and need no escaping.
  if (hostname.endsWith(".vercel.app")) {
    const project = hostname.replace(/\.vercel\.app$/i, "").split("-git-")[0];
    out.push(`${protocol}//${project}.vercel.app`);
    // Better Auth wildcard form: a leading `*` matches one or more segments, so
    // this covers every preview and per-deployment alias of the project.
    out.push(`${protocol}//${project}-*.vercel.app`);
  }
  return out;
}
