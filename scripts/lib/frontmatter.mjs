export const normalizeCategoryId = (raw) => {
  return raw.replace(/^cat_/, '').replace(/_/g, '-');
};

export const slugifyFilename = (slug) => {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const escapeYaml = (value) => {
  if (value == null) return '""';
  const stringValue = String(value);
  // Always double-quote scalars from a CSV: YAML treats many leading characters
  // (`!`, `&`, `*`, `|`, `>`, `@`, `` ` ``, `[`, `]`, `{`, `}`, `,`, `?`, `-`)
  // and bare values like `yes`/`no`/`null` specially. Quoting consistently
  // keeps untrusted CSV input from altering the shape of emitted frontmatter.
  return `"${stringValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
};

export const buildFrontmatter = (record) => {
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
};
