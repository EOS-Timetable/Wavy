'use client';

import { useState } from 'react';
import { Plus, Image as ImageIcon, Music, X } from 'lucide-react';

interface TimetableFabProps {
  onMakeWallpaper: () => void;
  onMakePlaylist: () => void;
}

export default function TimetableFab({ onMakeWallpaper, onMakePlaylist }: TimetableFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  // 메뉴 버튼 스타일 (공통)
  const menuItemClass = `
    flex items-center gap-3 px-4 py-3 bg-white text-slate-900 rounded-full shadow-lg 
    hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-gray-100
    whitespace-nowrap font-bold text-sm
  `;

  return (
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
      
      {/* --- 메뉴 아이템들 (아래에서 위로 펼쳐짐) --- */}
      {/* 1. 예습 플리 만들기 */}
      <div 
        className={`
          pointer-events-auto transition-all duration-300 ease-out transform origin-bottom-right
          ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}
        `}
      >
        <button 
          onClick={() => {
            onMakePlaylist();
            setIsOpen(false);
          }}
          className={menuItemClass}
        >
          <span>예습 플리 만들기</span>
          <div className="bg-green-100 p-1.5 rounded-full text-green-600">
            <Music size={18} />
          </div>
        </button>
      </div>

      {/* 2. 배경화면 만들기 */}
      <div 
        className={`
          pointer-events-auto transition-all duration-300 ease-out delay-75 transform origin-bottom-right
          ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}
        `}
      >
        <button 
          onClick={() => {
            onMakeWallpaper();
            setIsOpen(false);
          }}
          className={menuItemClass}
        >
          <span>배경화면 만들기</span>
          <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
            <ImageIcon size={18} />
          </div>
        </button>
      </div>

      {/* --- 메인 FAB 버튼 --- */}
      <button
        onClick={toggleOpen}
        className={`
          pointer-events-auto
          flex items-center justify-center w-14 h-14 rounded-full shadow-xl 
          bg-gradient-to-tr from-blue-600 to-purple-600 text-white
          hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300
          focus:outline-none ring-4 ring-white/10
        `}
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-[135deg]' : 'rotate-0'}`}>
          <Plus size={28} strokeWidth={2.5} />
        </div>
      </button>

      {/* 배경 클릭 시 닫기 위한 투명 오버레이 (열렸을 때만 활성화) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] -z-10 pointer-events-auto"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}