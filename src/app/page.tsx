'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { signInWithSocial } from "@/utils/authActions";

export default function LandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const mouse = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false); // 모바일 상태 관리 추가
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // 온보딩 완료 여부 체크
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('wavy_onboarding_completed');
    if (!onboardingCompleted) {
      router.push('/onboarding');
    } else {
      setIsCheckingOnboarding(false);
    }
  }, [router]);

  useEffect(() => {
    // 온보딩 체크 중이면 이벤트 리스너 등록 안 함
    if (isCheckingOnboarding) return;

    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
    };

    // 초기화 및 이벤트 리스너 등록
    handleResize();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCheckingOnboarding]);

  useEffect(() => {
    // 온보딩 체크 중이면 캔버스 초기화 안 함
    if (isCheckingOnboarding) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // isMobile 상태는 상단 useEffect에서 관리하므로 여기서는 제거
    };
    setCanvasSize();

    let animationId: number;
    let time = 0;

    const drawWave = (
      index: number,
      baseHeightRatio: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color: string,
      opacity: number
    ) => {
      ctx.beginPath();
      
      const mouseInteraction = (mouse.current.y / height);
      const mouseSkew = (width / 2 - mouse.current.x) * 0.0002;

      for (let x = 0; x <= width; x += 5) {
        const wave1 = Math.sin(x * frequency * 0.01 + time * speed + index) * amplitude;
        const wave2 = Math.cos(x * frequency * 0.02 - time * speed * 0.5) * (amplitude * 0.2);
        
        const y = height * baseHeightRatio + wave1 + wave2 + mouseSkew;
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      // [Glassy Effect 1] 그라데이션
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `${color}00`);
      gradient.addColorStop(0.3, color + '10');
      gradient.addColorStop(1, color + '40');

      ctx.fillStyle = gradient;
      ctx.fill();

      // [Glassy Effect 2] 빛나는 테두리
      ctx.lineWidth = isMobile ? 3 : 5; // 모바일 선 두께 약간 증가
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.9})`; // 불투명도 약간 증가
      ctx.shadowBlur = isMobile ? 80 : 100; // 모바일에서 광원 효과 감소
      ctx.shadowColor = color;
      ctx.stroke();
      
      ctx.shadowBlur = 0;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // [반응형 파도 설정]
      // 모바일: 파도 높이 감소, 위치를 약간 아래로 내림
      const ampScale = isMobile ? 0.5 : 1.3; 
      const freqScale = isMobile ? 1.2 : 0.8; 
      const baseRatioOffset = isMobile ? 0.05 : 0; // 모바일에서 5% 아래로

      drawWave(1, 0.55 + baseRatioOffset, 80 * ampScale, 0.3 * freqScale, 0.006, '#4a00e0', 0.2);
      drawWave(2, 0.62 + baseRatioOffset, 70 * ampScale, 0.5 * freqScale, 0.01, '#00f2ff', 0.3);
      drawWave(3, 0.70 + baseRatioOffset, 60 * ampScale, 0.7 * freqScale, 0.015, '#ffffff', 0.4);

      time += 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', setCanvasSize); // 캔버스 리사이즈 이벤트 별도 등록

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [isMobile, isCheckingOnboarding]); // isMobile 변경 시 애니메이션 재설정

  // 온보딩 체크 중이면 로딩 화면 표시
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-[#020305] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020305] overflow-hidden font-sans text-white selection:bg-[#00f2ff] selection:text-black">
      
      {/* [Noise Texture] */}
      <div className="absolute inset-0 z-[1] opacity-[0.07] pointer-events-none"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

      {/* [Frosted Glass Overlay] 
          - 반응형 블러: 모바일(backdrop-blur-[2px]) < PC(md:backdrop-blur-[6px])
      */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-[40vh] backdrop-blur-[2px] md:backdrop-blur-[6px] bg-gradient-to-t from-[#020305]/60 to-transparent" 
             style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}
        />
      </div>


      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen overflow-hidden px-4">
        
        {/* [Logo] */}
          <div className="relative z-0 opacity-90 animate-fade-in w-[36rem] h-[20rem] md:w-[1200px] md:h-[600px] pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <Image 
              src="/images/logo-white.png" 
              alt="Wavy Logo" 
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              priority
            />
          </div>

        {/* [Glassmorphism Card] 
            - 반응형 마진/패딩 조정: 모바일 오버랩 감소(-mt-10), 패딩 감소(p-8), 가로 여백 확보(mx-4)
        */}
        <div 
          className="relative z-10 -mt-20 md:-mt-30 w-full max-w-3xl mx-4 md:mx-6 p-8 md:p-14 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-1xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col items-center text-center animate-fade-in"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Slogan */}
          <div className="space-y-4 mb-10 md:mb-12">
            <h1 className="font-heading text-3xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 pb-1 md:pb-2">
                Ride the Vibe,
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
                Connect the Flow
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-300 font-light tracking-wide mix-blend-screen">
              음악과 사람이 연결되는 새로운 물결
            </p>
          </div>
          <div className="w-full max-w-sm space-y-3 mt-8 md:mt-12">

          {/* 카카오 로그인 */}
          <button 
            onClick={() => signInWithSocial('kakao')}
            className="w-full flex items-center transition-all hover:opacity-90 active:scale-[0.98] relative"
            style={{ 
              borderRadius: '12px',
              height: '50px',
              backgroundColor: '#FEE500',
              padding: '0 12px'
            }}
          >
            {/* 카카오 심볼 */}
            <Image
              src="/images/카카오 로고.png"
              alt="카카오"
              width={20}
              height={20}
              className="object-contain"
              style={{ flexShrink: 0, marginRight: '12px' }}
              priority
            />
            {/* 카카오 로그인 레이블 - 중앙 정렬 */}
            <span 
              className="font-medium absolute left-1/2 -translate-x-1/2"
              style={{ 
                color: 'rgba(0, 0, 0, 0.85)',
                fontSize: '14px',
                letterSpacing: '0.25px'
              }}
            >
              카카오 로그인
            </span>
          </button>

          {/* 구글 로그인 */}
          <button 
            onClick={() => signInWithSocial('google')}
            className="gsi-material-button w-full"
            style={{ height: '50px' }}
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">Sign in with Google</span>
              <span style={{ display: 'none' }}>Sign in with Google</span>
            </div>
          </button>
        </div>

          {/* Tags */}
          <div className="mt-6 md:mt-12 flex flex-wrap gap-1 md:gap-5 justify-center">
            {['Artist Lineup', 'Playlist', 'Smart Timetable'].map((text, idx) => (
              <span
                key={idx}
                className="px-4 py-2 text-[0.7rem] md:text-xs font-medium text-white/60 border border-white/10 rounded-full bg-black/30 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-default"
              >
                {text}
              </span>
            ))}
          </div>
        </div>

      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Space Grotesk', sans-serif; }
        .font-heading { font-family: 'Syne', sans-serif; }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.2s; opacity: 0; }
      `}</style>
    </div>
  );
}