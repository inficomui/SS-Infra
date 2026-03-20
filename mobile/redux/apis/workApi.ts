import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

// Client Types
export interface Client {
    id: number;
    name: string;
    mobile: string;
    district: string;
    taluka: string;
    ownerId: number;
    createdAt: string;
}

export interface CreateClientRequest {
    name: string;
    mobile: string;
    district: string;
    taluka: string;
}

// Work Session Types
export interface WorkSession {
    id: number;
    operatorId?: number;
    operatorName?: string;
    clientId?: number;
    clientName?: string;
    clientMobile?: string;
    clientDistrict?: string;
    clientTaluka?: string;
    siteLatitude?: string | number;
    siteLongitude?: string | number;
    siteAddress?: string;
    startLocation?: string;
    endLocation?: string;
    startedAt: string;
    finishedAt?: string | null;
    totalHours?: number | null;
    status: 'in_progress' | 'completed' | 'cancelled';
    beforePhotoUrl?: string; // Legacy
    afterPhotoUrl?: string | null; // Legacy
    startMeterPhotoUrl?: string;
    endMeterPhotoUrl?: string | null;
    startMeterReading?: string | number;
    endMeterReading?: string | number | null;
    notes?: string;
    role?: 'Operator' | 'Driver';
    createdAt: string;
    created_at?: string;
    client_name?: string;
    start_location?: string;
    end_location?: string;
    site_address?: string;
    start_meter_reading?: string | number;
    end_meter_reading?: string | number | null;
    start_meter_photo_url?: string;
    end_meter_photo_url?: string | null;
    before_photo_url?: string;
    after_photo_url?: string | null;
    started_at?: string;
    finished_at?: string | null;
    total_hours?: number | null;
}

export interface StartWorkResponse {
    success: boolean;
    message: string;
    workSession: WorkSession;
}

export interface FinishWorkResponse {
    success: boolean;
    message: string;
    workSession: WorkSession;
}

export interface GenerateBillRequest {
    workSessionId: string | number;
    hourlyRate: number;
    totalHours: number;
    totalAmount: number;
    description?: string;
}

export interface GenerateBillResponse {
    success: boolean;
    message: string;
    invoice: {
        id: number;
        invoice_number: string;
        work_session_id: number;
        client_id: number;
        owner_id: number;
        hourly_rate: string;
        total_hours: string;
        total_amount: string;
        description: string;
        status: string;
        issued_at: string;
        createdAt: string;
    };
}

import { baseQuery } from '../baseQuery';

