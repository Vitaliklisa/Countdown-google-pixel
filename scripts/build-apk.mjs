#!/usr/bin/env node
/**
 * One-command Android APK build for Windows.
 *
 *   node scripts/build-apk.mjs
 *   (or: npm run android:apk)
 *
 * Sets JAVA_HOME / ANDROID_HOME (which Gradle needs and which are NOT set on
 * this machine's PATH) and runs `cap sync` + `gradlew assembleDebug`. Writes the
 * APK to android/app/build/outputs/apk/debug/app-debug.apk.
 *
 * Why JAVA_HOME points at Android Studio's bundled JBR (JDK 25):
 *   Capacitor 8's android library compiles against Java 21. The only JDK 21+ on
 *   this box is Android Studio's JetBrains Runtime (JDK 25); the standalone
 *   Eclipse Adoptium JDK is 17, which fails with "invalid source release: 21".
 *   Gradle 9.1+ is required to RUN on JDK 25 (see the Gradle compatibility
 *   matrix) — which is why the wrapper is pinned to gradle-9.1.0 above.
 *
 * Edit JAVA_HOME / ANDROID_HOME below if your install paths differ.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

const JAVA_HOME = "C:\\Program Files\\Android\\Android Studio\\jbr";
const ANDROID_HOME = join(process.env.LOCALAPPDATA ?? "", "Android", "Sdk");

/**
 * Keep AndroidManifest's cleartext flag in step with CAP_SERVER_URL.
 *
 * A plain-http dev URL needs `usesCleartextTraffic="true"`; an https deploy must
 * NOT advertise cleartext support. Patching it here means switching between local
 * and deployed builds is one env var, never a hand-edit of the manifest.
 */
function syncCleartextFlag() {
  const url = process.env.CAP_SERVER_URL ?? "http://192.168.40.156:8080";
  const want = url.startsWith("http://");
  const manifestPath = join(ROOT, "android", "app", "src", "main", "AndroidManifest.xml");
  const xml = readFileSync(manifestPath, "utf8");
  const tag = 'android:usesCleartextTraffic="';
  let next;
  if (want) {
    next = xml.includes(tag) ? xml : xml.replace("android:supportsRtl=\"true\"", `android:supportsRtl="true"\n        ${tag}true"`);
  } else {
    next = xml.replace(/\n\s*android:usesCleartextTraffic="[^"]*"/, "");
  }
  if (next !== xml) writeFileSync(manifestPath, next);
  console.log(`[build-apk] server.url=${url} -> cleartext ${want ? "on" : "off"}`);
}

syncCleartextFlag();

function fail(msg) {
  console.error(`\n[build-apk] ${msg}\n`);
  process.exit(1);
}

if (!existsSync(join(JAVA_HOME, "bin", "java.exe"))) {
  fail(`JAVA_HOME not found at: ${JAVA_HOME}\nEdit JAVA_HOME in scripts/build-apk.mjs.`);
}
if (!existsSync(ANDROID_HOME)) {
  fail(`Android SDK not found at: ${ANDROID_HOME}\nInstall it via Android Studio > SDK Manager.`);
}

const env = { ...process.env, JAVA_HOME, ANDROID_HOME, ANDROID_SDK_ROOT: ANDROID_HOME };

const run = (cmd, args, cwd) => {
  console.log(`\n[build-apk] ${cmd} ${args.join(" ")}`);
  const res = spawnSync(cmd, args, { stdio: "inherit", env, cwd, shell: true });
  if (res.status !== 0) fail(`"${cmd} ${args.join(" ")}" exited with code ${res.status}`);
};

// 1. Copy capacitor.config + plugins into the native project.
run("npx", ["cap", "sync", "android"], ROOT);
// 2. Compile the debug APK.
run("gradlew.bat", ["assembleDebug", "--no-daemon"], join(ROOT, "android"));

const apk = join(ROOT, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
if (!existsSync(apk)) fail("Build reported success but no APK was produced.");
console.log(`\n[build-apk] SUCCESS -> ${apk}\n`);
