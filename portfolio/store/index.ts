"use client";

import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import languageReducer from "./slices/languageSlice";
import authReducer from "./slices/authSlice";
import { portfolioApi } from "./apis/portfolioApi";

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        language: languageReducer,
        auth: authReducer,
        [portfolioApi.reducerPath]: portfolioApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(portfolioApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
