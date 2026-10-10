/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sanitizeArticleText } from '../utils/sanitize';

interface MarkdownArticleViewProps {
  title: string;
  content: string;
  onBack?: () => void;
}

export const MarkdownArticleView: React.FC<MarkdownArticleViewProps> = ({
  title,
  content,
  onBack
}) => {
  const safeTitle = sanitizeArticleText(title);
  const safeContent = sanitizeArticleText(content);
  const blocks = safeContent.split(/\r?\n\r?\n+/);

  return (
    <article className="max-w-2xl mx-auto px-5 sm:px-8 pt-3 pb-12 sm:pt-4 sm:pb-14 text-[#3d3832] font-serif-sc space-y-5 break-words">
      {/* 标题与返回按钮同行排列，不单独占据上方大幅垂直空间 */}
      <header className="flex items-baseline justify-between gap-3 pb-1 border-b border-[#e2dac9]/70">
        <h1 className="text-base sm:text-[17px] font-medium text-[#2c2824] tracking-wider break-words min-w-0">
          {safeTitle}
        </h1>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="返回列表"
            className="min-w-[32px] min-h-[32px] flex items-center justify-center text-sm text-[#6e665c] hover:text-[#2c2824] transition-colors cursor-pointer shrink-0"
          >
            ↩
          </button>
        )}
      </header>

      <div className="space-y-4">
        {blocks.map((block, idx) => {
          const trimmed = block.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="text-[14.5px] sm:text-[15.5px] font-medium text-[#2c2824] pt-4 border-t border-[#e2dac9]/70 first:border-t-0 first:pt-0 tracking-wide break-words"
              >
                {trimmed.replace(/^##\s+/, '')}
              </h2>
            );
          }

          if (trimmed.startsWith('### ')) {
            return (
              <h3
                key={idx}
                className="text-sm sm:text-[15px] font-medium text-[#2c2824] pt-1.5 break-words"
              >
                {trimmed.replace(/^###\s+/, '')}
              </h3>
            );
          }

          return (
            <p
              key={idx}
              className="text-[14.5px] sm:text-[15px] leading-[2.0] text-[#3d3832] whitespace-pre-line break-words"
            >
              {trimmed}
            </p>
          );
        })}
      </div>

      {onBack && (
        <div className="pt-6 border-t border-[#e2dac9]/80">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回列表"
            className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center text-sm text-[#6e665c] hover:text-[#2c2824] transition-colors cursor-pointer"
          >
            ↩
          </button>
        </div>
      )}
    </article>
  );
};
