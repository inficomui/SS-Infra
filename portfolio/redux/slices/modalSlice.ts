import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
    isBookingModalOpen: boolean;
    bookingTargetId: string | null;
    bookingTargetType: 'owner' | 'operator' | null;
    bookingTargetName: string | null;
}

const initialState: ModalState = {
    isBookingModalOpen: false,
    bookingTargetId: null,
    bookingTargetType: null,
    bookingTargetName: null,
};

export const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openBookingModal: (state, action: PayloadAction<{ id: string; type: 'owner' | 'operator'; name?: string }>) => {
            state.isBookingModalOpen = true;
            state.bookingTargetId = action.payload.id;
            state.bookingTargetType = action.payload.type;
            state.bookingTargetName = action.payload.name ?? null;
        },
        closeBookingModal: (state) => {
            state.isBookingModalOpen = false;
            state.bookingTargetId = null;
            state.bookingTargetType = null;
            state.bookingTargetName = null;
        }
    },
});

export const { openBookingModal, closeBookingModal } = modalSlice.actions;
export default modalSlice.reducer;
