import { createBrowserClient } from "@supabase/ssr";

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

// 브라우저 클라이언트를 반환하는 함수
export const createClient = () => {
  // 환경 변수 확인 로그
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("❌ [supabase.ts] 환경 변수가 누락되었습니다!");
    // 에러를 던지지 않고 null을 반환하거나 가짜 객체를 반환하여 크래시 방지
  }
  // 클라이언트 사이드(브라우저)에서만 싱글톤 적용
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // 이미 만들어진 인스턴스가 없으면 새로 생성
  if (!supabaseInstance) {
    console.log("🚀 [supabase.ts] 새 인스턴스 생성 중...");
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabaseInstance;
}