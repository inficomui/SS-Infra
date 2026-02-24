import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './locationApi';

export interface DiscoveryResponse<T> {
    success: boolean;
    data: {
        current_page: number;
        data: T[];
        total: number;
    };
}

export interface Owner {
    id: number;
    name: string;
    company_name: string;
    district: string;
    taluka: string;
    profile_photo?: string;
    avatar?: string;
    machinesCount?: number;
    operatorCount?: number;
    created_at: string;
}

export interface Operator {
    id: number;
    name: string;
    district: string;
    taluka: string;
    status: 'active' | 'inactive' | 'online' | 'busy';
    avatar?: string;
    rating?: number;
    experience?: string;
    created_at: string;
}

export const discoveryApi = createApi({
    reducerPath: 'discoveryApi',
    baseQuery,
    endpoints: (builder) => ({
        getOwners: builder.query<DiscoveryResponse<Owner>, { page?: number; district?: string; taluka?: string; search?: string; limit?: number }>({
            query: (params) => ({
                url: '/discovery/owners',
                params,
            }),
        }),
        getOperators: builder.query<DiscoveryResponse<Operator>, { page?: number; district?: string; taluka?: string; search?: string; status?: string; limit?: number }>({
            query: (params) => ({
                url: '/discovery/operators',
                params,
            }),
        }),
        getNearMe: builder.query<any, { lat: number; lng: number; radius: number }>({
            query: (params) => ({
                url: '/discovery/near-me',
                params,
            }),
        }),
        recordSearchLead: builder.mutation<any, { district: string; taluka?: string; searchQuery?: string }>({
            query: (body) => ({
                url: '/discovery/search-lead',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useGetOwnersQuery, useGetOperatorsQuery, useGetNearMeQuery, useRecordSearchLeadMutation } = discoveryApi;
