'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTrack, setIsPlaying, setQueue } from '../../../lib/features/music/musicSlice';
import { formatTrack, formatCollection } from '../../../lib/utils/api-utils';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HomeData {
  trending: {
    songs: any[];
    albums: any[];
  };
  playlists: any[];
  charts: any[];
}

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch('/api/home');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handlePlaySong = (song: any, list: any[]) => {
    const track = formatTrack(song);
    const queue = list.map(formatTrack);
    dispatch(setQueue(queue));
    dispatch(setTrack(track));
    dispatch(setIsPlaying(true));
  };

  const playCollection = async (id: string) => {
    try {
      const res = await fetch(`/api/playlists?id=${id}`);
      const json = await res.json();
      if (json.success && json.data.songs) {
        const queue = json.data.songs.map(formatTrack);
        dispatch(setQueue(queue));
        dispatch(setTrack(queue[0]));
        dispatch(setIsPlaying(true));
      }
    } catch (err) {
      console.error('Failed to play collection:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-12 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-48 bg-white/10 rounded-lg" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="w-40 h-56 bg-white/5 rounded-2xl shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-32 space-y-10">
      <header>
        <h1 className="text-4xl font-black bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
          Explore
        </h1>
      </header>

      {/* Trending Songs */}
      {data?.trending.songs && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Trending Now <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {data.trending.songs.map((song: any) => {
              const track = formatTrack(song);
              return (
                <div 
                  key={song.id} 
                  onClick={() => handlePlaySong(song, data.trending.songs)}
                  className="w-40 shrink-0 group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden glass mb-3 transition-transform group-hover:scale-[1.02] active:scale-95">
                    <img src={track.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play fill="white" className="text-white" size={32} />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm truncate" dangerouslySetInnerHTML={{ __html: track.title }} />
                  <p className="text-xs text-white/50 truncate" dangerouslySetInnerHTML={{ __html: track.artist }} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Top Playlists */}
      {data?.playlists && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Recommended Playlists</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {data.playlists.map((playlist: any) => {
              const item = formatCollection(playlist);
              return (
                <div key={playlist.id} onClick={() => router.push(`/playlist/${playlist.id}`)} className="w-44 shrink-0 group cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden glass mb-3 relative overflow-hidden transition-all group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-sm truncate" dangerouslySetInnerHTML={{ __html: item.title }} />
                  <p className="text-xs text-white/40 line-clamp-2 mt-1" dangerouslySetInnerHTML={{ __html: item.subtitle }} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Charts */}
      {data?.charts && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Top Charts</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {data.charts.map((chart: any) => {
              const item = formatCollection(chart);
              return (
                <div key={chart.id} onClick={() => router.push(`/playlist/${chart.id}`)} className="w-36 shrink-0 group cursor-pointer">
                  <div className="aspect-square rounded-full overflow-hidden glass mb-3 border-4 border-transparent group-hover:border-white/10 transition-all">
                    <img src={item.image} alt="" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bold text-xs text-center truncate" dangerouslySetInnerHTML={{ __html: item.title }} />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
