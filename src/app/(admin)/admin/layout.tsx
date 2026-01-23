import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar";

// 1. 뷰포트 설정 (모바일 최적화)
export const viewport: Viewport = {
  themeColor: "#0a0e17", // 안드로이드 상단바 색상 일치
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // 확대 방지 (앱 같은 느낌)
  userScalable: false,
};

// 2. 메타데이터 설정 (PWA 매니페스트 연결)
export const metadata: Metadata = {
  title: "Wavy",
  description: "Ride the Vibe, Connect the Flow.",
  manifest: "/manifest.json", // 매니페스트 연결
  icons: {
    apple: "/icons/icon-192x192.png", // 아이폰 홈 화면 아이콘
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-[#0a0e17] text-white antialiased">
        {children}
      </body>
    </html>
  );
}