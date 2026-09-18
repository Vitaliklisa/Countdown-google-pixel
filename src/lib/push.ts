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
import { registerDeviceToken, unregisterDeviceToken } from "@/lib/push.api";

/** True only inside the native Capacitor shell, false in a normal browser. */
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

let currentToken: string | null = null;

/**
 * Ask the OS for permission and register this device's FCM token with the
 * server. Returns the token, or null when running in a browser / denied.
 */
export async function registerPush(): Promise<string | null> {
  if (!isNative()) return null;

  const { PushNotifications } = await import("@capacitor/push-notifications");

  // Android 13+ (your Pixel 8 Pro) requires a runtime permission prompt.
  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== "granted") return null;

  // Registration resolves asynchronously via the 'registration' listener.
  const token = await new Promise<string | null>((resolve) => {
    let settled = false;
    const done = (value: string | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    void PushNotifications.addListener("registration", (t) => done(t.value));
    void PushNotifications.addListener("registrationError", () => done(null));
    void PushNotifications.register();

    // Safety net so a silent failure can't hang the caller forever.
    setTimeout(() => done(null), 10_000);
  });

  if (!token) return null;
  currentToken = token;

  // Tap on a notification -> surface it as a normal window event the app can
  // listen for (e.g. to open the referenced event).
  void PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    window.dispatchEvent(
      new CustomEvent("until:notification-tap", { detail: action.notification.data }),
    );
  });

  // Foreground delivery: Android suppresses the tray banner while the app is
  // focused, so re-emit it as an event instead of dropping it.
  void PushNotifications.addListener("pushNotificationReceived", (notification) => {
    window.dispatchEvent(
      new CustomEvent("until:notification", { detail: notification.data ?? notification }),
    );
  });

  await registerDeviceToken({ data: { token, platform: "android" } });
  return token;
}

/** Remove this device's token (call on sign-out so a shared device stops receiving). */
export async function unregisterPush(): Promise<void> {
  if (!isNative()) return;
  const token = currentToken;
  if (!token) return;
  try {
    await unregisterDeviceToken({ data: { token } });
  } finally {
    currentToken = null;
  }
}
