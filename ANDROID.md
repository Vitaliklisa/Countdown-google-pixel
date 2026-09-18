# Until — Android app (Capacitor)

Wraps the TanStack Start web app in a native Android shell, producing a real
installable `.apk`, with **no rewrite** of the app code. See **[DEPLOY.md](./DEPLOY.md)**
for the cloud / Neon / Vercel side.

## Architecture (read this first)

The app is **server-rendered**: auth, the database, and every `createServerFn`
handler run on a Node server. Those cannot be baked into an APK. So the native
shell loads the running app over the network from `server.url`.

Consequences:

- **Something must serve the app**: either the deployed public URL (normal use)
  or your PC's dev server (local testing only).
- `webDir` (`dist/client`) is only an offline fallback shell.
- **Which URL the APK points at decides whether the phone needs your PC.** Point
  it at the deployed `https://` URL and no PC is involved at all.

## Two modes
| | Local test | Real / shareable |
|---|---|---|
| APK points at | `http://<pc-lan-ip>:8080` | `https://your-app.vercel.app` |
| Needs the PC on? | **Yes** | **No** |
| Data backend | PGLite (in-memory, resets on restart) | Neon Postgres (persistent) |
| Shared across devices? | No — one machine | Yes |
| Build with | `npm run android:apk` (default URL) | `$env:CAP_SERVER_URL="https://…"; npm run android:apk` |

## One-time setup (already done in this repo)

- Android Studio + Android SDK installed
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` (v8) installed
- `@capacitor/push-notifications` installed
- `android/` native project generated
- `android/local.properties` points Gradle at the SDK
- App icon + splash generated from code (see below)

## Build the APK
```powershell
npm run android:apk
```

Output:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

The script sets `JAVA_HOME` and `ANDROID_HOME` for you and, from
`CAP_SERVER_URL`, configures `server.url` + the cleartext flag. **JDK note:** it
uses Android Studio's bundled JDK 25, because Capacitor 8 compiles against Java
21 and the standalone Adoptium JDK 17 is too old. Gradle is pinned to 9.1.0, the
first version that *runs* on JDK 25. Edit the paths at the top of
`scripts/build-apk.mjs` if your installs differ.

## Run the dev server (local mode only)

```powershell
npm run dev:detached
```

Starts Vite detached on `0.0.0.0:8080` (logs in `dev-server.log`). Detached means
it survives after the terminal command returns.

## Switch which server the APK points at
Set one env var, then rebuild:

```powershell
# real, no-PC-needed build
$env:CAP_SERVER_URL = "https://your-app.vercel.app"
npm run android:apk
```

`cleartext` / `usesCleartextTraffic` are switched automatically: on for a plain
`http://` URL, stripped for `https://`.

## Install on the Pixel 8 Pro

1. Copy `android/app/build/outputs/apk/debug/app-debug.apk` to the phone
   (USB, Google Drive, or `adb install`).
2. Tap the file → allow "Install unknown apps" for your file manager/browser.
3. Open **Until** from the home screen.

Or, phone plugged in over USB with USB debugging on:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r "android\app\build\outputs\apk\debug\app-debug.apk"
```

## App icon and splash
Generated from code, not checked-in binaries, so a palette change re-propagates:

```powershell
npm run icons:generate      # SVG -> resources/*.png (via sharp)
npx @capacitor/assets generate --android
```

- Source art: `scripts/generate-icons.mjs` (dark canvas, cream clock, teal ring —
  matches `public/favicon.svg` and the app palette).
- The mark is drawn at 62% of the canvas so Android's adaptive-icon mask never
  clips it.
- Theme colors live in `android/app/src/main/res/values/colors.xml`; the launcher
  background and splash are set to the app's dark canvas so there is no white
  flash on launch.

## Push notifications — current status
**Wired:** permission request, token registration, and server storage.

- Client: `src/lib/push.ts` — no-op in a browser; only runs in the native shell.
- Server: `src/lib/push.api.ts` (registration RPCs) + `src/lib/push.server.ts`
  (`tokensForUsers` fan-out lookup).
- Table: `migrations/0003_device_tokens.sql`.
- Registered automatically on sign-in from `src/components/until-app.tsx`.

**Not yet wired — the last mile:** actually *sending* a push. That needs FCM
credentials from a Firebase project:

1. Create a Firebase project; add an Android app with package name
  `com.until.app`.
2. Download `google-services.json` → place at `android/app/google-services.json`
  (the Gradle file already detects and applies it — see `android/app/build.gradle`).
3. Add a server-side sender that calls FCM with the tokens from
  `tokensForUsers(...)`, using a service-account key in an env var. Call it from
  the event update path to notify the other participants.

Until step 3, notifications are collected and stored but not delivered.
