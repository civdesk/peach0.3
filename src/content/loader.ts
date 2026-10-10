/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ArticleDocument,
  ContentCategory,
  normalizeCategory,
  parseMarkdownFile
} from './storage';
import { sanitizeArticleText } from '../utils/sanitize';

export const DEFAULT_FOOTER_TEXT = `桃花浮岛

一个关于生命、文明与共同生活的开放性实验。

© 2026 Peach Blossom Island`;

/**
 * D1 数据库文章记录结构（只读）
 */
export interface D1ArticleRecord {
  id: number;
  title: string;
  category: ContentCategory;
  excerpt: string;
  content: string;
  published: number;
  pinned: number;
  created_at: string;
  updated_at: string;
}

/**
 * 读取 GitHub 仓库 content/articles/*.md 中的 Markdown 文章文件
 */
const rawMarkdownFiles = import.meta.glob('/content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

function sortArticleDocuments(docs: ArticleDocument[]): ArticleDocument[] {
  return [...docs].sort((a, b) => {
    const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if (pinDiff !== 0) return pinDiff;
    const timeDiff = (b.createdAt || '').localeCompare(a.createdAt || '');
    if (timeDiff !== 0) return timeDiff;
    return (b.id || 0) - (a.id || 0);
  });
}

function getMarkdownArticles(): ArticleDocument[] {
  const docs: ArticleDocument[] = [];
  for (const [rawPath, rawContent] of Object.entries(rawMarkdownFiles)) {
    const doc = parseMarkdownFile(rawContent, rawPath);
    if (doc.status === 'published') {
      docs.push(doc);
    }
  }
  return sortArticleDocuments(docs);
}

/**
 * 读取站点底部 Footer 文字（只读）
 */
export function getSiteFooterText(): string {
  return sanitizeArticleText(DEFAULT_FOOTER_TEXT);
}

/**
 * 公开文章以 GitHub content/articles/*.md 为唯一真实来源。
 * 保持异步方法签名兼容，直接返回本地已发布的 Markdown 文章，不依赖或调用 /api/articles。
 */
export async function syncD1PublishedArticles(): Promise<ArticleDocument[]> {
  return getAllArticles();
}

/**
 * 获取当前全部公开文章列表（只读，以 content/articles/*.md 为唯一来源）
 */
export function getAllArticles(): ArticleDocument[] {
  return getMarkdownArticles();
}

/**
 * 按路径或 D1 ID (d1/<id>) 读取单篇公开文章
 */
export function getArticleByPath(filePath: string): ArticleDocument | null {
  const normalized = filePath.replace(/^\/+/, '');
  const allCurrent = getAllArticles();
  const foundInCurrent = allCurrent.find((d) => d.path === normalized);
  if (foundInCurrent) return foundInCurrent;

  const rawKey = `/${normalized}`;
  const rawContent = rawMarkdownFiles[rawKey];
  if (rawContent !== undefined) {
    return parseMarkdownFile(rawContent, normalized);
  }

  return null;
}

/**
 * 获取指定一级栏目下所有公开（status === 'published'）的文章（置顶优先，其次按创建时间倒序）
 */
export function getPublishedArticlesByCategory(
  category: ContentCategory
): ArticleDocument[] {
  return getAllArticles().filter(
    (doc) => doc.category === category && doc.status === 'published'
  );
}

/**
 * 获取「文明编辑部」展示的公开文章列表
 */
export function getCivDeskPublishedDocuments(): ArticleDocument[] {
  return getPublishedArticlesByCategory('civdesk');
}
