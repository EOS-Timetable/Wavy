'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingCarousel from '@/components/onboarding/OnboardingCarousel';

// 온보딩 슬라이드 데이터
const onboardingSlides = [
  {
    image: '/images/onboarding/home-penta.png',
    title: '페스티벌 D-day 카운트다운',
    description: '다가오는 페스티벌의 설렘을 함께 해요',
    highlightText: 'D-day 카운트다운',
    highlightPosition: { top: '20%', right: '10%' },
  },
  {
    image: '/images/onboarding/lookup.png',
    title: '페스티벌 & 아티스트 검색',
    description: '원하는 페스티벌이나 아티스트를\n빠르게 찾아보세요',
    highlightText: '검색',
    highlightPosition: { top: '20%', left: '50%', transform: 'translateX(-50%)' },
  },
  {
    image: '/images/onboarding/festival-penta.png',
    title: '페스티벌의 모든 정보를 한 눈에',
    description: '내가 좋아하는 페스티벌의 모든 정보를\n한 눈에 확인하세요',
    highlightText: '페스티벌의 모든 정보',
    highlightPosition: { top: '20%', left: '50%', transform: 'translateX(-50%)' },
  },
  {
    image: '/images/onboarding/timetable-penta.png',
    title: '타임테이블 & 플레이리스트 생성',
    description: '나만의 타임테이블을 만들고\n원클릭 예습 플레이리스트로 준비하세요',
    highlightText: '타임테이블',
    highlightPosition: { top: '30%', left: '10%' },
  },
  {
    image: '/images/onboarding/library.png',
    title: '라이브러리',
    description: '좋아하는 페스티벌과 아티스트를 팔로우하고\n나의 취향을 모아보세요',
    highlightText: '라이브러리',
    highlightPosition: { top: '25%', left: '10%' },
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/');
  };

  return (
    <OnboardingCarousel slides={onboardingSlides} onComplete={handleComplete} />
  );
}

