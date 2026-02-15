import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ColorSchemeName } from 'react-native';

interface ThemeState {
    mode: 'light' | 'dark' | 'system';
}

const initialState: ThemeState = {
    mode: 'dark', // Default to dark as per current premium theme
};

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
            state.mode = action.payload;
        },
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
        },
    },
});

export const { setThemeMode, toggleTheme } = themeSlice.actions;

export const selectThemeMode = (state: any) => state.theme.mode;

export default themeSlice.reducer;
