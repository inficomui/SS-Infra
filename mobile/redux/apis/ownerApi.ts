import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

export interface Worker {
    id: number;
    name: string;
    mobile: string;
    role: 'Operator' | 'Driver';
    district: string;
    taluka: string;
    license_number?: string | null;
    assigned_vehicle?: string | null;
    salaryType: 'daily' | 'monthly' | 'none';
    salaryAmount: string;          // API returns as string e.g. "700.00"
    ownerId: number;
    avatar?: string | null;
    createdAt: string;
}

/** @deprecated Use Worker instead */
export type Operator = Worker;

export interface AddWorkerRequest {
    mobile: string;
    name: string;
    district: string;
    taluka: string;
    role: 'Operator' | 'Driver';
    // Driver-only
    license_number?: string;
    assigned_vehicle?: string;
    // Salary — use convenience OR explicit fields, not both
    salaryType?: 'daily' | 'monthly' | 'none';
    salaryAmount?: number;
    fixedMonthly?: number;   // shorthand: sets salaryType=monthly automatically
    perDayWise?: number;     // shorthand: sets salaryType=daily automatically
}

/** @deprecated Use AddWorkerRequest instead */
export type AddOperatorRequest = AddWorkerRequest;

export interface GetWorkersParams {
    role?: 'Operator' | 'Driver';
    search?: string;
    district?: string;
    taluka?: string;
    salaryType?: 'daily' | 'monthly' | 'none';
}

/** @deprecated Use GetWorkersParams instead */
export type GetOperatorsParams = GetWorkersParams;

export interface UpdateSalaryConfigRequest {
    salaryType: 'daily' | 'monthly' | 'none';
    salaryAmount: number;
}

export interface RecordPaymentRequest {
    amount: number;
    type: string;
    description: string;
    paymentDate: string;
}

export interface PaymentHistoryResponse {
    success: boolean;
    payments: {
        current_page: number;
        data: PaymentRecord[];
        last_page: number;
        per_page: number;
        total: number;
        first_page_url?: string;
    };
}

export interface PaymentRecord {
    id: number;
    amount: string;
    type: string;
    description: string;
    payment_date: string;
    owner: { id: number; name: string };
}

export interface Machine {
    id: number;
    name: string;
    registration_number: string;
    status: 'available' | 'in_use' | 'maintenance';
    photo_url?: string;
    photo_path?: string;
    photoUrl?: string;
    machine_photo?: string;
    photo?: string;
    owner_id: number;
    current_operator_id?: number | null;
    purchase_date?: string;
    last_service_date?: string | null;
    created_at: string;
    updated_at?: string;
    // Legacy support (optional mapping if frontend transforms it)
    registrationNumber?: string;
}

export interface AddMachineRequest {
    name: string;
    registrationNumber: string;
    purchaseDate?: string;
}

export interface SalaryReportRequest {
    startDate: string;
    endDate: string;
    operatorId?: number;
}

export interface SalaryReportResponse {
    success: boolean;
    report: {
        startDate: string;
        endDate: string;
        totalAmount: string;
        payments: {
            data: {
                id: number;
                amount: string;
                type: string;
                payment_date: string;
                operator: { id: number; name: string };
            }[];
        };
    };
}

import { baseQuery } from '../baseQuery';

// Define the API service
export const ownerApi = createApi({
    reducerPath: 'ownerApi',
    baseQuery,
    tagTypes: ['Operators', 'Machines'],
    endpoints: (builder) => ({
        // Get all workers (Operators & Drivers) with optional filters
        getOperators: builder.query<{ success: boolean; workers: Worker[]; operators: Worker[] }, GetWorkersParams | void>({
            query: (params) => {
                let url = '/workers';
                if (params) {
                    const queryParts: string[] = [];
                    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
                    if (params.role) queryParts.push(`role=${encodeURIComponent(params.role)}`);
                    if (params.district) queryParts.push(`district=${encodeURIComponent(params.district)}`);
                    if (params.taluka) queryParts.push(`taluka=${encodeURIComponent(params.taluka)}`);
                    if (params.salaryType) queryParts.push(`salaryType=${encodeURIComponent(params.salaryType)}`);
                    if (queryParts.length > 0) url += `?${queryParts.join('&')}`;
                }
                return url;
            },
            // Map `workers` array to legacy `operators` key so existing UI doesn't break
            transformResponse: (response: { success: boolean; workers: Worker[] }) => ({
                ...response,
                operators: response.workers,   // keep backward compat
            }),
            providesTags: ['Operators'],
        }),
        // Register a new Operator or Driver
        addOperator: builder.mutation<{ success: boolean; message: string; worker: Worker }, AddWorkerRequest>({
            query: (data) => ({
                url: '/workers',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Operators'],
        }),
        // Update operator salary config
        updateSalaryConfig: builder.mutation<{ success: boolean; message: string; config: UpdateSalaryConfigRequest }, { operatorId: number; data: UpdateSalaryConfigRequest }>({
            query: ({ operatorId, data }) => ({
                url: `/operators/${operatorId}/salary-config`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { operatorId }) => ['Operators', { type: 'Operators', id: operatorId }],
        }),
        // Record payment
        recordPayment: builder.mutation<{ success: boolean; message: string; payment: PaymentRecord }, { operatorId: number; data: RecordPaymentRequest }>({
            query: ({ operatorId, data }) => ({
                url: `/operators/${operatorId}/payments`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { operatorId }) => ['Operators', { type: 'Operators', id: operatorId }],
        }),
        // Get payment history
        getPaymentHistory: builder.query<PaymentHistoryResponse, { operatorId: number; page?: number }>({
            query: ({ operatorId, page }) => {
                let url = `/operators/${operatorId}/payments`;
                if (page) url += `?page=${page}`;
                return url;
            },
            providesTags: (result, error, { operatorId }) => ['Operators', { type: 'Operators', id: operatorId }],
        }),
        // Get salary report
        getSalaryReport: builder.query<SalaryReportResponse, SalaryReportRequest>({
            query: ({ startDate, endDate, operatorId }) => {
                let url = `/salary/report?startDate=${startDate}&endDate=${endDate}`;
                if (operatorId) url += `&operatorId=${operatorId}`;
                return url;
            },
            providesTags: ['Operators'],
        }),
        // Get all machines
        getMachines: builder.query<{ success: boolean; machines: Machine[] }, void>({
            query: () => '/machines',
            providesTags: ['Machines'],
            transformResponse: (response: any) => {
                return response;
            },
        }),
        // Add new machine
        addMachine: builder.mutation<{ success: boolean; message: string; machine: Machine }, FormData>({
            query: (formData) => ({
                url: '/machines',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Machines'],
        }),
        // Update machine
        updateMachine: builder.mutation<{ success: boolean; message: string; machine: Machine }, { id: number; data: FormData | (Partial<AddMachineRequest> & { status?: string }) }>({
            query: ({ id, data }) => ({
                url: `/machines/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => ['Machines', { type: 'Machines', id }],
        }),
        // Delete machine
        deleteMachine: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/machines/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Machines'],
        }),
    }),
});

// Export hooks for usage in functional components
export const {
    useGetOperatorsQuery,
    useAddOperatorMutation,
    useUpdateSalaryConfigMutation,
    useRecordPaymentMutation,
    useGetPaymentHistoryQuery,
    useGetSalaryReportQuery,
    useGetMachinesQuery,
    useAddMachineMutation,
    useUpdateMachineMutation,
    useDeleteMachineMutation,
} = ownerApi;
