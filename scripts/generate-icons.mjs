#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const svgPath = resolve(root, 'public', 'favicon.svg');
const iconDir = resolve(root, 'public', 'icons');

await mkdir(iconDir, { recursive: true });

const svg = await readFile(svgPath);

// Maskable variant: logo re-drawn inside the safe area (inner 80% per maskable spec).
const maskableSvg = Buffer.from(
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#F7F3EC" />
  <circle cx="50" cy="50" r="18" fill="none" stroke="#6B8E7F" stroke-width="2.6" />
  <circle cx="50" cy="50" r="9" fill="none" stroke="#C9875B" stroke-width="2" />
  <circle cx="50" cy="50" r="2.25" fill="#1F2A24" />
</svg>`,
);

const tasks = [
  { input: svg, size: 192, name: 'icon-192.png' },
  { input: svg, size: 512, name: 'icon-512.png' },
  { input: maskableSvg, size: 512, name: 'icon-maskable-512.png' },
];

for (const task of tasks) {
  const out = resolve(iconDir, task.name);
  const png = await sharp(task.input, { density: 512 })
    .resize(task.size, task.size, {
      fit: 'contain',
      background: { r: 247, g: 243, b: 236, alpha: 1 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(out, png);
  console.log(`[icons] ${task.name} (${task.size}x${task.size})`);
}
