//#region node_modules/.nitro/vite/services/ssr/assets/native-google-D3dTB2tY.js
/**
* Run the native Google sheet, then exchange the returned ID token for an app
* session. Throws with a readable message on any failure so the login screen can
* show it.
*/
async function signInWithNativeGoogle() {
	const { GoogleSignIn, ErrorCode } = await import("../_libs/@capawesome/capacitor-google-sign-in+[...].mjs").then((n) => n.t);
	throw new Error("Native Google sign-in is not configured in this build.");
}
//#endregion
export { signInWithNativeGoogle };
