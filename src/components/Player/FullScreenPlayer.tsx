'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../lib/store';
import { setIsPlaying, togglePlayer, setTrack, setCurrentTime } from '../../lib/features/music/musicSlice';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, ChevronDown, Check, Download, Loader2 } from 'lucide-react';
import { getColor } from 'colorthief';
import { offlineDB } from '../../lib/utils/offline-db';

export function FullScreenPlayer() {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, isPlayerOpen, currentTime, duration, queue } = useSelector(
    (state: RootState) => state.music
  );
  
  const [dominantColor, setDominantColor] = useState('rgb(20, 20, 20)');
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  
  const [isSliding, setIsSliding] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentTrack) {
      offlineDB.getSong(currentTrack.id).then(song => {
        setIsDownloaded(!!song);
      });
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!isSliding) setSliderValue(currentTime);
  }, [currentTime, isSliding]);

  useEffect(() => {
    if (!currentTrack?.image) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = currentTrack.image;
    img.onload = () => {
      try {
        const color = getColor(img);
        setDominantColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
      } catch (e) {
        console.warn('Could not extract color. Using default.');
        setDominantColor('rgb(20, 20, 20)');
      }
    };
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack) return;
    setLyrics(null);
    let isMounted = true;

    async function fetchLyrics() {
      try {
        const res = await fetch(`https://saavn.sumit.co/api/lyrics?id=${currentTrack?.id}`);
        if (!res.ok) {
           if (isMounted) setLyrics(null);
           return;
        }
        const data = await res.json();
        if (data.success && data.data && data.data.lyrics && isMounted) {
          const lrcText = data.data.lyrics;
          const parsed = parseLrc(lrcText);
          setLyrics(parsed);
        } else {
           if (isMounted) setLyrics(null);
        }
      } catch (error) {
        console.warn('Lyrics not available or failed to fetch', error);
        if (isMounted) setLyrics(null);
      }
    }
    fetchLyrics();

    return () => { isMounted = false; };
  }, [currentTrack]);

  const parseLrc = (lrc: string) => {
    const actualLines = lrc.replace(/<br>/g, '\n').split('\n');
    const hasTimestamps = /\[\d{2}:\d{2}\.\d{2,3}\]/.test(lrc);
    if (!hasTimestamps) {
       return actualLines.map(line => ({ time: 0, text: line }));
    }

    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
    const parsed = actualLines.map(line => {
      const match = regex.exec(line);
      if (match) {
        const min = parseInt(match[1]);
        const sec = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const time = min * 60 + sec + ms / 1000;
        return { time, text: match[4].trim() };
      }
      return null;
    }).filter(Boolean) as {time: number, text: string}[];

    return parsed;
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderValue(val);
  };
  
  const handleSeekCommit = () => {
    setIsSliding(false);
    dispatch(setCurrentTime(sliderValue)); 
    window.dispatchEvent(new CustomEvent('SEEK_AUDIO', { detail: sliderValue }));
  };

  const goNext = () => {
    if (!currentTrack) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    if (idx !== -1 && idx < queue.length - 1) {
      dispatch(setTrack(queue[idx + 1]));
    }
  };

  const goPrev = () => {
    if (!currentTrack) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    if (idx > 0) {
      dispatch(setTrack(queue[idx - 1]));
    }
  };

  const toggleDownload = async () => {
    if (!currentTrack || isDownloading) return;
    
    if (isDownloaded) {
      await offlineDB.deleteSong(currentTrack.id);
      setIsDownloaded(false);
      return;
    }

    try {
      setIsDownloading(true);
      
      // Fetch audio and image as blobs
      const [audioRes, imgRes] = await Promise.all([
        fetch(currentTrack.url),
        fetch(currentTrack.image)
      ]);

      if (!audioRes.ok || !imgRes.ok) throw new Error('Download failed');

      const [audioBlob, imageBlob] = await Promise.all([
        audioRes.blob(),
        imgRes.blob()
      ]);

      await offlineDB.saveSong({
        id: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        audioBlob,
        imageBlob,
        duration,
      });

      setIsDownloaded(true);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download for offline mode. Check your connection.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Auto-scroll logic for lyrics
  useEffect(() => {
    if (!lyricsContainerRef.current || !lyrics) return;
    const activeIndex = lyrics.findIndex((line, i) => {
      const nextTime = lyrics[i + 1]?.time || Infinity;
      return currentTime >= line.time && currentTime < nextTime;
    });

    if (activeIndex !== -1) {
      const activeEl = lyricsContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, lyrics]);

  return (
    <AnimatePresence>
      {isPlayerOpen && currentTrack && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.y > 100 || velocity.y > 500) {
              dispatch(togglePlayer());
            }
          }}
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-hidden"
        >
          {/* Shadow-on-Glow Background */}
          <div 
            className="absolute inset-x-0 top-0 h-2/3 -z-10 transition-colors duration-1000 ease-in-out"
            style={{ 
              backgroundColor: dominantColor,
              filter: 'blur(100px)',
              opacity: 0.6
            }}
          />

          {/* Top Bar */}
          <div className="flex justify-between items-center px-6 py-4">
            <button 
              onClick={() => dispatch(togglePlayer())}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronDown size={28} />
            </button>
            <span className="text-xs uppercase font-bold tracking-widest text-white/70">
              Now Playing
            </span>
            <div className="w-8" />
          </div>

          {/* Album Art */}
          <div className="flex-1 px-8 pt-4 flex items-center justify-center max-h-[45vh]">
            <motion.div 
              layoutId={`album-art-${currentTrack.id}`}
              className="w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <img 
                src={currentTrack.image} 
                alt="Album Art" 
                className="w-full h-full object-cover" 
              />
            </motion.div>
          </div>

          {/* Track Info */}
          <div className="px-8 mt-6 text-center">
            <h2 className="text-2xl font-bold truncate" dangerouslySetInnerHTML={{ __html: currentTrack.title }} />
            <p className="text-white/60 text-lg mt-1 truncate" dangerouslySetInnerHTML={{ __html: currentTrack.artist }} />
          </div>

          {/* Custom Slider / Seek Bar */}
          <div className="px-8 mt-8">
            <div className="relative w-full h-1.5 bg-white/20 rounded-full flex items-center">
              <div 
                className="absolute left-0 h-full bg-white rounded-full transition-all"
                style={{ width: `${duration > 0 ? (sliderValue / duration) * 100 : 0}%`, transitionDuration: isSliding ? '0s' : '0.2s' }}
              />
              <input 
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={sliderValue}
                onMouseDown={() => setIsSliding(true)}
                onTouchStart={() => setIsSliding(true)}
                onChange={handleSeek}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-white/50 mt-2 font-mono">
              <span>{formatTime(sliderValue)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="px-6 mt-6 flex items-center justify-between">
            <button 
              onClick={toggleDownload}
              disabled={isDownloading}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 size={20} className="text-white/70 animate-spin" />
              ) : isDownloaded ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <Download size={20} className="text-white/70" />
              )}
            </button>
            
            <div className="flex items-center gap-6">
               <button onClick={goPrev} className="p-3 hover:bg-white/10 rounded-full text-white cursor-pointer"><SkipBack size={32} fill="currentColor" /></button>
               <button onClick={() => dispatch(setIsPlaying(!isPlaying))} className="p-5 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-xl cursor-pointer">
                 {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
               </button>
               <button onClick={goNext} className="p-3 hover:bg-white/10 rounded-full text-white cursor-pointer"><SkipForward size={32} fill="currentColor" /></button>
            </div>

            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors cursor-pointer">
              <Repeat size={20} className="text-white/70" />
            </button>
          </div>

          {/* Synced Lyrics Section */}
          <div ref={lyricsContainerRef} className="flex-1 mt-8 overflow-y-auto px-8 space-y-4 pb-[env(safe-area-inset-bottom)] fade-mask relative no-scrollbar">
             <div className="h-10" /> {/* Top Padding */}
            {lyrics ? lyrics.map((line, i) => {
              const nextTime = lyrics[i + 1]?.time || Infinity;
              const isActive = currentTime >= line.time && currentTime < nextTime;
              return (
                <p 
                  key={i} 
                  className={`text-2xl font-bold transition-all duration-300 text-center ${isActive ? 'text-white opacity-100 scale-105 shadow-glow' : 'text-white/30 scale-100'}`} 
                  dangerouslySetInnerHTML={{ __html: line.text || '&nbsp;' }} 
                />
              );
            }) : (
              <p className="text-white/30 text-center font-bold text-xl">Lyrics not available</p>
            )}
             <div className="h-32" /> {/* Bottom Padding */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
