import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

// Types (mirrored from mobile/redux/apis/subscriptionApi.ts)
export interface Plan {
    id: number;
    name: string;
    type: string;
    durationDays?: number;
    price?: number;
    features?: string[];
}

export interface UserSummary {
    id: number;
    name: string;
    mobile: string;
    role: string;
}

export interface AdminSummary {
    id: number;
    name: string;
}

export interface Subscription {
    id: number;
    user?: UserSummary;
    userId?: number;
    plan: Plan;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
    daysRemaining: number;
    notes?: string;
    assignedBy?: AdminSummary;
    createdAt: string;
}

export interface AssignPlanRequest {
    userId: number;
    planId: number;
    startDate?: string;
    notes?: string;
}

export interface AssignPlanResponse {
    success: boolean;
    message: string;
    subscription: Subscription;
}

export interface CancelSubscriptionResponse {
    success: boolean;
    message: string;
    subscription?: Subscription;
    deletedSubscription?: { id: number; userId: number; userName: string };
}

export interface GetAllSubscriptionsResponse {
    success: boolean;
    subscriptions: Subscription[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

export interface GetAllSubscriptionsParams {
    status?: string;
    planId?: number;
    limit?: number;
    page?: number;
}

export const subscriptionApi = createApi({
    reducerPath: 'subscriptionApi',
    tagTypes: ['Subscriptions', 'UserSubscriptions'],
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    endpoints: (builder) => ({
        getAllSubscriptions: builder.query<GetAllSubscriptionsResponse, GetAllSubscriptionsParams>({
            query: (params) => ({
                url: '/subscriptions',
                params,
            }),
            providesTags: ['Subscriptions'],
        }),
        getUserSubscriptions: builder.query<{ success: boolean; user: UserSummary; subscriptions: Subscription[] }, number>({
            query: (userId) => `/subscriptions/user/${userId}`,
            providesTags: (result, error, userId) => [{ type: 'UserSubscriptions', id: userId }],
        }),
        assignPlan: builder.mutation<AssignPlanResponse, AssignPlanRequest>({
            query: (body) => ({
                url: '/subscriptions/assign',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Subscriptions', 'UserSubscriptions'],
        }),
        cancelSubscription: builder.mutation<CancelSubscriptionResponse, { id: number, softDelete?: boolean }>({
            query: ({ id, softDelete }) => ({
                url: `/subscriptions/${id}`,
                method: 'DELETE',
                params: { softDelete },
            }),
            invalidatesTags: ['Subscriptions', 'UserSubscriptions'],
        }),
    }),
})

export const {
    useGetAllSubscriptionsQuery,
    useGetUserSubscriptionsQuery,
    useAssignPlanMutation,
    useCancelSubscriptionMutation
} = subscriptionApi
