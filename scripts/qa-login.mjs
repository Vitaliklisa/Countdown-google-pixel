/**
 * Render check for the login screen, in BOTH provider configurations.
 *
 * The important assertion is the fallback: with no Google credentials the page
 * must still render usable sign-in buttons rather than an empty card — that is
 * the additivity contract, verified by looking at the page.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("screenshots", { recursive: true });
const base = process.env.QA_BASE ?? "http://127.0.0.1:8080";
const label = process.env.QA_LABEL ?? "login";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(`${base}/login`, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1500);

const buttons = await page.locator("button").allInnerTexts();
const text = (await page.textContent("body")) ?? "";
const shot = `screenshots/${label}.png`;
await page.screenshot({ path: shot, fullPage: true });

console.log(
  JSON.stringify(
    {
      label,
      buttons: buttons.map((b) => b.trim()).filter(Boolean),
      hasGoogle: text.includes("Google"),
      consoleErrors: errors,
      screenshot: shot,
    },
    null,
    2,
  ),
);

await browser.close();
