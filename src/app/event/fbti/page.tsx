'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ChevronRight, 
  Share2, 
  RefreshCcw,
  Sparkles,
  Music,
  CheckCircle2,
} from 'lucide-react';

// --- TYPES & INTERFACES ---
type ResultType = 'HOT' | 'HEAL' | 'PIC' | 'PARTY' | 'PLAN' | 'FREE';

type ViewType = 'intro' | 'quiz' | 'result';

interface CharacterInfo {
  title: string;
  description: string;
  // 기존 color 대신 배경 이미지나 복합적인 스타일을 위한 이미지 URL
  bgImageUrl: string; 
  // 캐릭터 본체 이미지 URL
  characterImageUrl: string;
  gradient: string;
  whyWavy: string[];
}

interface Option {
  text: string;
  weight: Partial<Record<ResultType, number>>;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

type ScoreMap = Record<string, number>;

// --- CONSTANTS ---
const PRIORITY: ResultType[] = ['HOT', 'PARTY', 'FREE', 'HEAL', 'PIC', 'PLAN'];

// 실제 서비스 시에는 /assets/images/... 경로의 파일로 대체하세요.
const CHARACTER_DATA: Record<ResultType, CharacterInfo> = {
  HOT: {
    title: "펜스 앞 열정 전사",
    description: "무대 위 아티스트보다 더 뜨겁게 타오르는 당신! 펜스 1열 사수는 기본, 온몸으로 축제를 흡수하는 진정한 열정의 아이콘입니다.",
    bgImageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=500&auto=format&fit=crop", 
    characterImageUrl: "/images/fbti/펜스 앞 열정 전사.png",
    gradient: "from-red-400 to-orange-600",
    whyWavy: [
      "실시간 스테이지 알림으로 슬램 타이밍 사수",
      "지금 가장 핫한 스테이지 혼잡도 확인",
      "함께 뛸 '슬램팟' 팀원 찾기 기능"
    ]
  },
  HEAL: {
    title: "여유만만 돗자리 힐러",
    description: "페스티벌은 곧 여유! 돗자리 명당에서 시원한 바람과 맥주 한 잔이면 세상을 다 가진 기분. 당신은 축제의 평화를 수호하는 힐러입니다.",
    bgImageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=500&auto=format&fit=crop",
    characterImageUrl: "/images/fbti/여유만만 돗자리 힐러.png",
    gradient: "from-green-400 to-emerald-600",
    whyWavy: [
      "여유롭게 즐길 수 있는 '돗자리 명당' 지도",
      "줄 서지 않는 모바일 푸드 오더 서비스",
      "나의 취향에 딱 맞는 앰비언트 아티스트 추천"
    ]
  },
  PIC: {
    title: "필터 속의 주인공",
    description: "남는 건 사진뿐! 찰나의 순간을 예술로 승화시키는 당신. 오늘 당신의 인스타 피드는 페스티벌의 공식 화보집이 될 예정입니다.",
    bgImageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=500&auto=format&fit=crop",
    characterImageUrl: "/images/fbti/필터 속의 주인공.png",
    gradient: "from-purple-400 to-indigo-600",
    whyWavy: [
      "현재 가장 예쁘게 나오는 '실시간 포토존' 정보",
      "아티스트별 최고의 샷을 찍기 위한 명당 가이드",
      "다른 유저들이 올린 실시간 무대 고화질 뷰 확인"
    ]
  },
  PARTY: {
    title: "흥 폭발 파티 피플",
    description: "모르는 사람과도 5분 만에 친구가 되는 마법! 당신이 가는 곳이 곧 파티장입니다. 모두의 흥을 돋우는 페스티벌의 미친 존재감!",
    bgImageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=500&auto=format&fit=crop",
    characterImageUrl: "/images/fbti/흥 폭발 파티 피플.png",
    gradient: "from-yellow-300 to-orange-400",
    whyWavy: [
      "지금 내 근처의 '인싸'들과 즉석 매칭",
      "공연 종료 후 열리는 애프터 파티 정보",
      "실시간 커뮤니티로 같이 술 마실 친구 찾기"
    ]
  },
  PLAN: {
    title: "1분 1초 효율 전략가",
    description: "분 단위의 타임테이블과 보조배터리 완충은 기본! 변수 없는 축제를 위해 완벽한 전략을 세우는 당신은 페스티벌의 든든한 가이드입니다.",
    bgImageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=500&auto=format&fit=crop",
    characterImageUrl: "/images/fbti/1분 1초 효율 전략가.png",
    gradient: "from-blue-400 to-cyan-600",
    whyWavy: [
      "동선 낭비 없는 AI 기반 '커스텀 타임테이블'",
      "친구와 일정 공유로 겹치는 시간 자동 계산",
      "셔틀버스 및 화장실 대기 시간 실시간 정보"
    ]
  },
  FREE: {
    title: "자유로운 영혼의 방랑자",
    description: "발길 닿는 대로, 소리 들리는 대로! 계획 따위는 던져버리고 현재의 느낌에 몸을 맡기는 당신은 축제 그 자체를 즐기는 보헤미안입니다.",
    bgImageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=500&auto=format&fit=crop",
    characterImageUrl: "/images/fbti/자유로운 영혼의 방랑자.png",
    gradient: "from-pink-300 to-rose-500",
    whyWavy: [
      "지금 당장 '무드'에 맞는 스테이지 추천",
      "예상치 못한 아티스트의 깜짝 공연 알림",
      "지도 없이도 즐거운 '랜덤 스테이지 투어' 가이드"
    ]
  }
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "드디어 기다리던 페스티벌 당일! 집을 나서기 전 내 마음가짐은?",
    options: [
      { text: "오늘 라인업 완벽 정복한다.", weight: { PLAN: 2, HOT: 2 } },
      { text: "예쁘게 입었으니 사진 백만 장 찍어야지!", weight: { PIC: 3 } },
      { text: "그냥 맛있는 거 먹고 바람 쐬러 가는 거지 뭐~", weight: { HEAL: 3 } }
    ]
  },
  {
    id: 2,
    text: "페스티벌 게이트 오픈! 입장하자마자 내가 달려가는 곳은?",
    options: [
      { text: "무조건 무대 앞 펜스 자리 사수!", weight: { HOT: 3 } },
      { text: "나무 그늘 아래 명당 돗자리 구역!", weight: { HEAL: 3 } },
      { text: "줄 길어지기 전에 공식 포토존으로!", weight: { PIC: 3 } }
    ]
  },
  {
    id: 3,
    text: "타임테이블을 확인했는데, 내가 모르는 가수의 공연 시간이라면?",
    options: [
      { text: "새로운 음악 발견은 즐거워! 일단 듣는다.", weight: { FREE: 3 } },
      { text: "다음 공연을 위해 체력을 아껴야 해. 쉰다.", weight: { PLAN: 3 } },
      { text: "이 시간에 푸드존을 공략해서 맛있는 걸 먹는다.", weight: { PARTY: 2, HEAL: 1 } }
    ]
  },
  {
    id: 4,
    text: "공연 중 가수가 \"다 같이 소리 질러!\"라고 외친다면?",
    options: [
      { text: "목이 터져라 떼창하며 점프한다.", weight: { HOT: 2, PARTY: 2 } },
      { text: "흐뭇하게 웃으며 그 모습을 영상으로 담는다.", weight: { PIC: 3 } },
      { text: "리듬에 맞춰 가볍게 몸을 흔든다.", weight: { FREE: 3 } }
    ]
  },
  {
    id: 5,
    text: "페스티벌의 꽃 '푸드존'! 메뉴를 고를 때 나의 기준은?",
    options: [
      { text: "무조건 비주얼! 사진 잘 나오는 예쁜 음식.", weight: { PIC: 3 } },
      { text: "먹기 편하고 든든한 것. 빨리 먹고 공연 봐야 하니까!", weight: { PLAN: 2, HOT: 1 } },
      { text: "시원한 맥주와 찰떡궁합인 안주 위주로!", weight: { PARTY: 3 } }
    ]
  },
  {
    id: 6,
    text: "모르는 사람이 너무 신난 나머지 나에게 같이 춤추자고 한다면?",
    options: [
      { text: "당황스럽지만 같이 \"예이~!\" 하며 즐긴다.", weight: { PARTY: 2, FREE: 2 } },
      { text: "어색하게 웃으며 슬쩍 자리를 피한다.", weight: { PLAN: 3 } },
      { text: "\"오, 재밌는 상황인데?\" 일단 그 사람을 촬영한다.", weight: { PIC: 3 } }
    ]
  },
  {
    id: 7,
    text: "갑자기 소나기가 내리기 시작한다면 나의 대처는?",
    options: [
      { text: "이것도 페스티벌의 묘미! 비 맞으며 슬램한다.", weight: { HOT: 2, PARTY: 2 } },
      { text: "미리 챙겨온 우비를 꺼내 입고 계획대로 움직인다.", weight: { PLAN: 3 } },
      { text: "비 피할 곳을 찾아 들어가서 느긋하게 비 구경을 한다.", weight: { HEAL: 3 } }
    ]
  },
  {
    id: 8,
    text: "내가 가장 좋아하는 아티스트의 공연이 끝났다! 다음 행동은?",
    options: [
      { text: "여운을 즐기며 다음 공연까지 자리를 지킨다.", weight: { HOT: 3 } },
      { text: "얼른 이동해서 다른 스테이지의 공연을 체크한다.", weight: { PLAN: 3 } },
      { text: "이제 지쳤다... 돗자리로 돌아가서 눕는다.", weight: { HEAL: 3 } }
    ]
  },
  {
    id: 9,
    text: "페스티벌 도중 핸드폰 배터리가 10%라면?",
    options: [
      { text: "보조배터리 풀충전 완료! 내 계획엔 차질 없다.", weight: { PLAN: 3 } },
      { text: "사진을 못 찍다니... 충전 부스를 찾아 헤맨다.", weight: { PIC: 3 } },
      { text: "\"오히려 좋아.\" 핸드폰 끄고 공연에만 집중한다.", weight: { FREE: 3 } }
    ]
  },
  {
    id: 10,
    text: "페스티벌이 끝나고 집으로 돌아가는 길, 가장 먼저 하는 생각은?",
    options: [
      { text: "오늘 찍은 사진들 보정해서 인스타 올려야지!", weight: { PIC: 3 } },
      { text: "진짜 하얗게 불태웠다... 당분간은 요양이다.", weight: { HOT: 3 } },
      { text: "다음 페스티벌은 언제지? 벌써 예매 알아본다.", weight: { PLAN: 3 } }
    ]
  }
];

