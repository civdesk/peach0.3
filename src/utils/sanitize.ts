/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 文章内容安全过滤与 HTML 转义工具，防止恶意脚本注入 (XSS)。
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * 将字符串中的 HTML 特殊字符转义为安全实体
 */
export function escapeHtml(raw: string): string {
  if (!raw) return '';
  return String(raw).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] || ch);
}

/**
 * 过滤并清理文章文本中的潜在恶意 HTML / 脚本标签与危险属性，
 * 确保在页面渲染时不会执行任何注入脚本 (XSS)。
 */
export function sanitizeArticleText(raw: string): string {
  if (!raw) return '';
  return String(raw)
    // 移除 script / style / iframe / object / embed 标签及其内容
    .replace(/<(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    // 移除自闭合或未闭合的危险标签与任意 HTML 标签
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    // 过滤内联事件属性与 javascript: 伪协议
    .replace(/\bon[a-z]+\s*=/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');
}
