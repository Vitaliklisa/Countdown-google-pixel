import { It as _enum, Wt as object, qt as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as getSql } from "./db-DV8XdeM_.mjs";
import { t as authMiddleware } from "./middleware-B8_TJP-B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/push.api-B_wyPUNv.js
/**
* Device push-token registry.
*
* On native (Capacitor) the app calls `registerPush()` on startup, which asks
* FCM for a token and posts it here. The server stores it per (token, user) so a
* later server event — "someone edited your shared event" — can look up every
* device belonging to a participant and fan out a notification.
*
* NOTE: this module only *stores* tokens. Actually *sending* a push needs FCM
* credentials (a service-account JSON) which are not configured here — see
* ANDROID.md "Push notifications" for the last mile. The write path is real and
* testable today; the send path is the deliberate remaining step because it
* needs your Firebase project's key.
*
* This file is `*.api.ts`, not `*.server.ts`, on purpose: the client imports it
* to call the RPCs, and the bundler's import-protection denies any `*.server.*`
* module reached from client code. The genuinely server-only helper lives in
* push.server.ts.
*/
var registerDeviceToken_createServerFn_handler = createServerRpc({
	id: "2d5337827bcfd9450626d99538cfd43bde3592f981579a2f28987839a42155d0",
	name: "registerDeviceToken",
	filename: "src/lib/push.api.ts"
}, (opts) => registerDeviceToken.__executeServer(opts));
var registerDeviceToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	token: string().min(8),
	platform: _enum([
		"android",
		"ios",
		"web"
	]).default("android")
})).handler(registerDeviceToken_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql.query(`INSERT INTO device_tokens (token, "userId", platform, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (token) DO UPDATE SET "userId" = $2, platform = $3, "updatedAt" = $4`, [
		data.token,
		context.userId,
		data.platform,
		now
	]);
	return { success: true };
});
var unregisterDeviceToken_createServerFn_handler = createServerRpc({
	id: "b065731475f096ab4fc6e8da4951a0f0fdc92502c9a97795ca3c01c7dc28ffcb",
	name: "unregisterDeviceToken",
	filename: "src/lib/push.api.ts"
}, (opts) => unregisterDeviceToken.__executeServer(opts));
var unregisterDeviceToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ token: string().min(8) })).handler(unregisterDeviceToken_createServerFn_handler, async ({ data, context }) => {
	await (await getSql()).query(`DELETE FROM device_tokens WHERE token = $1 AND "userId" = $2`, [data.token, context.userId]);
	return { success: true };
});
//#endregion
export { registerDeviceToken_createServerFn_handler, unregisterDeviceToken_createServerFn_handler };
