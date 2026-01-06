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
        
        /* ⚡ [수정 포인트 1] 모바일 터치 피드백 (눌렀을 때 살짝 작아짐) */
        active:scale-[0.98] md:active:scale-100

        /* ⚡ [수정 포인트 2] Hover 효과는 데스크탑(md) 이상에서만 동작하도록 제한 */
        md:hover:z-50 md:hover:scale-[1.02] md:hover:shadow-xl md:hover:!h-auto md:hover:min-h-fit
        
        ${isSelected
          ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/50 text-white z-20' 
          : 'bg-gray-800/90 border-gray-700 text-gray-300 md:hover:bg-gray-700 md:hover:border-gray-500'}
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />

      <div className="pl-[6px] pr-1 py-0.5 md:py-1 h-full flex flex-col justify-center">
        
        {/* 아티스트 이름 */}
        {/* ⚡ [수정 포인트 3] 텍스트 전체 표시(whitespace-normal)도 데스크탑 호버시에만 적용 */}
        <h3 className="font-bold text-[10px] md:text-xs leading-tight mb-[1px] truncate md:group-hover:whitespace-normal md:group-hover:overflow-visible">
          {data.artist.name}
        </h3>
        
        {/* 시간 표시 */}
        <p className={`text-[8px] md:text-[10px] font-mono leading-none tracking-tight opacity-80 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
          {timeRange}
        </p>
      </div>
    </div>
  );
}