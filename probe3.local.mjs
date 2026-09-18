import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, channel: "chromium" });
for (const vp of [{width:1280,height:900},{width:1024,height:700}]) {
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const out = await p.evaluate(() => {
    const de = document.documentElement;
    const over = [];
    document.querySelectorAll("*").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > de.clientWidth + 0.5 || r.left < -0.5) {
        over.push({ tag: el.tagName, cls: (el.className||"").toString().slice(0,80), left: Math.round(r.left), right: Math.round(r.right) });
      }
    });
    const ch = document.querySelector(".device-chassis").getBoundingClientRect();
    return { clientW: de.clientWidth, scrollW: de.scrollWidth, chassis: {w: Math.round(ch.width), h: Math.round(ch.height)}, over: over.slice(0,8) };
  });
  console.log(vp.width+"x"+vp.height, JSON.stringify(out, null, 1));
  await ctx.close();
}
await b.close();
