"use client";

import React, { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TimetableTemplate from "@/components/timetable/TimetableTemplate";
import { Save, Loader2, X, ArrowRight, CheckCircle } from "lucide-react";

// API 및 유틸리티
import { getFestival, syncUnifiedPopularity } from "@/utils/dataFetcher";
import { getMyTimetables, saveMyTimetable } from "@/utils/myTimetableFetcher";
import { useAuth } from "@/hooks/useAuth";

export default function FestivalTimetablePage() {
  const router = useRouter();
  const params = useParams();
  const festivalId = params.id as string;
  
  // 로그인 유저 정보 가져오기
  const { user } = useAuth();
  
  // 상태 관리
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [planTitle, setPlanTitle] = useState(""); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [existingTitles, setExistingTitles] = useState<Set<string>>(new Set());

  const selectedIdsRef = useRef<Set<string>>(new Set());

  const handleSelectionChange = (ids: Set<string>) => {
    selectedIdsRef.current = ids;
  };

  // 1. [저장하기] 버튼 클릭 시
  const handleOpenSaveModal = async () => {
    // user 존재 여부 확인
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    const currentSelected = Array.from(selectedIdsRef.current);
    if (currentSelected.length === 0) {
      alert("저장할 공연을 하나 이상 선택해주세요!");
      return;
    }
    
    setPlanTitle(""); 
    setShowSaveModal(true); 

    try {
      // ⚡ getMyTimetables 호출 시 user.id 사용
      const myLists = await getMyTimetables(user.id);
      
      const titles = new Set(
        myLists
          .filter((item: any) => item.festival_id === festivalId)
          .map((item: any) => item.title)
      );
      
      setExistingTitles(titles);
    } catch (e) {
      console.error("기존 목록 로드 실패", e);
    }
  };

  // 2. 이름 입력 후 [확인] 클릭 시
  const handleConfirmSave = async () => {
    if (!user) return; // ⚡ user 확인

    if (!planTitle.trim()) {
      alert("플랜 이름을 입력해주세요.");
      return;
    }

    setIsSaving(true);

    try {
      const festivalInfo = await getFestival(festivalId);
      const festivalName = festivalInfo ? festivalInfo.name : "Unknown Festival";
      const currentSelected = Array.from(selectedIdsRef.current);

      const { error } = await saveMyTimetable(
        festivalId,
        festivalName,
        planTitle,
        currentSelected,
        user.id,
      );

      if (error) throw error;
      await syncUnifiedPopularity(festivalId, user.id);
      
      setShowSaveModal(false);
      setShowSuccessModal(true);
      
    } catch (e : any) {
      console.error("Save failed:", e?.message || e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToMyList = () => {
    router.push('/timetable');
  };

  return (
    <>
      {/* 메인 타임테이블 화면 */}
      <TimetableTemplate
        festivalId={festivalId}
        onSelectionChange={handleSelectionChange}
        backHref={`/festival/${festivalId}`}
        headerAction={
          <button 
            onClick={handleOpenSaveModal} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg transition-all active:scale-95"
          >
            <Save size={16} />
            <span className="hidden md:inline">저장하기</span>
          </button>
        }
      />

      {/* --- 모달 1: 이름 입력창 --- */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setShowSaveModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={20} /></button>

            <h3 className="text-xl font-bold text-white mb-2">타임테이블 저장</h3>
            <p className="text-gray-400 text-sm mb-5">나만의 라인업에 이름을 붙여주세요.</p>

            {/* ⚡ [로직 추가] 실시간 검사 */}
            {(() => {
              const isDuplicate = existingTitles.has(planTitle); // 이미 있는 이름인가?
              const isEmpty = !planTitle.trim();
              
              return (
                <>
                  <input
                    type="text"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    placeholder="이름을 입력하세요"
                    autoFocus
                    className={`
                      w-full bg-slate-800 border text-white rounded-xl px-4 py-3 mb-1 focus:outline-none font-bold text-lg transition-all
                      /* ⚡ 빨간 테두리 적용 */
                      ${isDuplicate 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'border-slate-700 focus:border-blue-500'
                      }
                    `}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isDuplicate && !isEmpty) handleConfirmSave();
                    }}
                  />
                  
                  {/* ⚡ 에러 메시지 */}
                  <div className="h-6 mb-2 text-xs">
                    {isDuplicate && <span className="text-red-400 font-medium">⚠️ 이미 사용 중인 이름입니다.</span>}
                  </div>

                  <button
                    onClick={handleConfirmSave}
                    disabled={isSaving || isDuplicate || isEmpty}
                    className={`
                      w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2
                      /* ⚡ 버튼 비활성화 스타일 */
                      ${(isSaving || isDuplicate || isEmpty)
                        ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }
                    `}
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : "저장 완료"}
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- ⚡ 모달 2: 저장 성공 확인 (여기 추가됨!) --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative flex flex-col items-center text-center">
            
            {/* 닫기 버튼 (더 둘러보기와 동일 역할) */}
            <button 
              onClick={() => setShowSuccessModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            {/* 아이콘 + 메시지 */}
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 ring-1 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-in zoom-in duration-300">
              <CheckCircle size={32} strokeWidth={3} />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">저장 완료!</h3>
            <p className="text-gray-400 text-sm mb-6">
              <strong className="text-blue-400">{planTitle}</strong>이(가) 저장되었습니다.<br/>
              지금 바로 확인하시겠습니까?
            </p>

            {/* 버튼 그룹 */}
            <div className="flex gap-3 w-full">
              {/* 1. 더 둘러보기 (현재 페이지 유지) */}
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-gray-300 font-bold hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                더 둘러보기
              </button>

              {/* 2. 보러 가기 (내 목록으로 이동) */}
              <button 
                onClick={handleGoToMyList}
                className="flex-[1.5] py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                보러 가기 <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}