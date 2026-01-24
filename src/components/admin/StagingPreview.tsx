// src/components/admin/StagingPreview.tsx
import React from 'react';
import { 
  StagedFestivalBase, 
  StagedOfficialContent, 
  StagedArchiveData, 
  StagedArtistBase 
} from '@/types/staging';

// 서비스 컴포넌트 임포트
import FestivalHeader from '@/components/festival/FestivalHeader';
import ThisYearSection from '@/components/home/ThisYearSection';
import PerformanceVideosSection from '@/components/artist/PerformanceVideosSection';
import ArtistHeader from '@/components/artist/ArtistHeader';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';

interface StagingPreviewProps {
  category: string;
  rawData: any; // 위에서 정의한 타입들로 캐스팅하여 사용
}

export default function StagingPreview({ category, rawData }: StagingPreviewProps) {
  
  // 1. FESTIVAL_BASE: 페스티벌 상세 페이지 헤더 미리보기
  if (category === 'FESTIVAL_BASE') {
    const data = rawData as StagedFestivalBase;
    return (
      <div className="bg-[#161b29] p-4 rounded-lg border border-white/10">
        <p className="text-xs text-gray-500 mb-4 font-bold uppercase">Festival Page Preview</p>
        <FestivalHeader
          name={data.name}
          startDate={data.start_date}
          endDate={data.end_date}
          placeName={data.place_name}
          formatDate={(date) => date} // 간단한 mock 함수
          saveButton={
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Bookmark className="w-5 h-5" />
            </Button>
          }
        />
        {/* 포스터 이미지가 있다면 추가 표시 */}
        {data.poster_url && (
           <div className="mt-4 w-32 aspect-[3/4] relative bg-gray-800 rounded overflow-hidden">
             <img src={data.poster_url} alt="Poster" className="object-cover w-full h-full" />
           </div>
        )}
      </div>
    );
  }

  // 2. ARTIST_BASE: 아티스트 헤더 미리보기
  if (category === 'ARTIST_BASE') {
    const data = rawData as StagedArtistBase;
    return (
      <div className="bg-[#161b29] p-4 rounded-lg border border-white/10">
        <p className="text-xs text-gray-500 mb-4 font-bold uppercase">Artist Page Preview</p>
        <ArtistHeader artistName={data.name} backHref="#" />
        {data.image_url && (
            <div className="mt-4 w-32 h-32 rounded-full overflow-hidden bg-gray-800 mx-auto">
                <img src={data.image_url} alt={data.name} className="object-cover w-full h-full" />
            </div>
        )}
      </div>
    );
  }

  // 3. OFFICIAL_... & EXTERNAL_CONTENT: This Year 섹션 카드 미리보기
  if (
    ['OFFICIAL_LINEUP', 'OFFICIAL_TIMETABLE', 'OFFICIAL_NOTICE', 'EXTERNAL_CONTENT'].includes(category)
  ) {
    const data = rawData as StagedOfficialContent;
    
    // 카테고리 매핑 로직
    let displayCategory: any = '관련글';
    if (category === 'OFFICIAL_LINEUP') displayCategory = '라인업';
    if (category === 'OFFICIAL_TIMETABLE') displayCategory = '티켓'; // 혹은 타임테이블 전용 아이콘 매핑 필요
    if (category === 'OFFICIAL_NOTICE') displayCategory = '현장안내'; 
    if (data.content_type) displayCategory = data.content_type; // rawData에 명시되어 있다면 우선 사용

    // ThisYearSection은 배열을 받으므로 하나짜리 배열로 변환
    const mockContents = [{
      id: 'preview-id',
      category: displayCategory,
      title: data.title,
      date: data.date,
      linkUrl: data.link_url || '',
      imageUrl: data.image_url,
      isNew: true,
    }];

    return (
      <div className="bg-black/20 p-2 rounded-lg">
        <p className="text-xs text-gray-500 mb-2 font-bold uppercase ml-2">This Year Card Preview</p>
        {/* withPagePadding=false로 설정하여 미리보기 박스 안에 딱 맞게 */}
        <ThisYearSection 
          contents={mockContents} 
          withPagePadding={false} 
        />
        {/* OCR 확인용 원본 이미지가 있다면 별도로 표시 가능 */}
        {data.image_url && (
            <div className="mt-2 px-2">
                <p className="text-[10px] text-gray-400 mb-1">Source Image (for OCR Check)</p>
                <img src={data.image_url} alt="Source" className="w-full h-auto rounded border border-white/10 opacity-50 hover:opacity-100 transition-opacity" />
            </div>
        )}
      </div>
    );
  }

  // 4. ARCHIVE_DATA: Performance Video 미리보기
  if (category === 'ARCHIVE_DATA') {
    const data = rawData as StagedArchiveData;
    
    const mockVideos = [{
      id: 0,
      title: data.title,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url
    }];

    return (
      <div className="bg-[#161b29] p-4 rounded-lg border border-white/10">
        <p className="text-xs text-gray-500 mb-4 font-bold uppercase">Performance Video Preview</p>
        <PerformanceVideosSection videos={mockVideos} />
      </div>
    );
  }

  // 매칭되는 카테고리가 없을 때
  return (
    <div className="p-4 text-center text-gray-500 text-sm border border-dashed border-gray-600 rounded">
      미리보기를 지원하지 않는 카테고리입니다. ({category})
    </div>
  );
}