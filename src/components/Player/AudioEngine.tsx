'use client';

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Howl } from 'howler';
import { RootState } from '../../lib/store';
import { setIsPlaying, setCurrentTime, setDuration, setTrack } from '../../lib/features/music/musicSlice';
import { offlineDB } from '../../lib/utils/offline-db';

export function AudioEngine() {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, queue } = useSelector((state: RootState) => state.music);
  
  const soundRef = useRef<Howl | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use a ref for the queue to prevent closure staleness without causing re-renders/re-initializations
  const queueRef = useRef(queue);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    if (!currentTrack) return;

    // Cleanup previous instance completely
    if (soundRef.current) {
      soundRef.current.unload();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    const setupAudio = async () => {
      let activeUrl = currentTrack.url;
      let isLocal = false;

      try {
        const offlineSong = await offlineDB.getSong(currentTrack.id);
        if (offlineSong?.audioBlob) {
          activeUrl = URL.createObjectURL(offlineSong.audioBlob);
          isLocal = true;
        }
      } catch (e) {
        console.warn('Offline DB error:', e);
      }

      const sound = new Howl({
        src: [activeUrl],
        html5: !isLocal, // HTML5 true for streamers, false for local blobs to allow precise manipulation
        format: ['mp4', 'mp3', 'm4a'],
        onplay: () => {
          dispatch(setIsPlaying(true));
          dispatch(setDuration(sound.duration()));
          
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            if (sound.playing()) {
              dispatch(setCurrentTime(sound.seek() as number));
            }
          }, 500); 
        },
        onpause: () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          dispatch(setIsPlaying(false));
        },
        onend: () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          dispatch(setIsPlaying(false));
          dispatch(setCurrentTime(0));
          
          const q = queueRef.current;
          const currentIndex = q.findIndex(t => t.id === currentTrack.id);
          if (currentIndex !== -1 && currentIndex < q.length - 1) {
              const nextTrack = q[currentIndex + 1];
              dispatch(setTrack(nextTrack));
          }
        },
        onload: () => {
           dispatch(setDuration(sound.duration()));
        }
      });

      soundRef.current = sound;
      if (isPlaying) sound.play();

      return () => {
        if (isLocal) URL.revokeObjectURL(activeUrl);
      };
    };

    let cleanupObjectURL: (() => void) | undefined;
    setupAudio().then(cleanup => {
      cleanupObjectURL = cleanup;
    });

    return () => {
      if (soundRef.current) soundRef.current.unload();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (cleanupObjectURL) cleanupObjectURL();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]); // Explicitly omitted `dispatch` and `isPlaying` to prevent remount loops

  useEffect(() => {
    if (soundRef.current) {
      if (isPlaying && !soundRef.current.playing()) {
        soundRef.current.play();
      } else if (!isPlaying && soundRef.current.playing()) {
        soundRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleSeek = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (soundRef.current) {
        soundRef.current.seek(customEvent.detail);
        dispatch(setCurrentTime(customEvent.detail));
      }
    };
    window.addEventListener('SEEK_AUDIO', handleSeek);
    return () => window.removeEventListener('SEEK_AUDIO', handleSeek);
  }, [dispatch]);

  return null;
}
