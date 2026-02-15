
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationItem {
    id: string;
    title: string;
    body: string;
    type: string;
    createdAt: string;
    isRead: boolean;
    data?: any;
}

interface NotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'> & { id?: string; createdAt?: string }>) => {
            const newItem: NotificationItem = {
                id: action.payload.id || Date.now().toString(),
                title: action.payload.title,
                body: action.payload.body,
                type: action.payload.type || 'info', // Default type
                createdAt: action.payload.createdAt || new Date().toISOString(),
                isRead: false,
                data: action.payload.data,
            };
            state.notifications.unshift(newItem);
            state.unreadCount += 1;
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => {
                n.isRead = true;
            });
            state.unreadCount = 0;
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
        deleteNotification: (state, action: PayloadAction<string>) => {
            const index = state.notifications.findIndex(n => n.id === action.payload);
            if (index !== -1) {
                if (!state.notifications[index].isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications.splice(index, 1);
            }
        },
    },
});

export const {
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    deleteNotification
} = notificationSlice.actions;

export default notificationSlice.reducer;

export const selectAllNotifications = (state: any) => state.notifications.notifications;
export const selectUnreadCount = (state: any) => state.notifications.unreadCount;
export const selectNotificationById = (state: any, id: string) =>
    state.notifications.notifications.find((n: NotificationItem) => n.id === id);
