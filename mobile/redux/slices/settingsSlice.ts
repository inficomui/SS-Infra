import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../storage';

interface SettingsState {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoSync: boolean;
  language: string;
}

const initialState: SettingsState = {
  notificationsEnabled: true,
  soundEnabled: true,
  autoSync: true,
  language: 'en',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
    },
    setAutoSync: (state, action: PayloadAction<boolean>) => {
      state.autoSync = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setNotificationsEnabled,
  setSoundEnabled,
  setAutoSync,
  setLanguage,
  updateSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
