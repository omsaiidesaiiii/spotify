import { configureStore } from '@reduxjs/toolkit';
import musicReducer from './features/music/musicSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      music: musicReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
