'use client';

interface Props {
  startHour: number;
  endHour: number;
}

export default function TimelineSidebar({ startHour, endHour }: Props) {
  const hours = Array.from(
    { length: endHour - startHour }, 
    (_, i) => startHour + i
  );

  return (
    <div className="flex flex-col items-center w-full select-none">
      {hours.map((hour) => {
        const displayHour = hour >= 24 ? hour - 24 : hour;
        
        return (
          <div 
            key={hour} 
            // ⚡ 높이를 CSS 변수로 지정
            style={{ height: 'var(--hour-height)' }} 
            className="w-full relative border-b border-white/5 last:border-none"
          >
            {/* 시간 텍스트: 모바일(xs) / 데스크탑(sm) 크기 조정 */}
            <div className="absolute -top-2.5 w-full text-center z-10">
              <span className="text-[10px] md:text-sm font-bold text-gray-400 block bg-slate-950 px-1">
                {displayHour}
              </span>
            </div>
            
            {/* 30분 표시 (선택 사항): 데스크탑에서만 보이게 할 수도 있음 */}
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-full text-center opacity-20">
              <span className="text-[10px]">-</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}