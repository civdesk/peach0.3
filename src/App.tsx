/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderNav, NavMenu } from './components/HeaderNav';
import { RuralScrollHome } from './components/RuralScrollHome';
import { TrackDetailView } from './components/TrackDetailView';
import { FloatingIslandView } from './components/FloatingIslandView';
import { LetsDecideView } from './components/LetsDecideView';
import {
  getSiteFooterText
} from './content/loader';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavMenu>('island');
  const footerText = getSiteFooterText();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: NavMenu) => {
    setCurrentTab(tab);
    scrollToTop();
  };

  return (
    <div className="min-h-screen flex flex-col xuan-paper-surface text-[#3d3832] font-serif-sc selection:bg-[#d8cfc0]/60 selection:text-[#26221e] overflow-x-hidden">
      {/* 画心（顶部山水长卷）+ 装裱（窄导航区域） */}
      <HeaderNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      {/* 页面文稿内容区 */}
      <main className="flex-1 w-full">
        <div>
          {currentTab === 'home' && (
            <RuralScrollHome onNavigateTab={handleSelectTab} />
          )}

          {currentTab === 'predation' && (
            <TrackDetailView
              trackId="predation"
              onNavigateToIsland={() => handleSelectTab('island')}
              onNavigateToDecide={() => handleSelectTab('letsdecide')}
              onSwitchTrack={(id) => handleSelectTab(id)}
            />
          )}

          {currentTab === 'aging' && (
            <TrackDetailView
              trackId="aging"
              onNavigateToIsland={() => handleSelectTab('island')}
              onNavigateToDecide={() => handleSelectTab('letsdecide')}
              onSwitchTrack={(id) => handleSelectTab(id)}
            />
          )}

          {currentTab === 'disaster' && (
            <TrackDetailView
              trackId="disaster"
              onNavigateToIsland={() => handleSelectTab('island')}
              onNavigateToDecide={() => handleSelectTab('letsdecide')}
              onSwitchTrack={(id) => handleSelectTab(id)}
            />
          )}

          {currentTab === 'island' && (
            <FloatingIslandView
              onNavigateToDecide={() => handleSelectTab('letsdecide')}
              onNavigateToTrack={(id) => handleSelectTab(id)}
            />
          )}

          {currentTab === 'letsdecide' && (
            <LetsDecideView
              onNavigateToIslandArticle={() => handleSelectTab('island')}
            />
          )}
        </div>
      </main>

      {/* 素雅宣纸尾跋页脚（紧凑两行布局） */}
      <footer className="w-full border-t border-[#e2dac9]/70 py-2.5 sm:py-3.5 px-2.5 sm:px-8 text-[9.5px] min-[390px]:text-[10.5px] sm:text-xs text-[#787066] font-serif-sc">
        <div className="max-w-2xl mx-auto flex flex-col gap-[3px]">
          {footerText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line, index) => (
              <p
                key={index}
                className="m-0 p-0 leading-[1.2] whitespace-nowrap"
              >
                {line}
              </p>
            ))}
        </div>
      </footer>
    </div>
  );
}
