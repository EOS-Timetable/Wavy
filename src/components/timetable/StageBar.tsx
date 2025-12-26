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
          // [핵심] Grid와 동일한 min-w-[135px] + flex-1 적용
          className={`
            flex-1 min-w-[135px]
            ${stage.color} 
            py-2 px-1 text-center text-xs font-bold uppercase tracking-tighter truncate 
            flex items-center justify-center h-12 shadow-md
          `}
        >
          {stage.name}
        </div>
      ))}
    </div>
  );
}