import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { CONFIG } from '@/constants/Config';
import { logout } from './slices/authSlice';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: CONFIG.API_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error) {
        const status = result.error.status;
        const data = result.error.data as any;

        if (status === 401) {
            // Unauthorized - Log out user
            api.dispatch(logout());

            // Show alert for session expiry
            Alert.alert(
                'Session Expired',
                'Your session has expired. Please login again.',
                [{ text: 'OK', onPress: () => router.replace('/login') }]
            );
        } else if (status === 403 && data?.subscription_expired) {
            // Subscription Expired
            Alert.alert(
                'Plan Expired',
                data.message || 'Your subscription has expired or is inactive. Please renew your plan to continue using this feature.',
                [
                    {
                        text: 'View Plans',
                        onPress: () => router.push('/(common)/plans' as any),
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                ]
            );
        }
    }

    return result;
};
