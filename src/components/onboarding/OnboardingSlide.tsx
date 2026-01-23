'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface OnboardingSlideProps {
  image: string;
  title: string;
  description: string;
  highlightText?: string;
  highlightPosition?: { top?: string; left?: string; right?: string; bottom?: string };
  isActive: boolean;
}

export default function OnboardingSlide({
  image,
  title,
  description,
  highlightText,
  highlightPosition,
  isActive,
}: OnboardingSlideProps) {
  return (
    <div className="relative w-full h-full flex-shrink-0 flex flex-col items-center justify-center bg-slate-950">
      {/* 하단 그라데이션 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-10" />
      
      {/* 핸드폰 프레임 컨테이너 */}
      <div className="relative w-full max-w-[280px] md:max-w-[320px] flex-shrink-0 mb-4 z-0 mt-20 md:mt-24">
        {/* 핸드폰 프레임 */}
        <div className="relative bg-slate-900 rounded-[2.5rem] p-2 md:p-3 shadow-2xl border-4 border-slate-700">
          {/* 노치 (선택적) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10" />
          
          {/* 스크린 영역 */}
          <div className="relative bg-black rounded-[2rem] overflow-hidden aspect-[9/19.5]">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              priority
              quality={95}
              sizes="(max-width: 768px) 280px, 320px"
            />
            
          </div>
        </div>
      </div>

      {/* 텍스트 콘텐츠 - 핸드폰 아래 */}
      <div className="w-full max-w-2xl px-6 text-center relative z-20 mb-16 mt-4 md:mt-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl md:text-2xl font-bold text-white mb-2"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-sm md:text-base text-gray-300 leading-relaxed whitespace-pre-line"
        >
          {description}
        </motion.p>
      </div>
    </div>
  );
}

