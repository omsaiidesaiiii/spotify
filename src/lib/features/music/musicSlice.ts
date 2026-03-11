import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Track {
  id: string;
  title: string;
  artist: string;
  image: string;
  url: string;
}

export interface MusicState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  isPlayerOpen: boolean;
  currentTime: number;
  duration: number;
}

const initialState: MusicState = {
  currentTrack: null,
  isPlaying: false,
  queue: [],
  isPlayerOpen: false,
  currentTime: 0,
  duration: 0,
};

export const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    togglePlayer: (state) => {
      state.isPlayerOpen = !state.isPlayerOpen;
    },
    setQueue: (state, action: PayloadAction<Track[]>) => {
      state.queue = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
  },
});

export const { setTrack, setIsPlaying, togglePlayer, setQueue, setCurrentTime, setDuration } = musicSlice.actions;

export default musicSlice.reducer;
