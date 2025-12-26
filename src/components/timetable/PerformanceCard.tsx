'use client';

import { PerformanceJoined } from '@/utils/dataFetcher';

interface Props {
  data: PerformanceJoined;
  isSelected: boolean;
  onToggle: () => void;
  style?: React.CSSProperties; // 위치 지정을 위한 style prop 추가
}

export default function PerformanceCard({ data, isSelected, onToggle, style }: Props) {
  // 시간 포맷팅 (예: 13:10)
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const timeRange = `${formatTime(data.startTime)} - ${formatTime(data.endTime)}`;

  // 지속 시간 계산 (분 단위)
  const start = new Date(data.startTime).getTime();
  const end = new Date(data.endTime).getTime();
  const durationMin = (end - start) / (1000 * 60);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation(); // 부모 클릭 이벤트 방지
        onToggle();
      }}
      style={style}
      className={`
        absolute w-full rounded-lg border p-2 cursor-pointer transition-all duration-200 overflow-hidden group hover:z-10
        ${isSelected
          ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/50 text-white' 
          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}
      `}
    >
      {/* 장식용 바 */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />

      <div className="pl-2 h-full flex flex-col justify-center overflow-hidden"> {/* overflow-hidden 추가 */}
        {/* truncate 추가하여 너무 긴 제목은 ... 처리 */}
        <h3 className="font-bold text-sm leading-tight mb-0.5 truncate pr-1">
          {data.artist.name}
        </h3>
        
        {/* 폰트 사이즈 조절 및 줄바꿈 방지 */}
        <p className={`text-[10px] md:text-[11px] font-mono whitespace-nowrap ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
          {timeRange}
        </p>
        
        {/* [수정] hidden md:block 제거 -> 항상 보이게 설정 */}
        <span className="text-[9px] md:text-[10px] opacity-60 mt-auto">
          {Math.floor(durationMin)} min
        </span>
      </div>
    </div>
  );
}