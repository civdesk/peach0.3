/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavMenu } from './HeaderNav';
import { getArticleByPath, getCivDeskPublishedDocuments } from '../content/loader';
import { MarkdownArticleView } from './MarkdownArticleView';

interface RuralScrollHomeProps {
  onNavigateTab: (tab: NavMenu, subId?: string) => void;
}

export const RuralScrollHome: React.FC<RuralScrollHomeProps> = () => {
  const [activeArticlePath, setActiveArticlePath] = useState<string | null>(null);
  const publishedDocs = getCivDeskPublishedDocuments();

  if (activeArticlePath) {
    const selectedDoc = getArticleByPath(activeArticlePath);
    if (selectedDoc) {
      return (
        <MarkdownArticleView
          title={selectedDoc.title}
          content={selectedDoc.content}
          onBack={() => {
            setActiveArticlePath(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }
  }

  return (
    <article className="max-w-2xl mx-auto px-5 sm:px-8 pt-3 pb-12 sm:pt-4 sm:pb-14 text-[#3d3832] font-serif-sc">
      {publishedDocs.length > 0 ? (
        <ul className="space-y-2.5">
          {publishedDocs.map((doc) => (
            <li key={doc.path}>
              <button
                type="button"
                onClick={() => {
                  setActiveArticlePath(doc.path);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left text-[13px] sm:text-sm text-[#35302a] hover:text-[#B83A5A] transition-colors cursor-pointer break-words"
              >
                {doc.title}
              </button>
              {doc.excerpt && doc.excerpt.trim() !== '' && (
                <p className="mt-0.5 text-xs text-[#6e665c] leading-relaxed break-words">
                  {doc.excerpt}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs sm:text-sm text-[#8c8275] leading-relaxed">暫無文章</p>
      )}
    </article>
  );
};
