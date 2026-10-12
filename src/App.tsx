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

function checkIsNotFoundRoute(): boolean {
  const { pathname } = window.location;
  // 支持根域名部署 (如 /) 或 GitHub Pages 仓库二级目录部署 (如 /peach0.3/ 或 /peach0.3)
  const cleanPath = pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
  const segments = cleanPath.split('/').filter(Boolean);
  // 根域名 0 段，GitHub Pages 1 段，若超过 1 段则视为不存在的深层子路由
  return segments.length > 1;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavMenu>('island');
  const [isNotFound, setIsNotFound] = useState<boolean>(checkIsNotFoundRoute);
  const footerText = getSiteFooterText();

  useEffect(() => {
    const handleRouteChange = () => {
      setIsNotFound(checkIsNotFoundRoute());
    };
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: NavMenu) => {
    setIsNotFound(false);
    const cleanPath = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
    const segments = cleanPath.split('/').filter(Boolean);
    const basePath = segments.length > 0 ? `/${segments[0]}/` : '/';

    if (
      window.location.pathname !== basePath ||
      window.location.hash !== '' ||
      window.location.search !== ''
    ) {
      window.history.pushState(null, '', basePath);
    }
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
        {isNotFound ? (
          <section className="max-w-2xl mx-auto px-5 sm:px-8 pt-10 pb-16 text-[#3d3832] font-serif-sc space-y-4">
            <h1 className="text-base sm:text-lg font-medium text-[#2c2824] tracking-wider">
              未找到页面
            </h1>
            <p className="text-sm leading-relaxed text-[#6e665c]">
              您访问的页面不存在，或链接已变更。
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleSelectTab('island')}
                className="min-h-[34px] px-3.5 py-1.5 text-xs sm:text-sm border border-[#cfc6b4] bg-[#f1ece1] text-[#2c2824] hover:text-[#B83A5A] transition-colors cursor-pointer"
              >
                返回桃花浮岛首页
              </button>
            </div>
          </section>
        ) : (
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
        )}
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
