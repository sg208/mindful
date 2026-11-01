#!/usr/bin/env node
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseCsv, toRecords } from './lib/csv.mjs';
import { buildFrontmatter, normalizeCategoryId, slugifyFilename } from './lib/frontmatter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const CSV_PATH =
  process.env.CSV_PATH ??
  resolve(root, '..', '..', 'Downloads', 'mindful-from-appwrite-april-2026.csv');

const POSTS_DIR = resolve(root, 'src', 'content', 'posts');
const CATEGORIES_DIR = resolve(root, 'src', 'content', 'categories');

const CATEGORY_META = {
  cat_anxiety_stress: {
    label: 'Anxiety & Stress',
    description: 'Gentle tools for moments when the mind runs ahead of the body.',
    accent: '#7A9B8E',
  },
  cat_mindfulness: {
    label: 'Mindfulness',
    description: 'Small practices for paying attention to what is already here.',
    accent: '#9FB7A4',
  },
  cat_relationships: {
    label: 'Relationships',
    description: 'Showing up with care — for others, and for yourself.',
    accent: '#C9875B',
  },
  cat_self_care: {
    label: 'Self-Care',
    description: 'The quiet, ordinary acts that keep us steady.',
    accent: '#D4A574',
  },
  cat_sleep_rest: {
    label: 'Sleep & Rest',
    description: 'Permission to slow down, rest, and begin again.',
    accent: '#6B8E9E',
  },
};

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function writeCategories() {
  await ensureDir(CATEGORIES_DIR);
  for (const [rawId, meta] of Object.entries(CATEGORY_META)) {
    const id = normalizeCategoryId(rawId);
    const file = resolve(CATEGORIES_DIR, `${id}.json`);
    const body = {
      id,
      label: meta.label,
      description: meta.description,
      accent: meta.accent,
    };
    await writeFile(file, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
  }
}

async function writePosts(records) {
  await ensureDir(POSTS_DIR);
  let written = 0;
  for (const record of records) {
    const slug = slugifyFilename(record.slug || record.$id || record.title);
    if (!slug) continue;
    const file = resolve(POSTS_DIR, `${slug}.md`);
    const frontmatter = buildFrontmatter(record);
    const body = (record.body ?? '').replace(/\r\n/g, '\n').trim();
    await writeFile(file, `${frontmatter}\n${body}\n`, 'utf8');
    written += 1;
  }
  return written;
}

async function main() {
  if (!(await exists(CSV_PATH))) {
    console.error(`[seed] CSV not found at ${CSV_PATH}`);
    console.error('[seed] Set CSV_PATH=... to override.');
    process.exit(1);
  }
  const csv = await readFile(CSV_PATH, 'utf8');
  const rows = parseCsv(csv);
  const records = toRecords(rows);
  const posts = await writePosts(records);
  await writeCategories();
  console.log(`[seed] Wrote ${posts} post(s) to ${POSTS_DIR}`);
  console.log(`[seed] Wrote ${Object.keys(CATEGORY_META).length} categories to ${CATEGORIES_DIR}`);
}

main().catch((error) => {
  console.error('[seed] Failed:', error);
  process.exit(1);
});
