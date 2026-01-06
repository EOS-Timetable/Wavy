import { Stage } from "@/utils/dataFetcher";

interface Props {
  stages: Stage[];
}

export default function StageBar({ stages }: Props) {
  return (
    <div className="flex w-full">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className="
            flex-1 
            /* ⚡ [핵심] 너비를 Grid와 동일하게 반응형으로 설정 */
            min-w-[100px] md:min-w-[135px]
            
            /* 높이: 모바일 40px / PC 48px */
            h-10 md:h-12
            
            /* 폰트: 모바일 10px / PC 14px */
            text-[10px] md:text-sm
            
            px-1 
            flex items-center justify-center 
            text-center font-bold uppercase tracking-tighter
            whitespace-normal break-keep leading-none
            shadow-md text-white
          "
          style={{ 
            backgroundColor: stage.color, 
            textShadow: "0px 1px 2px rgba(0,0,0,0.5)" 
          }}
        >
          {stage.name}
        </div>
      ))}
    </div>
  );
}