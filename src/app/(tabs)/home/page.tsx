'use client';

import { useDispatch } from 'react-redux';
import { setTrack, setIsPlaying } from '../../../lib/features/music/musicSlice';

export default function HomePage() {
  const dispatch = useDispatch();

  const handlePlayDummy = () => {
    dispatch(setTrack({
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      image: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
      url: ''
    }));
    dispatch(setIsPlaying(true));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Home Page</h1>
      <p className="mt-4 text-zinc-400">Welcome to Project Sound-Wave.</p>
      
      <button 
        onClick={handlePlayDummy}
        className="mt-6 glass px-6 py-3 rounded-full text-white font-semibold hover:bg-white/10 transition-colors"
      >
        Play Dummy Track
      </button>

      <div className="mt-8 space-y-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-16 glass rounded-xl flex items-center px-4">
            Placeholder Playlist {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
