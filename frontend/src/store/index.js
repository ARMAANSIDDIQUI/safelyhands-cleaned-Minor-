import { configureStore } from '@reduxjs/toolkit';

import serviceReducer from './slices/serviceSlice';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import attendanceReducer from './slices/attendanceSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
    reducer: {
        services: serviceReducer,
        auth: authReducer,
        bookings: bookingReducer,
        attendance: attendanceReducer,
        analytics: analyticsReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});
