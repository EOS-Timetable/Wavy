"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TimetableTemplate from "@/components/timetable/TimetableTemplate";
import { List, Loader2, Save, RotateCcw, X, Trash2, CheckCircle, ArrowRight, Link } from "lucide-react"; 

import {
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  TouchSensor, 
  useSensor, 
  useSensors, 
  DragOverlay, 
  defaultDropAnimationSideEffects, 
  DragStartEvent, 
  DragEndEvent, 
  DragOverEvent, 
  pointerWithin,
  CollisionDetection,
  Modifier,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  getMyTimetables, 
  updateMyTimetableById, 
  deleteMyTimetable, 
  updateTimetableOrder,
  MyTimetable 
} from "@/utils/myTimetableFetcher";
import { useDeviceId } from "@/hooks/useDeviceId";

// ------------------------------------------------------------------
// 0. 커스텀 Modifier: 그룹 범위 제한 & 가로 중앙 고정
// ------------------------------------------------------------------
const restrictToGroupBounds: Modifier = ({
  transform,
  draggingNodeRect,
  containerNodeRect,
}) => {
  if (!draggingNodeRect || !containerNodeRect) {
    return transform;
  }

  // 1. 가로축 고정 (중앙)
  const newX = 0;

  // 2. 세로축 제한
  let newY = transform.y;

  // 상단 제한
  if (draggingNodeRect.top + newY < containerNodeRect.top) {
    newY = containerNodeRect.top - draggingNodeRect.top;
  }

  // ⚡ [핵심] 하단 제한 수정: 카드의 중심이 Trash Zone의 중심까지만 가도록
  // Trash Zone 높이(h-32 = 128px)의 절반 = 64px
  const TRASH_ZONE_HALF_HEIGHT = 64;
  const cardHalfHeight = draggingNodeRect.height / 2;
  
  // 컨테이너 바닥(리스트 끝) + Trash Zone 절반 - 카드 절반
  // 이렇게 하면 카드의 Center가 Trash Zone의 Center 라인에 딱 걸립니다.
  const maxBottomOffset = TRASH_ZONE_HALF_HEIGHT - cardHalfHeight;
  
  // 기준점: containerNodeRect.bottom (리스트 아이템들의 끝)
  const limitY = containerNodeRect.bottom + maxBottomOffset;

  if (draggingNodeRect.top + newY > limitY) {
    newY = limitY - draggingNodeRect.top;
  }

  return {
    ...transform,
    x: newX,
    y: newY,
  };
};

