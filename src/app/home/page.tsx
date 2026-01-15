import Link from "next/link";
import { 
  Zap,          // Current (실시간/번개)
  Sparkles,     // FBTI (이벤트/반짝임)
  Search,       // Lookup (검색)
  Tent          // Landing (메인/홈)
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- [Background Mood] 배경 앰비언트 라이트 효과 --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* --- [Hero Section] 타이틀 --- */}
      <header className="relative z-10 text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
          <span className="ml-1 text-slate-180">WAVY</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium">
          Prototype HomePage
        </p>
      </header>

      {/* --- [Grid Navigation] 4개 메뉴 카드 --- */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md md:max-w-2xl">
        
        {/* 1. Landing Page (Root) */}
        <NavCard 
          href="/" 
          icon={<Tent size={28} />}
          title="Main Landing"
          desc="페스티벌 메인으로 이동"
          colorClass="text-slate-100"
          bgHover="group-hover:bg-slate-800"
        />

        {/* 2. Current SNS */}
        <NavCard 
          href="/current" 
          icon={<Zap size={28} />}
          title="Live Current"
          desc="실시간 현장 스레드 & 반응"
          colorClass="text-yellow-400"
          bgHover="group-hover:bg-yellow-500/10"
          borderHover="group-hover:border-yellow-500/50"
        />

        {/* 3. FBTI Event */}
        <NavCard 
          href="/event/fbti" 
          icon={<Sparkles size={28} />}
          title="Festival Type"
          desc="나의 페스티벌 성향(FBTI) 찾기"
          colorClass="text-purple-400"
          bgHover="group-hover:bg-purple-500/10"
          borderHover="group-hover:border-purple-500/50"
        />

        {/* 4. Lookup (Search) */}
        <NavCard 
          href="/lookup" 
          icon={<Search size={28} />}
          title="Search & Map"
          desc="아티스트 및 정보 검색"
          colorClass="text-cyan-400"
          bgHover="group-hover:bg-cyan-500/10"
          borderHover="group-hover:border-cyan-500/50"
        />

      </div>

      {/* --- Footer Decoration --- */}
      <footer className="absolute bottom-6 text-slate-600 text-xs font-mono">
        © 2026 WAVY CORP.
      </footer>
    </main>
  );
}

// --- [Component] 재사용 가능한 카드 컴포넌트 ---
interface NavCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  colorClass: string;     // 아이콘 색상
  bgHover?: string;       // 호버 시 배경색
  borderHover?: string;   // 호버 시 테두리색
}

function NavCard({ href, icon, title, desc, colorClass, bgHover, borderHover }: NavCardProps) {
  return (
    <Link href={href} className="group w-full">
      <div className={`
        relative overflow-hidden
        bg-slate-900/60 backdrop-blur-md 
        border border-slate-800 
        rounded-2xl p-5 h-28 md:h-32
        flex items-center gap-5
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-2xl
        ${borderHover || 'group-hover:border-slate-600'}
      `}>
        {/* 아이콘 영역 */}
        <div className={`
          p-3 rounded-full bg-slate-950 border border-slate-800 
          transition-colors duration-300
          ${colorClass}
          ${bgHover || 'group-hover:bg-slate-800'}
        `}>
          {icon}
        </div>

        {/* 텍스트 영역 */}
        <div className="flex flex-col">
          <span className={`text-lg md:text-xl font-bold text-slate-200 group-hover:text-white transition-colors`}>
            {title}
          </span>
          <span className="text-xs md:text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
            {desc}
          </span>
        </div>

        {/* 화살표 (Hover 시 등장) */}
        <div className="absolute right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-600">
            ➔
        </div>
      </div>
    </Link>
  );
}