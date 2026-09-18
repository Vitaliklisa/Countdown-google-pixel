import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, channel: "chromium" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await p.waitForTimeout(700);
const info = await p.evaluate(() => {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const frame = document.querySelector(".device-screen");
  const chassisBox = frame ? frame.getBoundingClientRect() : null;
  const desktopBranch = document.querySelector(".hidden.min-\\[900px\\]\\:flex");
  return {
    htmlClass: root.className,
    theme: root.dataset.theme,
    tokBg: cs.getPropertyValue("--color-bg").trim(),
    tokFg: cs.getPropertyValue("--color-fg").trim(),
    tokSurface: cs.getPropertyValue("--color-surface").trim(),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
    screenSize: chassisBox ? { w: Math.round(chassisBox.width), h: Math.round(chassisBox.height) } : null,
    desktopBranchDisplay: desktopBranch ? getComputedStyle(desktopBranch).display : "absent",
    h1: (() => { const el = document.querySelector("h1"); return el ? { text: el.textContent, color: getComputedStyle(el).color } : null; })(),
    visibleH1s: [...document.querySelectorAll("h1")].map(e => ({ t: e.textContent.trim().slice(0,30), c: getComputedStyle(e).color, w: Math.round(e.getBoundingClientRect().width) })),
  };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
