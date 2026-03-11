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
}

const initialState: MusicState = {
  currentTrack: null,
  isPlaying: false,
  queue: [],
  isPlayerOpen: false,
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
  },
});

export const { setTrack, setIsPlaying, togglePlayer, setQueue } = musicSlice.actions;

export default musicSlice.reducer;
