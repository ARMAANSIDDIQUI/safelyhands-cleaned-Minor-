"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTutorial } from '@/context/TutorialContext';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export default function TutorialOverlay() {
    const pathname = usePathname();
    const { isActive, currentStep, totalSteps, stepIndex, nextStep, prevStep, endTutorial } = useTutorial();
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        if (isActive && currentStep) {
            let retryCount = 0;
            const maxRetries = 10;

            const updatePosition = () => {
                const element = document.getElementById(currentStep.targetId);
                if (element) {
                    const rect = element.getBoundingClientRect();

                    // If element has no size, it might be hidden/animating
                    if (rect.width === 0 && retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(updatePosition, 100);
                        return;
                    }

                    setTargetRect({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                    });

                    // Scroll element into view if it's not well-visible
                    const isVisible = (
                        rect.top >= 0 &&
                        rect.bottom <= window.innerHeight
                    );

                    if (!isVisible) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Re-check position after scroll animation (approx)
                        setTimeout(() => {
                            const newRect = element.getBoundingClientRect();
                            setTargetRect({
                                top: newRect.top,
                                left: newRect.left,
                                width: newRect.width,
                                height: newRect.height,
                            });
                        }, 500);
                    }
                } else if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(updatePosition, 200);
                }
            };

            // Initial update
            updatePosition();

            // Additional update after a short delay to catch final layout
            const timer = setTimeout(updatePosition, 1000);

            // Update on resize
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, { passive: true });

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition);
                clearTimeout(timer);
            };
        }
    }, [isActive, currentStep, stepIndex, pathname]); // Re-run when step or path changes

    if (!isActive || !currentStep || !targetRect) return null;

    // Calculate tooltip position
    const tooltipStyle = {
        width: '320px',
        maxWidth: 'calc(100vw - 40px)',
    };
    const margin = 20;

    // Default to bottom if we can't fit anywhere else
    let pos = currentStep.position || 'bottom';

    // Desktop positioning
    if (pos === 'top') {
        const topPos = (targetRect.top - margin - 200); // 200 is approx height
        if (topPos < 10) pos = 'bottom'; // Flip to bottom if no space at top
    } else if (pos === 'bottom') {
        const bottomPos = (targetRect.top + targetRect.height + margin + 200);
        if (bottomPos > window.innerHeight - 10) pos = 'top'; // Flip to top if no space at bottom
    }

    // Simple adaptive positioning for narrow screens
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isMobile) {
        // On mobile, mostly center it or put it below/above
        tooltipStyle.left = '50%';
        tooltipStyle.transform = 'translateX(-50%)';

        if (pos === 'top') {
            tooltipStyle.bottom = (window.innerHeight - targetRect.top) + margin;
        } else {
            tooltipStyle.top = (targetRect.top + targetRect.height) + margin;
        }
    } else {
        // Desktop positioning
        if (pos === 'top') {
            tooltipStyle.bottom = (window.innerHeight - targetRect.top) + margin;
            tooltipStyle.left = targetRect.left + (targetRect.width / 2);
            tooltipStyle.transform = 'translateX(-50%)';
        } else if (pos === 'bottom') {
            tooltipStyle.top = (targetRect.top + targetRect.height) + margin;
            tooltipStyle.left = targetRect.left + (targetRect.width / 2);
            tooltipStyle.transform = 'translateX(-50%)';
        } else if (pos === 'left') {
            tooltipStyle.top = targetRect.top + (targetRect.height / 2);
            tooltipStyle.right = (window.innerWidth - targetRect.left) + margin;
            tooltipStyle.transform = 'translateY(-50%)';
        } else { // right
            tooltipStyle.top = targetRect.top + (targetRect.height / 2);
            tooltipStyle.left = (targetRect.left + targetRect.width) + margin;
            tooltipStyle.transform = 'translateY(-50%)';
        }
    }

    return (
        <div className="fixed inset-0 z-[10000] pointer-events-none">
            {/* Semi-transparent overlay with hole */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <mask id="hole">
                        <rect width="100%" height="100%" fill="white" />
                        <rect
                            x={targetRect.left - 5}
                            y={targetRect.top - 5}
                            width={targetRect.width + 10}
                            height={targetRect.height + 10}
                            rx="8"
                            fill="black"
                        />
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.6)"
                    mask="url(#hole)"
                />
                {/* Highlight border */}
                <rect
                    x={targetRect.left - 5}
                    y={targetRect.top - 5}
                    width={targetRect.width + 10}
                    height={targetRect.height + 10}
                    rx="8"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    className="animate-pulse"
                />
            </svg>

            {/* Tooltip Card */}
            <div
                className="absolute pointer-events-auto bg-white p-6 rounded-xl shadow-2xl w-[320px] max-w-[90vw] animate-in fade-in zoom-in duration-300"
                style={tooltipStyle}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step {stepIndex + 1} of {totalSteps}</span>
                    <button onClick={endTutorial} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{currentStep.title}</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    {currentStep.content}
                </p>

                <div className="flex justify-between items-center">
                    {stepIndex > 0 ? (
                        <Button variant="outline" size="sm" onClick={prevStep} className="flex items-center gap-1">
                            <ChevronLeft size={14} /> Back
                        </Button>
                    ) : (
                        <div></div>
                    )}

                    {!currentStep.disableNext && (
                        <Button size="sm" onClick={nextStep} className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700">
                            {stepIndex === totalSteps - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
