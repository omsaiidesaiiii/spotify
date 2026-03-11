'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTrack, setIsPlaying, setQueue, Track } from '../../../lib/features/music/musicSlice';
import { Search as SearchIcon, Play } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();

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

  return (
    <div className="p-4 md:p-8 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-white">Search</h1>
      
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="text-zinc-400" size={20} />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?" 
          className="w-full glass rounded-full pl-12 pr-6 py-4 outline-none text-white focus:ring-2 focus:ring-white/20 transition-all font-medium placeholder:text-zinc-500"
        />
      </div>

      {loading && (
        <div className="text-zinc-400 text-center py-10 animate-pulse">Searching...</div>
      )}

      <div className="flex flex-col gap-3 pb-24">
        {results.map((song, i) => (
          <div 
            key={song.id} 
            onClick={() => handlePlaySong(song, i)}
            className="glass rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group"
          >
            <div className="w-14 h-14 bg-zinc-800 rounded-lg overflow-hidden shrink-0 relative">
              {song.image && (
                  <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play fill="white" className="text-white" size={20} />
              </div>
            </div>
            
            <div className="flex flex-col flex-grow overflow-hidden">
              <span className="text-white font-bold truncate text-base" dangerouslySetInnerHTML={{ __html: song.title }} />
              <span className="text-zinc-400 text-sm truncate" dangerouslySetInnerHTML={{ __html: song.artist }} />
            </div>
          </div>
        ))}
        {!loading && query && results.length === 0 && (
          <div className="text-zinc-500 text-center py-10">No results found for "{query}"</div>
        )}
      </div>
    </div>
  );
}
