#!/usr/bin/env node
/**
 * Generate the Android launcher icon + splash source art (PNG) from inline SVG,
 * then hand it to `@capacitor/assets` to produce every Android density.
 *
 *   node scripts/generate-icons.mjs
 *   (or: npm run icons:generate)
 *
 * Why SVG -> PNG here instead of checked-in binaries: the mark must match the
 * app's own favicon and palette (dark #0b0b0a canvas, cream #f3f1ea clock, teal
 * #6fd0b6 accent), and keeping it as code means a palette change re-propagates
 * everywhere in one run rather than by re-exporting files from a design tool.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const RES = join(ROOT, "resources");

const BG = "#0b0b0a";
const CREAM = "#f3f1ea";
const ACCENT = "#6fd0b6";

/**
 * The clock mark, drawn on a transparent canvas of `size`.
 *
 * Icon: the rounded-square tile is part of the art (Android masks it, but the
 * fallback/legacy icon needs the plate). Splash: no plate — just the clock on
 * the app canvas so it reads on any background.
 */
function clockMark({ size, withPlate }) {
  const c = size / 2;
  // Android's adaptive-icon mask crops to the inner ~66% "safe zone", so the
  // mark is drawn at 62% of the canvas to guarantee no clipping under any mask
  // (circle, squircle, rounded-square).
  const s = size * 0.62;
  const r = s * 0.26; // clock radius
  const strokeW = s * 0.055;
  const plate = withPlate
    ? `<rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.22}" fill="${BG}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${plate}
 <g transform="translate(${c} ${c})">
 <circle cx="0" cy="0" r="${r}" fill="none" stroke="${CREAM}" stroke-width="${strokeW}"/>
 <circle cx="0" cy="0" r="${r * 1.42}" fill="none" stroke="${ACCENT}" stroke-width="${strokeW * 0.7}" opacity="0.55" stroke-dasharray="${s * 0.02} ${s * 0.05}"/>
 <path d="M0 ${-r * 0.62} V0 L${r * 0.5} ${r * 0.3}"
        fill="none" stroke="${CREAM}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>
 </g>
</svg>`;
}

/** Full-bleed splash canvas with the mark centered. */
function splash({ size }) {
  const c = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
 <rect width="${size}" height="${size}" fill="${BG}"/>
 <g transform="translate(${c} ${c})">
    <circle r="${size * 0.115}" fill="none" stroke="${CREAM}" stroke-width="${size * 0.018}"/>
    <circle r="${size * 0.16}" fill="none" stroke="${ACCENT}" stroke-width="${size * 0.012}" opacity="0.5" stroke-dasharray="${size * 0.006} ${size * 0.016}"/>
    <path d="M0 ${-size * 0.071} V0 L${size * 0.058} ${size * 0.035}"
          fill="none" stroke="${CREAM}" stroke-width="${size * 0.018}" stroke-linecap="round" stroke-linejoin="round"/>
 </g>
</svg>`;
}

const jobs = [
  { file: "icon.png", svg: clockMark({ size: 1024, withPlate: true }) },
  { file: "icon-foreground.png", svg: clockMark({ size: 1024, withPlate: false }) },
  { file: "icon-background.png", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${BG}"/></svg>` },
  { file: "splash.png", svg: splash({ size: 2732 }) },
  { file: "splash-dark.png", svg: splash({ size: 2732 }) },
];

mkdirSync(RES, { recursive: true });

for (const job of jobs) {
  const buf = await sharp(Buffer.from(job.svg)).png().toBuffer();
  writeFileSync(join(RES, job.file), buf);
  console.log(`[icons] wrote resources/${job.file} (${buf.length} bytes)`);
}

console.log("[icons] done — now run: npx @capacitor/assets generate --android");
