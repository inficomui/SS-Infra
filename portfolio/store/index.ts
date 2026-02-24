"use client";

import { configureStore, isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// Slices — now live in src/redux/slices/
import themeReducer from "@/redux/slices/themeSlice";
import languageReducer from "@/redux/slices/languageSlice";
import authReducer from "@/redux/slices/authSlice";
import filterReducer from "@/redux/slices/filterSlice";
import modalReducer from "@/redux/slices/modalSlice";

// APIs — live in src/redux/apis/
import { authApi } from "@/redux/apis/authApi";
import { locationApi } from "@/redux/apis/locationApi";
import { bookingApi } from "@/redux/apis/bookingApi";
import { discoveryApi } from "@/redux/apis/discoveryApi";

// Global RTK Query error middleware — shows toast on any API failure
const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        const errorMsg =
            (action.payload as any)?.data?.message ||
            "Something went wrong. Please try again.";
        toast.error(errorMsg);
    }
    return next(action);
};

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        language: languageReducer,
        auth: authReducer,
        filter: filterReducer,
        modal: modalReducer,
        [authApi.reducerPath]: authApi.reducer,
        [locationApi.reducerPath]: locationApi.reducer,
        [bookingApi.reducerPath]: bookingApi.reducer,
        [discoveryApi.reducerPath]: discoveryApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(locationApi.middleware)
            .concat(bookingApi.middleware)
            .concat(discoveryApi.middleware)
            .concat(rtkQueryErrorLogger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
