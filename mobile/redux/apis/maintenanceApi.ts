import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

export interface MaintenanceRecord {
    id: number;
    machine_id: number;
    service_type: string;
    cost: string;
    service_date: string;
    service_image_url?: string;
    invoice_image_url?: string;
    description?: string;
    machine?: { id: number; name: string; registration_number: string };
}

export interface GetMaintenanceParams {
    machineId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
}

import { baseQuery } from '../baseQuery';

export const maintenanceApi = createApi({
    reducerPath: 'maintenanceApi',
    baseQuery,
    tagTypes: ['Maintenance'],
    endpoints: (builder) => ({
        getMaintenanceRecords: builder.query<{
            success: boolean;
            data: {
                current_page: number;
                last_page: number;
                total: number;
                data: MaintenanceRecord[]
            }
        }, GetMaintenanceParams>({
            query: (params) => {
                let url = '/maintenance-records?';
                if (params.machineId) url += `machineId=${params.machineId}&`;
                if (params.startDate) url += `startDate=${params.startDate}&`;
                if (params.endDate) url += `endDate=${params.endDate}&`;
                if (params.page) url += `page=${params.page}&`;
                return url;
            },
            providesTags: ['Maintenance'],
        }),
        // Add Maintenance Record (Multipart)
        addMaintenanceRecord: builder.mutation<{ success: boolean; message: string; data: MaintenanceRecord }, FormData>({
            query: (formData) => ({
                url: '/maintenance-records',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Maintenance'],
        }),
    }),
});

export const {
    useGetMaintenanceRecordsQuery,
    useAddMaintenanceRecordMutation
} = maintenanceApi;
