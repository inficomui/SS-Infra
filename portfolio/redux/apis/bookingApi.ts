import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './locationApi';

export interface BookingPayload {
    targetId: string;
    targetType: 'owner' | 'operator';
    clientName: string;
    mobile: string;
    /**
     * Short-lived OTP verification token returned by /auth/verify-otp.
     * Required so the backend can guarantee the mobile number is validated.
     */
    otpToken: string;
    message?: string;
    locationDistrict?: string;
    locationTaluka?: string;
    dateOfRequirement?: string;
}

export interface BookingResponse {
    success: boolean;
    message: string;
    bookingId?: string;
    /**
     * Notification status: whether FCM push was sent to the target (owner/operator).
     */
    notificationSent?: boolean;
}

export interface Enquiry {
    id: number;
    target_id: number;
    target_type: 'owner' | 'operator';
    client_name: string;
    mobile: string;
    message?: string;
    location_district?: string;
    location_taluka?: string;
    date_of_requirement?: string;
    status: 'pending' | 'assigned' | 'completed' | 'cancelled';
    assigned_operator_id?: number | null;
    created_at: string;
    target?: any;
    assigned_operator?: any;
}

export interface EnquiriesResponse {
    success: boolean;
    data: {
        current_page: number;
        data: Enquiry[];
        total: number;
    };
}

export const bookingApi = createApi({
    reducerPath: 'bookingApi',
    baseQuery,
    endpoints: (builder) => ({
        createBooking: builder.mutation<BookingResponse, BookingPayload>({
            query: (body) => ({
                url: '/enquiry/create',
                method: 'POST',
                body: {
                    targetId: body.targetId,
                    targetType: body.targetType,
                    clientName: body.clientName,
                    clientMobile: body.mobile,
                    otpToken: body.otpToken,
                    message: body.message,
                    locationDistrict: body.locationDistrict,
                    locationTaluka: body.locationTaluka,
                    dateOfRequirement: body.dateOfRequirement,
                },
            }),
        }),
        getEnquiries: builder.query<EnquiriesResponse, { status?: string }>({
            query: (params) => ({
                url: '/enquiries',
                method: 'GET',
                params,
            }),
        }),
    }),
});

export const { useCreateBookingMutation, useGetEnquiriesQuery } = bookingApi;
