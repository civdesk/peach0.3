/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import peachBlossomScroll from '../assets/images/peach_blossom_scroll_v02_1791025529085.jpg';
import scrollImgMain from '../assets/images/scroll_panorama_main_1791020909631.jpg';
import riverOceanImg from '../assets/images/river_to_ocean_scroll_1791020942875.jpg';

export type NavMenu = 'home' | 'aging' | 'predation' | 'disaster' | 'island' | 'letsdecide';

interface HeaderNavProps {
  currentTab: NavMenu;
  onSelectTab: (tab: NavMenu) => void;
  onSelectArticle?: (articleNumber: number) => void;
  onSelectIslandArticle?: (articleNumber: number) => void;
  onSelectMotion?: (motionId: string) => void;
}

/**
 * 网站 Logo：传统的五瓣桃花图案（适当缩小尺寸以压缩横向占用，不含任何文字）
 */
const PeachBlossomLogo: React.FC = () => {
  const petalPath =
    'M 12 10.7 C 9.3 8.8, 8.6 5.2, 10.3 3.2 C 11.0 2.4, 11.6 2.3, 12 2.7 C 12.4 2.3, 13.0 2.4, 13.7 3.2 C 15.4 5.2, 14.7 8.8, 12 10.7 Z';

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0 select-none block"
    >
      <g transform="rotate(-8 12 12)">
        {/* 五枚传统桃花瓣：72° 均匀环绕花心 */}
        <g fill="#B83A5A" fillOpacity="0.9">
          <path d={petalPath} />
          <path d={petalPath} transform="rotate(72 12 12)" />
          <path d={petalPath} transform="rotate(144 12 12)" />
          <path d={petalPath} transform="rotate(216 12 12)" />
          <path d={petalPath} transform="rotate(288 12 12)" />
        </g>

        {/* 花心浅胭脂晕染 */}
        <circle cx="12" cy="12" r="2.2" fill="#D15476" fillOpacity="0.35" />

        {/* 桃花花丝与花药点 */}
        <g stroke="#7E2945" strokeWidth="0.6" strokeLinecap="round" opacity="0.9">
          <line x1="12" y1="12" x2="12" y2="9.3" />
          <line x1="12" y1="12" x2="14.6" y2="11.2" />
          <line x1="12" y1="12" x2="13.6" y2="14.2" />
          <line x1="12" y1="12" x2="10.4" y2="14.2" />
          <line x1="12" y1="12" x2="9.4" y2="11.2" />
        </g>
        <g fill="#7E2945">
          <circle cx="12" cy="12" r="1.05" />
          <circle cx="12" cy="9.1" r="0.55" />
          <circle cx="14.8" cy="11.1" r="0.55" />
          <circle cx="13.7" cy="14.4" r="0.55" />
          <circle cx="10.3" cy="14.4" r="0.55" />
          <circle cx="9.2" cy="11.1" r="0.55" />
        </g>
      </g>
    </svg>
  );
};

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab
}) => {
  const menuItems: { id: NavMenu; label: string }[] = [
    { id: 'island', label: '桃花浮岛' },
    { id: 'predation', label: '弱肉强食' },
    { id: 'disaster', label: '自然灾害' },
    { id: 'letsdecide', label: "Let's Decide" },
    { id: 'home', label: '文明编辑部' }
  ];

  return (
    <div className="w-full font-serif-sc">
      {/* 画心：顶部窄幅青绿山水长卷 */}
      <div
        className="relative w-full h-[11vh] sm:h-[13vh] min-h-[70px] max-h-[124px] overflow-hidden bg-[#f3f1ea] select-none"
        aria-label="桃花浮岛青绿山水长卷"
      >
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={scrollImgMain}
            alt=""
            className="h-full w-auto max-w-none object-contain object-center shrink-0 opacity-95"
            loading="eager"
          />
          <img
            src={peachBlossomScroll}
            alt="桃花浮岛山水画卷"
            className="h-full w-auto max-w-none object-contain object-center shrink-0 opacity-95 -ml-px"
            loading="eager"
          />
          <img
            src={riverOceanImg}
            alt=""
            className="h-full w-auto max-w-none object-contain object-center shrink-0 opacity-95 -ml-px"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-stone-900/3 via-transparent to-[#f8f6f0]/10" />
      </div>

      {/* 装裱：紧凑单行导航 [桃花 Logo] 桃花浮岛 弱肉强食 自然灾害 Let's Decide 文明编辑部 */}
      <header className="w-full scroll-mounting-bar">
        <div className="max-w-2xl mx-auto px-3 sm:px-8 h-8 sm:h-9 flex items-center justify-start gap-2 sm:gap-3.5">
          {/* 左侧：紧凑五瓣桃花图形 Logo */}
          <button
            type="button"
            onClick={() => onSelectTab('island')}
            className="inline-flex items-center justify-center p-0.5 cursor-pointer shrink-0"
            aria-label="桃花浮岛首页"
          >
            <PeachBlossomLogo />
          </button>

          {/* 主导航：单行紧凑排列，整体向右偏移约半个字符，Let's Decide 单独缩小 1~2 号字 */}
          <nav
            className="ml-[0.5em] flex items-center gap-2.5 sm:gap-4 whitespace-nowrap"
            aria-label="主导航"
          >
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              const isLetsDecide = item.id === 'letsdecide';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`inline-flex items-center leading-none transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isLetsDecide
                      ? 'text-[10px] sm:text-[11px] tracking-tight'
                      : 'text-xs sm:text-[13px] tracking-normal sm:tracking-wide'
                  } ${
                    isActive
                      ? 'text-[#B83A5A] font-semibold'
                      : 'text-[#6e665c] font-normal hover:text-[#2e2924]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>
    </div>
  );
};
