import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getToken } from '@/lib/auth';

export const fetchMyBookings = createAsyncThunk(
    'bookings/fetchMyBookings',
    async (_, { getState, rejectWithValue }) => {
        try {
            // Check cache validity (e.g., 2 minutes)
            const { bookings, lastFetch } = getState().bookings;
            const now = Date.now();
            if (bookings.length > 0 && lastFetch && (now - lastFetch < 120000)) {
                return bookings;
            }

            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/mybookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch bookings');
            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async Thunk for Admin to fetch ALL bookings
export const fetchAllBookings = createAsyncThunk(
    'bookings/fetchAllBookings',
    async (_, { getState, rejectWithValue }) => {
        try {
            // Check cache validity (e.g., 2 minutes)
            const { adminBookings, lastAdminFetch } = getState().bookings;
            const now = Date.now();
            if (adminBookings.length > 0 && lastAdminFetch && (now - lastAdminFetch < 120000)) {
                return adminBookings;
            }

            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch all bookings');
            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const bookingSlice = createSlice({
    name: 'bookings',
    initialState: {
        bookings: [], // User's bookings
        adminBookings: [], // All bookings (Admin)
        currentBooking: null,
        status: 'idle',
        adminStatus: 'idle', // Separate status for admin fetch
        error: null,
        lastFetch: null,
        lastAdminFetch: null,
    },
    reducers: {
        invalidateBookings: (state) => {
            state.status = 'idle';
            state.lastFetch = null;
        },
        invalidateAdminBookings: (state) => {
            state.adminStatus = 'idle';
            state.lastAdminFetch = null;
        },
        setCurrentBooking: (state, action) => {
            state.currentBooking = action.payload;
        },
        // Optimistic Updates for Admin
        removeBookingFromAdmin: (state, action) => {
            state.adminBookings = state.adminBookings.filter(b => b._id !== action.payload);
        },
        updateBookingInAdmin: (state, action) => {
            const index = state.adminBookings.findIndex(b => b._id === action.payload._id);
            if (index !== -1) {
                state.adminBookings[index] = action.payload;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // User Bookings
            .addCase(fetchMyBookings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMyBookings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bookings = action.payload;
                state.lastFetch = Date.now();
            })
            .addCase(fetchMyBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Admin Bookings
            .addCase(fetchAllBookings.pending, (state) => {
                state.adminStatus = 'loading';
            })
            .addCase(fetchAllBookings.fulfilled, (state, action) => {
                state.adminStatus = 'succeeded';
                state.adminBookings = action.payload;
                state.lastAdminFetch = Date.now();
            })
            .addCase(fetchAllBookings.rejected, (state, action) => {
                state.adminStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const {
    invalidateBookings,
    invalidateAdminBookings,
    setCurrentBooking,
    removeBookingFromAdmin,
    updateBookingInAdmin
} = bookingSlice.actions;

export const selectAllBookings = (state) => state.bookings.bookings;
export const selectAdminBookings = (state) => state.bookings.adminBookings;
export const selectBookingStatus = (state) => state.bookings.status;
export const selectAdminBookingStatus = (state) => state.bookings.adminStatus;

export default bookingSlice.reducer;
