"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
    mode: "light" | "dark";
}

const initialState: ThemeState = {
    mode: "dark", // Always initialize as dark to ensure SSR and Client initial matched rendering
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
            if (typeof window !== "undefined") {
                localStorage.setItem("theme", state.mode);
                document.documentElement.classList.toggle("light", state.mode === "light");
                document.documentElement.classList.toggle("dark", state.mode === "dark");
            }
        },
        setTheme: (state, action: PayloadAction<"light" | "dark">) => {
            state.mode = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("theme", state.mode);
                document.documentElement.classList.toggle("light", state.mode === "light");
                document.documentElement.classList.toggle("dark", state.mode === "dark");
            }
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
