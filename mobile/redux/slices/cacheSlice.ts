import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CacheState {
    machines: any[];
    clients: any[];
    lastUpdated: number;
}

const initialState: CacheState = {
    machines: [],
    clients: [],
    lastUpdated: 0,
};

const cacheSlice = createSlice({
    name: 'cache',
    initialState,
    reducers: {
        setPrepareData: (state, action: PayloadAction<{ machines: any[]; clients: any[] }>) => {
            state.machines = action.payload.machines;
            state.clients = action.payload.clients;
            state.lastUpdated = Date.now();
        },
        updateCachedClients: (state, action: PayloadAction<any[]>) => {
            state.clients = action.payload;
        },
        addCachedClient: (state, action: PayloadAction<any>) => {
            state.clients = [action.payload, ...state.clients];
        },
        clearCache: (state) => {
            state.machines = [];
            state.clients = [];
            state.lastUpdated = 0;
        },
    },
});

export const { setPrepareData, updateCachedClients, addCachedClient, clearCache } = cacheSlice.actions;
export default cacheSlice.reducer;
