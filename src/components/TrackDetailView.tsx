/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ContentCategory } from '../content/storage';
import { getArticleByPath, getPublishedArticlesByCategory } from '../content/loader';
import { MarkdownArticleView } from './MarkdownArticleView';

interface TrackDetailViewProps {
  trackId: 'aging' | 'predation' | 'disaster';
  onNavigateToIsland: () => void;
  onNavigateToDecide: (motionId?: string) => void;
  onSwitchTrack: (trackId: 'aging' | 'predation' | 'disaster') => void;
}

const TRACK_CONFIG: Record<
  'aging' | 'predation' | 'disaster',
  { category: ContentCategory }
> = {
  predation: { category: 'foodchain' },
  aging: { category: 'death' },
  disaster: { category: 'disaster' }
};

export const TrackDetailView: React.FC<TrackDetailViewProps> = ({
  trackId
}) => {
  const [activeArticlePath, setActiveArticlePath] = useState<string | null>(null);
  const { category } = TRACK_CONFIG[trackId];
  const articles = getPublishedArticlesByCategory(category);

  if (activeArticlePath) {
    const doc = getArticleByPath(activeArticlePath);
    if (doc) {
      return (
        <MarkdownArticleView
          title={doc.title}
          content={doc.content}
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
      {articles.length > 0 ? (
        <ul className="space-y-2.5">
          {articles.map((doc) => (
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
