import type { CapacitorConfig } from "@capacitor/cli";

/**
 * ARCHITECTURE NOTE
 * -----------------
 * This app is server-rendered: auth, the database and every `createServerFn`
 * handler run on a Node server, not in the browser. Those cannot be baked into
 * an APK as static files, so the native shell loads the running app over the
 * network via `server.url`, and the device talks to the same backend as the
 * browser does.
 *
 * WHICH URL TO USE (set CAP_SERVER_URL, no code edit needed)
 * ---------------------------------------------------------
 *   • Local test (PC on, same Wi-Fi):  $env:CAP_SERVER_URL="http://192.168.40.156:8080"
 *   • Shareable / real build:         $env:CAP_SERVER_URL="https://your-app.vercel.app"
 *   • default (unset)                 falls back to local dev server below
 *
 * Then `npm run android:apk`. `cleartext` is derived automatically: it is only
 * enabled for a plain-http URL, since Android blocks http by default and an
 * https deploy must not advertise cleartext support.
 */
const serverUrl = process.env.CAP_SERVER_URL ?? "http://192.168.40.156:8080";
const isCleartext = serverUrl.startsWith("http://");

const config: CapacitorConfig = {
  appId: "com.until.app",
  appName: "Until",
  // Required by the CLI; used only as the offline fallback shell.
  webDir: "dist/client",
  server: {
    url: serverUrl,
    cleartext: isCleartext,
    androidScheme: isCleartext ? "http" : "https",
    /**
     * Treat every navigation to the app's own origin as INSIDE the app.
     *
     * Without this, the WebView hands top-level navigations to the system
     * browser, so an OAuth round-trip lands in Chrome — which gets the session
     * cookie in ITS cookie jar — and the app, with a separate jar, stays signed
     * out. That was the reported "signs me into the web version only" bug.
     */
    allowNavigation: [new URL(serverUrl).host],
  },
  android: {
    // Only relevant while talking to a plain-http dev server.
    allowMixedContent: isCleartext,
  },
  plugins: {
    GoogleSignIn: {
      /**
       * Android OAuth client id. NOT the web client id from Google Cloud — a
       * WebView cannot complete Google's browser-based OAuth (Google blocks it
       * with "This browser or app may not be secure"), so Android sign-in must
       * go through the native Google Sign-In SDK, which needs its own OAuth
       * client of type "Android" registered against this package name + the
       * signing key SHA-1.
       *
       * Left empty on purpose: `googleNativeEnabled` in the app is false until
       * this is set, so the UI falls back to the web flow rather than showing a
       * button that cannot work. See ANDROID.md for how to create it.
       */
      serverClientId: process.env.GOOGLE_ANDROID_CLIENT_ID ?? "",
      scopes: ["email", "profile"],
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
