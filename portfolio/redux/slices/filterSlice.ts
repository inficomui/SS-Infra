import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
    selectedDistrict: string;
    selectedTaluka: string;
    searchQuery: string;
}

const initialState: FilterState = {
    selectedDistrict: '',
    selectedTaluka: '',
    searchQuery: '',
};

export const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setDistrict: (state, action: PayloadAction<string>) => {
            state.selectedDistrict = action.payload;
            state.selectedTaluka = ''; // Reset taluka when district changes
        },
        setTaluka: (state, action: PayloadAction<string>) => {
            state.selectedTaluka = action.payload;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        resetFilters: (state) => {
            state.selectedDistrict = '';
            state.selectedTaluka = '';
            state.searchQuery = '';
        }
    },
});

export const { setDistrict, setTaluka, setSearchQuery, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
