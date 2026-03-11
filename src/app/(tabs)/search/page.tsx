'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTrack, setIsPlaying, setQueue, Track } from '../../../lib/features/music/musicSlice';
import { formatCollection, formatTrack } from '../../../lib/utils/api-utils';
import { Search as SearchIcon, Play } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
  
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/home');
        const json = await res.json();
        if (json.success) {
          const items = [
            ...(json.data.charts || []).slice(0, 4),
            ...(json.data.playlists || []).slice(0, 6)
          ];
          setCategories(items.map(formatCollection));
        }
      } catch (e) {
        console.error('Failed to fetch categories:', e);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handlePlaySong = (track: Track, index: number) => {
    dispatch(setQueue(results));
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

  return (
    <div className="p-4 md:p-8 pb-32 min-h-full">
      <h1 className="text-3xl font-black mb-6 text-white italic">Search</h1>
      
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <SearchIcon className="text-white/30 group-focus-within:text-white transition-colors" size={20} />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artists, songs, or podcasts" 
          className="w-full glass rounded-2xl pl-14 pr-6 py-5 outline-none text-white focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/20"
        />
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 glass rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!query && !loading && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Browse all</h2>
          <div className="grid grid-cols-2 gap-4">
            {loadingCats ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 glass rounded-2xl animate-pulse" />
              ))
            ) : (
              categories.map((cat, i) => (
                <div 
                  key={cat.id || i} 
                  onClick={() => playCollection(cat.id)}
                  className="h-32 glass rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:bg-white/[0.08] transition-all active:scale-95"
                >
                  <img 
                    src={cat.image} 
                    className="absolute -right-4 -top-4 w-28 h-28 rotate-[25deg] opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500" 
                    alt="" 
                  />
                  <span className="font-black text-xl relative z-10 leading-tight tracking-tighter" dangerouslySetInnerHTML={{ __html: cat.title }} />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/30 relative z-10">{cat.type}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {!loading && query && results.length > 0 && (
        <div className="flex flex-col gap-3">
          {results.map((song, i) => (
            <div 
              key={song.id} 
              onClick={() => handlePlaySong(song, i)}
              className="glass rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group"
            >
              <div className="w-14 h-14 bg-zinc-800 rounded-xl overflow-hidden shrink-0 relative shadow-lg">
                <img src={song.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play fill="white" className="text-white" size={20} />
                </div>
              </div>
              
              <div className="flex flex-col flex-grow overflow-hidden">
                <span className="text-white font-bold truncate text-base" dangerouslySetInnerHTML={{ __html: song.title }} />
                <span className="text-white/40 text-sm truncate" dangerouslySetInnerHTML={{ __html: song.artist }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-zinc-500 text-center py-20 font-medium italic">
          No matches found for <span className="text-white">"{query}"</span>
        </div>
      )}
    </div>
  );
}
