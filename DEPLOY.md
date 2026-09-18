# Deploying "Until" to the cloud (Vercel + Neon Postgres)

Goal: the web app runs at a public HTTPS URL, event data lives in managed cloud
Postgres, every signed-in device sees the same events, and the Android APK talks
to that public URL — **no local PC required**.

This repo is **already wired** for that. The work is configuration, not code.

---

## TL;DR — what actually has to change

| # | What | Where | Status in this repo |
|---|------|-------|---------------------|
| 1 | Sign-in on | `.grok/app-env.json` → `VITE_AUTH_ENABLED: "true"` | ✅ already set |
| 2 | Provision a database | `.grok/app-env.json` → `deploy.database: true` | ✅ already set |
| 3 | Schema files | `migrations/*.sql` | ✅ present (auth + events + device tokens) |
| 4 | Public URL for auth | `BETTER_AUTH_URL` env | ⬜ injected by the platform on publish |
| 5 | Cloud Postgres connection | `DATABASE_URL` env | ⬜ injected by the platform on publish |
| 6 | APK points at the public URL | `CAP_SERVER_URL` when building | ⬜ set at build time (see below) |

Nothing in `src/` needs editing to deploy. The three things you *do* run are: an
env var at publish time (the platform does this), `npm run build` (which migrates
Neon), and an APK rebuild with `CAP_SERVER_URL`.

---

## How the app decides local vs cloud

`src/lib/db.ts` picks the backend from one variable:

```
DATABASE_URL set   → Neon / any Postgres   (deployed)
DATABASE_URL unset → embedded PGLite       (local dev + live preview)
```

`src/lib/auth/server.ts` is tri-mode and keys off the same idea:

```
BETTER_AUTH_URL + DATABASE_URL + GROK_AUTH_*   → deployed: real federated auth in Postgres
neither                                         → live preview: shared preview client + PGLite
VITE_AUTH_ENABLED="false"                       → auth off (dev user)
```

So **there is no "switch to cloud" code change** — setting the deployed env vars
is the switch. That is why this file is mostly instructions rather than patches.

---

## Step 1 — Get a Neon Postgres database

1. Create a project at <https://console.neon.tech> (free tier is plenty).
2. Copy the **pooled** connection string. It looks like:

   ```
   postgresql://USER:PASSWORD@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

   Use the **pooler** host (it contains `-pooler`) — Vercel runs serverless
   functions, and each invocation can open a connection; the pooler is what keeps
   that from exhausting Neon's connection limit.

`migrations/*.sql` is applied to this database automatically by `npm run build`
(see "Deploy step" below) — you do not run migrations by hand.

## Step 2 — Publish the app

The platform deploys this repo to Vercel. On publish it injects:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string from Step 1 → switches `db.ts` to Postgres |
| `BETTER_AUTH_URL` | The app's public `https://…` origin → OAuth redirect + cookie origin |
| `BETTER_AUTH_SECRET` | Session signing secret |
| `GROK_AUTH_ISSUER` / `GROK_AUTH_CLIENT_ID` / `GROK_AUTH_CLIENT_SECRET` | Federated sign-in (Google/X) broker creds |
| `GROK_PROJECT_ID` | Marks a deployed (vs preview) instance |

**Never commit these.** They are not in this repo and must not be:

- There is no `.env` file in the repo, by design — the platform injects runtime
  config, and only `VITE_`-prefixed vars would reach the browser anyway.
- If you deploy this yourself to Vercel instead of via the platform, set the same
  names in **Project → Settings → Environment Variables** for Production.

### What `npm run build` does on the deploy

```
vite build        → emits .vercel/output (Vercel serverless + static)
npm run db:migrate → scripts/migrate.mjs applies migrations/*.sql to DATABASE_URL
```

`db:migrate` opens a `pg` pool against `DATABASE_URL`, applies each pending file
in a transaction, and records it in `_migrations`. It is idempotent — re-deploys
skip already-applied files. With no `DATABASE_URL` (local build) it exits
cleanly and the PGLite fallback migrates itself instead.

## Step 3 — Point the APK at the public URL

The Android shell loads the app from a server (it is a server-rendered app, so it
cannot be bundled statically). Change `CAP_SERVER_URL` and rebuild:

```powershell
# use the real URL from your deploy
$env:CAP_SERVER_URL = "https://your-app.vercel.app"
npm run android:apk
```

`scripts/build-apk.mjs` reads `CAP_SERVER_URL` and, for an `https://` URL,
automatically:
- writes it into `capacitor.config.ts`'s `server.url`,
- turns `cleartext` **off** (Android must not advertise plain-http support),
- strips `android:usesCleartextTraffic` from the manifest.

The APK is then fully cloud-backed: **no PC, no LAN, no dev server needed.**

Output: `android/app/build/outputs/apk/debug/app-debug.apk` → install on the phone.

---

## Verifying it is actually cloud-shared

1. Sign in on the phone app, create an event.
2. Open the same public URL in a desktop browser, sign in as the same account.
3. The event is there. Edit the title on desktop → on the phone it refreshes
   within ~20 s (or immediately when the app regains focus).
4. Invite a second account by email from the event composer. That account, when
   it signs in, sees a **"Shared with you"** banner and can **Join** — after which
   the event appears in *its* event list on every device it signs in from.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Deploy is blank / `MIME type "text/html"` on `/assets/*` | build output/base path, not this feature | re-run `npm run build`; see `.grok/references/deploy-target.md` |
| `Invalid origin` on sign-in | `BETTER_AUTH_URL` doesn't exactly match the public origin | set it to the exact `https://…` origin |
| Events present locally but not on the phone | APK still points at the LAN IP | rebuild with `CAP_SERVER_URL` = the public URL |
| `relation "events" does not exist` in prod | migrations didn't run | confirm `DATABASE_URL` was set **during the build**, then redeploy |
| Sign-in works, but a second account can't see a shared event | they haven't accepted the invite yet | invitee signs in → "Shared with you" → **Join** |
| Too many Neon connections | using the direct host, not the pooler | use the `-pooler` connection string |
