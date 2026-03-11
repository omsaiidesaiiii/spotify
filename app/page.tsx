'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../src/lib/store';
import { setIsPlaying, togglePlayer } from '../src/lib/features/music/musicSlice';

export default function Home() {
  const dispatch = useDispatch();
  const { isPlaying, isPlayerOpen } = useSelector((state: RootState) => state.music);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Project Sound-Wave</h1>
      
      <div className="glass p-8 rounded-3xl flex flex-col items-center gap-6 text-center max-w-md w-full">
        <h2 className="text-2xl font-semibold">Redux State Test</h2>
        
        <div className="flex flex-col gap-2 w-full text-lg">
          <div className="flex justify-between w-full">
            <span className="text-zinc-400">Is Playing:</span>
            <span className={isPlaying ? "text-green-400 font-bold" : "text-white font-bold"}>{isPlaying ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between w-full">
            <span className="text-zinc-400">Drawer Open:</span>
            <span className={isPlayerOpen ? "text-blue-400 font-bold" : "text-white font-bold"}>{isPlayerOpen ? 'Yes' : 'No'}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mt-4 w-full">
          <button 
            className="w-full rounded-full bg-white text-black px-6 py-4 font-semibold hover:bg-zinc-200 transition-colors"
            onClick={() => dispatch(setIsPlaying(!isPlaying))}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <button 
            className="w-full rounded-full bg-zinc-800 text-white border border-zinc-700 px-6 py-4 font-semibold hover:bg-zinc-700 transition-colors"
            onClick={() => dispatch(togglePlayer())}
          >
            Toggle Player Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
