import { supabase } from "@/lib/supabase";
import LookupView from "@/components/lookup/LookupView";

export const revalidate = 0; // 페이지를 캐싱하지 않고 매번 최신 데이터 로드

export default async function LookupPage() {
  // Supabase에서 페스티벌 목록 가져오기
  const { data: festivals, error } = await supabase
    .from("festivals")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching festivals:", error);
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return <LookupView festivals={festivals || []} />;
}
