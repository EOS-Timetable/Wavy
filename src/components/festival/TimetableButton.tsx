import Link from "next/link";
import { Clock } from "lucide-react";

interface TimetableButtonProps {
  festivalId: string;
}

export default function TimetableButton({ festivalId }: TimetableButtonProps) {
  return (
    <Link
      href={`/festival/${festivalId}/timetable`}
      className="group relative block w-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-3 transition-all duration-300 hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-500/50"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/20 border border-purple-500/30 p-2 rounded-md backdrop-blur-sm group-hover:bg-purple-500/30 group-hover:border-purple-500/50 transition-colors">
            <Clock className="w-4 h-4 text-purple-300 group-hover:text-purple-200 transition-colors" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-purple-100 transition-colors">
              타임테이블 보기
            </h3>
            <p className="text-gray-300 text-[10px] group-hover:text-gray-200 transition-colors">
              나만의 스케줄을 만들고 공연을 놓치지 마세요
            </p>
          </div>
        </div>
        <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/30 group-hover:border-purple-500/50 transition-colors flex-shrink-0">
          <svg
            className="w-3 h-3 text-purple-300 group-hover:text-purple-200 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
