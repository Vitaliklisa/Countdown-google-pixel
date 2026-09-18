import { r as createServerFn } from "./ssr.mjs";
import { Qt as string, Vt as _enum, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-P0GAgHmU.mjs";
import { n as createSsrRpc } from "./routes-DJlEeju1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/push-DMIIHQVo.js
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
var registerDeviceToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	token: string().min(8),
	platform: _enum([
		"android",
		"ios",
		"web"
	]).default("android")
})).handler(createSsrRpc("2d5337827bcfd9450626d99538cfd43bde3592f981579a2f28987839a42155d0"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ token: string().min(8) })).handler(createSsrRpc("b065731475f096ab4fc6e8da4951a0f0fdc92502c9a97795ca3c01c7dc28ffcb"));
/**
* Push registration — safe to import in BOTH the browser and the server.
*
* In the browser (or the deployed web app) there is no Capacitor runtime, so
* every call here is a no-op: `isNative()` is false and we never touch the
* plugin. Only inside the Android/iOS shell do we ask FCM for a token and hand
* it to the server function.
*
* The filename deliberately has NO dot-client suffix: the bundler's
* import-protection denies client-marked modules reachable from server code, and
* this module is pulled in by until-app, which also renders on the server. The
* isNative() guard is what makes it safe in both environments instead.
*
* Usage: call `registerPush()` once after the user is signed in (see the event
* store / root auth effect). It is idempotent — registering twice just refreshes
* the same token row.
*/
/** True only inside the native Capacitor shell, false in a normal browser. */
function isNative() {
	if (typeof window === "undefined") return false;
	const cap = window.Capacitor;
	return Boolean(cap?.isNativePlatform?.());
}
/**
* Ask the OS for permission and register this device's FCM token with the
* server. Returns the token, or null when running in a browser / denied.
*/
async function registerPush() {
	if (!isNative()) return null;
	const { PushNotifications } = await import("../_libs/capacitor__push-notifications.mjs").then((n) => n.t);
	let perm = await PushNotifications.checkPermissions();
	if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") perm = await PushNotifications.requestPermissions();
	if (perm.receive !== "granted") return null;
	const token = await new Promise((resolve) => {
		let settled = false;
		const done = (value) => {
			if (settled) return;
			settled = true;
			resolve(value);
		};
		PushNotifications.addListener("registration", (t) => done(t.value));
		PushNotifications.addListener("registrationError", () => done(null));
		PushNotifications.register();
		setTimeout(() => done(null), 1e4);
	});
	if (!token) return null;
	PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
		window.dispatchEvent(new CustomEvent("until:notification-tap", { detail: action.notification.data }));
	});
	PushNotifications.addListener("pushNotificationReceived", (notification) => {
		window.dispatchEvent(new CustomEvent("until:notification", { detail: notification.data ?? notification }));
	});
	await registerDeviceToken({ data: {
		token,
		platform: "android"
	} });
	return token;
}
//#endregion
export { registerPush };
