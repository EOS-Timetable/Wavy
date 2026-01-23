import React from 'react';
import { 
  Bot, 
  UserCheck, 
  Database, 
  Calendar, 
  MapPin,
  Mic2, 
  Clock, 
  Bell, 
  Globe, 
  Youtube, 
  ArrowRight, 
  CheckCircle2, 
  Layers,
  FileJson,
  Flag,
  Sparkles,
  Ticket,
  Video,
  Music,
  Megaphone,
  LucideIcon
} from 'lucide-react';

// --- Types ---

interface PipelineCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
  colorTheme?: 'blue' | 'green' | 'indigo' | 'slate';
  isDualEffect?: boolean;
}

interface EventStepProps {
  step: string;
  title: string;
  icon: LucideIcon;
}

interface CrawlerStepProps {
  step: string;
  title: string;
  desc: string;
  category: string;
}

interface AdminStepProps {
  step: string;
  title: string;
  desc: string;
  tables: string[];
  isDualEffect?: boolean;
}

// --- 1. Reusable Card Component ---
const PipelineCard: React.FC<PipelineCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  tags = [], 
  colorTheme = 'blue', 
  isDualEffect = false 
}) => {
  const themeStyles = {
    blue: { border: 'border-blue-100', bg: 'bg-white', icon: 'text-blue-500', badge: 'bg-blue-50 text-blue-700' },
    green: { border: 'border-green-100', bg: 'bg-white', icon: 'text-green-600', badge: 'bg-green-50 text-green-700' },
    indigo: { border: 'border-indigo-100', bg: 'bg-white', icon: 'text-indigo-500', badge: 'bg-indigo-50 text-indigo-700' },
    slate: { border: 'border-slate-200', bg: 'bg-slate-50', icon: 'text-slate-500', badge: 'bg-slate-100 text-slate-700' },
  };

  const style = themeStyles[colorTheme] || themeStyles.blue;

  return (
    <div className={`relative p-5 rounded-2xl shadow-sm border ${style.border} ${style.bg} hover:shadow-md transition-all group w-full`}>
      {/* Icon Badge (Fixed Position) */}
      <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-xl ${style.bg} border ${style.border} shadow-sm flex items-center justify-center ${style.icon} z-10`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="pr-2">
        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          {title}
        </h4>
        <p className="text-sm text-gray-500 leading-relaxed mb-3">
          {description}
        </p>

        {/* Tags & Metadata */}
        <div className="flex flex-wrap gap-2 items-center">
          {isDualEffect && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded border border-purple-100 uppercase tracking-tight">
              <Layers size={10} /> Dual Effect
            </span>
          )}
          {tags.map((tag, idx) => (
            <span key={idx} className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border uppercase tracking-tight ${style.badge} border-${colorTheme}-100`}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Connector Dot for Line */}
      <div className={`absolute top-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${style.icon.replace('text-', 'bg-')} 
        ${colorTheme === 'green' ? '-left-1.5' : '-right-1.5'} hidden md:block`} 
      />
    </div>
  );
};

// --- 2. Step Components (Event / Crawler / Admin) ---

const EventStep: React.FC<EventStepProps> = ({ step, title, icon: Icon }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center mb-8">
    <div /> {/* Left Empty */}
    <div className="relative flex flex-col items-center z-10">
      <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-lg mb-2">
        <Icon size={24} />
      </div>
      <div className="absolute top-16 w-max px-4 py-1 bg-slate-800 text-white text-xs font-bold rounded-full shadow-md mt-2">
        STEP {step}
      </div>
      <h3 className="absolute top-24 w-max text-sm font-bold text-slate-700 bg-white/80 backdrop-blur px-3 py-1 rounded-lg border">
        {title}
      </h3>
    </div>
    <div /> {/* Right Empty */}
  </div>
);

const CrawlerStep: React.FC<CrawlerStepProps> = ({ step, title, desc, category }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center mb-8 relative">
    {/* Background Line Connector (Visual Only) */}
    <div className="absolute left-1/2 top-1/2 w-8 h-0.5 bg-green-200 -translate-y-1/2" />
    
    <div /> {/* Left Empty */}
    <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm z-10 relative" /> {/* Center Dot */}
    <div className="flex items-center gap-4">
      <div className="text-xs font-bold text-green-500 font-mono w-8 text-right">STEP {step}</div>
      <PipelineCard 
        title={title}
        description={desc}
        icon={Bot}
        tags={[category]}
        colorTheme="green"
      />
    </div>
  </div>
);

const AdminStep: React.FC<AdminStepProps> = ({ step, title, desc, tables, isDualEffect }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center mb-8 relative">
    {/* Background Line Connector */}
    <div className="absolute right-1/2 top-1/2 w-8 h-0.5 bg-blue-200 -translate-y-1/2" />

    <div className="flex items-center gap-4">
      <PipelineCard 
        title={title}
        description={desc}
        icon={UserCheck}
        tags={tables}
        colorTheme="blue"
        isDualEffect={isDualEffect}
      />
      <div className="text-xs font-bold text-blue-500 font-mono w-8">STEP {step}</div>
    </div>
    <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm z-10 relative" /> {/* Center Dot */}
    <div /> {/* Right Empty */}
  </div>
);

// --- 3. Main Component ---

