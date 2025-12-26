'use client';

import DaySelector from './DaySelector';

interface TimetableHeaderProps {
  title: string;
  days: string[];
  currentDay: string;
  onSelectDay: (day: string) => void;
}

export default function TimetableHeader({ title, days, currentDay, onSelectDay }: TimetableHeaderProps) {
  return (
    // [변경 1] 배경색, 테두리 (화면 전체 너비)
    <header className="bg-slate-950 border-b border-white/10 w-full z-50 relative shadow-md">      
      {/* [변경 2] 실제 콘텐츠를 감싸는 div에 max-width와 중앙 정렬(mx-auto) 적용 */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4 flex flex-col gap-4">
        
        {/* 타이틀 영역 */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {title}
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Official Timetable</p>
        </div>

        {/* Day 선택기 */}
        <DaySelector days={days} currentDay={currentDay} onSelect={onSelectDay} />
      </div>
    </header>
  );
}