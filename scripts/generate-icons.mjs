/**
 * Run this script once to generate placeholder PWA icons:
 * node scripts/generate-icons.mjs
 *
 * In production, replace with proper branded icons.
 * The icons use canvas (via the 'canvas' npm package) to render an SVG-style icon.
 * For Vercel deployment, commit pre-generated PNG files.
 */

import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../public/icons");

mkdirSync(iconsDir, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#1E3A2F";
  roundRect(ctx, 0, 0, size, size, size * 0.2);
  ctx.fill();

  // Lock emoji approximation — draw a simple lock shape
  const cx = size / 2;
  const cy = size * 0.55;
  const bodyW = size * 0.44;
  const bodyH = size * 0.36;

  // Lock body
  ctx.fillStyle = "#FFFBF5";
  roundRect(
    ctx,
    cx - bodyW / 2,
    cy - bodyH * 0.1,
    bodyW,
    bodyH,
    size * 0.06
  );
  ctx.fill();

  // Lock shackle
  ctx.strokeStyle = "#FFFBF5";
  ctx.lineWidth = size * 0.07;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy - bodyH * 0.15, bodyW * 0.28, Math.PI, 0);
  ctx.stroke();

  // Keyhole
  ctx.fillStyle = "#1E3A2F";
  ctx.beginPath();
  ctx.arc(cx, cy + bodyH * 0.2, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - size * 0.025, cy + bodyH * 0.2, size * 0.05, size * 0.09);

  return canvas.toBuffer("image/png");
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

try {
  writeFileSync(join(iconsDir, "icon-192.png"), drawIcon(192));
  writeFileSync(join(iconsDir, "icon-512.png"), drawIcon(512));
  writeFileSync(join(iconsDir, "apple-touch-icon.png"), drawIcon(180));
  console.log("✅ Icons generated in public/icons/");
} catch (e) {
  console.error(
    "⚠️  Could not generate icons (canvas package not installed). Add PNG icons to public/icons/ manually."
  );
  console.error(e.message);
}
