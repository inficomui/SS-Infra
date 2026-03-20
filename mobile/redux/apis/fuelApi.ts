import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

export interface FuelLog {
    id: number;
    machineId?: number;
    operatorId?: number;
    fuelLiters: number | string;
    amount: number | string;
    logDate: string;
    readingBeforeUrl?: string;
    readingAfterUrl?: string;
    createdAt: string;
    machine?: { id: number; name: string; registrationNumber: string; registration_number?: string };
    operator?: { id: number; name: string };
    description?: string;
    
    // Fallbacks
    machine_id?: number;
    operator_id?: number;
    fuel_liters?: string | number;
    log_date?: string;
    reading_before_url?: string;
    reading_after_url?: string;
    machine_name?: string;
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

import { baseQuery } from '../baseQuery';

export const fuelApi = createApi({
    reducerPath: 'fuelApi',
    baseQuery,
    tagTypes: ['FuelLogs'],
    endpoints: (builder) => ({
        // Get Fuel Logs
        getFuelLogs: builder.query<{ 
            success: boolean; 
            logs: FuelLog[]; 
            pagination?: { totalItems: number; totalPages: number; currentPage: number; limit: number };
            data?: { data: FuelLog[]; last_page: number; current_page: number } // Temp fallback
        }, GetFuelLogsParams>({
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
