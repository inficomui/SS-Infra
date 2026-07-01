import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseQuery';

export interface TripEntry {
    id: number | string;
    customWorkId?: number | string;
    operatorId?: number;
    operatorName?: string;
    ownerId?: number;
    clientId?: number | string;
    clientName?: string;
    machineId?: number | string;
    machineName?: string;
    workName?: string;
    tripCount: number;
    costPerTrip: number;
    totalAmount: number;
    date?: string;
    createdAt?: string;
}

export interface CreateTripEntryRequest {
    customWorkId?: number | string;
    clientId?: number | string;
    clientName?: string;
    machineId?: number | string;
    machineName?: string;
    workName?: string;
    tripCount: number;
    costPerTrip: number;
    totalAmount: number;
    date?: string;
    entryDate?: string;
    entry_date?: string;
}

export const tripApi = createApi({
    reducerPath: 'tripApi',
    baseQuery,
    tagTypes: ['TripEntries'],
    endpoints: (builder) => ({
        getTripEntries: builder.query<{ success: boolean; data: TripEntry[]; tripEntries?: TripEntry[] }, { machineId?: string | number; operatorId?: string | number; customWorkId?: string | number; from?: string; to?: string } | void>({
            query: (params) => {
                let url = '/trip-entries';
                if (params) {
                    const queryParts: string[] = [];
                    if (params.machineId) queryParts.push(`machineId=${encodeURIComponent(String(params.machineId))}`);
                    if (params.operatorId) queryParts.push(`operatorId=${encodeURIComponent(String(params.operatorId))}`);
                    if (params.customWorkId) queryParts.push(`customWorkId=${encodeURIComponent(String(params.customWorkId))}`);
                    if (params.from) queryParts.push(`from=${encodeURIComponent(params.from)}`);
                    if (params.to) queryParts.push(`to=${encodeURIComponent(params.to)}`);
                    if (queryParts.length > 0) url += `?${queryParts.join('&')}`;
                }
                return url;
            },
            providesTags: ['TripEntries'],
        }),
        getTripEntryById: builder.query<{ success: boolean; data: TripEntry; tripEntry?: TripEntry }, number | string>({
            query: (id) => `/trip-entries/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'TripEntries', id }],
        }),
        createTripEntry: builder.mutation<{ success: boolean; message?: string; data?: TripEntry; tripEntry?: TripEntry }, CreateTripEntryRequest>({
            query: (data) => {
                const today = new Date().toISOString().split('T')[0];
                const payload = {
                    ...data,
                    date: data.date || data.entryDate || data.entry_date || today,
                    entryDate: data.entryDate || data.entry_date || data.date || today,
                    entry_date: data.entry_date || data.entryDate || data.date || today,
                };
                return {
                    url: '/trip-entries',
                    method: 'POST',
                    body: payload,
                };
            },
            invalidatesTags: ['TripEntries'],
        }),
    }),
});

export const {
    useGetTripEntriesQuery,
    useGetTripEntryByIdQuery,
    useCreateTripEntryMutation,
} = tripApi;
