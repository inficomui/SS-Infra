import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseQuery';

export interface Booking {
    id: number;
    target_id: number;
    target_type: 'owner' | 'operator';
    client_name: string;
    mobile: string;
    message?: string;
    location_district?: string;
    location_taluka?: string;
    date_of_requirement?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'assigned' | 'cancelled';
    assigned_operator_id?: number | null;
    total_amount?: string;
    created_at: string;

    // Eager-loaded relationships if available
    target?: any;
    assigned_operator?: any;
    machine?: {
        name: string;
        model?: string;
    };
}

export const bookingApi = createApi({
    reducerPath: 'bookingApi',
    baseQuery,
    tagTypes: ['Bookings'],
    endpoints: (builder) => ({
        getBookings: builder.query<{ success: boolean; data: { current_page: number, data: Booking[], total: number } }, void>({
            query: () => '/bookings',
            providesTags: ['Bookings'],
        }),
        getBookingDetails: builder.query<{ success: boolean; enquiry: Booking }, number>({
            query: (id) => `/bookings/${id}`,
            providesTags: (result, error, id) => [{ type: 'Bookings', id }],
        }),
        updateBookingStatus: builder.mutation<{ success: boolean; message: string; enquiry: Booking }, { id: number; status: string }>({
            query: ({ id, status }) => ({
                url: `/bookings/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, { id }) => ['Bookings', { type: 'Bookings', id }],
        }),
        assignOperator: builder.mutation<{ success: boolean; message: string; enquiry: Booking }, { id: number; operator_id: number }>({
            query: ({ id, operator_id }) => ({
                url: `/bookings/${id}/assign`,
                method: 'POST',
                body: { operatorId: operator_id },
            }),
            invalidatesTags: (result, error, { id }) => ['Bookings', { type: 'Bookings', id }],
        }),
    }),
});

export const {
    useGetBookingsQuery,
    useGetBookingDetailsQuery,
    useUpdateBookingStatusMutation,
    useAssignOperatorMutation,
} = bookingApi;
