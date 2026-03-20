import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DriverState {
    activeWorkId: string | null;
    workStatus: 'running' | 'idle';
    siteAddress: string | null;
    startedAt: string | null;
    lastRefetchedAt: string | null;
}

const initialState: DriverState = {
    activeWorkId: null,
    workStatus: 'idle',
    siteAddress: null,
    startedAt: null,
    lastRefetchedAt: null,
};

const driverSlice = createSlice({
    name: 'driver',
    initialState,
    reducers: {
        setActiveDuty: (state, action: PayloadAction<{ id: string; siteAddress?: string; startedAt: string }>) => {
            state.activeWorkId = action.payload.id;
            state.workStatus = 'running';
            state.siteAddress = action.payload.siteAddress || null;
            state.startedAt = action.payload.startedAt;
            state.lastRefetchedAt = new Date().toISOString();
        },
        clearActiveDuty: (state) => {
            state.activeWorkId = null;
            state.workStatus = 'idle';
            state.siteAddress = null;
            state.startedAt = null;
        },
        syncWithServer: (state, action: PayloadAction<{ activeWork: any | null }>) => {
            if (action.payload.activeWork) {
                const { id, siteAddress, startedAt } = action.payload.activeWork;
                state.activeWorkId = id.toString();
                state.workStatus = 'running';
                state.siteAddress = siteAddress;
                state.startedAt = startedAt;
            } else {
                state.activeWorkId = null;
                state.workStatus = 'idle';
                state.siteAddress = null;
                state.startedAt = null;
            }
            state.lastRefetchedAt = new Date().toISOString();
        }
    },
});

export const { setActiveDuty, clearActiveDuty, syncWithServer } = driverSlice.actions;
export default driverSlice.reducer;

export const selectActiveWorkId = (state: any) => state.driver.activeWorkId;
export const selectWorkStatus = (state: any) => state.driver.workStatus;
export const selectSiteAddress = (state: any) => state.driver.siteAddress;
export const selectStartedAt = (state: any) => state.driver.startedAt;
