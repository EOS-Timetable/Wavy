import { createClient } from "@/lib/supabase";
import LookupView from "@/components/lookup/LookupView";
import { getAllArtists } from "@/utils/dataFetcher";

export const revalidate = 0; // 페이지를 캐싱하지 않고 매번 최신 데이터 로드
const supabase = createClient();

export default async function LookupPage() {
  // Supabase에서 페스티벌 목록 가져오기
  const { data: festivals, error: festivalsError } = await supabase
    .from("festivals")
    .select("*")
    .order("start_date", { ascending: true });

  if (festivalsError) {
    console.error("Error fetching festivals:", festivalsError);
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // DB에서 아티스트 목록 가져오기
  const artists = await getAllArtists();
  
  console.log(`[LookupPage] Artists passed to LookupView:`, artists.slice(0, 5).map(a => ({ id: a.id, name: a.name })));

  return <LookupView festivals={festivals || []} artists={artists} />;
}
