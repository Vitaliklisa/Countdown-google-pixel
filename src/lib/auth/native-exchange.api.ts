import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "@/lib/auth/server";

/**
 * Exchange a NATIVE Google ID token for an app session.
 *
 * Called only from the Capacitor shell (`native-google.ts`), where Google's
 * browser OAuth cannot be used. The token is verified by Better Auth's own
 * `signInSocial` ID-token path, so we never hand-roll JWT validation or trust an
 * unverified client payload.
 *
 * Security notes:
 *  • The token is verified against Google's keys AND the audience must match our
 *    client id — Better Auth enforces both, which is what stops a token minted
 *    for another app being replayed here.
 *  • Nothing here trusts an email from the client; identity comes from the
 *    verified token only.
 */
export const signInWithIdToken = createServerFn({ method: "POST" })
  .validator(z.object({ idToken: z.string().min(20) }))
  .handler(async ({ data }) => {
    // Better Auth's server API accepts `idToken` for social providers and
    // performs the JWKS + audience verification. `asResponse` lets the
    // Set-Cookie reach the client through the normal cookie bridge.
    const response = await auth.api.signInSocial({
      body: {
        provider: "google",
        idToken: {
          token: data.idToken,
        },
      },
      asResponse: true,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `Native sign-in failed (${response.status})`);
    }

    return { success: true };
  });
