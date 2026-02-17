import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

export interface Notification {
    id: string;
    title: string;
    body: string;
    type: string;
    data?: any;
    isRead?: boolean;
    is_read?: boolean;
    createdAt?: string;
    created_at?: string;
}

import { baseQuery } from '../baseQuery';

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery,
    tagTypes: ['Notifications'],
    endpoints: (builder) => ({
        getNotifications: builder.query<{ success: boolean; notifications?: Notification[]; data?: Notification[] }, void>({
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
