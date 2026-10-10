/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cloudflare Worker Entry (peach-blossom-island-v0-2)
 * 只读公开文章 API：
 * - 仅允许 GET 请求（GET /api/articles 与 GET /api/articles/:id）
 * - 仅执行只读 SELECT 查询，所有参数均使用 .bind() 参数绑定
 * - 其余请求交由静态 Assets (SPA) 处理
 */

import { sanitizeArticleText } from './src/utils/sanitize';

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(colName?: string): Promise<T | null>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface AssetsFetcher {
  fetch(request: Request | string): Promise<Response>;
}

export interface Env {
  DB?: D1Database;
  ASSETS?: AssetsFetcher;
}

export interface D1ArticleRow {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  published: number;
  pinned: number;
  created_at: string;
  updated_at: string;
}

const VALID_CATEGORIES = new Set([
  'floating-island',
  'foodchain',
  'death',
  'disaster',
  'lets-decide',
  'civdesk'
]);

const DEFAULT_FOOTER_TEXT = `桃花浮岛

一个关于生命、文明与共同生活的开放性实验。

© 2026 Peach Blossom Island`;

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

function sanitizeArticleRow(row: D1ArticleRow): D1ArticleRow {
  return {
    id: Number(row.id),
    title: sanitizeArticleText(row.title || ''),
    category: sanitizeArticleText(row.category || 'civdesk'),
    excerpt: sanitizeArticleText(row.excerpt || ''),
    content: sanitizeArticleText(row.content || ''),
    published: row.published ? 1 : 0,
    pinned: row.pinned ? 1 : 0,
    created_at: sanitizeArticleText(row.created_at || ''),
    updated_at: sanitizeArticleText(row.updated_at || '')
  };
}

async function readFooterTextFromD1(db: D1Database): Promise<string> {
  try {
    const row = await db
      .prepare(`SELECT value FROM _admin_meta WHERE key = ?`)
      .bind('footer_text')
      .first<{ value: string }>();
    if (row && typeof row.value === 'string' && row.value.trim() !== '') {
      return sanitizeArticleText(row.value);
    }
  } catch {
    // 若表中无该元数据则使用默认页脚文字
  }
  return DEFAULT_FOOTER_TEXT;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();

    // 所有 /api/* 路径仅提供公开只读查询，拒绝任何非 GET 请求
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      if (method !== 'GET') {
        return jsonResponse(
          { error: 'Method Not Allowed' },
          405,
          { Allow: 'GET' }
        );
      }

      // 1. GET /api/articles — 读取已发布的文章列表（可选按 category 过滤）
      if (pathname === '/api/articles') {
        if (!env.DB) {
          return jsonResponse({
            articles: [],
            footerText: DEFAULT_FOOTER_TEXT,
            dbBound: false
          });
        }

        try {
          const footerText = await readFooterTextFromD1(env.DB);
          const category = url.searchParams.get('category');
          let stmt: D1PreparedStatement;

          if (category && VALID_CATEGORIES.has(category)) {
            stmt = env.DB
              .prepare(
                `SELECT id, title, category, excerpt, content, published, pinned, created_at, updated_at
                 FROM articles
                 WHERE published = ? AND category = ?
                 ORDER BY pinned DESC, datetime(created_at) DESC, id DESC`
              )
              .bind(1, category);
          } else {
            stmt = env.DB
              .prepare(
                `SELECT id, title, category, excerpt, content, published, pinned, created_at, updated_at
                 FROM articles
                 WHERE published = ?
                 ORDER BY pinned DESC, datetime(created_at) DESC, id DESC`
              )
              .bind(1);
          }

          const { results } = await stmt.all<D1ArticleRow>();
          const safeArticles = (results || []).map(sanitizeArticleRow);

          return jsonResponse({
            articles: safeArticles,
            footerText,
            dbBound: true
          });
        } catch {
          return jsonResponse(
            {
              articles: [],
              footerText: DEFAULT_FOOTER_TEXT,
              dbBound: true,
              error: 'Failed to read articles'
            },
            500
          );
        }
      }

      // 2. GET /api/articles/:id — 按 ID 读取单篇已发布文章
      const idMatch = pathname.match(/^\/api\/articles\/(\d+)$/);
      if (idMatch) {
        if (!env.DB) {
          return jsonResponse({ error: 'Article not found', dbBound: false }, 404);
        }

        try {
          const articleId = Number(idMatch[1]);
          const row = await env.DB
            .prepare(
              `SELECT id, title, category, excerpt, content, published, pinned, created_at, updated_at
               FROM articles
               WHERE id = ? AND published = ?`
            )
            .bind(articleId, 1)
            .first<D1ArticleRow>();

          if (!row) {
            return jsonResponse({ error: 'Article not found' }, 404);
          }

          return jsonResponse({
            article: sanitizeArticleRow(row),
            dbBound: true
          });
        } catch {
          return jsonResponse({ error: 'Failed to read article' }, 500);
        }
      }

      return jsonResponse({ error: 'Not Found' }, 404);
    }

    // 其余请求交由 Cloudflare Assets 处理（SPA 路由回退至 index.html）
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
