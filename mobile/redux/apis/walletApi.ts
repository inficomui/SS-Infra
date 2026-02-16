import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

export interface Wallet {
    balance: string;
    currency: string;
}

export interface Transaction {
    id: number;
    amount: string;
    type: 'credit' | 'debit';
    category: string;
    description: string;
    createdAt: string;
    payment_date?: string;
    paymentDate?: string;
}

export interface PaginationMetadata {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

export interface WalletResponse {
    success: boolean;
    wallet: Wallet;
    transactions: Transaction[];
    pagination: PaginationMetadata;
}

export interface BankDetails {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    holderName: string;
}

export interface WithdrawalRequestPayload {
    amount: number;
    bankDetails: BankDetails;
}

export interface WithdrawalResponse {
    success: boolean;
    message: string;
    withdrawal: {
        id: number;
        amount: string;
        status: string;
        createdAt: string;
    };
}

export interface WithdrawalHistoryItem {
    id: number;
    amount: string;
    status: 'pending' | 'approved' | 'rejected';
    adminNote?: string | null;
    createdAt: string;
}

export interface WithdrawalHistoryResponse {
    success: boolean;
    withdrawals: WithdrawalHistoryItem[];
    pagination: PaginationMetadata;
}

// Define the API service
export const walletApi = createApi({
    reducerPath: 'walletApi',
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
    tagTypes: ['Wallet'],
    endpoints: (builder) => ({
        // Get Wallet Balance & History
        getWallet: builder.query<WalletResponse, { page?: number } | void>({
            query: (params) => {
                const page = typeof params === 'object' ? params?.page : undefined;
                return `/wallet${page ? `?page=${page}` : ''}`;
            },
            providesTags: ['Wallet'],
        }),
        // Request Withdrawal
        requestWithdrawal: builder.mutation<WithdrawalResponse, WithdrawalRequestPayload>({
            query: (data) => ({
                url: '/wallet/withdraw',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Wallet'],
        }),
        // Get Withdrawal History
        getWithdrawals: builder.query<WithdrawalHistoryResponse, { page?: number } | void>({
            query: (params) => {
                const page = typeof params === 'object' ? params?.page : undefined;
                return `/wallet/withdrawals${page ? `?page=${page}` : ''}`;
            },
            providesTags: ['Wallet'],
        }),
        // Get My Salary/Payment History (For Operator)
        getMyPayments: builder.query<any, { page?: number; month?: number; year?: number; startDate?: string; endDate?: string } | void>({
            queryFn: async (params, { getState }, _extraOptions, baseQuery) => {
                // Get operator ID from auth state
                const state = getState() as any;
                const operatorId = state.auth.user?.id;

                if (!operatorId) {
                    return { error: { status: 'CUSTOM_ERROR', error: 'Operator ID not found in auth state' } };
                }

                const queryParams = new URLSearchParams();

                if (params && typeof params === 'object') {
                    const { page, month, year, startDate, endDate } = params;
                    if (page) queryParams.append('page', page.toString());
                    if (month) queryParams.append('month', month.toString());
                    if (year) queryParams.append('year', year.toString());
                    if (startDate) queryParams.append('startDate', startDate);
                    if (endDate) queryParams.append('endDate', endDate);
                }

                const queryString = queryParams.toString();
                const url = `/operators/${operatorId}/payments${queryString ? `?${queryString}` : ''}`;

                const result = await baseQuery(url);
                return result.data ? { data: result.data } : { error: result.error };
            },
            providesTags: ['Wallet'],
        }),
        // Get Subscription/Business Plans
        getPlans: builder.query<{ success: boolean; plans: any[] }, void>({
            query: () => '/plans',
        }),
        // Create Razorpay Order
        createSubscriptionOrder: builder.mutation<{ success: boolean; order_id: string; amount: number; currency: string; key: string; plan_name: string; user_email: string; user_mobile: string; user_name: string }, { planId: string; billingCycle: 'monthly' | 'yearly' }>({
            query: ({ planId, billingCycle }) => ({
                url: `/plans/${planId}/purchase/initiate`,
                method: 'POST',
                body: { billingCycle },
            }),
        }),
        // Verify Razorpay Payment
        verifySubscriptionPayment: builder.mutation<{ success: boolean; message: string }, { planId: string; razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }>({
            query: ({ planId, ...data }) => ({
                url: `/plans/${planId}/purchase/verify`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Wallet'],
        }),
    }),
});


export const {
    useGetWalletQuery,
    useRequestWithdrawalMutation,
    useGetWithdrawalsQuery,
    useGetMyPaymentsQuery,
    useGetPlansQuery,
    useCreateSubscriptionOrderMutation,
    useVerifySubscriptionPaymentMutation,
} = walletApi;
