/**
 * Native Google Sign-In (Capacitor Android/iOS shell only).
 *
 * Why this file exists: Google refuses OAuth from an embedded WebView ("This
 * browser or app may not be secure"), and a browser round-trip would put the
 * session in the SYSTEM browser's cookie jar — leaving the app itself signed out.
 * The native Google SDK avoids both: it authenticates in-app and returns an ID
 * token, which we hand to our own Better Auth endpoint to mint a session inside
 * the WebView.
 *
 * Everything here is dynamically imported and guarded by `isNativeApp()`, so the
 * browser bundle never loads the plugin and web sign-in is untouched.
 */
import { signInWithIdToken } from "@/lib/auth/native-exchange.api";

/**
 * The plugin's `initialize()` REQUIRES a client id and, per its own docs, it must
 * be the **WEB** client id on every platform — that value is passed to Android's
 * Credential Manager as the *server* client id, and it is what the returned ID
 * token's audience is checked against. Using the Android client id here yields a
 * token Better Auth rejects (audience mismatch).
 *
 * Baked in at build time from GOOGLE_CLIENT_ID via scripts/with-app-env.mjs. A
 * Google OAuth client id is public (it ships in every web page), so exposing it
 * to the client bundle is expected — the client SECRET never is.
 */
const WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string | undefined;

/**
 * Run the native Google sheet, then exchange the returned ID token for an app
 * session. Throws with a readable message on any failure so the login screen can
 * show it.
 */
export async function signInWithNativeGoogle(): Promise<void> {
  const { GoogleSignIn, ErrorCode } = await import("@capawesome/capacitor-google-sign-in");

  if (!WEB_CLIENT_ID) {
    throw new Error("Native Google sign-in is not configured in this build.");
  }

  let idToken: string;
  try {
    // initialize() must run once before signIn().
    await GoogleSignIn.initialize({ clientId: WEB_CLIENT_ID });
    const result = await GoogleSignIn.signIn();
    idToken = result.idToken;
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === ErrorCode?.SignInCanceled) {
      // User dismissed the sheet — not a failure worth alarming them about.
      throw new Error("Sign-in cancelled.");
    }
    const message = err instanceof Error ? err.message : String(err);
    // Google registers an Android app by PACKAGE NAME + SIGNING KEY SHA-1, so a
    // build signed with a different key is rejected (DEVELOPER_ERROR).
    throw new Error(
      /DEVELOPER_ERROR|10:|PROVIDER_CONFIGURATION/i.test(`${code} ${message}`)
        ? "Google sign-in is misconfigured for this build (check the Android OAuth client's SHA-1)."
        : `Google sign-in failed: ${message}`,
    );
  }

  if (!idToken) throw new Error("Google sign-in returned no ID token.");

  await signInWithIdToken({ data: { idToken } });
}