// ------------------------------------------------------------------
// 1. 카드 컴포넌트 (날짜 제거)
// ------------------------------------------------------------------
function AnimatedSortableItem({ item, isActive, onClick }: { item: MyTimetable, isActive: boolean, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: item.id,
    data: { festival: item.festival_name } 
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 99 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group relative w-full text-left rounded-xl border transition-all cursor-pointer select-none
        p-3 mb-2
        ${isActive 
          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
          : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600'}
        ${isDragging ? 'ring-2 ring-blue-500 opacity-50' : ''}
      `}
    >
      <div className="flex justify-between items-center">
          <span className={`font-bold text-sm truncate ${isActive ? 'text-cyan-400' : 'text-slate-200'}`}>
              {item.title} 
          </span>
          {isActive && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse ml-2 flex-shrink-0"/>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 2. Trash Zone
// ------------------------------------------------------------------
function TrashDropZone({ 
  visible,   // 드래그 중인지 (이 그룹이 활성화되었는지)
  expanded,  // 확장해야 하는지 (마지막 카드 or 쓰레기통 위)
  isOver, 
  droppableId 
}: { 
  visible: boolean, 
  expanded: boolean, 
  isOver: boolean, 
  droppableId: string 
}) {
  const { setNodeRef } = useDroppable({ 
    id: droppableId, 
    data: { type: 'trash' }
  });
  
  useEffect(() => {
    if (isOver && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
  }, [isOver]);

  return (
    <div
      ref={setNodeRef}
      className={`
        relative w-full shrink-0 flex flex-col items-center justify-center gap-2 overflow-hidden
        transition-all duration-300 ease-out
        
        /* ⚡ [핵심] 높이 및 가시성 제어 */
        ${visible 
            ? (expanded 
                ? 'h-32 opacity-100 mt-2 border-t border-white/10 bg-red-950/20' // 확장됨 (활성)
                : 'h-12 opacity-0 mt-0') // 센서 모드 (투명하지만 공간 차지 -> 감지 가능)
            : 'h-0 opacity-0 mt-0 border-none' // 비활성 (아예 사라짐)
        }
        
        ${isOver ? 'bg-red-900/40' : ''}
      `}
    >
       <div className={`p-3 rounded-full transition-all duration-300 ${isOver ? 'bg-red-500 text-white scale-110 shadow-lg' : 'bg-white/5 text-gray-400'}`}>
        <Trash2 size={24} />
      </div>
      <span className={`text-xs font-bold uppercase ${isOver ? 'text-white' : 'text-gray-500'}`}>
        {isOver ? "놓아서 삭제" : "삭제하기"}
      </span>
    </div>
  );
}

// ------------------------------------------------------------------
// 3. Festival Group (컴포넌트 분리 및 구조화)
// ------------------------------------------------------------------
function FestivalGroup({ 
  festivalName, 
  items, 
  currentTimetableId, 
  onSelect,
  isActiveGroup,
  isOverTrash,
  hasActiveDrag,
  currentOverId // ⚡ [추가] 현재 커서가 있는 아이템 ID
}: { 
  festivalName: string, 
  items: MyTimetable[], 
  currentTimetableId: string | undefined, 
  onSelect: (item: MyTimetable) => void,
  isActiveGroup: boolean,
  isOverTrash: boolean,
  hasActiveDrag: boolean,
  currentOverId: string | null // ⚡
}) {
  const { setNodeRef } = useDroppable({
    id: `group-container-${festivalName}`,
    data: { festival: festivalName }
  });

  const trashZoneId = `trash-zone-${festivalName}`;

  // ⚡ [로직] 마지막 카드 위에 있나?
  const lastItemId = items[items.length - 1]?.id;
  const isOverLastItem = currentOverId === lastItemId;

  // ⚡ [로직] 확장 조건: 쓰레기통 위에 있거나 OR 마지막 카드 위에 있을 때
  const shouldExpand = isOverTrash || isOverLastItem;

  return (
    <div 
      ref={setNodeRef}
      className={`
        mb-2 transition-opacity duration-300
        ${hasActiveDrag && !isActiveGroup ? 'opacity-20 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* [Sticky Level 2] 페스티벌 이름 헤더 
        - top-8: 연도 헤더(약 32px) 바로 아래에 붙도록 설정
        - z-0: 연도 헤더(z-10)보다는 아래지만 카드보다는 위에 오도록
      */}
      <div className="sticky top-8 z-[5] bg-slate-900/95 backdrop-blur py-2 px-1 mb-2 border-b border-white/10 flex items-center gap-2">
          <div className="w-1 h-3 bg-blue-500 rounded-full" />
          <span className="text-white font-bold text-sm">{festivalName}</span>
      </div>
      
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="pl-3 border-l border-white/10 ml-1.5 flex flex-col gap-1">
            {items.map(item => (
                <AnimatedSortableItem 
                    key={item.id} 
                    item={item} 
                    isActive={currentTimetableId === item.id}
                    onClick={() => onSelect(item)}
                />
            ))}
        </div>
      </SortableContext>

      {/* Props 전달 수정 */}
      <TrashDropZone 
        visible={isActiveGroup} // 이 그룹 드래그 중이면 '센서' 켜짐
        expanded={shouldExpand} // 조건 맞으면 '확장'됨
        isOver={isOverTrash} 
        droppableId={trashZoneId} 
      />
    </div>
  );
}

// ------------------------------------------------------------------
// 4. 메인 페이지
// ------------------------------------------------------------------
export default function MyTimetablePage() {
  const deviceId = useDeviceId();
  
  // State
  const [savedList, setSavedList] = useState<MyTimetable[]>([]);
  const [currentTimetable, setCurrentTimetable] = useState<MyTimetable | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(new Set());
  const [currentTitle, setCurrentTitle] = useState(""); 
  const [isListOpen, setIsListOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [tempTitleName, setTempTitleName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // DND State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeFestivalGroup, setActiveFestivalGroup] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isOverGroup, setIsOverGroup] = useState(false);
  // ⚡ [추가] 현재 커서가 위치한 대상의 ID 저장
  const [currentOverId, setCurrentOverId] = useState<string | null>(null);

  // ⚡ 스크롤 제어 상태
  const [enableAutoScroll, setEnableAutoScroll] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ⚡ [추가] 스크롤 컨테이너 제어를 위한 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pointerYRef = useRef<number>(0);

  // ⚡ [핵심] 스크롤 강제 잠금 Effect
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (enableAutoScroll) {
      container.style.overflowY = 'auto'; // 스크롤 허용
    } else {
      // 드래그 중이 아니거나(평소), TrashZone 위일 때 잠금
      // 단, 평소에는 리스트가 길면 스크롤 되어야 하므로 activeId가 있을 때만 잠그는 로직이 안전함
      // 여기서는 enableAutoScroll 상태를 전적으로 신뢰합니다.
      if (activeId) {
         container.style.overflowY = 'hidden'; // 강제 잠금 🔒
      } else {
         container.style.overflowY = 'auto'; // 평소엔 풀기
      }
    }
    
    // Cleanup: 컴포넌트 언마운트 시 복구
    return () => { container.style.overflowY = 'auto'; };
  }, [enableAutoScroll, activeId]);

  // --- 데이터 로드 및 초기 선택 로직 ---
  useEffect(() => {
    async function loadData() {
      if (!deviceId) return;
      try {
        setLoading(true);
        const data = await getMyTimetables(deviceId);
        
        // 일단 전체 리스트는 position 또는 created_at 기준으로 정렬되어 온다고 가정
        // 클라이언트에서 한 번 더 created_at 기준으로 1차 정렬 (최신순)
        const sortedData = data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setSavedList(sortedData);

        if (sortedData.length > 0) {
          const lastViewedId = localStorage.getItem("wavy_last_viewed_id");
          const lastViewedItem = sortedData.find(item => item.id === lastViewedId);
          const latestItem = sortedData[0]; 

          const JUST_CREATED_THRESHOLD = 60 * 1000; 
          const isJustCreated = (Date.now() - new Date(latestItem.created_at).getTime()) < JUST_CREATED_THRESHOLD;

          if (isJustCreated) {
            selectTimetable(latestItem);
          } else if (lastViewedItem) {
            selectTimetable(lastViewedItem);
          } else {
            selectTimetable(latestItem);
          }
        }
      } catch (error) { 
        console.error(error); 
      } finally { 
        setLoading(false); 
      }
    }
    loadData();
  }, [deviceId]);

  const selectTimetable = (target: MyTimetable) => {
    setCurrentTimetable(target);
    setCurrentSelection(new Set(target.selected_ids));
    setCurrentTitle(target.title);
    localStorage.setItem("wavy_last_viewed_id", target.id);
  };

  // --- ⚡ 그룹화 로직 (1. 연도 -> 2. 페스티벌 최신순) ---
  const groupedTimetables = useMemo(() => {
    const groups: Record<string, Record<string, MyTimetable[]>> = {};

    savedList.forEach((item) => {
      // ⚡ festival_date가 있으면 그걸 쓰고, 없으면 created_at 사용 (fallback)
      const dateSource = item.festival_date ? item.festival_date : item.created_at;
      const year = new Date(dateSource).getFullYear().toString();
      const festival = item.festival_name;

      if (!groups[year]) groups[year] = {};
      if (!groups[year][festival]) groups[year][festival] = [];

      groups[year][festival].push(item);
    });

    // 1. 연도 내림차순 정렬 (2026 -> 2025)
    return Object.keys(groups).sort((a, b) => Number(b) - Number(a)).map((year) => {
      // 2. 페스티벌 정렬 (최신순)
      const sortedFestivals = Object.entries(groups[year]).sort(([, itemsA], [, itemsB]) => {
        const maxTimeA = Math.max(...itemsA.map(i => new Date(i.created_at).getTime()));
        const maxTimeB = Math.max(...itemsB.map(i => new Date(i.created_at).getTime()));
        return maxTimeB - maxTimeA; 
      });

      return {
        year,
        festivals: sortedFestivals.map(([name, items]) => ({
            name,
            items: items.sort((a, b) => a.position - b.position)
        }))
      };
    });
  }, [savedList]);
  
  
  // 변경사항 감지
  const hasChanges = useMemo(() => {
    if (!currentTimetable) return false;
    if (currentTitle !== currentTimetable.title) return true;
    const original = new Set(currentTimetable.selected_ids);
    if (original.size !== currentSelection.size) return true;
    for (let id of currentSelection) if (!original.has(id)) return true;
    return false;
  }, [currentTimetable, currentSelection, currentTitle]);

  // 저장 로직 (이름 중복 체크)
  const handleUpdateSave = async () => {
    if (!currentTimetable?.id || !deviceId) return;
    if (!currentTitle.trim()) { alert("이름 입력 필요"); return; }
    
    // [수정] 같은 페스티벌 내에서만 이름 중복 검사
    const isDuplicate = savedList.some(item => 
      item.title === currentTitle && 
      item.id !== currentTimetable.id &&
      item.festival_id === currentTimetable.festival_id // 같은 페스티벌인지 확인
    );

    if (isDuplicate && !confirm(`'${currentTitle}' 덮어쓰기?`)) {
      setTempTitleName(currentTitle);
      setShowRenameModal(true);
      return;
    }

     setIsSaving(true);
     try {
       const { error } = await updateMyTimetableById(currentTimetable.id, currentTitle, Array.from(currentSelection));
       if (error) throw error;
       setShowSuccessModal(true); 
       
       const newData = await getMyTimetables(deviceId);
       setSavedList(newData);

     } catch (e) { console.error(e); alert("실패"); }
     finally { setIsSaving(false); }
  };
  
  const handleReset = () => { if(currentTimetable && confirm("되돌릴까요?")) selectTimetable(currentTimetable); };
  
  const openRenameModal = () => { setTempTitleName(currentTitle); setShowRenameModal(true); };
  const applyRename = () => { setCurrentTitle(tempTitleName); setShowRenameModal(false); };

  // ⚡ [수정] 충돌 감지 로직 강화 (Overshoot 처리)
  const customCollisionDetection: CollisionDetection = (args) => {
    const { active, droppableContainers, pointerCoordinates } = args;

    // ⚡ [추가] 현재 마우스 Y 좌표를 실시간으로 저장 (handleDragOver에서 쓰기 위해)
    if (pointerCoordinates) {
      pointerYRef.current = pointerCoordinates.y;
    }

    if (pointerCoordinates) {
      const activeFestival = active.data.current?.festival;
      if (activeFestival) {
        const targetTrashId = `trash-zone-${activeFestival}`;
        const trashContainer = droppableContainers.find(c => c.id === targetTrashId);
        
        if (trashContainer && trashContainer.rect.current) {
          const rect = trashContainer.rect.current;

          // 1. 커서가 Trash Zone 내부에 있는 경우
          if (pointerWithin({ ...args, droppableContainers: [trashContainer] }).length > 0) {
            return [trashContainer];
          }

          // 2. ⚡ [핵심] 커서가 Trash Zone보다 아래에 있는 경우 (빠른 드래그/오버슈트)
          // X축 범위 내에 있고, Y축이 바닥보다 아래면 충돌로 인정
          const { x, y } = pointerCoordinates;
          if (y > rect.bottom && x >= rect.left && x <= rect.right) {
            return [trashContainer];
          }
        }
      }
    }

    // 3. 그 외엔 closestCenter (아이템 간 순서 변경)
    return closestCenter(args);
  };

  // --- DND Handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const item = savedList.find(i => i.id === active.id);
    if (item) setActiveFestivalGroup(item.festival_name);
    
    setIsOverTrash(false);
    setCurrentOverId(null);
    setEnableAutoScroll(true); // 드래그 시작 시 스크롤 활성화
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    const isTrash = over?.data.current?.type === 'trash';
    setIsOverTrash(isTrash);
    setCurrentOverId(over?.id as string || null);

    if (!over) {
      setEnableAutoScroll(false);
      return;
    }

    if (isTrash) {
      const container = scrollContainerRef.current;
      if (container) {
        // 1. 컨테이너의 화면상 위치 정보 가져오기
        const containerRect = container.getBoundingClientRect();
        
        // 2. 현재 마우스 Y 좌표 (CollisionDetection에서 저장해둔 값)
        const currentPointerY = pointerYRef.current;

        // 3. ⚡ [핵심 로직] "바닥 감지 구역(Hot Zone)" 설정
        // 컨테이너 바닥에서 80px 위까지를 '스크롤이 필요한 영역'으로 간주
        const bottomThreshold = containerRect.bottom - 80;

        // 4. 판단: 
        // 마우스가 바닥 근처(Hot Zone)에 있다면? -> 스크롤 허용 (더 내려가서 보여줘야 하니까)
        // 마우스가 바닥과 멀다면? (중간에 있다면) -> 스크롤 차단 (조준 안정성 확보)
        const isNearBottom = currentPointerY > bottomThreshold;

        setEnableAutoScroll(isNearBottom);
      } else {
        setEnableAutoScroll(false);
      }
    } else {
      // 일반 아이템 위에서는 항상 스크롤 허용
      setEnableAutoScroll(true);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveFestivalGroup(null);
    setIsOverTrash(false);
    setCurrentOverId(null);
    setIsOverGroup(false);
    setEnableAutoScroll(true);

    if (!over) return;

    // 1. 삭제 로직
    if (over.data.current?.type === 'trash') {
       const targetItem = savedList.find(item => item.id === active.id);
       if (targetItem && confirm(`'${targetItem.title}' 삭제?`)) {
          const newList = savedList.filter(item => item.id !== active.id);
          setSavedList(newList);
          await deleteMyTimetable(active.id as string);
          if (currentTimetable?.id === active.id) {
             if (newList.length > 0) selectTimetable(newList[0]);
             else { setCurrentTimetable(null); setIsListOpen(false); }
          }
       }
       return;
    }

    // 2. 순서 변경 로직 (⚡ 정렬 오류 수정)
    if (active.id !== over.id) {
      const activeItem = savedList.find(i => i.id === active.id);
      const overItem = savedList.find(i => i.id === over.id);

      if (!activeItem || !overItem || activeItem.festival_name !== overItem.festival_name) return;

      setSavedList((prevList) => {
        const targetFestival = activeItem.festival_name;
        
        // ⚡ [중요] 시각적 순서(Position)대로 정렬된 배열을 먼저 만듭니다.
        // 이렇게 해야 arrayMove가 화면에 보이는 그대로 인덱스를 계산합니다.
        const festivalItems = prevList
            .filter(item => item.festival_name === targetFestival)
            .sort((a, b) => a.position - b.position);
        
        // 정렬된 배열 기준 인덱스 찾기
        const oldIndex = festivalItems.findIndex((item) => item.id === active.id);
        const newIndex = festivalItems.findIndex((item) => item.id === over.id);

        // 순서 변경
        const reorderedFestivalItems = arrayMove(festivalItems, oldIndex, newIndex);

        // Position 재할당 (0, 1, 2...)
        const updatedFestivalItems = reorderedFestivalItems.map((item, index) => ({
            ...item,
            position: index, 
            updated_at: new Date().toISOString()
        }));

        // DB 업데이트
        updateTimetableOrder(updatedFestivalItems);

        // 전체 리스트에 병합 (기존 아이템을 새 아이템으로 교체)
        return prevList.map(item => {
            if (item.festival_name === targetFestival) {
                return updatedFestivalItems.find(u => u.id === item.id) || item;
            }
            return item;
        });
      });
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      modifiers={[restrictToGroupBounds]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      autoScroll={enableAutoScroll}
    >
      {/* 사이드바 UI 구조 */}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isListOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsListOpen(false)} />
          <div className={`absolute top-0 right-0 h-full w-[300px] bg-slate-900 border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col ${isListOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             
             {/* 헤더 */}
             <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950 shrink-0">
                <h2 className="font-bold text-lg text-white">내 목록</h2>
                <button onClick={() => setIsListOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
             </div>
             
             {/* 리스트 영역 */}
             <div
                ref={scrollContainerRef} 
                className="flex-1 overflow-y-auto px-4 custom-scrollbar relative pb-50"
                >
                {groupedTimetables.length === 0 ? (
                    <div className="text-gray-500 text-center mt-10 text-sm">저장된 타임테이블이 없습니다.</div>
                ) : (
                    groupedTimetables.map(({ year, festivals }) => (
                        <div key={year} className="mb-6 relative">
                            
                            {/* [Sticky Level 1] 연도 헤더 */}
                            {/* 최상단(top-0)에 고정되며, z-index를 높여서(z-10) 페스티벌 헤더보다 위에 오게 함 */}
                            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur py-2 mb-2 border-b border-white/10">
                                <h3 className="text-gray-400 text-xs font-bold tracking-widest uppercase ml-1">
                                    {year}
                                </h3>
                            </div>

                            {/* 페스티벌 그룹 순회 */}
                            {festivals.map(({ name, items }) => (
                                <FestivalGroup 
                                    key={`${year}-${name}`}
                                    festivalName={name}
                                    items={items}
                                    currentTimetableId={currentTimetable?.id}
                                    onSelect={(item) => {
                                        if (!activeId) {
                                            selectTimetable(item);
                                            setIsListOpen(false);
                                        }
                                    }}
                                    isActiveGroup={activeFestivalGroup === name}
                                    isOverTrash={isOverTrash}
                                    hasActiveDrag={!!activeId}
                                    // ⚡ [추가] overId 전달
                                    currentOverId={currentOverId}
                                />
                            ))}
                        </div>
                    ))
                )}
             </div>
          </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay zIndex={150} dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.3' } } }) }}>
        {activeId ? (
            <div className="w-[260px] flex items-center justify-center">
               <div className={`w-full p-3 rounded-xl bg-slate-800/80 backdrop-blur border border-cyan-400/50 shadow-2xl ${isOverTrash ? '!border-red-400 !bg-red-900/20' : ''}`}>
                  <span className="font-bold text-sm text-cyan-300">
                    {savedList.find(i => i.id === activeId)?.title}
                  </span>
               </div>
            </div>
        ) : null}
      </DragOverlay>

      {/* 1. 로딩 중일 때 표시 */}
        {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950 z-50">
            <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
            <span className="text-slate-400 font-bold">불러오는 중...</span>
            </div>
        </div>
        )}

        {/* 2. 로딩 끝났는데 데이터가 없을 때 (빈 화면) 표시 */}
        {!loading && !currentTimetable && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-6 z-40">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <List size={32} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">저장된 시간표가 없어요</h2>
            <p className="text-slate-400 text-center mb-6 max-w-xs">
            아직 생성된 시간표가 없습니다.<br/>
            새로운 시간표를 만들어보세요!
            </p>
            
            {/* 메인으로 돌아가는 버튼이나, 새 시간표 만들기 버튼 등 연결 */}
            <Link
            href="/" // 메인(축제 선택 등)으로 이동 가정
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-6 rounded-xl transition-all"
            >
            홈으로 가기
            </Link>
        </div>
        )}

      {/* 메인 템플릿 */}
      {currentTimetable && (
        <TimetableTemplate
           festivalId={currentTimetable.festival_id}
           initialSelectedIds={currentSelection}
           onSelectionChange={(newSet) => setCurrentSelection(newSet)}
           subTitle={currentTitle}
           onTitleClick={openRenameModal}
           headerAction={
             <div className="flex gap-2">
               {hasChanges && (
                 <>
                   <button onClick={handleReset} className="bg-gray-700 text-white p-2 rounded-full shadow-lg" title="되돌리기"><RotateCcw size={16} /></button>
                   <button onClick={handleUpdateSave} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                     {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} <span>저장</span>
                   </button>
                 </>
               )}
               <button onClick={() => setIsListOpen(true)} className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                 <List size={16} /> <span className="hidden md:inline">목록</span>
               </button>
             </div>
           }
        />
      )}
      
      {/* 이름 변경 모달 (중복 검사 포함) */}
      {showRenameModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in pb-40 md:pb-0" onClick={() => setShowRenameModal(false)}>
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowRenameModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-2">이름 변경</h3>
            {(() => {
              const isDuplicate = savedList.some(item => 
                item.title === tempTitleName && 
                item.id !== currentTimetable?.id &&
                item.festival_id === currentTimetable?.festival_id // 같은 페스티벌인지 확인
              );
              const isEmpty = !tempTitleName.trim();
              return (
                <>
                  <input 
                    type="text" 
                    value={tempTitleName} 
                    onChange={(e) => setTempTitleName(e.target.value)} 
                    autoFocus 
                    placeholder="새로운 이름 입력"
                    className={`
                      w-full bg-slate-800 border text-white rounded-xl px-4 py-3 mb-1 font-bold text-lg transition-all outline-none
                      ${isDuplicate ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'}
                    `} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !isDuplicate && !isEmpty) applyRename(); }} 
                  />
                  <div className="h-6 mb-2 text-xs">
                    {isDuplicate && <span className="text-red-400 font-medium">⚠️ 이미 사용 중인 이름입니다.</span>}
                  </div>
                  <button 
                    onClick={applyRename} 
                    disabled={isDuplicate || isEmpty}
                    className={`
                      w-full font-bold py-3 rounded-xl transition-all
                      ${isDuplicate || isEmpty ? 'bg-slate-800 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}
                    `}
                  >
                    확인
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
       
       {/* 성공 모달 */}
       {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in pb-40 md:pb-0" onClick={() => setShowSuccessModal(false)}>
           <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative flex flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
             <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 ring-1 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"><CheckCircle size={32} /></div>
             <h3 className="text-xl font-bold text-white mb-2">저장 완료!</h3>
             <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 mt-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500">확인</button>
           </div>
        </div>
      )}
    </DndContext>
  );
}