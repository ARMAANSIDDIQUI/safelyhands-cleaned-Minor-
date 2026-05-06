import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getToken } from '@/lib/auth';

// Thunk to fetch services
export const fetchServices = createAsyncThunk(
    'services/fetchServices',
    async (_, { getState, rejectWithValue }) => {
        try {
            // Basic caching: If data exists and is fresh (< 5 mins), return existing
            const { services } = getState().services;
            const lastFetch = getState().services.lastFetch;
            const now = Date.now();

            if (services.length > 0 && lastFetch && (now - lastFetch < 300000)) {
                return services;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
            if (!res.ok) throw new Error('Failed to fetch services');
            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const serviceSlice = createSlice({
    name: 'services',
    initialState: {
        services: [],
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
        lastFetch: null,
    },
    reducers: {
        invalidateServices: (state) => {
            state.status = 'idle';
            state.lastFetch = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServices.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                // If the payload is the existing state (cache hit logic in thunk might return state), handle carefully.
                // Actually, thunk returns the data.
                // Check if we returned existing state from thunk? 
                // No, thunk returns the array.

                // Wait, if thunk returns existing services from cache, it comes here as user-returned value.
                // But if I return `services` from thunk, `action.payload` is `services`.
                // So we just update.
                // Optimization: Only update if payload is different or we forced fetch.
                // For now, simpler:
                state.status = 'succeeded';
                state.services = action.payload;
                state.lastFetch = Date.now();
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { invalidateServices } = serviceSlice.actions;

export const selectAllServices = (state) => state.services.services;
export const selectServiceStatus = (state) => state.services.status;
export const selectServiceError = (state) => state.services.error;

export default serviceSlice.reducer;
