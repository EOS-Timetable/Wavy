import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// 크롤러 등 스크립트 실행 시 .env.local을 못 찾을 수 있으므로 명시적 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('❌ Supabase Admin Key가 없습니다. .env.local을 확인하세요.');
}

// ⚠️ 이 클라이언트는 "모든 권한"을 가집니다. 절대 브라우저 코드에서 import 하지 마세요.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false, // 스크립트 실행용이라 토큰 갱신 불필요
    persistSession: false,   // 세션 저장 불필요
  },
});