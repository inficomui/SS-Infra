import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './apis/authApi'
import { dashboardApi } from './apis/dashboardApi'
import { usersApi } from './apis/usersApi'
import { plansApi } from './apis/plansApi'
import { subscriptionApi } from './apis/subscriptionApi'
import { commissionApi } from './apis/commissionApi'
import { walletApi } from './apis/walletApi'
import authReducer from './features/authSlice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            [authApi.reducerPath]: authApi.reducer,
            [dashboardApi.reducerPath]: dashboardApi.reducer,
            [usersApi.reducerPath]: usersApi.reducer,
            [plansApi.reducerPath]: plansApi.reducer,
            [subscriptionApi.reducerPath]: subscriptionApi.reducer,
            [commissionApi.reducerPath]: commissionApi.reducer,
            [walletApi.reducerPath]: walletApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware()
                .concat(authApi.middleware)
                .concat(dashboardApi.middleware)
                .concat(usersApi.middleware)
                .concat(plansApi.middleware)
                .concat(subscriptionApi.middleware)
                .concat(commissionApi.middleware)
                .concat(walletApi.middleware),
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
