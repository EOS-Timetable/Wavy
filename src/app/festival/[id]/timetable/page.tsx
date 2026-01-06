"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getFestival,
  getStages,
  getFestivalDates,
  getPerformancesByDay,
  Stage,
  PerformanceJoined,
} from "@/utils/dataFetcher";

import TimetableHeader from "@/components/timetable/TimetableHeader";
import TimetableBody from "@/components/timetable/TimetableBody";
import TimetableFab from "@/components/timetable/TimetableFab"; // FAB 컴포넌트 import

// Spotify 로직 import
import { supabase } from "@/lib/supabase";
import { createPlaylistFromArtists } from "@/lib/spotify";
import { Loader2 } from "lucide-react";

export default function TimetablePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const festivalId = params.id as string;

  // --- State 관리 ---
  const [festival, setFestival] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [performances, setPerformances] = useState<PerformanceJoined[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // [추가] 플레이리스트 생성 로딩 상태
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  // 1. 초기 데이터 로드
  useEffect(() => {
    async function initData() {
      if (!festivalId) return;
      setLoading(true);

      const [fetchedFestival, fetchedStages, fetchedDates] = await Promise.all([
        getFestival(festivalId),
        getStages(festivalId),
        getFestivalDates(festivalId),
      ]);

      setFestival(fetchedFestival);
      setStages(fetchedStages);
      setDates(fetchedDates);
      setCurrentDay(1); // 기본 1일차

      setLoading(false);
    }

    initData();
  }, [festivalId]);

  // 2. 공연 데이터 로드
  useEffect(() => {
    async function loadPerformances() {
      if (!festivalId) return;
      const data = await getPerformancesByDay(festivalId, currentDay);
      setPerformances(data || []);
    }
    loadPerformances();
  }, [festivalId, currentDay]);

  // 3. [핵심] 로그인 후 돌아왔을 때 작업 이어하기
  useEffect(() => {
    const resumePlaylistCreation = async () => {
      // 1. 저장된 작업이 있는지 확인
      const pendingArtists = localStorage.getItem("wavy_pending_artists");
      const pendingDay = localStorage.getItem("wavy_pending_day");

      if (!pendingArtists) return;

      setIsCreatingPlaylist(true);

      try {
        // 2. 세션 확인
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.provider_token) {
          // 3. 토큰이 유효하면 바로 생성 로직 실행
          const artistNames = JSON.parse(pendingArtists);
          const day = pendingDay ? parseInt(pendingDay) : 1;

          await processPlaylistCreation(artistNames, session.provider_token, day);
          
          // 4. 성공 후 임시 데이터 삭제
          localStorage.removeItem("wavy_pending_artists");
          localStorage.removeItem("wavy_pending_day");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsCreatingPlaylist(false);
      }
    };

    resumePlaylistCreation();
  }, []); // 마운트 시 1회 실행

  // 4. 에러 체크 (로그인 실패 후 돌아왔을 때)
  useEffect(() => {
    const error = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (error) {
      // URL 지저분하니까 정리
      window.history.replaceState(null, "", window.location.pathname);
      
      // 사용자에게 알림
      if (error === "access_denied") {
        alert(`로그인 실패: 스포티파이 이메일 인증이 필요하거나, 개발자 대시보드에 등록되지 않은 유저입니다.\n(${errorDesc})`);
      } else {
        alert(`로그인 오류: ${errorDesc}`);
      }
      
      // 로딩 상태 해제 (만약 걸려있다면)
      setIsCreatingPlaylist(false);
      localStorage.removeItem("wavy_pending_artists"); // 펜딩 작업 취소
    }
  }, [searchParams]);

  // --- 내부 로직 분리 (재사용을 위해) ---
  const processPlaylistCreation = async (artistNames: string[], token: string, day: number) => {
    try {
      // 사용자 ID 조회
      const meRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!meRes.ok) throw new Error("Spotify 사용자 정보를 가져오지 못했습니다.");
      const me = await meRes.json();

      alert(`🎵 '${festival?.name}' Day ${day} 플레이리스트 생성을 시작합니다.`);

        // [체크 포인트] festivalName을 정확히 넘겨주고 있는지 확인
      await createPlaylistFromArtists({
        artistNames,
        token,
        userId: me.id,
        festivalName: festival?.name,
        day: day
      });

      alert(`✨ 성공! '[${festival?.name}] Day ${day}' 플레이리스트가 생성되었습니다.`);
    } catch (error: any) {
      console.error("Playlist Logic Error:", error);
      alert(`생성 실패: ${error.message}`);
    }
  };

  // --- 핸들러 ---
  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // FAB 핸들러 1: 배경화면 만들기 (준비중)
  const handleMakeWallpaper = () => {
    alert("🎨 배경화면 만들기 기능은 준비 중입니다!");
  };

  // FAB 핸들러 2: 예습 플리 만들기 (인증 시작)
  const handleMakePlaylist = async () => {
    if (selectedIds.size === 0) {
      alert("공연을 먼저 선택해주세요!");
      return;
    }

    // A. 아티스트 목록 추출
    const selectedPerformances = performances.filter(p => selectedIds.has(p.id));
    if (selectedPerformances.length === 0) {
        alert("현재 화면에 보이는 공연 중에서 선택된 것이 없습니다.\n(다른 날짜의 공연은 현재 포함되지 않습니다)");
        return;
    }

    // 시간순 정렬 및 이름 추출
    selectedPerformances.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const artistNames = selectedPerformances.map(p => p.artist.name);
    
    // B. 생성 시작 (로딩 표시)
    setIsCreatingPlaylist(true);

    try {
      // 1. 현재 로그인 상태 확인
      const { data: { session } } = await supabase.auth.getSession();

      // 2-A. 로그인이 안 되어 있거나 토큰이 없으면 -> 저장 후 로그인 페이지로
      if (!session || !session.provider_token) {
        const confirmLogin = confirm("Spotify 로그인이 필요합니다. 이동하시겠습니까?");
        if (!confirmLogin) {
          setIsCreatingPlaylist(false);
          return;
        }

        // ★ 중요: 현재 작업 내용을 저장해둠 (돌아와서 쓰려고)
        localStorage.setItem("wavy_pending_artists", JSON.stringify(artistNames));
        localStorage.setItem("wavy_pending_day", currentDay.toString());

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'spotify',
          options: {
            scopes: 'user-read-private playlist-modify-public playlist-modify-private',
            redirectTo: window.location.href,
          },
        });
        if (error) throw error;
        // 여기서 리다이렉트 되므로 이후 코드는 실행 안 됨
        return; 
      }

      // 2-B. 이미 로그인이 되어 있으면 -> 바로 생성
      await processPlaylistCreation(artistNames, session.provider_token, currentDay);

    } catch (error: any) {
      console.error("Error:", error);
      alert(`오류 발생: ${error.message}`);
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  // --- 렌더링 ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Festival info not found.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden relative">
      {/* 헤더 */}
      <div className="flex-shrink-0 z-50">
        <TimetableHeader
          title={festival.name}
          days={dates}
          currentDay={currentDay}
          onSelectDay={setCurrentDay}
        />
      </div>

      {/* 바디 */}
      <div className="flex-1 relative overflow-hidden">
        <TimetableBody
          stages={stages}
          performances={performances}
          selectedIds={selectedIds}
          onToggleId={handleToggle}
        />
      </div>

      {/* FAB 버튼 */}
      <TimetableFab 
        onMakeWallpaper={handleMakeWallpaper}
        onMakePlaylist={handleMakePlaylist}
        //isLoading={isCreatingPlaylist} // (선택) FAB 컴포넌트에 로딩 prop 추가 시
      />

      {/* 로딩 오버레이 (간단 버전) */}
      {isCreatingPlaylist && (
        <div className="absolute inset-0 bg-black/50 z-[100] flex items-center justify-center">
            <div className="bg-slate-800 p-4 rounded-lg flex items-center gap-3 shadow-xl">
                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                <span>Spotify 플레이리스트 생성 중...</span>
            </div>
        </div>
      )}
    </div>
  );
}