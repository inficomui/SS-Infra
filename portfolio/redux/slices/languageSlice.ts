"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "en" | "hi" | "mr";

interface LanguageState {
    current: Language;
}

const getInitialLanguage = (): Language => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("lang") as Language;
        if (["en", "hi", "mr"].includes(saved)) return saved;
    }
    return "en";
};

const initialState: LanguageState = {
    current: getInitialLanguage(),
};

const languageSlice = createSlice({
    name: "language",
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<Language>) => {
            state.current = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("lang", action.payload);
            }
        },
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
