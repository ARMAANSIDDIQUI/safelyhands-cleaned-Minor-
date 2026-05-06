"use client";

import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Calendar({ selected, onSelect, disabled, modifiers, modifiersStyles, className }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className={`p-4 w-full max-w-sm mx-auto bg-white rounded-lg ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={prevMonth}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="font-semibold text-lg text-slate-900">
                    {format(currentMonth, "MMMM yyyy")}
                </div>
                <button
                    onClick={nextMonth}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {weekDays.map(day => (
                    <div key={day} className="text-xs font-medium text-slate-500 uppercase tracking-wide py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1 place-items-center">
                {calendarDays.map((day, idx) => {
                    const isDisabled = disabled && disabled(day);
                    const isSelected = selected && isSameDay(day, selected);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    // Apply modifiers styles (e.g., present/absent colors)
                    let customStyle = {};
                    if (modifiers && modifiersStyles) {
                        for (const mod in modifiers) {
                            if (modifiers[mod](day)) {
                                customStyle = { ...customStyle, ...modifiersStyles[mod] };
                            }
                        }
                    }

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => !isDisabled && onSelect && onSelect(day)}
                            disabled={isDisabled}
                            style={customStyle}
                            className={`
                                w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all relative
                                ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                                ${isSelected ? 'ring-2 ring-primary ring-offset-1 z-10' : ''}
                                ${!isSelected && isToday && !customStyle.backgroundColor ? 'bg-slate-100 font-semibold' : ''}
                                ${!isDisabled && !isSelected ? 'hover:bg-slate-50' : ''}
                                ${isDisabled ? 'opacity-40 cursor-not-allowed text-slate-300' : ''}
                            `}
                        >
                            {format(day, "d")}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Compatibility export
export default Calendar;
