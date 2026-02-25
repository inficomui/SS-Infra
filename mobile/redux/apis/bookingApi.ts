import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseQuery';

export interface Booking {
    id: number;
    user_id: number;
    owner_id: number;
    operator_id: number | null;
    machine_id: number | null;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    start_date: string;
    end_date: string;
    total_amount: string;
    location: string;
    remarks: string;
    created_at: string;
}

export const bookingApi = createApi({
    reducerPath: 'bookingApi',
    baseQuery,
    tagTypes: ['Bookings'],
    endpoints: (builder) => ({
        getBookings: builder.query<{ success: boolean; bookings: Booking[] }, void>({
            query: () => '/bookings',
            providesTags: ['Bookings'],
        }),
        getBookingDetails: builder.query<{ success: boolean; booking: Booking }, number>({
            query: (id) => `/bookings/${id}`,
            providesTags: (result, error, id) => [{ type: 'Bookings', id }],
        }),
        updateBookingStatus: builder.mutation<{ success: boolean; message: string; booking: Booking }, { id: number; status: string }>({
            query: ({ id, status }) => ({
                url: `/bookings/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, { id }) => ['Bookings', { type: 'Bookings', id }],
        }),
    }),
});

export const {
    useGetBookingsQuery,
    useGetBookingDetailsQuery,
    useUpdateBookingStatusMutation,
} = bookingApi;
