import { createClient } from "@/lib/supabase";

export const signInWithSocial = async (provider: 'google' | 'kakao') => {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(`${provider} 로그인 에러:`, error.message);
    return false;
  }
  
  console.log(`${provider} OAuth 프로세스가 시작되었습니다.`);
  return true;
};