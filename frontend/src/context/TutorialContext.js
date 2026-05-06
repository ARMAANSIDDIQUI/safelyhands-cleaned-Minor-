"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const TutorialContext = createContext();

const STEPS = [
    {
        id: 'welcome-step',
        targetId: 'hero-title',
        path: '/',
        title: 'Welcome to Safely Hands',
        content: 'Your trusted partner for home makers in Moradabad. Let us show you around!',
        position: 'bottom'
    },
    {
        id: 'booking-start-step',
        targetId: 'hero-book-btn',
        path: '/',
        title: 'Ready to Book?',
        content: 'Click "Book Now" to start the booking process!',
        position: 'bottom',
        disableNext: true // User must click the button to proceed
    },
    {
        id: 'booking-city-step',
        targetId: 'booking-city-select',
        path: '/booking?step=1',
        title: 'Select Your City',
        content: 'Choose your city from the dropdown, then click the "Next" button at the bottom to continue.',
        position: 'bottom'
    },
    {
        id: 'booking-service-step',
        targetId: 'booking-service-heading',
        path: '/booking?step=2',
        title: 'Choose a Service',
        content: 'Click on a service card to select it, then click the "Next" button to proceed.',
        position: 'bottom'
    },
    {
        id: 'booking-subcategory-step',
        targetId: 'booking-options-header',
        path: '/booking?step=3',
        title: 'Customize Your Package',
        content: 'Add services to your cart by clicking the + button, then click the \"Next\" button at the bottom.',
        position: 'bottom'
    },
    {
        id: 'booking-form-step',
        targetId: 'booking-address',
        path: '/booking?step=4',
        title: 'Fill Details',
        content: 'Fill in all the required details (Date, Time, Address) to complete your booking.',
        position: 'bottom'
    },
    {
        id: 'booking-submit-step',
        targetId: 'booking-submit-btn',
        path: '/booking?step=4',
        title: 'Confirm Your Booking',
        content: 'Review all your details and click "Confirm Booking" to complete!',
        position: 'top'
    },
    {
        id: 'dashboard-step',
        targetId: 'dashboard-stats',
        path: '/dashboard',
        title: 'Your Dashboard',
        content: 'Monitor your bookings, track worker attendance, and manage your profile here.',
        position: 'bottom'
    },
    {
        id: 'attendance-step',
        targetId: 'desktop-nav-item-attendance',
        path: '/dashboard',
        title: 'Worker Attendance',
        content: 'Click here to view and mark attendance logs for your workers.',
        position: 'right'
    }
];

export function TutorialProvider({ children }) {
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const isAdvancingRef = useRef(false); // Prevent rapid multiple advances
    const router = useRouter();
    const pathname = usePathname();
    const auth = useAuth();
    const user = auth ? auth.user : null;

    const startTutorial = () => {
        if (!user) {
            toast.error('Please login to start the guided tour!');
            router.push('/login');
            return;
        }
        setIsActive(true);
        setCurrentStepIndex(0);
        // Navigate to first step if needed
        if (pathname !== STEPS[0].path) {
            router.push(STEPS[0].path);
        }
    };

    const endTutorial = () => {
        setIsActive(false);
        setCurrentStepIndex(0);
    };

    const nextStep = () => {
        if (currentStepIndex < STEPS.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);

            // Handle navigation
            if (STEPS[nextIndex].path !== pathname) {
                router.push(STEPS[nextIndex].path);
            }
        } else {
            endTutorial();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            const prevIndex = currentStepIndex - 1;
            setCurrentStepIndex(prevIndex);

            // Handle navigation
            if (STEPS[prevIndex].path !== pathname) {
                router.push(STEPS[prevIndex].path);
            }
        }
    };

    // Auto-navigate logic
    useEffect(() => {
        if (isActive && !isAdvancingRef.current) {
            const currentStepPath = STEPS[currentStepIndex].path;

            // Build current URL from pathname
            const currentUrl = typeof window !== 'undefined' ? pathname + window.location.search : pathname;

            // Check if user has navigated to the NEXT step's path
            if (currentStepIndex < STEPS.length - 1) {
                const nextStepPath = STEPS[currentStepIndex + 1].path;
                const nextStepBasePath = nextStepPath.split('?')[0]; // e.g., '/booking' from '/booking?step=1'

                // Check if user navigated to next step (exact match or base path match)
                const isOnNextStep = currentUrl === nextStepPath || pathname === nextStepBasePath;
                const pathsAreDifferent = nextStepPath !== currentStepPath;

                if (isOnNextStep && pathsAreDifferent) {
                    // Set flag to prevent rapid multiple advances
                    isAdvancingRef.current = true;

                    // Advance to next step
                    setCurrentStepIndex(currentStepIndex + 1);

                    // If they're on base path but next step needs query params, redirect
                    if (pathname === nextStepBasePath && nextStepPath.includes('?') && currentUrl !== nextStepPath) {
                        router.push(nextStepPath);
                    }

                    // Reset flag after a short delay
                    setTimeout(() => {
                        isAdvancingRef.current = false;
                    }, 500);

                    return;
                }
            }

            // Enforce current path if we're off-track (but not if we just advanced)
            if (currentUrl !== currentStepPath) {
                const currentBasePath = currentStepPath.split('?')[0];
                // Don't redirect if we're on the right base path (query params might be loading)
                if (pathname !== currentBasePath) {
                    router.push(currentStepPath);
                }
            }
        }
    }, [isActive, currentStepIndex, pathname, router]);

    return (
        <TutorialContext.Provider value={{
            isActive,
            currentStep: STEPS[currentStepIndex],
            totalSteps: STEPS.length,
            stepIndex: currentStepIndex,
            startTutorial,
            endTutorial,
            nextStep,
            prevStep
        }}>
            {children}
        </TutorialContext.Provider>
    );
}

export const useTutorial = () => useContext(TutorialContext);
