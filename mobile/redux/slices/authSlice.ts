import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: User | null;
    role: 'Owner' | 'Operator' | 'Admin' | 'Driver' | null;
}

const initialState: AuthState = {
    token: null,
    isAuthenticated: false,
    user: null,
    role: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.role = user.role;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
        },
        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.role = action.payload.role;
        },
        rehydrate: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.user.role;
            state.isAuthenticated = true;
        },
    },
});

export const { setCredentials, logout, updateUser, rehydrate } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: any) => state.auth.user;
export const selectCurrentToken = (state: any) => state.auth.token;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectCurrentRole = (state: any) => state.auth.role;
