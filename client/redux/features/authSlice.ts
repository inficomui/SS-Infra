import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'

interface Admin {
    id: number
    name: string
    email: string
    mobile: string
    role: string
}

export interface AuthState {
    user: Admin | null
    token: string | null
    isAuthenticated: boolean
}

const initialState: AuthState = {
    user: Cookies.get('admin_user') ? JSON.parse(Cookies.get('admin_user')!) : null,
    token: Cookies.get('admin_token') || null,
    isAuthenticated: !!Cookies.get('admin_token'),
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: Admin; token: string }>
        ) => {
            const { user, token } = action.payload
            state.user = user
            state.token = token
            state.isAuthenticated = true
            Cookies.set('admin_token', token, { expires: 7 })
            Cookies.set('admin_user', JSON.stringify(user), { expires: 7 })
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            Cookies.remove('admin_token')
            Cookies.remove('admin_user')
        },
    },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
