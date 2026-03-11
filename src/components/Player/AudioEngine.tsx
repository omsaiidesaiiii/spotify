'use client';

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Howl } from 'howler';
import { RootState } from '../../lib/store';
import { setIsPlaying, setCurrentTime, setDuration, setTrack } from '../../lib/features/music/musicSlice';

export function AudioEngine() {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, queue } = useSelector((state: RootState) => state.music);
  const soundRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);

  const step = () => {
    if (soundRef.current && soundRef.current.playing()) {
      dispatch(setCurrentTime(soundRef.current.seek() as number));
      rafRef.current = requestAnimationFrame(step);
    }
  };

  useEffect(() => {
    if (!currentTrack) return;

    if (soundRef.current) {
      soundRef.current.unload();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }

    const sound = new Howl({
      src: [currentTrack.url],
      html5: true, 
      format: ['mp4', 'mp3', 'm4a'],
      onplay: () => {
        dispatch(setIsPlaying(true));
        dispatch(setDuration(sound.duration()));
        rafRef.current = requestAnimationFrame(step);
      },
      onpause: () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        dispatch(setIsPlaying(false));
      },
      onend: () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        dispatch(setIsPlaying(false));
        dispatch(setCurrentTime(0));
        
        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        if (currentIndex !== -1 && currentIndex < queue.length - 1) {
             const nextTrack = queue[currentIndex + 1];
             dispatch(setTrack(nextTrack));
        }
      },
      onstop: () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        dispatch(setCurrentTime(0));
      },
      onload: () => {
         dispatch(setDuration(sound.duration()));
      }
    });

    soundRef.current = sound;

    if (isPlaying) {
      sound.play();
    }

    return () => {
      sound.unload();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  useEffect(() => {
    if (soundRef.current) {
      if (isPlaying && !soundRef.current.playing()) {
        soundRef.current.play();
      } else if (!isPlaying && soundRef.current.playing()) {
        soundRef.current.pause();
      }
    }
  }, [isPlaying]);

  return null;
}
