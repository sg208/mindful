#!/usr/bin/env node
import { access, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const src = resolve(root, '.env.example');
const dest = resolve(root, '.env');

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const hasExample = await exists(src);
if (!hasExample) {
  console.error('[init:env] .env.example is missing. Cannot initialize environment.');
  process.exit(1);
}

const hasEnv = await exists(dest);
if (hasEnv) {
  console.log('[init:env] .env already exists — leaving untouched.');
  process.exit(0);
}

await copyFile(src, dest);
console.log('[init:env] Created .env from .env.example');
