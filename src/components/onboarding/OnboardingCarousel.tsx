'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import OnboardingSlide from './OnboardingSlide';
import { useRouter } from 'next/navigation';

interface OnboardingData {
  image: string;
  title: string;
  description: string;
  highlightText?: string;
  highlightPosition?: { top?: string; left?: string; right?: string; bottom?: string };
}

interface OnboardingCarouselProps {
  slides: OnboardingData[];
  onComplete: () => void;
}

export default function OnboardingCarousel({ slides, onComplete }: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const router = useRouter();

  const handleSkip = () => {
    localStorage.setItem('wavy_onboarding_completed', 'true');
    onComplete();
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('wavy_onboarding_completed', 'true');
    onComplete();
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    
    if (info.offset.x < -swipeThreshold && currentIndex < slides.length - 1) {
      // 왼쪽으로 스와이프 (다음)
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
      // 오른쪽으로 스와이프 (이전)
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      {/* 건너뛰기 / Dive in 버튼 */}
      <motion.button
        onClick={handleSkip}
        className={`absolute top-6 right-6 z-30 flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 transition-all ${
          isLastSlide 
            ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-blue-500/40 text-white hover:from-blue-600/40 hover:to-cyan-600/40 shadow-lg' 
            : 'text-white/70 hover:text-white'
        }`}
        animate={isLastSlide ? {
          scale: [1, 1.02, 1],
        } : {}}
        transition={isLastSlide ? {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        whileHover={isLastSlide ? {
          scale: 1.05,
        } : {}}
      >
        {isLastSlide ? (
          <>
            {/* 웨이브 효과 배경 - 흐르는 그라데이션 */}
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.2) 25%, rgba(6, 182, 212, 0.2) 50%, rgba(59, 130, 246, 0.2) 75%, transparent 100%)',
                backgroundSize: '200% 100%',
                width: '100%',
                height: '100%',
              }}
            />
            {/* 웨이브 SVG 라인 효과 */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
              style={{ opacity: 0.4 }}
            >
              <motion.path
                fill="none"
                stroke="rgba(59, 130, 246, 0.6)"
                strokeWidth="1.5"
                strokeLinecap="round"
                animate={{
                  d: [
                    "M0,30 Q25,20 50,30 T100,30 T150,30 T200,30",
                    "M0,30 Q25,40 50,30 T100,30 T150,30 T200,30",
                    "M0,30 Q25,20 50,30 T100,30 T150,30 T200,30",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
            <span className="relative z-10 text-sm font-semibold tracking-wide">Dive in</span>
          </>
        ) : (
          <>
            <X className="w-5 h-5" />
            <span className="text-sm">건너뛰기</span>
          </>
        )}
      </motion.button>

      {/* 슬라이드 컨테이너 */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            <OnboardingSlide
              {...slides[currentIndex]}
              isActive={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 페이지 인디케이터 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 justify-center items-center">
        {slides.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/30 w-2'
            }`}
            initial={false}
            animate={{
              width: index === currentIndex ? 32 : 8,
              backgroundColor: index === currentIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.3)',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

    </div>
  );
}

