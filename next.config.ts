import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co", // Supabase 프로젝트 URL 패턴 허용
      },
    ],
  },
};

const nextConfig = withPWA({
  dest: "public",         // 서비스 워커 파일 저장 위치
  cacheOnFrontEndNav: true, // 앞단 탐색 시 캐싱 활성화
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,   // 온라인 되돌아오면 리로드
  disable: process.env.NODE_ENV === "development", // 개발 모드에선 PWA 끄기 (중요!)
  workboxOptions: {
    disableDevLogs: true,
  },
})(config);

export default nextConfig;