// --- HELPER LOGIC ---
const calculateResult = (scores: ScoreMap): ResultType => {
  const sortedTypes = (Object.entries(scores) as [ResultType, number][]).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return PRIORITY.indexOf(a[0]) - PRIORITY.indexOf(b[0]);
  });
  return sortedTypes[0]?.[0] || 'HOT';
};

// --- COMPONENTS ---
const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden border-2 border-black">
    <motion.div 
      className="bg-indigo-600 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ type: "spring", stiffness: 50 }}
    />
  </div>
);

const StickerCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-6 ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [view, setView] = useState<ViewType>('intro');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [scores, setScores] = useState<ScoreMap>({});
  const [resultType, setResultType] = useState<ResultType | null>(null);

  const startQuiz = () => {
    setScores({});
    setCurrentIdx(0);
    setView('quiz');
  };

  const handleAnswer = (weight: Partial<Record<ResultType, number>>) => {
    const newScores = { ...scores };
    Object.entries(weight).forEach(([type, val]) => {
      if (val !== undefined) newScores[type] = (newScores[type] || 0) + val;
    });
    setScores(newScores);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setResultType(calculateResult(newScores));
      setView('result');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex items-center justify-center p-4 selection:bg-indigo-100">
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        @font-face {
          font-family: 'GmarketSans';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: 'GmarketSans';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
          font-weight: 500;
          font-style: normal;
        }
        
        body {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        .font-brand {
          font-family: 'GmarketSans', sans-serif;
          letter-spacing: -0.04em;
        }
        
        .font-body {
          font-family: 'Pretendard', sans-serif;
          letter-spacing: -0.02em;
        }
      `}</style>
      <div className="w-full max-w-[420px]">
        <AnimatePresence mode="wait">
          {view === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <StickerCard className="text-center py-12 relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-widest">WAVY 2026</div>
                <h1 className="text-7xl font-brand font-black mb-1 italic leading-none text-black tracking-tighter">
                  MY<br/>TYPE
                </h1>
                <p className="text-base font-brand font-medium text-gray-400 mb-12 uppercase tracking-[0.2em]">페스티벌 유형 검사</p>
                <div className="relative w-48 h-48 mx-auto mb-10 group">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 scale-110"></div>
                  <div className="relative z-10 w-full h-full bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Music size={80} className="text-indigo-600" />
                  </div>
                </div>

                <p className="text-xl font-body font-bold text-gray-800 mb-12 leading-tight">
                  축제 속 나의 진짜 모습은?<br/>
                  <span className="text-indigo-600">10문항으로 캐릭터 발견하기</span>
                </p>

                <button 
                  onClick={() => setView('quiz')}
                  className="w-full bg-black text-white text-2xl font-brand font-black py-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  시작하기 <ChevronRight size={28} strokeWidth={4} />
                </button>
              </StickerCard>
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center px-2">
                <span className="bg-black text-white px-3 py-1 rounded-lg font-black italic">Q{currentIdx + 1}</span>
                <span className="font-black text-gray-400 uppercase text-sm tracking-tighter">Progress: {Math.round(((currentIdx+1)/QUESTIONS.length)*100)}%</span>
              </div>
              <ProgressBar current={currentIdx + 1} total={QUESTIONS.length} />

              <StickerCard className="min-h-[420px] flex flex-col justify-between">
                <h2 className="text-3xl font-black mb-8 leading-tight tracking-tight">
                  {QUESTIONS[currentIdx].text}
                </h2>

                <div className="space-y-4">
                  {QUESTIONS[currentIdx].options.map((opt, i) => (
                    <motion.button
                      key={`${currentIdx}-${i}`}
                      whileTap={{ scale: 0.96 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.1 }}
                      onClick={() => handleAnswer(opt.weight)}
                      className="w-full p-5 text-left border-4 border-black rounded-2xl font-black text-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-between group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    >
                      <span>{opt.text}</span>
                    </motion.button>
                  ))}
                </div>
              </StickerCard>
            </motion.div>
          )}

          {view === 'result' && resultType && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} // 애니메이션 살짝 수정 (위로 올라오듯)
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="pb-10" // 하단 스크롤 여유 공간 확보
            >
              <StickerCard className="text-center relative pt-12 pb-6 px-5 overflow-hidden flex flex-col h-full">
                
                {/* --- [배경 이미지] --- */}
                <div className="absolute top-0 left-0 w-full h-40 -z-10 overflow-hidden">
                  <img 
                    src={CHARACTER_DATA[resultType].bgImageUrl} 
                    alt="background" 
                    className="w-full h-full object-cover opacity-30 grayscale"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b ${CHARACTER_DATA[resultType].gradient} opacity-60`} />
                </div>
                
                {/* --- [헤더: 타이틀 & 캐릭터] --- */}
                <div className="flex flex-col items-center mb-6">
                  <div className="inline-block bg-white border-2 border-black px-3 py-1 rounded-full text-[10px] md:text-xs font-black mb-3 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    나의 페스티벌 캐릭터는?
                  </div>
                  
                  {/* 폰트 크기 반응형 적용 (모바일 3xl, PC 4xl) */}
                  <h1 className="text-3xl md:text-4xl font-black mb-6 leading-none italic tracking-tighter break-keep">
                    {CHARACTER_DATA[resultType].title}
                  </h1>

                  {/* 캐릭터 이미지 영역 */}
                  <div className="flex-1 min-h-0 relative flex items-center justify-center my-1 overflow-hidden rounded-xl">
                    <motion.img 
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      // [핵심 변경 2] scale: 1.2 -> 영역 안에서 내용물만 20% 확대
                      animate={{ scale: 1.1, opacity: 1, y: 0 }} 
                      transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
                      src={CHARACTER_DATA[resultType].characterImageUrl} 
                      alt={resultType} 
                      // object-contain: 비율 유지
                      className="max-h-full w-auto object-contain drop-shadow-2xl" 
                    />
                  </div>
                </div>

                {/* --- [본문: 설명 & 이유] (간격 gap-4로 통일) --- */}
                <div className="flex flex-col gap-4 mb-8">
                  
                  {/* 설명 박스 */}
                  <div className="bg-[#FFF5F5] border-4 border-black rounded-2xl p-5 text-left shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-gray-900 font-black leading-relaxed whitespace-pre-line text-base md:text-lg italic tracking-tight">
                      "{CHARACTER_DATA[resultType].description}"
                    </p>
                  </div>

                  {/* Why Wavy 박스 */}
                  <div className="bg-indigo-50 border-4 border-indigo-600 rounded-2xl p-5 mt-2 text-left relative">
                    <div className="absolute -top-3 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black italic shadow-sm">
                      WHY WAVY?
                    </div>
                    <ul className="space-y-2 pt-1">
                      {CHARACTER_DATA[resultType].whyWavy.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span className="text-indigo-900 font-bold text-xs md:text-sm leading-snug break-keep">
                            {reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* --- [하단 버튼 그룹] --- */}
                <div className="space-y-3 mt-auto"> {/* mt-auto로 내용이 짧아도 버튼을 하단으로 밀어줌 */}
                  <Link href="/" className="block"> {/* Next/Link 사용 권장, 여기선 a태그 대신 div로 감쌈 */}
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-black text-white py-4 rounded-2xl font-black text-base md:text-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      Wavy로 200% 즐기기 <ChevronRight size={20} strokeWidth={4} />
                    </motion.button>
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white text-black py-3 rounded-2xl font-black text-sm border-4 border-black flex items-center justify-center gap-2 hover:bg-gray-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 transition-all active:scale-95">
                      <Share2 size={18} strokeWidth={3} /> 공유하기
                    </button>
                    <button 
                      onClick={startQuiz}
                      className="bg-white text-black py-3 rounded-2xl font-black text-sm border-4 border-black flex items-center justify-center gap-2 hover:bg-gray-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 transition-all active:scale-95"
                    >
                      <RefreshCcw size={18} strokeWidth={3} /> 다시하기
                    </button>
                  </div>
                </div>

              </StickerCard>

              {/* 푸터 로고 */}
              <div className="flex justify-center items-center gap-2 py-6 opacity-60">
                <Sparkles className="text-yellow-500 w-3 h-3" />
                <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Powered by Wavy Core</p>
                <Sparkles className="text-yellow-500 w-3 h-3" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}