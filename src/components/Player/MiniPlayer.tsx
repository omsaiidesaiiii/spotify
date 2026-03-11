'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../lib/store';
import { setIsPlaying } from '../../lib/features/music/musicSlice';
import { Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export function MiniPlayer() {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state: RootState) => state.music);

  // Verification log to ensure it's not remounting abruptly on route changes
  useEffect(() => {
    if (currentTrack) {
      console.log('MiniPlayer active:', currentTrack.title, 'Playing:', isPlaying);
    }
  }, [currentTrack, isPlaying]);

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="glass fixed left-2 right-2 p-2 rounded-xl flex items-center justify-between z-40 shadow-2xl"
          style={{ bottom: 'calc(84px + env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 flex-shrink-0 bg-zinc-800 rounded-md overflow-hidden">
              {currentTrack.image ? (
                <img src={currentTrack.image} alt="Album Art" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-700" />
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-white truncate">{currentTrack.title}</span>
              <span className="text-xs text-zinc-400 truncate">{currentTrack.artist}</span>
            </div>
          </div>
          
          <div className="flex items-center pr-2">
            <button
              onClick={() => dispatch(setIsPlaying(!isPlaying))}
              className="p-2 text-white hover:text-zinc-300 transition-colors"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
