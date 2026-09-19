import { Wt as object, qt as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as auth } from "./server-CFfXDBwo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/native-exchange.api-B_vmAPvR.js
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
var signInWithIdToken_createServerFn_handler = createServerRpc({
	id: "3036d67248778fc8b39c18a198fca95306af8da3fadac8043e1a3e3a25088f35",
	name: "signInWithIdToken",
	filename: "src/lib/auth/native-exchange.api.ts"
}, (opts) => signInWithIdToken.__executeServer(opts));
var signInWithIdToken = createServerFn({ method: "POST" }).validator(object({ idToken: string().min(20) })).handler(signInWithIdToken_createServerFn_handler, async ({ data }) => {
	const response = await auth.api.signInSocial({
		body: {
			provider: "google",
			idToken: { token: data.idToken }
		},
		asResponse: true
	});
	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		throw new Error(detail || `Native sign-in failed (${response.status})`);
	}
	return { success: true };
});
//#endregion
export { signInWithIdToken_createServerFn_handler };
