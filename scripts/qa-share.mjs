/**
 * Visual + console verification of the home screen after the signing/sharing
 * changes. Not part of the build — a one-off QA driver so the render is checked
 * by looking at it, not by assuming.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function shoot(name, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 30000 });
  // Let the auth gate resolve and the app paint past its spinner.
  await page.waitForTimeout(2500);

  const bodyText = (await page.textContent("body")) ?? "";
  const hasSpinner = await page.locator(".animate-spin").count();
  const screenshot = `${OUT}/${name}.png`;
  await page.screenshot({ path: screenshot, fullPage: true });

  console.log(
    JSON.stringify(
      {
        name,
        viewport: `${width}x${height}`,
        bodyLength: bodyText.trim().length,
        bodyPreview: bodyText.trim().slice(0, 180),
        spinnersVisible: hasSpinner,
        consoleErrors: errors,
        screenshot,
      },
      null,
      2,
    ),
  );
  await page.close();
}

await shoot("share-home-desktop", 1280, 900);
await shoot("share-home-mobile", 390, 844);

await browser.close();
