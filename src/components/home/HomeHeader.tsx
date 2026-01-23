// src/components/home/HomeHeader.tsx
"use client";

import { Tent } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

interface HomeHeaderProps {
  userName: string;
  avatarUrl?: string;
}

export default function HomeHeader({ userName, avatarUrl }: HomeHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 md:py-6 border-b border-white/5 mb-3 md:mb-4">
      {/* 1. 인사말 영역: 훨씬 담백하고 세련된 문구 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          <span className="text-cyan-400">{userName}</span>님,
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium">
          오늘의 페스티벌 무드를 확인해보세요.
        </p>
      </div>

      {/* 오른쪽: 유저 액션 영역 (프로필 + 로그아웃) */}
      <div className="flex items-center justify-between sm:justify-end gap-4 bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/5 sm:border-none">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 & 상태 점 */}
          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/10 object-cover shadow-xl"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
                <Tent className="text-slate-500" size={20} />
              </div>
            )}
            {/* 온라인 상태 표시 */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-950 rounded-full"></div>
          </div>
          
          {/* 모바일에서만 보이는 이름 정보 (필요시) */}
          <div className="sm:hidden">
            <p className="text-xs text-slate-500">Authenticated</p>
            <p className="text-sm font-bold text-slate-200">{userName}</p>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <LogoutButton />
      </div>
    </div>
  );
}