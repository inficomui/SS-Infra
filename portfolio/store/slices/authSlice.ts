"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    showLoginPopup: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    showLoginPopup: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.showLoginPopup = false;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        toggleLoginPopup: (state, action: PayloadAction<boolean>) => {
            state.showLoginPopup = action.payload;
        },
    },
});

export const { setCredentials, logout, toggleLoginPopup } = authSlice.actions;
export default authSlice.reducer;
