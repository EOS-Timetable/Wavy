'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SpotifyCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Spotify가 해시(#)에 담아준 토큰 확인
    const hash = window.location.hash;
    
    // 2. 아까 저장해둔 "원래 있던 페이지" 주소 확인
    const returnUrl = localStorage.getItem('wavy_return_url');

    if (hash && returnUrl) {
      // 3. 토큰을 달고 원래 페이지로 복귀
      // (origin은 127.0.0.1로 같으므로 localStorage 접근 가능)
      router.replace(`${returnUrl}${hash}`);
    } else {
      // 정보가 없으면 홈으로
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="animate-spin text-4xl mb-4">⏳</div>
      <p className="text-gray-400">Login Successful! Redirecting...</p>
    </div>
  );
}