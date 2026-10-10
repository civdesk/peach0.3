/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 从 content/articles/*.md 自动生成 D1 数据库同步 SQL 文件 (migrations/sync_articles.sql)。
 * 文章统一通过 GitHub 仓库中的 Markdown 文件维护。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const articlesDir = path.join(rootDir, 'content', 'articles');
const migrationsDir = path.join(rootDir, 'migrations');
const outputSqlPath = path.join(migrationsDir, 'sync_articles.sql');

function stripQuotes(val) {
  const trimmed = String(val || '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function escapeSqlString(str) {
  return `'${String(str ?? '').replace(/'/g, "''")}'`;
}

function parseMarkdownArticle(rawText, filename, fallbackId) {
  const match = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  let id = fallbackId;
  let title = filename.replace(/\.md$/, '');
  let category = 'civdesk';
  let excerpt = '';
  let published = 1;
  let pinned = 0;
  let createdAt = '2026-01-01 00:00:00';
  let updatedAt = '2026-01-01 00:00:00';
  let body = rawText.trim();

  if (match) {
    const frontmatter = match[1];
    body = match[2].trim();
    for (const line of frontmatter.split(/\r?\n/)) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = stripQuotes(line.slice(idx + 1));
      if (key === 'id' && val) id = Number(val) || fallbackId;
      else if (key === 'title' && val) title = val;
      else if (key === 'category' && val) category = val;
      else if (key === 'excerpt') excerpt = val;
      else if (key === 'published' && val !== '') published = Number(val) ? 1 : 0;
      else if (key === 'pinned' && val !== '') pinned = Number(val) ? 1 : 0;
      else if (key === 'created_at' && val) createdAt = val;
      else if (key === 'updated_at' && val) updatedAt = val;
    }
  }

  return {
    id,
    title,
    category,
    excerpt,
    content: body,
    published,
    pinned,
    createdAt,
    updatedAt
  };
}

function main() {
  if (!fs.existsSync(articlesDir)) {
    return;
  }

  const files = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith('.md'))
    .sort();

  const articles = files.map((file, index) => {
    const raw = fs.readFileSync(path.join(articlesDir, file), 'utf8');
    return parseMarkdownArticle(raw, file, index + 1);
  });

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const sqlLines = [
    '-- 自动由 scripts/sync-articles-sql.mjs 从 content/articles/*.md 生成',
    '-- 用于通过 Wrangler CLI 将文章同步至 Cloudflare D1 数据库',
    '',
    'CREATE TABLE IF NOT EXISTS articles (',
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
    '  title TEXT NOT NULL,',
    '  category TEXT NOT NULL,',
    "  excerpt TEXT NOT NULL DEFAULT '',",
    '  content TEXT NOT NULL,',
    '  published INTEGER NOT NULL DEFAULT 1,',
    '  pinned INTEGER NOT NULL DEFAULT 0,',
    "  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),",
    "  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))",
    ');',
    '',
    'CREATE INDEX IF NOT EXISTS idx_articles_category_published',
    '  ON articles (category, published, pinned DESC, created_at DESC);',
    ''
  ];

  for (const art of articles) {
    sqlLines.push(
      `INSERT OR REPLACE INTO articles (id, title, category, excerpt, content, published, pinned, created_at, updated_at) VALUES (${art.id}, ${escapeSqlString(art.title)}, ${escapeSqlString(art.category)}, ${escapeSqlString(art.excerpt)}, ${escapeSqlString(art.content)}, ${art.published}, ${art.pinned}, ${escapeSqlString(art.createdAt)}, ${escapeSqlString(art.updatedAt)});`
    );
  }

  sqlLines.push('');
  fs.writeFileSync(outputSqlPath, sqlLines.join('\n'), 'utf8');
}

main();
