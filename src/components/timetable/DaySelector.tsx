'use client';

interface Props {
  days: string[];
  currentDay: number;
  onSelect: (dayNum: number) => void;
}

export default function DaySelector({ days, currentDay, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      {days.map((dayDateStr, index) => {
        const dayNum = index + 1;
        const label = `Day ${dayNum}`;

        const dateObj = new Date(dayDateStr);
        const dateSubLabel = `${dateObj.getMonth() + 1}.${dateObj.getDate()}`; 

        const isActive = currentDay === dayNum;

        return (
          <button
            key={dayDateStr}
            onClick={() => onSelect(dayNum)}
            className={`
              group relative flex items-center gap-1.5 rounded-full border transition-all duration-200 ease-out
              active:scale-95 whitespace-nowrap
              
              /* ⚡ [크기 및 여백 조정] 더 작고 컴팩트하게 */
              px-3 py-1.5 md:px-4 md:py-1.5 
              text-xs md:text-sm
              
              ${isActive 
                ? 'bg-white border-white text-slate-950 shadow-md font-bold' 
                : 'bg-slate-900/50 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30 hover:text-gray-200'}
            `}
          >
            {/* Day 라벨 */}
            <span>{label}</span>
            
            {/* 날짜 보조 표시 (구분선 | 추가) */}
            <span className={`text-[10px] md:text-xs font-normal opacity-80 ${isActive ? 'text-slate-600' : 'text-gray-500 group-hover:text-gray-400'}`}>
              <span className="mx-0.5 opacity-50">|</span>
              {dateSubLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}