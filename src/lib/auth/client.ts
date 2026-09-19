import { createAuthClient } from "better-auth/react";
import { runSignOut } from "../../../scripts/sign-out-plan.mjs";

/**
 * Better Auth client for this React SPA (browser-side).
 *
 * Talks to this app's OWN Better Auth at same-origin `/api/auth/*`. In the live
 * preview the app is an embedded iframe with PARTITIONED cookies, so after a
 * popup sign-in it can't read the session cookie — it authenticates with a
 * bearer token instead (captured from the popup, see `signIn`). The `onRequest`
 * hook attaches that token when present; when deployed (cookie auth) no token
 * is stored, so nothing changes.
 *
 * To sign out call `signOut()` below, NOT `authClient.signOut()`: the raw call
 * leaves the bearer token in place, and `onRequest` keeps re-attaching it, so
 * the visitor stays signed in.
 */
export const authClient = createAuthClient({
  fetchOptions: {
    onRequest(ctx) {
      const token = getBearerToken();
      if (token) ctx.headers.set("Authorization", `Bearer ${token}`);
      return ctx;
    },
  },
});

/**
 * True when sign-in UI should be shown — i.e. whenever `VITE_AUTH_ENABLED` is
 * not `"false"`. The shipped template sets it to `"false"`
 * (`.grok/app-env.json`), which selects the dev user (see `use-current-user`);
 * with the key removed, sign-in is real in preview (baked preview client) and
 * when deployed (injected per-app client).
 */
export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";

/**
 * Whether Google sign-in is configured (GOOGLE_CLIENT_ID present).
 *
 * Published as a VITE_ flag at build time because the client cannot read
 * GOOGLE_CLIENT_ID itself (it is server-only, and must never reach the browser).
 * Retained as the single capability check the UI can use; Google is the only
 * method now.
 */
export const googleDirectEnabled = import.meta.env.VITE_GOOGLE_DIRECT === "true";

// ── Live-preview bearer token ────────────────────────────────────────────────
// The embedded preview iframe has partitioned cookies, so we keep the session's
// bearer token in sessionStorage and attach it to every Better Auth request (and
// to server functions, via `@/lib/auth/middleware`). Empty everywhere except the
// preview after a popup sign-in, so the cookie path is untouched elsewhere.
const BEARER_KEY = "grok-auth.bearer-token";

/** The stored preview bearer token, or null. */
export function getBearerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(BEARER_KEY);
  } catch {
    return null;
  }
}

function setBearerToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(BEARER_KEY, token);
    else window.sessionStorage.removeItem(BEARER_KEY);
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * The sandbox live preview runs this app inside an iframe on a `*.grok-sandbox.com`
 * host, where a full-page redirect to the broker can't work — so sign-in uses a
 * popup there and a normal redirect everywhere else.
 */
function inLivePreview(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(".grok-sandbox.com")
  );
}

/**
 * True when running inside the Capacitor Android/iOS shell (not a browser).
 */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

/**
 * Start sign-in with Google — the app's ONLY sign-in method.
 *
 * Two paths, chosen by environment:
 *
 *  • **Native (Android/iOS shell):** Google's OAuth must NOT go through the
 *    WebView — Google blocks that with "This browser or app may not be secure",
 *    and a browser round-trip would land the session in the system browser's
 *    cookie jar, leaving the app signed out (the reported bug). Instead the
 *    native Google SDK runs in-app and hands us an ID token, which we exchange
 *    for an app session via a server function.
 *
 *  • **Browser (web + deployed):** the normal Better Auth `social` redirect.
 *
 * The native path is attempted only when `nativeGoogleConfigured()` is true, so
 * a misconfigured build falls back to the web redirect rather than dead-ending.
 */
export async function signInGoogle(
  opts: { callbackURL?: string; errorCallbackURL?: string } = {},
): Promise<void> {
  if (isNativeApp() && nativeGoogleConfigured()) {
    const { signInWithNativeGoogle } = await import("@/lib/auth/native-google");
    await signInWithNativeGoogle();
    // Session is now established in the WebView's own cookie jar; reload so the
    // app re-reads it in a clean state.
    window.location.href = opts.callbackURL ?? "/";
    return;
  }

  const { data, error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: opts.callbackURL ?? "/",
    errorCallbackURL: opts.errorCallbackURL ?? "/login",
  });
  if (error) throw new Error(error.message ?? "Google sign-in failed");
  if (data?.url) window.location.href = data.url;
}

/**
 * Whether a native (Android) Google client id was baked into the build.
 *
 * Published as a VITE_ flag at build time (see scripts/with-app-env.mjs) because
 * the client cannot read GOOGLE_ANDROID_CLIENT_ID directly — and must not, since
 * baking a client id into the bundle is only safe when it is a public one.
 */
export function nativeGoogleConfigured(): boolean {
  return import.meta.env.VITE_NATIVE_GOOGLE === "true";
}

/**
 * Sign out of THIS app's local session, clear the preview token, then redirect.
 *
 * Use this, never `authClient.signOut()` — see the note on `authClient`.
 * Sequencing lives in `scripts/sign-out-plan.mjs` so it can be unit-tested.
 *
 * **Rejects when deployed if the server never confirms.** There the session is
 * an HttpOnly cookie only the server can clear, so redirecting anyway would
 * report a sign-out that did not happen. `<UserButton />` handles that for you;
 * a hand-rolled control must catch it and let the visitor retry. In the live
 * preview the local clear is sufficient, so it always resolves.
 */
export async function signOut(redirectTo = "/"): Promise<void> {
  await runSignOut({
    livePreview: inLivePreview(),
    hasBearer: Boolean(getBearerToken()),
    // Better Auth resolves with `{ error }` instead of rejecting, so surface a
    // failed response as a rejection for the sequence to act on.
    requestSignOut: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message ?? "Sign-out failed");
    },
    clearToken: () => setBearerToken(null),
    redirect: () => {
      window.location.href = redirectTo;
    },
  });
}
