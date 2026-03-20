import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

// Types (mirrored from mobile/redux/apis/subscriptionApi.ts)
export interface Plan {
    id: number;
    name: string;
    type: string;
    durationDays?: number;
    price?: string | number; // API returns price as string e.g. "499.00"
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
    subscription?: Subscription; // For soft delete (status: 'cancelled')
    deletedSubscription?: { id: number; userId: number; userName: string }; // For hard delete
}

export interface GetUserSubscriptionsResponse {
    success: boolean;
    user: UserSummary;
    subscriptions: Subscription[];
    totalSubscriptions: number;
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
    status?: 'active' | 'expired' | 'cancelled';
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
            transformResponse: (response: GetAllSubscriptionsResponse) => {
                return response;
            },
        }),
        getUserSubscriptions: builder.query<GetUserSubscriptionsResponse, number>({
            query: (userId) => `/subscriptions/user/${userId}`,
            providesTags: (result, error, userId) => [{ type: 'UserSubscriptions', id: userId }],
            transformResponse: (response: GetUserSubscriptionsResponse) => {
                return response;
            },
        }),
        assignPlan: builder.mutation<AssignPlanResponse, AssignPlanRequest>({
            query: (body) => ({
                url: '/subscriptions/assign',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Subscriptions', 'UserSubscriptions'],
            transformResponse: (response: AssignPlanResponse) => {
                return response;
            },
        }),
        cancelSubscription: builder.mutation<CancelSubscriptionResponse, { id: number, softDelete?: boolean }>({
            query: ({ id, softDelete = false }) => ({
                url: `/subscriptions/${id}`,
                method: 'DELETE',
                body: { softDelete }, // softDelete goes in the request body, not query params
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
