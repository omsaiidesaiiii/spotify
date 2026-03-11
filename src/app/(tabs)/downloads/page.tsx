'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTrack, setIsPlaying, setQueue, Track } from '../../../lib/features/music/musicSlice';
import { Download, Play, Trash2 } from 'lucide-react';
import { offlineDB, OfflineSong } from '../../../lib/utils/offline-db';

export default function DownloadsPage() {
  const [downloadedSongs, setDownloadedSongs] = useState<OfflineSong[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const dispatch = useDispatch();

  useEffect(() => {
    const loadSongs = async () => {
      const songs = await offlineDB.getAllSongs();
      setDownloadedSongs(songs);
      
      // Create object URLs for images
      const urls: Record<string, string> = {};
      songs.forEach(song => {
        urls[song.id] = URL.createObjectURL(song.imageBlob);
      });
      setImageUrls(urls);
    };

    loadSongs();

    return () => {
      // Cleanup object URLs to prevent memory leaks
      Object.values(imageUrls).forEach(URL.revokeObjectURL);
    };
  }, []);

  const handlePlaySong = (song: OfflineSong) => {
    // Convert OfflineSong back to Track for the reducer/engine
    const trackList: Track[] = downloadedSongs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      image: imageUrls[s.id] || '',
      url: '', // AudioEngine will fetch from DB using ID
    }));

    const currentTrack = trackList.find(t => t.id === song.id)!;
    
    dispatch(setQueue(trackList));
    dispatch(setTrack(currentTrack));
    dispatch(setIsPlaying(true));
  };

  const removeDownload = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await offlineDB.deleteSong(id);
    setDownloadedSongs(prev => prev.filter(s => s.id !== id));
    if (imageUrls[id]) {
      URL.revokeObjectURL(imageUrls[id]);
      const newUrls = { ...imageUrls };
      delete newUrls[id];
      setImageUrls(newUrls);
    }
  };

  return (
    <div className="p-4 md:p-8 pb-32 min-h-full">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic">Downloads</h1>
        <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">
          {downloadedSongs.length} Songs
        </div>
      </header>
      
      {downloadedSongs.length > 0 ? (
        <div className="flex flex-col gap-3">
          {downloadedSongs.map((song) => (
            <div 
              key={song.id} 
              onClick={() => handlePlaySong(song)}
              className="glass rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group"
            >
              <div className="w-14 h-14 bg-zinc-800 rounded-xl overflow-hidden shrink-0 relative shadow-lg">
                <img src={imageUrls[song.id]} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play fill="white" className="text-white" size={20} />
                </div>
              </div>
              
              <div className="flex flex-col flex-grow overflow-hidden">
                <span className="text-white font-bold truncate text-base" dangerouslySetInnerHTML={{ __html: song.title }} />
                <span className="text-white/40 text-sm truncate" dangerouslySetInnerHTML={{ __html: song.artist }} />
              </div>

              <button 
                onClick={(e) => removeDownload(song.id, e)}
                className="p-2 text-white/20 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
             <Download size={32} className="text-white/20" />
          </div>
          <h2 className="text-xl font-bold mb-2">No downloads yet</h2>
          <p className="text-white/40 text-sm max-w-[240px]">
            Songs you download for offline listening will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
