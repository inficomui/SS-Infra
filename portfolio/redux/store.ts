import { configureStore, isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// Slices
import filterReducer from "./slices/filterSlice";
import modalReducer from "./slices/modalSlice";
import themeReducer from "./slices/themeSlice";
import languageReducer from "./slices/languageSlice";
import authReducer from "./slices/authSlice";

// APIs
import { authApi } from "./apis/authApi";
import { locationApi } from "./apis/locationApi";
import { bookingApi } from "./apis/bookingApi";
import { discoveryApi } from "./apis/discoveryApi";

// Global RTK Query Error Handler
export const rtkQueryErrorLogger: Middleware =
    () => (next) => (action) => {
        if (isRejectedWithValue(action)) {
            console.error("RTK Query Error Logger: ", action.payload);
            const errorMsg =
                (action.payload as any)?.data?.message ||
                "An unexpected error occurred with the server.";
            // Show Toast Error Globally
            // Make sure <Toaster /> is rendered in the layout
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
