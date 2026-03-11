'use client';

import { useState, useEffect, use } from 'react';
import { useDispatch } from 'react-redux';
import { setTrack, setIsPlaying, setQueue, Track } from '../../../lib/features/music/musicSlice';
import { formatTrack } from '../../../lib/utils/api-utils';
import { Play, ArrowLeft, Clock, Music } from 'lucide-react';
import { Link } from 'next-view-transitions';

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await fetch(`/api/playlists?id=${id}`);
        const json = await res.json();
        if (json.success) {
          setPlaylist(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  const handlePlayAll = () => {
    if (!playlist?.songs) return;
    const queue = playlist.songs.map(formatTrack);
    dispatch(setQueue(queue));
    dispatch(setTrack(queue[0]));
    dispatch(setIsPlaying(true));
  };

  const handlePlaySong = (song: any, index: number) => {
    const queue = playlist.songs.map(formatTrack);
    dispatch(setQueue(queue));
    dispatch(setTrack(queue[index]));
    dispatch(setIsPlaying(true));
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-8">
        <div className="flex gap-8 items-end">
          <div className="w-64 h-64 glass rounded-3xl" />
          <div className="space-y-4 flex-1">
             <div className="h-4 w-24 glass rounded" />
             <div className="h-12 w-3/4 glass rounded" />
             <div className="h-6 w-1/2 glass rounded" />
          </div>
        </div>
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 glass rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!playlist) return <div className="p-20 text-center text-zinc-500">Playlist not found</div>;

  const hqImage = playlist.image.find((img: any) => img.quality === '500x500')?.url || playlist.image[playlist.image.length - 1]?.url;

  return (
    <div className="min-h-full pb-32">
       {/* Hero Section */}
       <div className="relative p-8 pt-12 flex flex-col md:flex-row gap-8 items-center md:items-end">
          <Link href="/home" className="absolute top-8 left-8 p-3 glass rounded-full hover:bg-white/10 transition-colors z-10">
            <ArrowLeft size={24} />
          </Link>
          
          <div className="w-64 h-64 shrink-0 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group relative">
             <img src={hqImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
             <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
             <span className="text-xs uppercase tracking-[0.2em] font-black text-white/50">{playlist.type}</span>
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter" dangerouslySetInnerHTML={{ __html: playlist.name }} />
             <p className="text-white/40 font-medium" dangerouslySetInnerHTML={{ __html: playlist.description || 'Curated for you' }} />
             <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                <button 
                  onClick={handlePlayAll}
                  className="bg-white text-black px-8 py-4 rounded-full font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  <Play fill="black" size={20} /> PLAY ALL
                </button>
                <span className="text-sm font-bold text-white/30 tracking-tight">
                  {playlist.songCount || playlist.songs?.length} SONGS
                </span>
             </div>
          </div>
       </div>

       {/* Song List */}
       <div className="px-4 md:px-8 mt-8">
          <div className="flex items-center text-white/20 px-4 py-2 text-xs uppercase tracking-widest font-black border-b border-white/5 mb-4">
             <span className="w-10">#</span>
             <span className="flex-1">Title</span>
             <span className="hidden md:block w-48">Album</span>
             <Clock size={16} />
          </div>

          <div className="space-y-1">
             {playlist.songs?.map((song: any, i: number) => (
                <div 
                  key={song.id} 
                  onClick={() => handlePlaySong(song, i)}
                  className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                   <div className="w-10 text-white/20 font-mono text-sm group-hover:text-white transition-colors">
                      {i + 1}
                   </div>
                   <div className="w-12 h-12 glass rounded-lg overflow-hidden shrink-0">
                      <img src={song.image?.[1]?.url || song.image?.[0]?.url} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <div className="text-white font-bold truncate group-hover:text-amber-400 transition-colors" dangerouslySetInnerHTML={{ __html: song.name || song.title }} />
                      <div className="text-white/40 text-sm truncate" dangerouslySetInnerHTML={{ __html: song.primaryArtists || song.artist }} />
                   </div>
                   <div className="hidden md:block w-48 text-white/40 text-sm truncate" dangerouslySetInnerHTML={{ __html: song.album?.name || '' }} />
                   <div className="text-white/20 text-xs font-mono">
                      {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
