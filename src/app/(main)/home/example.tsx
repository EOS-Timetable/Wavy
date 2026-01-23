'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Ticket, 
  ShoppingBag, 
  MapPin, 
  Instagram, 
  Calendar, 
  Star, 
  ChevronRight, 
  MessageSquare,
  PlayCircle,
  Clock,
  ExternalLink,
  Music,
  Send,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';

// --- GEMINI API CONFIG ---
const apiKey = "";
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

// --- TYPES ---
interface NewsItem {
  id: string;
  tag: string;
  title: string;
  date: string;
  imageUrl?: string;
  isNew?: boolean;
}

interface PastRecap {
  year: string;
  items: {
    type: 'Lineup' | 'MD' | 'Review' | 'Recap';
    title: string;
    source?: string;
    link?: string;
  }[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- MOCK DATA ---
const CURRENT_NEWS: NewsItem[] = [
  { id: '1', tag: '라인업', title: '2차 라인업 공개: 실리카겔, 잔나비 외 12팀', date: '2시간 전', isNew: true },
  { id: '2', tag: '티켓', title: '일반 예매 오픈 가이드 (티켓링크/인터파크)', date: '1일 전' },
  { id: '3', tag: 'MD', title: '공식 굿즈 리스트 & 현장 수령 예약 안내', date: '3일 전' },
  { id: '4', tag: '이벤트', title: '친환경 캠페인 참여하고 한정판 와펜 받기', date: '4일 전' },
  { id: '5', tag: '현장안내', title: '스테이지 맵 & 셔틀버스 시간표 최종본', date: '5일 전' },
];

const PAST_RECAPS: PastRecap[] = [
  {
    year: '2023',
    items: [
      { type: 'Recap', title: 'Official After-Movie: One Summer Night', link: '#' },
      { type: 'Review', title: '폭우 속의 펜타포트, 그래도 행복했다', source: 'Instagram' },
      { type: 'Lineup', title: 'The Strokes, 엘르가든 포함 60팀', link: '#' },
      { type: 'Review', title: '초보자를 위한 페스티벌 생존 전략 칼럼', source: 'Magazine W' },
    ]
  }
];

// --- API HELPER WITH RETRY ---
const fetchGemini = async (prompt: string, history: ChatMessage[]) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  const systemInstruction = `당신은 'Wavy' 페스티벌 앱의 스마트 AI 컨시어지입니다. 
  사용자는 'PENTAPORT 2026' 페스티벌 참가를 앞두고 있습니다. 
  현재 라인업: 실리카겔, 잔나비, 250, 이디오테잎 등이 확정되었습니다.
  친절하고 활기찬 어조로 답변하세요. 축제 꿀팁, 준비물, 라인업 추천 등을 제공하세요. 
  한국어로 답변하세요.`;

  const contents = [
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: prompt }] }
  ];

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const fetchWithRetry = async (retries = 5, delay = 1000): Promise<any> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  return fetchWithRetry();
};

// --- COMPONENTS ---

const Header = () => (
  <header className="flex justify-between items-center px-6 py-4 bg-white border-b-4 border-black sticky top-0 z-50">
    <div className="font-brand font-black text-2xl italic tracking-tighter">WAVY.</div>
    <div className="flex gap-4">
      <div className="relative">
        <Bell size={24} />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
      </div>
      <div className="w-8 h-8 bg-black rounded-full border-2 border-black overflow-hidden">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="profile" />
      </div>
    </div>
  </header>
);

