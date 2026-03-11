'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTrack, setIsPlaying, setQueue } from '../../../lib/features/music/musicSlice';
import { formatCollection, formatTrack } from '../../../lib/utils/api-utils';

export default function LibraryPage() {
  const [picks, setPicks] = useState<any[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const res = await fetch('/api/home');
        const json = await res.json();
        if (json.success) {
          const combined = [...(json.data.charts || []), ...(json.data.playlists || [])].slice(0, 10);
          setPicks(combined.map(formatCollection));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPicks();
  }, []);

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

  return (
    <div className="p-4 md:p-8 pb-32">
      <h1 className="text-3xl font-black mb-8 italic">Your Library</h1>
      <div className="space-y-4">
        {picks.length > 0 ? picks.map((item, i) => (
          <div key={item.id} onClick={() => playCollection(item.id)} className="glass rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group">
            <div className="w-16 h-16 bg-zinc-800 rounded-xl overflow-hidden shrink-0 shadow-lg">
              <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex flex-col flex-grow overflow-hidden">
              <span className="text-white font-bold truncate text-base" dangerouslySetInnerHTML={{ __html: item.title }} />
              <span className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">{item.type}</span>
            </div>
          </div>
        )) : (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 glass rounded-2xl animate-pulse" />
          ))
        )}
      </div>
    </div>
  );
}
