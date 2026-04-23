#!/usr/bin/env node
/**
 * upload-to-cdn.mjs
 *
 * Uploads all files from dist/ to Bunny CDN storage, then purges the pull-zone
 * cache. Runs as part of the startup command so output is visible in Railway
 * deploy logs.
 *
 * Required environment variables:
 *   BUNNY_STORAGE_ACCESS_KEY  – Storage zone password (used for PUT requests)
 *   BUNNY_API_KEY             – Account API key (used for cache purge)
 *   BUNNY_ZONE_ID             – Pull-zone ID to purge
 *
 * The script exits 0 regardless of upload/purge failures so that the server
 * always starts even when CDN credentials are absent or the API is unreachable.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(here, '..', 'dist');
const STORAGE_BASE_URL = 'https://storage.bunnycdn.com/mindful-prod';
const PURGE_URL = 'https://api.bunny.net/pullzone';

const STORAGE_ACCESS_KEY = process.env.BUNNY_STORAGE_ACCESS_KEY;
const API_KEY = process.env.BUNNY_API_KEY;
const ZONE_ID = process.env.BUNNY_ZONE_ID;

// ─── helpers ────────────────────────────────────────────────────────────────

/** Encode each path segment individually, preserving the slashes between them. */
function encodePath(rawPath) {
  return rawPath.split('/').map(encodeURIComponent).join('/');
}

/** Recursively collect every file path under a directory. */
async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await collectFiles(full)));
    } else {
      paths.push(full);
    }
  }
  return paths;
}

/** Upload a single file to Bunny storage. Returns true on success. */
async function uploadFile(filePath) {
  const relativePath = relative(DIST_DIR, filePath).replace(/\\/g, '/');
  const url = `${STORAGE_BASE_URL}/${encodePath(relativePath)}`;

  let body;
  try {
    body = await readFile(filePath);
  } catch (err) {
    console.error(`[cdn] ✗ read error  ${relativePath}: ${err.message}`);
    return false;
  }

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        AccessKey: STORAGE_ACCESS_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body,
    });

    if (!res.ok) {
      console.error(`[cdn] ✗ upload failed  ${relativePath}  HTTP ${res.status}`);
      return false;
    }

    console.log(`[cdn] ✓ uploaded  ${relativePath}`);
    return true;
  } catch (err) {
    console.error(`[cdn] ✗ network error  ${relativePath}: ${err.message}`);
    return false;
  }
}

/** Purge the Bunny pull-zone cache. Returns true on success. */
async function purgeCache() {
  const url = `${PURGE_URL}/${ZONE_ID}/purgeCache`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        AccessKey: API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`[cdn] ✗ cache purge failed  HTTP ${res.status}`);
      return false;
    }

    console.log('[cdn] ✓ cache purged');
    return true;
  } catch (err) {
    console.error(`[cdn] ✗ cache purge network error: ${err.message}`);
    return false;
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  // Validate that dist/ exists before doing anything.
  try {
    const s = await stat(DIST_DIR);
    if (!s.isDirectory()) throw new Error('not a directory');
  } catch {
    console.warn('[cdn] dist/ not found — skipping CDN upload');
    return;
  }

  // Validate credentials. Warn and bail out rather than failing hard.
  if (!STORAGE_ACCESS_KEY || !API_KEY || !ZONE_ID) {
    console.warn(
      '[cdn] Missing one or more required env vars ' +
        '(BUNNY_STORAGE_ACCESS_KEY, BUNNY_API_KEY, BUNNY_ZONE_ID) — skipping CDN upload',
    );
    return;
  }

  // ZONE_ID is interpolated into a URL path segment — reject anything that
  // isn't a plain positive integer to prevent path injection.
  if (!/^\d+$/.test(ZONE_ID)) {
    console.warn('[cdn] BUNNY_ZONE_ID must be a numeric ID — skipping CDN upload');
    return;
  }

  console.log('[cdn] Starting CDN upload…');

  let files;
  try {
    files = await collectFiles(DIST_DIR);
  } catch (err) {
    console.error(`[cdn] Failed to read dist/: ${err.message}`);
    return;
  }

  console.log(`[cdn] ${files.length} file(s) to upload`);

  const CONCURRENCY = 8;
  let ok = 0;
  let fail = 0;

  // Upload files in bounded-concurrency batches. Bunny object storage
  // creates virtual directory paths automatically on PUT — no explicit
  // mkdir step is needed.
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((file) => uploadFile(file)));
    for (const success of results) {
      if (success) {
        ok++;
      } else {
        fail++;
      }
    }
  }

  console.log(`[cdn] Upload complete — ${ok} succeeded, ${fail} failed`);

  if (fail === 0) {
    await purgeCache();
  } else {
    console.warn('[cdn] Skipping cache purge because some uploads failed');
  }
}

main().catch((err) => {
  // Catch any unexpected top-level error so the process always exits 0.
  console.error(`[cdn] Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
});