const HeroDDay = ({ festivalName, targetDate }: { festivalName: string, targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number }>({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000 * 60);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section className="bg-indigo-600 p-6 text-white border-b-4 border-black relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-20 transform rotate-12 translate-x-10 -translate-y-5">
        <Music size={200} strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-yellow-400 text-black font-brand font-black text-[10px] px-2 py-0.5 rounded-full uppercase italic tracking-wider">Next Wave</span>
        </div>
        <h2 className="text-4xl font-brand font-black italic mb-6 leading-none tracking-tighter">
          {festivalName}
        </h2>
        
        <div className="flex items-end gap-3">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-7xl font-brand font-black italic leading-none"
          >
            D-{timeLeft.days}
          </motion.div>
          <div className="flex flex-col font-brand font-bold text-sm opacity-80 pb-1">
            <span>{timeLeft.hours}H {timeLeft.mins}M</span>
            <span>UNTIL STAGE OPENS</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const SectionTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-6 px-6 pt-8">
    <h3 className="text-3xl font-brand font-black italic tracking-tighter leading-none mb-1 uppercase">{title}</h3>
    <p className="text-gray-400 font-brand font-bold text-[11px] tracking-widest uppercase">{subtitle}</p>
  </div>
);

const NewsCard = ({ item }: { item: NewsItem }) => (
  <motion.div 
    whileTap={{ scale: 0.98 }}
    className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 mb-4 flex gap-4 items-center group cursor-pointer"
  >
    <div className="w-12 h-12 bg-indigo-50 border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
      {item.tag === '라인업' && <Music size={24} />}
      {item.tag === '티켓' && <Ticket size={24} />}
      {item.tag === 'MD' && <ShoppingBag size={24} />}
      {item.tag === '현장안내' && <MapPin size={24} />}
      {!['라인업', '티켓', 'MD', '현장안내'].includes(item.tag) && <Clock size={24} />}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-brand font-black text-indigo-600 uppercase tracking-wider">{item.tag}</span>
        {item.isNew && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
      </div>
      <h4 className="font-body font-bold text-[15px] leading-tight text-gray-900 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
    </div>
    <ChevronRight size={20} className="text-gray-300" />
  </motion.div>
);

const RecapCard = ({ item }: { item: any }) => (
  <div className="bg-white border-2 border-black rounded-xl p-3 flex flex-col justify-between h-36 min-w-[140px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
    <div>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[9px] font-brand font-black text-gray-400 uppercase tracking-tighter border border-gray-200 px-1.5 py-0.5 rounded">
          {item.type}
        </span>
        {item.source === 'Instagram' && <Instagram size={14} className="text-pink-600" />}
      </div>
      <h5 className="font-body font-bold text-xs leading-tight line-clamp-3">{item.title}</h5>
    </div>
    <button className="text-[10px] font-brand font-black flex items-center gap-1 group">
      VIEW <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const pentaportDate = new Date('2026-08-02T12:00:00'); 
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    try {
      const result = await fetchGemini(userMsg, chatMessages);
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다.";
      setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', text: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans pb-24 selection:bg-indigo-100">
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        @font-face {
          font-family: 'GmarketSans';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
          font-weight: 700;
        }
        @font-face {
          font-family: 'GmarketSans';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
          font-weight: 500;
        }
        body { font-family: 'Pretendard', sans-serif; -webkit-font-smoothing: antialiased; }
        .font-brand { font-family: 'GmarketSans', sans-serif; letter-spacing: -0.04em; }
        .font-body { font-family: 'Pretendard', sans-serif; letter-spacing: -0.02em; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Header />

      <HeroDDay festivalName="PENTAPORT 2026" targetDate={pentaportDate} />

      {/* AI 컨시어지 퀵 액세스 */}
      <div className="px-6 py-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsChatOpen(true)}
          className="bg-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-6 flex items-center justify-between cursor-pointer overflow-hidden relative"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-black" />
              <span className="font-brand font-black text-xs uppercase tracking-wider">Wavy Assistant</span>
            </div>
            <h3 className="text-xl font-brand font-black italic tracking-tighter">✨ 무엇이든 물어보세요!</h3>
            <p className="text-[11px] font-body font-bold text-black/60 mt-1">라인업 추천부터 준비물까지 AI가 도와드려요</p>
          </div>
          <div className="bg-black text-white p-3 rounded-full relative z-10">
            <MessageSquare size={24} />
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Sparkles size={120} />
          </div>
        </motion.div>
      </div>

      {/* 실시간 숏컷 가이드 */}
      <div className="flex gap-4 px-6 py-6 overflow-x-auto no-scrollbar">
        {['라인업', 'MD', '티켓', '지도', '커뮤니티'].map((tab) => (
          <button key={tab} className="flex-shrink-0 bg-white border-2 border-black px-5 py-2.5 rounded-full font-brand font-bold text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all hover:bg-indigo-50">
            {tab}
          </button>
        ))}
      </div>

      {/* 올해의 소식 섹션 */}
      <SectionTitle title="This Year" subtitle="Real-time Feed & Updates" />
      <div className="px-6">
        {CURRENT_NEWS.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
        <button className="w-full py-5 bg-gray-100 border-4 border-dashed border-gray-300 rounded-2xl font-brand font-bold text-xs text-gray-400 hover:bg-gray-200 transition-colors uppercase tracking-[0.2em]">
          Load More Updates
        </button>
      </div>

      {/* 이전 소식 / 히스토리 섹션 */}
      <div className="bg-black text-white mt-12 py-12">
        <div className="px-6 mb-8">
          <h3 className="text-4xl font-brand font-black italic tracking-tighter leading-none mb-1 text-yellow-400 uppercase">Legacy</h3>
          <p className="text-gray-500 font-brand font-bold text-[11px] tracking-widest uppercase opacity-60">Archive of our moments</p>
        </div>

        {PAST_RECAPS.map((recap) => (
          <div key={recap.year} className="mb-10">
            <div className="flex items-center gap-4 px-6 mb-5">
              <span className="text-2xl font-brand font-black italic">{recap.year}</span>
              <div className="flex-1 h-[2px] bg-gray-800"></div>
            </div>
            
            <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar text-black">
              {recap.items.map((item, idx) => (
                <RecapCard key={idx} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI CHAT MODAL */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-white border-t-8 border-x-8 border-black rounded-t-[40px] h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Chat Header */}
              <div className="p-6 border-b-4 border-black flex justify-between items-center bg-yellow-400">
                <div className="flex items-center gap-3">
                  <div className="bg-black text-white p-2 rounded-xl">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="font-brand font-black italic text-lg leading-none">WAVY AI BOT</h4>
                    <p className="text-[10px] font-brand font-bold text-black/60 uppercase tracking-widest mt-1">Concierge Service</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="bg-black text-white p-2 rounded-full active:scale-90 transition-transform">
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FFFDF5]">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-3xl border-2 border-black flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={32} className="text-indigo-600" />
                    </div>
                    <p className="font-body font-bold text-gray-400 text-sm italic">"이번 펜타포트에서 꼭 봐야할 가수가 누구야?"<br/>라고 물어보세요!</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl border-2 border-black font-body font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-black'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Loader2 size={20} className="animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-white border-t-4 border-black">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 bg-gray-100 border-2 border-black rounded-xl px-4 py-3 font-body font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isTyping}
                    className="bg-black text-white px-5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 하단 탭 바 */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t-4 border-black px-8 py-5 flex justify-between items-center z-50">
        <button className="text-indigo-600"><Calendar size={26} strokeWidth={3} /></button>
        <button className="text-gray-300 hover:text-indigo-400 transition-colors"><Star size={26} strokeWidth={3} /></button>
        <button className="text-gray-300 hover:text-indigo-400 transition-colors"><MessageSquare size={26} strokeWidth={3} /></button>
        <button className="text-gray-300 hover:text-indigo-400 transition-colors"><ShoppingBag size={26} strokeWidth={3} /></button>
      </nav>
    </div>
  );
}