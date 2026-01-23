"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase";
import { getInterestedFestivals, getFollowedArtists } from "@/utils/dataFetcher";
import Link from "next/link";
import Image from "next/image";

const supabase = createClient();

interface Festival {
  id: string;
  name: string;
  posterUrl?: string;
}

interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function LibraryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"festival" | "artist">("festival");
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  // 저장한 페스티벌 가져오기
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function loadFestivals() {
      try {
        const data = await getInterestedFestivals(user!.id);
        setFestivals(data);
      } catch (error) {
        console.error("Error loading festivals:", error);
        setFestivals([]);
      }
    }

    loadFestivals();
  }, [user]);

  // 팔로우한 아티스트 가져오기
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function loadArtists() {
      try {
        const data = await getFollowedArtists(user!.id);
        setArtists(data);
      } catch (error) {
        console.error("Error loading artists:", error);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    }

    loadArtists();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-5 md:max-w-2xl md:mx-auto md:text-left">
          Library
        </h1>

        {/* 탭 네비게이션 */}
        <div className="max-w-2xl md:mx-auto mb-6">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("festival")}
              className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                activeTab === "festival"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              페스티벌
              {activeTab === "festival" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("artist")}
              className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                activeTab === "artist"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              아티스트
              {activeTab === "artist" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="max-w-2xl md:mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-4"></div>
                <p className="text-slate-400">Loading...</p>
              </div>
            </div>
          ) : activeTab === "festival" ? (
            // 페스티벌 탭
            festivals.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {festivals.map((festival) => (
                  <Link
                    key={festival.id}
                    href={`/festival/${festival.id}`}
                    className="group"
                  >
                    <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-slate-800 mb-2">
                      {festival.posterUrl ? (
                        <Image
                          src={festival.posterUrl}
                          alt={festival.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-center line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {festival.name}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p>저장한 페스티벌이 없습니다.</p>
              </div>
            )
          ) : (
            // 아티스트 탭
            artists.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="group"
                  >
                    <div className="aspect-square relative rounded-full overflow-hidden bg-slate-800 mb-2 mx-auto w-full max-w-[120px]">
                      {artist.imageUrl ? (
                        <Image
                          src={artist.imageUrl}
                          alt={artist.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-center line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {artist.name}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p>팔로우한 아티스트가 없습니다.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
