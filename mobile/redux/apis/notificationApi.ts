import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

export interface Notification {
    id: string;
    title: string;
    body: string;
    type: string;
    data?: any;
    isRead: boolean;
    createdAt: string;
}

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: CONFIG.API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Notifications'],
    endpoints: (builder) => ({
        getNotifications: builder.query<{ success: boolean; notifications: Notification[] }, void>({
            query: () => '/notifications',
            providesTags: ['Notifications'],
        }),
        markAsRead: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications'],
        }),
        markAllAsRead: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: '/notifications/read-all',
                method: 'POST',
            }),
            invalidatesTags: ['Notifications'],
        }),
        deleteNotification: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notifications'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation
} = notificationApi;