export const workApi = createApi({
    reducerPath: 'workApi',
    baseQuery,
    tagTypes: ['Work', 'Clients'],
    endpoints: (builder) => ({
        // ============ CLIENTS ENDPOINTS ============
        getClients: builder.query<{ success: boolean; clients: Client[] }, void>({
            query: () => '/clients',
            providesTags: ['Clients'],
        }),
        createClient: builder.mutation<{ success: boolean; message: string; client: Client }, CreateClientRequest>({
            query: (data) => ({
                url: '/clients',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Clients'],
        }),
        getClientDetails: builder.query<{ success: boolean; client: Client & { stats?: any; recentWork?: any[] } }, number>({
            query: (clientId) => `/clients/${clientId}`,
            providesTags: (_result, _error, id) => [{ type: 'Clients', id }],
        }),
        updateClient: builder.mutation<{ success: boolean; message: string; client: Client }, { id: number; data: Partial<CreateClientRequest> }>({
            query: ({ id, data }) => ({
                url: `/clients/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => ['Clients', { type: 'Clients', id }],
        }),
        deleteClient: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/clients/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Clients'],
        }),
        getClientWorkHistory: builder.query<{ success: boolean; workHistory: WorkSession[] }, number>({
            query: (clientId) => `/clients/${clientId}/work-history`,
            providesTags: (result, _error, id) =>
                result
                    ? [...result.workHistory.map(({ id }) => ({ type: 'Work' as const, id })), { type: 'Clients', id }]
                    : [{ type: 'Clients', id }],
        }),

        // ============ WORK ENDPOINTS ============
        startWork: builder.mutation<StartWorkResponse, FormData>({
            query: (formData) => ({
                url: '/work/start',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Work', 'Clients'],
        }),
        finishWork: builder.mutation<FinishWorkResponse, FormData>({
            query: (formData) => ({
                url: '/work/finish',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Work'],
        }),
        getActiveWork: builder.query<{ success: boolean; workSession: WorkSession | null }, void>({
            query: () => '/work/active',
            providesTags: ['Work'],
        }),
        getWorkHistory: builder.query<{ success: boolean; workSessions: WorkSession[]; work_sessions?: WorkSession[]; pagination?: any; data?: WorkSession[] }, { page?: number; limit?: number; status?: 'completed' | 'in_progress'; from?: string; to?: string }>({
            query: ({ page = 1, limit = 20, status, from, to }) => {
                let url = `/work/history?page=${page}&limit=${limit}`;
                if (status) url += `&status=${status}`;
                if (from) url += `&from=${from}`;
                if (to) url += `&to=${to}`;
                return url;
            },
            providesTags: ['Work'],
        }),
        getWorkDetails: builder.query<{ success: boolean; workSession: WorkSession }, number>({
            query: (workSessionId) => `/work/${workSessionId}`,
        }),

        // ============ DUTY ENDPOINTS (Driver Specific) ============
        startDuty: builder.mutation<StartWorkResponse, FormData>({
            query: (formData) => ({
                url: '/duty/start',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Work', 'Clients'],
        }),
        endDuty: builder.mutation<FinishWorkResponse, FormData>({
            query: (formData) => ({
                url: '/duty/end',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Work'],
        }),
        getActiveDuty: builder.query<{ success: boolean; workSession: WorkSession | null }, void>({
            query: () => '/duty/active',
            providesTags: ['Work'],
        }),
        getDutyHistory: builder.query<{ success: boolean; workSessions: WorkSession[]; work_sessions?: WorkSession[]; pagination?: any; data?: WorkSession[] }, { page?: number; limit?: number; status?: 'completed' | 'in_progress' | 'cancelled'; from?: string; to?: string }>({
            query: ({ page = 1, limit = 20, status, from, to }) => {
                let url = `/duty/history?page=${page}&limit=${limit}`;
                if (status) url += `&status=${status}`;
                if (from) url += `&from=${from}`;
                if (to) url += `&to=${to}`;
                return url;
            },
            providesTags: ['Work'],
        }),
        getDutyStats: builder.query<{ success: boolean; stats: any }, void>({
            query: () => '/duty/stats',
            providesTags: ['Work'],
        }),

        // ============ BILLING ENDPOINTS ============
        updateWorkSession: builder.mutation<{ success: boolean; message: string; workSession: WorkSession }, { id: number; data: Partial<WorkSession> }>({
            query: ({ id, data }) => ({
                url: `/work/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => ['Work', { type: 'Work', id }],
        }),
        generateBill: builder.mutation<GenerateBillResponse, GenerateBillRequest>({
            query: (body) => ({
                url: '/billing/generate',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Work'],
        }),
        recordPayment: builder.mutation<{ success: boolean; message: string; invoice: any }, { invoiceId: string | number; amount: number; paymentDate: string; nextPaymentDate?: string; notes?: string }>({
            query: ({ invoiceId, ...body }) => ({
                url: `/billing/${invoiceId}/payment`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Work'],
        }),
    }),
});

export const {
    // Clients
    useGetClientsQuery,
    useCreateClientMutation,
    useGetClientDetailsQuery,
    useUpdateClientMutation,
    useDeleteClientMutation,
    useGetClientWorkHistoryQuery,
    // Work
    useStartWorkMutation,
    useFinishWorkMutation,
    useGetActiveWorkQuery,
    useGetWorkHistoryQuery,
    useGetWorkDetailsQuery,
    useUpdateWorkSessionMutation,
    // Duty
    useStartDutyMutation,
    useEndDutyMutation,
    useGetActiveDutyQuery,
    useGetDutyHistoryQuery,
    useGetDutyStatsQuery,
    // Billing
    useGenerateBillMutation,
    useRecordPaymentMutation,
} = workApi;
