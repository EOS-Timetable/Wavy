"use client";

import { useState, useEffect, useMemo } from "react";
import HomeHeader from "@/components/home/HomeHeader";
import DDayBanner from "@/components/home/DDayBanner";
import ThisYearSection from "@/components/home/ThisYearSection";
import LegacySection from "@/components/home/LegacySection";
import { getExternalThumbnailUrl } from "@/utils/externalThumbnail";
import { USE_MOCK_DATA } from "@/config/dataMode";
import { useDeviceId } from "@/hooks/useDeviceId";
import { getMyTimetables } from "@/utils/myTimetableFetcher";
import { supabase } from "@/lib/supabase";
import {
  getFestivalKey,
  MOCK_HOME_FESTIVALS,
  MOCK_LEGACY_CONTENTS,
  MOCK_THIS_YEAR_CONTENTS,
} from "@/data/homeMockContents";

interface SavedFestival {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  posterUrl?: string;
}

export default function HomePage() {
  const deviceId = useDeviceId();
  const [selectedFestivalId, setSelectedFestivalId] = useState<string | undefined>();
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string>>({});
  const [savedFestivalsDb, setSavedFestivalsDb] = useState<SavedFestival[]>([]);
  const [loading, setLoading] = useState(!USE_MOCK_DATA);

  // ✅ 목업/DB 모드 스위치
  const savedFestivals: SavedFestival[] = USE_MOCK_DATA ? MOCK_HOME_FESTIVALS : savedFestivalsDb;

  // DB 모드일 때만: 저장된 타임테이블 기반으로 페스티벌 목록 로드
  useEffect(() => {
    if (USE_MOCK_DATA) return;
    if (!deviceId) {
      setLoading(false);
      return;
    }

    async function loadSavedFestivals() {
      try {
        setLoading(true);
        const timetables = await getMyTimetables(deviceId as string);
        const uniqueFestivalIds = Array.from(new Set(timetables.map((t) => t.festival_id)));
        if (uniqueFestivalIds.length === 0) {
          setSavedFestivalsDb([]);
          return;
        }

        const { data: festivalsData, error: festivalsError } = await supabase
          .from("festivals")
          .select("id, name, start_date, end_date, poster_url")
          .in("id", uniqueFestivalIds);

        if (festivalsError) {
          console.error("Error fetching festivals:", festivalsError);
          setSavedFestivalsDb([]);
          return;
        }

        const festivalById = new Map<string, any>(
          (festivalsData || []).map((f: any) => [f.id, f])
        );

        const festivals: SavedFestival[] = uniqueFestivalIds
          .map((festivalId) => {
            const festival = festivalById.get(festivalId);
            if (!festival) return null;

            const startDate = festival.start_date
              ? typeof festival.start_date === "string"
                ? festival.start_date
                : new Date(festival.start_date).toISOString().split("T")[0]
              : "";
            const endDate = festival.end_date
              ? typeof festival.end_date === "string"
                ? festival.end_date
                : new Date(festival.end_date).toISOString().split("T")[0]
              : "";

            return {
              id: festival.id,
              name: festival.name,
              startDate,
              endDate,
              posterUrl: festival.poster_url || undefined,
            } as SavedFestival;
          })
          .filter((f): f is SavedFestival => f !== null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedFestivals = [...festivals].sort((a, b) => {
          const endA = a.endDate ? new Date(a.endDate).getTime() : -Infinity;
          const endB = b.endDate ? new Date(b.endDate).getTime() : -Infinity;
          const isEndedA = a.endDate ? new Date(a.endDate) < today : true;
          const isEndedB = b.endDate ? new Date(b.endDate) < today : true;

          if (isEndedA !== isEndedB) return isEndedA ? 1 : -1;
          if (!isEndedA && !isEndedB) {
            const startA = new Date(a.startDate).getTime();
            const startB = new Date(b.startDate).getTime();
            return startA - startB;
          }
          return endB - endA;
        });

        setSavedFestivalsDb(sortedFestivals);
      } catch (error) {
        console.error("Error loading saved festivals:", error);
        setSavedFestivalsDb([]);
      } finally {
        setLoading(false);
      }
    }

    loadSavedFestivals();
  }, [deviceId]);

  // 선택된 페스티벌 또는 가장 임박한 페스티벌
  const currentFestival = useMemo(() => {
    if (savedFestivals.length === 0) return null;
    
    // selectedFestivalId가 명시적으로 설정되어 있으면 (null이어도) 그것을 찾음
    if (selectedFestivalId !== undefined) {
      // null이면 명시적으로 선택 안 함을 의미하므로 null 반환
      if (selectedFestivalId === null) return null;
      
      // 선택된 페스티벌 찾기
      const found = savedFestivals.find((f) => f.id === selectedFestivalId);
      if (found) return found;
      // 찾을 수 없으면 null 반환 (명시적으로 선택했는데 없으면)
      return null;
    }
    // selectedFestivalId가 undefined면 아직 선택 안 한 상태 → 가장 임박한 페스티벌 사용
    return savedFestivals[0];
  }, [savedFestivals, selectedFestivalId]);

  // This Year와 Legacy 콘텐츠 가져오기 (목업 데이터)
  const { thisYearContents, legacyContents } = useMemo(() => {
    const festivalKey = currentFestival ? getFestivalKey(currentFestival.name) : null;
    const thisYear = festivalKey && MOCK_THIS_YEAR_CONTENTS[festivalKey]
      ? MOCK_THIS_YEAR_CONTENTS[festivalKey].map((item) => ({
          ...item,
          imageUrl:
            thumbnailCache[item.linkUrl] ||
            item.imageUrl ||
            getExternalThumbnailUrl(item.linkUrl),
        }))
      : [];
    const legacy = festivalKey && MOCK_LEGACY_CONTENTS[festivalKey]
      ? MOCK_LEGACY_CONTENTS[festivalKey].map((item: any) => ({
          ...item,
          thumbnailUrl: item.thumbnailUrl || getExternalThumbnailUrl(item.linkUrl),
        }))
      : [];
    return { thisYearContents: thisYear, legacyContents: legacy };
  }, [currentFestival, thumbnailCache]);


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pb-20 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <HomeHeader />

        {/* D-Day / ThisYear / Legacy 섹션 간격 통일 */}
        <div className="space-y-5">
          <DDayBanner
            savedFestivals={savedFestivals}
            selectedFestivalId={selectedFestivalId}
            onFestivalChange={setSelectedFestivalId}
            withBottomMargin={false}
          />

          {/* This Year 섹션 - 저장된 페스티벌이 있을 때만 표시 */}
          {currentFestival && (
            <ThisYearSection
              festivalId={currentFestival.id}
              festivalName={currentFestival.name}
              contents={thisYearContents}
            />
          )}

          {/* Legacy 섹션 - 저장된 페스티벌이 있을 때만 표시 */}
          {currentFestival && (
            <LegacySection
              festivalId={currentFestival.id}
              festivalName={currentFestival.name}
              contents={legacyContents}
            />
          )}
        </div>
      </div>
    </div>
  );
}
