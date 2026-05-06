import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getToken } from '@/lib/auth';

export const fetchAnalytics = createAsyncThunk(
    'analytics/fetchAnalytics',
    async (_, { getState, rejectWithValue }) => {
        try {
            // Check cache (5 minutes for analytics as it's heavy and slow)
            const { data, lastFetch } = getState().analytics;
            const now = Date.now();
            if (data && lastFetch && (now - lastFetch < 300000)) {
                return data;
            }

            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch analytics');
            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState: {
        data: null, // { stats, charts, recentActivity }
        status: 'idle',
        error: null,
        lastFetch: null,
    },
    reducers: {
        invalidateAnalytics: (state) => {
            state.status = 'idle';
            state.lastFetch = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnalytics.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAnalytics.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
                state.lastFetch = Date.now();
            })
            .addCase(fetchAnalytics.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { invalidateAnalytics } = analyticsSlice.actions;

export const selectAnalyticsData = (state) => state.analytics.data;
export const selectAnalyticsStatus = (state) => state.analytics.status;

export default analyticsSlice.reducer;
