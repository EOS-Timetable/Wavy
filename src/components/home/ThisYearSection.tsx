"use client";

import { useState } from "react";
import { ExternalLink, Music, Ticket, ShoppingBag, Sparkles, MapPin, FileText } from "lucide-react";
import Link from "next/link";

interface ThisYearContent {
  id: string;
  category: "라인업" | "티켓" | "MD" | "이벤트" | "현장안내" | "관련글";
  title: string;
  date: string;
  linkUrl: string;
  imageUrl?: string;
  isNew?: boolean;
}

interface ThisYearSectionProps {
  festivalId?: string;
  festivalName?: string;
  contents: ThisYearContent[];
  /** Home처럼 섹션 전체를 px-4로 감쌀지 여부 (Festival 페이지에서는 부모가 이미 px-4라서 false 권장) */
  withPagePadding?: boolean;
}

const categoryIcons = {
  라인업: Music,
  티켓: Ticket,
  MD: ShoppingBag,
  이벤트: Sparkles,
  현장안내: MapPin,
  관련글: FileText,
};

const categories: ThisYearContent["category"][] = [
  "라인업",
  "티켓",
  "MD",
  "이벤트",
  "현장안내",
  "관련글",
];

export default function ThisYearSection({
  festivalId,
  festivalName,
  contents,
  withPagePadding = true,
}: ThisYearSectionProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ThisYearContent["category"] | "전체">("전체");

  const filteredContents =
    selectedCategory === "전체"
      ? contents
      : contents.filter((item) => item.category === selectedCategory);

  return (
    <section className={festivalId ? "" : "mb-8"}>
      <div className={withPagePadding ? "px-4" : ""}>
        <div className="bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg p-3.5">
        {/* 섹션 헤더 */}
        <div className="flex items-center gap-2 mb-2.5">
          <Music className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-bold">This Year</h2>
        </div>
        {festivalName && (
          <p className="text-xs text-gray-400 mb-3">{festivalName}의 올해 소식</p>
        )}

        {/* 카테고리 칩 */}
        <div className="mb-4">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setSelectedCategory("전체")}
              className={`
                px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all
                ${
                  selectedCategory === "전체"
                    ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent"
                }
              `}
            >
              전체
            </button>
            {categories.map((category) => {
              const Icon = categoryIcons[category];
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all border
                    ${
                      selectedCategory === category
                        ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 text-purple-300"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 border-transparent"
                    }
                  `}
                >
                  <Icon className="w-3 h-3" />
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* 콘텐츠 카드 (가로 스크롤, 썸네일 포함) */}
        {filteredContents.length > 0 ? (
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-5 pb-2">
              {filteredContents.map((item) => {
                const Icon = categoryIcons[item.category];
                const CardContent = (
                  <div className="group flex-shrink-0 w-48 bg-[#161b29]/60 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all h-48 flex flex-col">
                    {/* 썸네일 */}
                    <div className="w-full h-24 relative overflow-hidden bg-slate-900">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <Icon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* 콘텐츠 정보 */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold text-blue-400 uppercase">
                            {item.category}
                          </span>
                          {item.isNew && (
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-400">{item.date}</span>
                        {item.linkUrl && (
                          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  </div>
                );

                return item.linkUrl ? (
                  <a
                    key={item.id}
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {CardContent}
                  </a>
                ) : (
                  <div key={item.id}>{CardContent}</div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[#161b29]/50 border border-white/10 rounded-lg p-8 text-center text-gray-400">
            {selectedCategory === "전체"
              ? "콘텐츠가 없습니다"
              : `${selectedCategory} 카테고리의 콘텐츠가 없습니다`}
          </div>
        )}
        </div>
      </div>
    </section>
  );
}

