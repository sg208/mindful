#!/usr/bin/env node
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const CSV_PATH =
  process.env.CSV_PATH ??
  resolve(root, '..', '..', 'Downloads', 'mindful-from-appwrite-april-2026.csv');

const POSTS_DIR = resolve(root, 'src', 'content', 'posts');
const CATEGORIES_DIR = resolve(root, 'src', 'content', 'categories');

// Minimal RFC-4180-ish CSV parser. Handles quoted fields, escaped quotes, newlines in quotes.
function parseCsv(input) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    if (char === '\r') {
      continue;
    }
    cell += char;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function toRecords(rows) {
  const [headers, ...rest] = rows;
  return rest
    .filter((row) => row.some((value) => value !== ''))
    .map((row) => Object.fromEntries(headers.map((key, index) => [key, row[index] ?? ''])));
}

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

function normalizeCategoryId(raw) {
  return raw.replace(/^cat_/, '').replace(/_/g, '-');
}

function slugifyFilename(slug) {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeYaml(value) {
  if (value == null) return '""';
  const stringValue = String(value);
  // Always double-quote scalars from a CSV: YAML treats many leading characters
  // (`!`, `&`, `*`, `|`, `>`, `@`, `` ` ``, `[`, `]`, `{`, `}`, `,`, `?`, `-`)
  // and bare values like `yes`/`no`/`null` specially. Quoting consistently
  // keeps untrusted CSV input from altering the shape of emitted frontmatter.
  return `"${stringValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function buildFrontmatter(record) {
  const categoryId = record.categoryId ?? '';
  const category = normalizeCategoryId(categoryId);
  const reviewRequired = record.reviewRequired?.toLowerCase() === 'true';
  const featured = record.featured?.toLowerCase() === 'true';
  const imageUrl = record.imageUrl?.trim();
  const imageAlt = record.imageAlt?.trim();
  const updatedAt = (record.$updatedAt || record.publishedAt)?.trim();

  /** Required entries first. Optional entries are only emitted when present so
   * optional Zod fields like `image: z.url()` never see an empty string. */
  const entries = [
    ['title', record.title],
    ['excerpt', record.excerpt],
    ['category', category],
    ['publishedAt', record.publishedAt],
  ];
  if (updatedAt) entries.push(['updatedAt', updatedAt]);
  if (imageUrl) entries.push(['image', imageUrl]);
  if (imageAlt) entries.push(['imageAlt', imageAlt]);
  entries.push(
    ['featured', featured],
    ['reviewRequired', reviewRequired],
    ['draft', reviewRequired],
  );

  const lines = entries.map(([key, value]) => {
    if (typeof value === 'boolean') return `${key}: ${value}`;
    return `${key}: ${escapeYaml(value)}`;
  });
  return `---\n${lines.join('\n')}\n---\n`;
}

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
