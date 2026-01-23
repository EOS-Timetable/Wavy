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

  // 공연 시간 계산 (분 단위)
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  
  // 최소 높이 설정: 짧은 공연(30분 이하)도 최소 36px 보장
  const minHeight = durationMinutes <= 30 ? '36px' : undefined;

  return (
    <div
      onClick={handleClick}
      style={{ 
        ...style, 
        minHeight: minHeight || style?.height,
        height: style?.height 
      }}
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

      <div className="pl-[6px] pr-1 py-1 md:py-1.5 h-full flex flex-col justify-center min-w-0">
        
        {/* 아티스트 이름 */}
        {/* ⚡ [수정] line-clamp-2로 최대 2줄까지 표시, break-words로 단어 단위 줄바꿈 */}
        <h3 className="font-bold text-[10px] md:text-xs leading-tight mb-[1px] line-clamp-2 break-words md:group-hover:line-clamp-none md:group-hover:whitespace-normal">
          {data.artist.name}
        </h3>
        
        {/* 시간 표시 */}
        <p className={`text-[8px] md:text-[10px] font-mono leading-none tracking-tight opacity-80 flex-shrink-0 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
          {timeRange}
        </p>
      </div>
    </div>
  );
}