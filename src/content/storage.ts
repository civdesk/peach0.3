/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sanitizeArticleText } from '../utils/sanitize';

export type ArticleStatus = 'draft' | 'published' | 'archived';

export type ContentCategory =
  | 'civdesk'
  | 'foodchain'
  | 'death'
  | 'disaster'
  | 'floating-island'
  | 'lets-decide';

export interface ArticleDocument {
  id?: number;
  path: string;
  category: ContentCategory;
  title: string;
  description: string;
  excerpt?: string;
  pinned?: boolean;
  status: ArticleStatus;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

const VALID_CATEGORIES = new Set<ContentCategory>([
  'civdesk',
  'foodchain',
  'death',
  'disaster',
  'floating-island',
  'lets-decide'
]);

function stripQuotes(val: string): string {
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function normalizeCategory(rawCategory: string): ContentCategory {
  const map: Record<string, ContentCategory> = {
    'floating-island': 'floating-island',
    '桃花浮岛': 'floating-island',
    foodchain: 'foodchain',
    '弱肉强食': 'foodchain',
    death: 'death',
    '生老病死': 'death',
    disaster: 'disaster',
    '自然灾害': 'disaster',
    'lets-decide': 'lets-decide',
    "Let's Decide": 'lets-decide',
    civdesk: 'civdesk',
    '文明编辑部': 'civdesk'
  };
  return map[rawCategory] || 'civdesk';
}

export function extractCategoryFromPath(filePath: string): ContentCategory {
  const normalized = filePath.replace(/^\/+/, '');
  const parts = normalized.split('/');
  const cat = parts[2] as ContentCategory | undefined;
  if (cat && VALID_CATEGORIES.has(cat)) {
    return cat;
  }
  return 'civdesk';
}

/**
 * 解析 content/articles/*.md 的只读 Markdown 文件并进行 XSS 安全过滤
 */
export function parseMarkdownFile(rawText: string, filePath: string): ArticleDocument {
  const normalizedPath = filePath.replace(/^\/+/, '');
  let category: ContentCategory = extractCategoryFromPath(normalizedPath);

  const match = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    const trimmedRaw = rawText.trim();
    const headingMatch = trimmedRaw.match(/^#\s+([^\r\n]+)\r?\n+([\s\S]*)$/);
    const rawTitle = headingMatch
      ? headingMatch[1].trim()
      : normalizedPath.split('/').pop()?.replace(/\.md$/, '') || '未命名文章';
    const rawBody = headingMatch ? headingMatch[2].trim() : trimmedRaw;
    return {
      path: normalizedPath,
      category,
      title: sanitizeArticleText(rawTitle),
      description: '',
      excerpt: '',
      pinned: false,
      status: 'published',
      content: sanitizeArticleText(rawBody),
      createdAt: '2026-01-01 00:00:00',
      updatedAt: '2026-01-01 00:00:00'
    };
  }

  const frontmatterBlock = match[1];
  const body = match[2].trim();

  let id: number | undefined;
  let title = '';
  let excerpt = '';
  let pinned = false;
  let status: ArticleStatus = 'published';
  let createdAt = '2026-01-01 00:00:00';
  let updatedAt = '2026-01-01 00:00:00';

  const lines = frontmatterBlock.split(/\r?\n/);
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = stripQuotes(line.slice(colonIdx + 1));

    if (key === 'id') {
      const parsedId = Number(val);
      if (!Number.isNaN(parsedId) && parsedId > 0) {
        id = parsedId;
      }
    } else if (key === 'title') {
      title = val;
    } else if (key === 'category' && val) {
      category = normalizeCategory(val);
    } else if (key === 'excerpt' || key === 'description') {
      if (val) excerpt = val;
    } else if (key === 'pinned') {
      pinned = val === '1' || val.toLowerCase() === 'true';
    } else if (key === 'published') {
      const lower = val.toLowerCase();
      if (lower === '0' || lower === 'false') {
        status = 'draft';
      } else if (lower === '1' || lower === 'true') {
        if (status !== 'draft') {
          status = 'published';
        }
      }
    } else if (key === 'status') {
      const lower = val.toLowerCase();
      if (lower === 'draft' || lower === 'archived') {
        status = lower as ArticleStatus;
      } else if (lower === 'published') {
        if (status !== 'draft') {
          status = 'published';
        }
      }
    } else if (key === 'created_at') {
      if (val) createdAt = val;
    } else if (key === 'updated_at') {
      if (val) updatedAt = val;
    }
  }

  const safeTitle = sanitizeArticleText(
    title || normalizedPath.split('/').pop()?.replace(/\.md$/, '') || '未命名文章'
  );
  const safeExcerpt = sanitizeArticleText(excerpt);

  return {
    id,
    path: normalizedPath,
    category,
    title: safeTitle,
    description: safeExcerpt,
    excerpt: safeExcerpt,
    pinned,
    status,
    content: sanitizeArticleText(body),
    createdAt: sanitizeArticleText(createdAt),
    updatedAt: sanitizeArticleText(updatedAt || createdAt)
  };
}
