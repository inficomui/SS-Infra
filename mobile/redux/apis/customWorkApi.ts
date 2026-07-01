import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseQuery';

export interface CustomWork {
    id: number | string;
    operatorId?: number;
    operatorName?: string;
    ownerId?: number;
    clientId?: number | string;
    clientName?: string;
    machineId?: number | string;
    machineName?: string;
    workName: string;
    workLocation: string;
    latitude?: number | string;
    longitude?: number | string;
    beforeImage?: string | null;
    afterImage?: string | null;
    workCost?: number | string;
    status: 'Draft' | 'Started' | 'In Progress' | 'Completed';
    createdAt?: string;
    updatedAt?: string;
    completedAt?: string;
}

export interface CreateCustomWorkRequest {
    clientId?: number | string;
    clientName?: string;
    machineId?: number | string;
    machineName?: string;
    workName: string;
    workLocation: string;
    latitude?: number | string;
    longitude?: number | string;
    beforeImage?: any;
    workCost?: number | string;
    status?: 'Draft' | 'Started' | 'In Progress' | 'Completed';
}

export interface CompleteCustomWorkRequest {
    id: number | string;
    afterImage?: any;
    workCost?: number | string;
    status?: 'Completed';
}

export const customWorkApi = createApi({
    reducerPath: 'customWorkApi',
    baseQuery,
    tagTypes: ['CustomWorks'],
    endpoints: (builder) => ({
        getCustomWorks: builder.query<{ success: boolean; data: CustomWork[]; customWorks?: CustomWork[] }, { status?: string; machineId?: string | number; operatorId?: string | number; from?: string; to?: string } | void>({
            query: (params) => {
                let url = '/custom-works';
                if (params) {
                    const queryParts: string[] = [];
                    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
                    if (params.machineId) queryParts.push(`machineId=${encodeURIComponent(String(params.machineId))}`);
                    if (params.operatorId) queryParts.push(`operatorId=${encodeURIComponent(String(params.operatorId))}`);
                    if (params.from) queryParts.push(`from=${encodeURIComponent(params.from)}`);
                    if (params.to) queryParts.push(`to=${encodeURIComponent(params.to)}`);
                    if (queryParts.length > 0) url += `?${queryParts.join('&')}`;
                }
                return url;
            },
            providesTags: ['CustomWorks'],
        }),
        getCustomWorkById: builder.query<{ success: boolean; data: CustomWork; customWork?: CustomWork }, number | string>({
            query: (id) => `/custom-works/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'CustomWorks', id }],
        }),
        createCustomWork: builder.mutation<{ success: boolean; message?: string; data?: CustomWork; customWork?: CustomWork }, FormData | CreateCustomWorkRequest>({
            query: (data) => ({
                url: '/custom-works',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['CustomWorks'],
        }),
        updateCustomWork: builder.mutation<{ success: boolean; message?: string; data?: CustomWork }, { id: number | string; data: Partial<CreateCustomWorkRequest> | FormData }>({
            query: ({ id, data }) => ({
                url: `/custom-works/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => ['CustomWorks', { type: 'CustomWorks', id }],
        }),
        completeCustomWork: builder.mutation<{ success: boolean; message?: string; data?: CustomWork }, { id: number | string; formData?: FormData; body?: any }>({
            query: ({ id, formData, body }) => ({
                url: `/custom-works/${id}/complete`,
                method: 'POST',
                body: formData || body,
            }),
            invalidatesTags: (_result, _error, { id }) => ['CustomWorks', { type: 'CustomWorks', id }],
        }),
    }),
});

export const {
    useGetCustomWorksQuery,
    useGetCustomWorkByIdQuery,
    useCreateCustomWorkMutation,
    useUpdateCustomWorkMutation,
    useCompleteCustomWorkMutation,
} = customWorkApi;
