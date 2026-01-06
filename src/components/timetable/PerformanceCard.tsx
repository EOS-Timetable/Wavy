'use client';

import { PerformanceJoined } from '@/utils/dataFetcher';

interface Props {
  data: PerformanceJoined;
  isSelected: boolean;
  onToggle: () => void;
  style?: React.CSSProperties;
}

export default function PerformanceCard({ data, isSelected, onToggle, style }: Props) {
  
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const timeRange = `${formatTime(data.startTime)} - ${formatTime(data.endTime)}`;

  // 단순 클릭 핸들러 (PC/모바일 공통)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <div
      onClick={handleClick}
      style={{ ...style, minHeight: style?.height }}
      className={`
        absolute w-full rounded border cursor-pointer transition-all duration-200 overflow-hidden group select-none
        
        /* Hover 효과는 PC/모바일 모두 적용 (모바일은 터치 시 살짝 반응) */
        hover:z-50 hover:scale-[1.02] hover:shadow-xl hover:!h-auto hover:min-h-fit
        
        ${isSelected
          ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/50 text-white z-20' 
          : 'bg-gray-800/90 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-500'}
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />

      {/* ⚡ [반응형 스타일] 모바일: 좁은 패딩 / PC: 넓은 패딩 */}
      <div className="pl-[6px] pr-1 py-0.5 md:py-1 h-full flex flex-col justify-center">
        
        {/* 아티스트 이름: 모바일 text-[10px], PC text-xs */}
        <h3 className="font-bold text-[10px] md:text-xs leading-tight mb-[1px] truncate group-hover:whitespace-normal group-hover:overflow-visible">
          {data.artist.name}
        </h3>
        
        {/* 시간: 모바일 text-[8px], PC text-[10px] */}
        <p className={`text-[8px] md:text-[10px] font-mono leading-none tracking-tight opacity-80 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
          {timeRange}
        </p>
      </div>
    </div>
  );
}