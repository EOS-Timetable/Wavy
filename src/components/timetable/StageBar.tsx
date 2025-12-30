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
            flex-1 min-w-[135px]
            py-2 px-1 text-center text-xs font-bold uppercase tracking-tighter truncate 
            flex items-center justify-center h-12 shadow-md
            text-white
            /* ✅ 기존 ${stage.color} 삭제됨 */
          "
          style={{ 
            backgroundColor: stage.color, // ✅ Hex 코드는 여기에 넣어야 작동함!
            textShadow: "0px 1px 2px rgba(0,0,0,0.5)" // 배경이 밝을 수 있으니 글씨 그림자 추가
          }}
        >
          {stage.name}
        </div>
      ))}
    </div>
  );
}