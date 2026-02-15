import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

export interface FuelLog {
    id: number;
    machine_id: number;
    operator_id: number;
    fuel_liters: string;
    amount: string;
    log_date: string;
    reading_before_url?: string;
    reading_after_url?: string;
    reading_before?: string;
    before_reading_url?: string;
    reading_after?: string;
    after_reading_url?: string;
    description?: string;
    created_at: string;
    machine?: { id: number; name: string; registration_number: string };
    operator?: { id: number; name: string };
}

export interface AddFuelLogRequest {
    machine_id: number;
    fuel_liters: string;
    amount: string;
    log_date: string;
    reading_before_image?: any; // File object or URI
    reading_after_image?: any;  // File object or URI
}

export interface GetFuelLogsParams {
    machineId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
}

export interface VideoLog {
    id: number;
    machine_id: number;
    operator_id: number;
    video_url: string;
    description?: string;
    created_at: string;
    machine?: { id: number; name: string };
    operator?: { id: number; name: string };
}

export const fuelApi = createApi({
    reducerPath: 'fuelApi',
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
    tagTypes: ['FuelLogs'],
    endpoints: (builder) => ({
        // Get Fuel Logs
        getFuelLogs: builder.query<{ success: boolean; data: { current_page: number; last_page: number; total: number; data: FuelLog[] } }, GetFuelLogsParams>({
            query: (params) => {
                let url = '/fuel-logs?';
                if (params.machineId) url += `machineId=${params.machineId}&`;
                if (params.startDate) url += `startDate=${params.startDate}&`;
                if (params.endDate) url += `endDate=${params.endDate}&`;
                if (params.page) url += `page=${params.page}&`;
                return url;
            },
            providesTags: ['FuelLogs'],
        }),
        // Add Fuel Log (Multipart)
        addFuelLog: builder.mutation<{ success: boolean; message: string; data: FuelLog }, FormData>({
            query: (formData) => ({
                url: '/fuel-logs',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['FuelLogs'],
        }),
    }),
});

export const {
    useGetFuelLogsQuery,
    useAddFuelLogMutation
} = fuelApi;
