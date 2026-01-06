'use client';

import DaySelector from './DaySelector';

interface TimetableHeaderProps {
  title: string;
  days: string[];
  currentDay: number;
  onSelectDay: (dayNum: number) => void;
}

export default function TimetableHeader({ title, days, currentDay, onSelectDay }: TimetableHeaderProps) {
  return (
    <header className="bg-slate-950 border-b border-white/10 w-full z-50 relative shadow-md">
      {/* ⚡ [반응형 수정] 
        - padding: 모바일(px-4 py-3) / PC(px-6 pt-6 pb-4)
        - gap: 모바일(gap-3) / PC(gap-4)
        - max-w-7xl: TimetableBody와 라인 정렬
      */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:pt-6 md:pb-4 flex flex-col gap-3 md:gap-4">
        
        {/* 타이틀 영역 */}
        <div className="flex flex-col">
          {/* 폰트 크기: 모바일(text-xl) / PC(text-3xl) */}
          <h1 className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {title}
          </h1>
          {/* 서브텍스트: 모바일(text-[10px]) / PC(text-sm) */}
          <p className="text-gray-400 text-[10px] md:text-sm font-medium mt-0.5 md:mt-1">
            Official Timetable
          </p>
        </div>

        {/* Day 선택기 */}
        <DaySelector days={days} currentDay={currentDay} onSelect={onSelectDay} />
      </div>
    </header>
  );
}