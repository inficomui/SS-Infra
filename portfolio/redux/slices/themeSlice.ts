"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
    mode: "light" | "dark";
}

const getInitialTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") return saved;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
};

const initialState: ThemeState = {
    mode: getInitialTheme(),
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
