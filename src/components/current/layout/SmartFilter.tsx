// src/components/current/layout/SmartFilter.tsx
"use client";

import { cn } from "@/lib/utils";

// 페스티벌 목록 (나중에는 DB에서 받아오거나 상수로 관리)
const FESTIVALS = [
  { id: "all", name: "All Wave", icon: "🌊", color: "bg-gray-800" },
  { id: "penta_2025", name: "펜타포트", icon: "⚡️", color: "bg-gradient-to-br from-yellow-400 to-orange-500" },
  { id: "water_2025", name: "워터밤", icon: "💦", color: "bg-gradient-to-br from-blue-400 to-cyan-500" },
  { id: "gmf_2025", name: "GMF", icon: "🍂", color: "bg-gradient-to-br from-green-400 to-emerald-600" },
];

interface SmartFilterProps {
  activeFilter: string;
  onFilterChange: (id: string) => void;
}

export default function SmartFilter({ activeFilter, onFilterChange }: SmartFilterProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide px-5">
      <div className="flex gap-4 w-max">
        {FESTIVALS.map((fest) => {
          const isActive = activeFilter === fest.id;
          
          return (
            <button
              key={fest.id}
              onClick={() => onFilterChange(fest.id)}
              className="flex flex-col items-center gap-2 transition-all duration-300 group"
            >
              {/* 아이콘 원형 컨테이너 */}
              <div
                className={cn(
                  "w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl shadow-lg transition-all border-2",
                  fest.color,
                  isActive 
                    ? "border-[#00f2ff] scale-110 shadow-[0_0_15px_rgba(0,242,255,0.3)] brightness-110" 
                    : "border-transparent opacity-60 scale-100 grayscale-[0.3] group-hover:opacity-100 group-hover:scale-105"
                )}
              >
                {/* 텍스트 아이콘 (이미지로 교체 가능) */}
                <span className={cn("text-white drop-shadow-md", isActive ? "animate-pulse" : "")}>
                    {fest.icon}
                </span>
              </div>
              
              {/* 라벨 텍스트 */}
              <span 
                className={cn(
                  "text-[11px] font-bold tracking-wide transition-colors",
                  isActive ? "text-[#00f2ff]" : "text-gray-500"
                )}
              >
                {fest.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}