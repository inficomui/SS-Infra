import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import Reactotron from '../reactotron';
import { authApi } from './apis/authApi';
import { workApi } from './apis/workApi';
import { ownerApi } from './apis/ownerApi';
import { walletApi } from './apis/walletApi';
import { fuelApi } from './apis/fuelApi';
import { maintenanceApi } from './apis/maintenanceApi';
import { notificationApi } from './apis/notificationApi';
import { subscriptionApi } from './apis/subscriptionApi';
import { bookingApi } from './apis/bookingApi';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import { storage } from './storage';
import notificationReducer from './slices/notificationSlice';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const rootReducer = combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    [workApi.reducerPath]: workApi.reducer,
    [ownerApi.reducerPath]: ownerApi.reducer,
    [walletApi.reducerPath]: walletApi.reducer,
    [fuelApi.reducerPath]: fuelApi.reducer,
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    auth: authReducer,
    theme: themeReducer,
    notifications: notificationReducer,
});

const persistConfig = {
    key: 'root',
    storage: storage,
    whitelist: ['auth', 'theme', 'notifications'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(
            authApi.middleware,
            workApi.middleware,
            ownerApi.middleware,
            walletApi.middleware,
            fuelApi.middleware,
            maintenanceApi.middleware,
            notificationApi.middleware,
            subscriptionApi.middleware,
            bookingApi.middleware
        ),
    enhancers: (getDefaultEnhancers) =>
        __DEV__ && Reactotron.createEnhancer ? getDefaultEnhancers().concat(Reactotron.createEnhancer()) : getDefaultEnhancers(),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

