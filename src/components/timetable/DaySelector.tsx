'use client';

interface Props {
  days: string[];
  currentDay: string;
  onSelect: (day: string) => void;
}

export default function DaySelector({ days, currentDay, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {days.map((day, index) => {
        // UI 표시용 라벨 생성 (Day 1, Day 2 ...)
        const label = `Day ${index + 1}`;
        // 필요하다면 날짜도 같이 작게 표시 (옵션)
        const dateObj = new Date(day);
        const dateSubLabel = `${dateObj.getMonth() + 1}.${dateObj.getDate()}`; 

        const isActive = day === currentDay;

        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`
              relative px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap
              ${isActive 
                ? 'bg-white text-black shadow-lg scale-105 z-10' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'}
            `}
          >
            <span className="text-base">{label}</span>
            {/* 날짜 보조 표시 (선택사항) */}
            <span className={`ml-2 text-xs font-normal ${isActive ? 'text-gray-500' : 'text-gray-600'}`}>
              {dateSubLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}