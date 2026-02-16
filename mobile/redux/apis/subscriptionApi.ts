import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

// Types
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
    userId?: number; // In case user object is not returned in some responses
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
    subscription?: Subscription; // For soft delete
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

// API Definition
export const subscriptionApi = createApi({
    reducerPath: 'subscriptionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: CONFIG.API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Subscriptions', 'UserSubscriptions'],
    endpoints: (builder) => ({
        // 1. Assign Plan to User (Admin Only)
        assignPlan: builder.mutation<AssignPlanResponse, AssignPlanRequest>({
            query: (data) => ({
                url: '/subscriptions/assign',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Subscriptions', 'UserSubscriptions'],
        }),

        // 2. Cancel/Delete Subscription (Admin Only)
        cancelSubscription: builder.mutation<CancelSubscriptionResponse, { id: number; softDelete?: boolean }>({
            query: ({ id, softDelete = false }) => ({
                url: `/subscriptions/${id}`,
                method: 'DELETE',
                params: { softDelete },
            }),
            invalidatesTags: ['Subscriptions', 'UserSubscriptions'],
        }),

        // 3. Get User's Subscriptions (Admin Only)
        getUserSubscriptions: builder.query<GetUserSubscriptionsResponse, number>({
            query: (userId) => `/subscriptions/user/${userId}`,
            providesTags: (result, error, userId) => [{ type: 'UserSubscriptions', id: userId }],
        }),

        // 4. Get All Subscriptions (Admin Only) with filtering
        getAllSubscriptions: builder.query<GetAllSubscriptionsResponse, GetAllSubscriptionsParams>({
            query: (params) => ({
                url: '/subscriptions',
                params,
            }),
            providesTags: ['Subscriptions'],
        }),
    }),
});

export const {
    useAssignPlanMutation,
    useCancelSubscriptionMutation,
    useGetUserSubscriptionsQuery,
    useGetAllSubscriptionsQuery,
} = subscriptionApi;
