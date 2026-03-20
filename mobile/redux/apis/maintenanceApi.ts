import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

export interface MaintenanceRecord {
    id: number;
    machineId?: number;
    operatorId?: number;
    serviceType: string;
    description?: string;
    cost: number | string;
    serviceDate: string;
    nextServiceDate?: string;
    serviceImageUrl?: string;
    invoiceImageUrl?: string;
    createdAt: string;
    machine?: { id: number; name: string; registrationNumber: string; registration_number?: string };
    operator?: { id: number; name: string };
    
    // Fallbacks
    machine_id?: number;
    operator_id?: number;
    service_type?: string;
    service_date?: string;
    next_service_date?: string;
    service_image_url?: string;
    invoice_image_url?: string;
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
            records: MaintenanceRecord[];
            pagination?: { totalItems: number; totalPages: number; currentPage: number; limit: number };
            data?: { data: MaintenanceRecord[]; last_page: number; current_page: number } // Temp fallback
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
