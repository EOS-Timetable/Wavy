'use client'

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Zap,
  Sparkles,
  Search,
  Tent
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/auth/LogoutButton";

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // 디버깅 로그
  useEffect(() => {
    console.log('[HomePage] Mounted!');
    console.log('[HomePage] Loading:', loading);
    console.log('[HomePage] User:', user?.email || 'null');
    console.log('[HomePage] profile:', profile);
  }, [loading, user, profile]);

  // 로그인 체크 - 반드시 로딩이 완료된 후에만 리다이렉트
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     console.log('[HomePage] Not authenticated after loading, redirecting...');
  //     router.push('/');
  //   }
  // }, [loading, isAuthenticated, router]);

  // 로딩 화면
  if (loading && !user) {
    console.log('[HomePage] Rendering loading state');
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // 비로그인 상태
  if (!user) {
    console.log('[HomePage] Rendering unauthenticated state');
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Redirecting to login...</p>
      </div>
    );
  }

  // 로그인된 상태 - 메인 콘텐츠
  console.log('[HomePage] Rendering main content');
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* 배경 효과 */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 헤더 */}
      <header className="relative z-10 text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
          <span className="text-slate-100">WAVY</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium">
          Prototype HomePage
        </p>
        
        {/* 로그인 정보 */}
        {/* 프로필 이미지 영역 */}
        <div className="mb-6 mt-6 relative w-20 h-20 flex items-center justify-center">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Profile" 
              className="w-20 h-20 rounded-full border-2 border-cyan-500/50 object-cover shadow-xl shadow-cyan-500/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
              <Tent className="text-slate-500" size={32} />
            </div>
          )}
          {/* 상태 표시 점 (온라인 등) */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-slate-950 rounded-full"></div>
        </div>

        <div className="mt-4 p-4 border border-white/10 bg-slate-900/60 rounded-lg max-w-md mx-auto">
          <LogoutButton />
          <p className="text-xs text-slate-400 mt-2">
            Welcome, <span className="text-cyan-400 font-bold">{profile?.nickname || user.email}</span>
          </p>
        </div>
      </header>

      {/* 네비게이션 카드 그리드 */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md md:max-w-2xl">
        
        <NavCard 
          href="/" 
          icon={<Tent size={28} />}
          title="Main Landing"
          desc="페스티벌 메인으로 이동"
          colorClass="text-slate-100"
        />

        <NavCard 
          href="/current" 
          icon={<Zap size={28} />}
          title="Live Current"
          desc="실시간 현장 스레드 & 반응"
          colorClass="text-yellow-400"
          borderHover="group-hover:border-yellow-500/50"
        />

        <NavCard 
          href="/event/fbti" 
          icon={<Sparkles size={28} />}
          title="Festival Type"
          desc="나의 페스티벌 성향(FBTI) 찾기"
          colorClass="text-purple-400"
          borderHover="group-hover:border-purple-500/50"
        />

        <NavCard 
          href="/lookup" 
          icon={<Search size={28} />}
          title="Search & Map"
          desc="아티스트 및 정보 검색"
          colorClass="text-cyan-400"
          borderHover="group-hover:border-cyan-500/50"
        />

      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-slate-600 text-xs font-mono">
        © 2026 WAVY CORP.
      </footer>
    </main>
  );
}

interface NavCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  colorClass: string;
  borderHover?: string;
}

function NavCard({ href, icon, title, desc, colorClass, borderHover }: NavCardProps) {
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
        <div className={`
          p-3 rounded-full bg-slate-950 border border-slate-800 
          transition-colors duration-300
          ${colorClass}
        `}>
          {icon}
        </div>

        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-bold text-slate-200 group-hover:text-white transition-colors">
            {title}
          </span>
          <span className="text-xs md:text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
            {desc}
          </span>
        </div>

        <div className="absolute right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-600">
          ➔
        </div>
      </div>
    </Link>
  );
}