export default function WavyPipelineInfographic() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-extrabold mb-4 text-slate-900 tracking-tight">Wavy Pipeline Flow</h1>
          <p className="text-slate-500">
            Event → <span className="text-green-600 font-bold">Crawler</span> → <span className="text-blue-600 font-bold">Admin</span>
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Main Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 -translate-x-1/2" />

          {/* --- PHASE 1: PRE-FESTIVAL --- */}
          
          {/* Step 1: Event */}
          <EventStep step="1" title="페스티벌 개최 공지" icon={Megaphone} />
          
          {/* Step 2: Crawler */}
          <CrawlerStep 
            step="2" 
            title="기본 정보 수집" 
            desc="예매처/SNS에서 날짜, 장소, 포스터 수집. 이미지 OCR로 텍스트 추출 시도." 
            category="FESTIVAL_BASE" 
          />

          {/* Step 3: Admin */}
          <AdminStep 
            step="3" 
            title="기본 정보 승인" 
            desc="페스티벌 생성(INSERT) 또는 정보 업데이트. 데이터 정합성 확인." 
            tables={['festivals']} 
          />

          <div className="h-12" /> {/* Spacer */}

          {/* Step 4: Event */}
          <EventStep step="4" title="라인업 발표 (얼리버드/N차)" icon={Sparkles} />

          {/* Step 5: Crawler */}
          <CrawlerStep 
            step="5" 
            title="라인업 피드 수집" 
            desc="공식 피드 이미지/캡션 파싱. 아티스트 이름 텍스트 추출." 
            category="OFFICIAL_LINEUP" 
          />

          {/* Step 6: Admin */}
          <AdminStep 
            step="6" 
            title="라인업 매핑 (Dual Effect)" 
            desc="View용 라인업 카드 생성 + 아티스트 DB 연결/생성 동시 처리." 
            tables={['contents', 'lineups', 'artists']}
            isDualEffect={true}
          />

          <div className="h-12" /> {/* Spacer */}

          {/* Step 7: Event */}
          <EventStep step="7" title="타임테이블 공지" icon={Clock} />

          {/* Step 8: Crawler */}
          <CrawlerStep 
            step="8" 
            title="타임테이블 수집" 
            desc="이미지/텍스트에서 스테이지명, 공연 시간, 아티스트 정보 추출." 
            category="OFFICIAL_TIMETABLE" 
          />

          {/* Step 9: Admin */}
          <AdminStep 
            step="9" 
            title="시간표 매핑 (Dual Effect)" 
            desc="View용 타임테이블 카드 생성 + 실제 공연(Performance) 데이터 생성." 
            tables={['contents', 'stages', 'performances']}
            isDualEffect={true}
          />

          {/* --- PHASE 2: ON-GOING --- */}
          <div className="h-16 flex items-center justify-center relative z-10">
            <span className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full text-xs font-bold border">PHASE 2: 진행 중</span>
          </div>

          {/* Step 10: Event */}
          <EventStep step="10" title="각종 안내 (티켓, MD, 지도)" icon={MapPin} />

          {/* Step 11: Crawler */}
          <CrawlerStep 
            step="11" 
            title="공지사항 피드 수집" 
            desc="티켓, MD, 이벤트 등 키워드로 타입 자동 분류 시도." 
            category="OFFICIAL_NOTICE" 
          />

          {/* Step 12: Admin */}
          <AdminStep 
            step="12" 
            title="공지사항 등록" 
            desc="적절한 카테고리(TICKET, MD 등)로 분류하여 콘텐츠 카드 발행." 
            tables={['festival_contents']} 
          />

          <div className="h-12" />

          {/* Step 13: Event (Implicit Periodic) */}
          <EventStep step="13" title="후기 및 관련글 생성" icon={Globe} />

          {/* Step 14: Crawler */}
          <CrawlerStep 
            step="14" 
            title="관련글/후기 수집" 
            desc="해시태그 검색. 페스티벌 식별이 불명확해도 일단 수집." 
            category="EXTERNAL_CONTENT" 
          />

          {/* Step 15: Admin (Moved from previous logic to match flow) */}
          <AdminStep 
            step="15" 
            title="외부 콘텐츠 매핑" 
            desc="관리자가 직접 '이 글은 A페스티벌 관련글'이라고 수동 매핑 후 승인." 
            tables={['external_contents']} 
          />

          {/* --- PHASE 3: ARCHIVE --- */}
          <div className="h-16 flex items-center justify-center relative z-10">
            <span className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full text-xs font-bold border">PHASE 3: 종료 후</span>
          </div>

          {/* Step 15->16 (Re-numbering based on flow): Event */}
          <EventStep step="16" title="페스티벌 종료" icon={Flag} />

          {/* Step 16->17: Crawler */}
          <CrawlerStep 
            step="17" 
            title="아카이브 데이터 수집" 
            desc="유튜브 셋리스트, 직캠/풀영상 링크 수집 (Legacy 포함)." 
            category="ARCHIVE_DATA" 
          />

          {/* Step 17->18: Admin */}
          <AdminStep 
            step="18" 
            title="영상/셋리스트 등록" 
            desc="공연 영상 및 셋리스트 DB화. 아티스트/페스티벌 최종 매핑." 
            tables={['perf_videos', 'setlists']} 
          />

        </div>
      </div>
    </div>
  );
}