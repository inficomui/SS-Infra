import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OfflineAction {
    id: string;
    local_id?: string; // For idempotency tracking as per documentation
    endpoint: string;
    method: string;
    body: any;
    headers?: any;
    timestamp: number;
    retryCount: number;
    description: string;
}

interface OfflineState {
    isOnline: boolean;
    queue: OfflineAction[];
}

const initialState: OfflineState = {
    isOnline: true,
    queue: [],
};

const offlineSlice = createSlice({
    name: 'offline',
    initialState,
    reducers: {
        setOnlineStatus: (state, action: PayloadAction<boolean>) => {
            state.isOnline = action.payload;
        },
        addToQueue: (state, action: PayloadAction<OfflineAction>) => {
            state.queue.push(action.payload);
        },
        removeFromQueue: (state, action: PayloadAction<string>) => {
            state.queue = state.queue.filter((item) => item.id !== action.payload);
        },
        incrementRetryCount: (state, action: PayloadAction<string>) => {
            const actionToUpdate = state.queue.find((item) => item.id === action.payload);
            if (actionToUpdate) {
                actionToUpdate.retryCount += 1;
            }
        },
        clearQueue: (state) => {
            state.queue = [];
        },
    },
});

export const { setOnlineStatus, addToQueue, removeFromQueue, incrementRetryCount, clearQueue } = offlineSlice.actions;
export default offlineSlice.reducer;
