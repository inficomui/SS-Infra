import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

export interface Operator {
    id: number;
    name: string;
    mobile: string;
    role: 'Operator';
    district: string;
    taluka: string;
    ownerId: number;
    avatar?: string | null;
    createdAt: string;
    fixedMonthly?: string;
    perDayWise?: string;
    bonusAmount?: string;
}

export interface AddOperatorRequest {
    mobile: string;
    name: string;
    district: string;
    taluka: string;
    fixedMonthly?: string;
    perDayWise?: string;
    bonusAmount?: string;
}

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
    owner_id: number;
    current_operator_id?: number | null;
    purchase_date?: string;
    last_service_date?: string | null;
    created_at: string;
    updated_at?: string;
    photo_path?: string;
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
        // Get all operators
        getOperators: builder.query<{ success: boolean; operators: Operator[] }, void>({
            query: () => '/operators',
            providesTags: ['Operators'],
        }),
        // Add new operator
        addOperator: builder.mutation<{ success: boolean; message: string; operator: Operator }, AddOperatorRequest>({
            query: (data) => ({
                url: '/operators',
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
