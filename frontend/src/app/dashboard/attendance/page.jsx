"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { format, isSameDay, isWithinInterval, addDays, getDay } from "date-fns";
import { Calendar as CalendarIcon, Check, X, ClipboardList, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyBookings, selectAllBookings, selectBookingStatus } from "@/store/slices/bookingSlice";
import {
    fetchBookingAttendance,
    selectAttendanceData,
    invalidateAttendance,
    fetchAttendanceOverview,
    selectAttendanceOverview,
    selectAttendanceOverviewStatus
} from "@/store/slices/attendanceSlice";

export default function AttendancePage() {
    // Redux
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const dispatch = useAppDispatch();
    const bookings = useAppSelector(selectAllBookings);
    const bookingsStatus = useAppSelector(selectBookingStatus);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [marking, setMarking] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    // Attendance Data from Redux
    const attendanceData = useAppSelector(selectAttendanceData(selectedBooking?._id));
    const validDates = attendanceData?.validDates?.map(d => new Date(d)) || [];
    const history = attendanceData?.markedDates || [];

    // Overview Data
    const overview = useAppSelector(selectAttendanceOverview);
    const overviewStatus = useAppSelector(selectAttendanceOverviewStatus);

    useEffect(() => {
        if (overviewStatus === 'idle') {
            dispatch(fetchAttendanceOverview());
        }
    }, [overviewStatus, dispatch]);

    useEffect(() => {
        if (bookingsStatus === 'idle') {
            dispatch(fetchMyBookings());
        }
    }, [bookingsStatus, dispatch]);

    useEffect(() => {
        if (bookings.length > 0 && !selectedBooking) {
            setSelectedBooking(bookings[0]);
        }
    }, [bookings, selectedBooking]);

    useEffect(() => {
        if (selectedBooking) {
            dispatch(fetchBookingAttendance(selectedBooking._id));
        }
    }, [selectedBooking, dispatch]);

    // Removed local fetchBookings and fetchBookingDetails functions as they are replaced by Redux


    // fetchBookingDetails replaced by Redux dispatch


    const handleMarkAttendance = async (status) => {
        if (!selectedBooking) return;

        try {
            setMarking(true);
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking: selectedBooking._id,
                    status,
                    date: calendarDate
                }),
                cache: 'no-store'
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Marked as ${status}`);
                // Refresh data via Redux
                dispatch(invalidateAttendance(selectedBooking._id));
                dispatch(fetchBookingAttendance(selectedBooking._id));
                dispatch(fetchAttendanceOverview()); // Refresh overview as well
            } else {
                toast.error(data.message || "Failed to mark attendance");
            }
        } catch (error) {
            console.error("Error marking attendance:", error);
            toast.error("Failed to mark attendance");
        } finally {
            setMarking(false);
        }
    };

    const handleQuickMark = async (bookingId, status) => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking: bookingId,
                    status,
                    date: new Date() // Always today for quick mark
                })
            });

            if (res.ok) {
                toast.success(`Marked as ${status}`);
                dispatch(fetchAttendanceOverview());
                // If the quick-marked booking is currently selected, refresh its details too
                if (selectedBooking && selectedBooking._id === bookingId) {
                    dispatch(invalidateAttendance(bookingId));
                    dispatch(fetchBookingAttendance(bookingId));
                }
            } else {
                toast.error("Failed to mark attendance");
            }
        } catch (error) {
            console.error("Error marking attendance:", error);
            toast.error("Failed to mark attendance");
        }
    };

    // Custom modifier for calendar to disable invalid dates
    const isDateDisabled = (date) => {
        if (selectedBooking?.serviceStatus !== 'active') return true;

        // Check if date is in validDates array
        const isValid = validDates.some(validDate =>
            isSameDay(new Date(validDate), date)
        );

        return !isValid;
    };

    // Get attendance status for a specific date
    const getDateStatus = (date) => {
        if (!history || history.length === 0) return null;

        const dateStr = new Date(date).toISOString().split('T')[0];
        const record = history.find(h => {
            const hDateStr = new Date(h.date).toISOString().split('T')[0];
            return hDateStr === dateStr;
        });
        return record ? record.status : null;
    };

    if (bookingsStatus === 'loading') {
        return <AttendanceSkeleton />;
    }

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <ClipboardList className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Active Bookings</h3>
                <p className="text-muted-foreground max-w-sm">
                    You don't have any approved bookings to mark attendance for.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
                    <p className="text-muted-foreground">Mark daily attendance for your workers</p>
                </div>

                <Select
                    value={selectedBooking?._id}
                    onValueChange={(val) => setSelectedBooking(bookings.find(b => b._id === val))}
                >
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Select booking" />
                    </SelectTrigger>
                    <SelectContent>
                        {bookings.map(booking => (
                            <SelectItem key={booking._id} value={booking._id}>
                                {booking.serviceType} - {booking.assignedWorker?.name || "Unassigned"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {
                overviewStatus === 'succeeded' && overview.some(b => b.canMarkToday && !b.todayStatus) && (
                    <Card className="mb-8 border-blue-100 bg-blue-50/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                                <AlertCircle className="w-5 h-5" />
                                Pending Attendance (Today)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {overview.filter(b => b.canMarkToday && !b.todayStatus).map(booking => (
                                    <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border shadow-sm">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{booking.serviceType}</h4>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{booking.assignedWorker?.name || "Assigning..."}</span>
                                                <span>•</span>
                                                <span>Day {booking.totalValidDays > 0 ? Math.min(booking.markedDays + 1, 30) : 1} of 30</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            <Button
                                                size="sm"
                                                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleQuickMark(booking._id, 'present')}
                                            >
                                                <Check className="mr-2 w-4 h-4" /> Present
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                                onClick={() => handleQuickMark(booking._id, 'absent')}
                                            >
                                                <X className="mr-2 w-4 h-4" /> Absent
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Attendance for Selected Date</span>
                            <Badge variant={selectedBooking?.serviceStatus === 'active' ? "outline" : "secondary"}>
                                {selectedBooking?.serviceStatus === 'active' ? (
                                    <span className="flex items-center gap-1 text-green-600">
                                        <Clock className="w-3 h-3" /> Active Service
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-slate-500">
                                        <X className="w-3 h-3" /> Service Ended
                                    </span>
                                )}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {format(calendarDate, "EEEE, dd-MM-yyyy")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Logic for Selected Date */
                            (() => {
                                const isFutureDate = calendarDate > new Date();
                                const isToday = isSameDay(calendarDate, new Date());
                                const dateStatus = getDateStatus(calendarDate);
                                const isValidDate = validDates.some(d => isSameDay(d, calendarDate));

                                // Admins can mark any date within the start/end range, even if validDates logic (e.g. days off) says no
                                // But for now, let's stick to valid dates logic unless specific override requested. 
                                // Actually, user asked "admins can edit old attendances", implying correction.
                                // Let's allow admins to mark ONLY if it's within the overall booking period, effectively overriding "validDays" if needed?
                                // For safety, let's stick to valid dates first, but maybe relax checking for Past dates?
                                // Let's just use the isValidDate check for everyone for now to ensure we don't mark non-working days.

                                if (!isValidDate && !isAdmin) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-xl bg-slate-50">
                                            <CalendarIcon className="w-10 h-10 text-slate-300 mb-2" />
                                            <h4 className="font-semibold text-slate-900">No Attendance Required</h4>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {format(calendarDate, "MMM do")} is not a scheduled service day.
                                            </p>
                                        </div>
                                    );
                                }

                                if (isFutureDate && !isToday) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-xl bg-slate-50">
                                            <Clock className="w-10 h-10 text-slate-300 mb-2" />
                                            <h4 className="font-semibold text-slate-900">Future Date</h4>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {isAdmin ? "Admins can edit future dates if needed." : "You cannot mark attendance for future dates."}
                                            </p>
                                            {isAdmin && (
                                                <div className="flex gap-4 mt-4">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleMarkAttendance('present')}
                                                        disabled={marking}
                                                    >
                                                        <Check className="mr-2 w-3 h-3" /> Mark Present
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleMarkAttendance('absent')}
                                                        disabled={marking}
                                                    >
                                                        <X className="mr-2 w-3 h-3" /> Mark Absent
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                if (dateStatus) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-xl bg-slate-50">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${dateStatus === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {dateStatus === 'present' ? <Check size={24} /> : <X size={24} />}
                                            </div>
                                            <h4 className="font-semibold text-lg">
                                                Marked as {dateStatus === 'present' ? 'Present' : 'Absent'}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Attendance for {format(calendarDate, "dd-MM-yyyy")} has been recorded.
                                            </p>

                                            {isAdmin && (
                                                <div className="flex flex-col gap-2 w-full max-w-xs">
                                                    <div className="text-xs text-center text-muted-foreground uppercase tracking-wider font-semibold">Admin Override</div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 border-green-200 hover:bg-green-50 text-green-700"
                                                            onClick={() => handleMarkAttendance('present')}
                                                            disabled={marking || dateStatus === 'present'}
                                                        >
                                                            Change to Present
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 border-red-200 hover:bg-red-50 text-red-700"
                                                            onClick={() => handleMarkAttendance('absent')}
                                                            disabled={marking || dateStatus === 'absent'}
                                                        >
                                                            Change to Absent
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // If valid, past/today, and not marked:
                                return (
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-600">
                                            Was <strong>{selectedBooking?.assignedWorker?.name}</strong> present on {format(calendarDate, "dd-MM-yyyy")}?
                                        </p>
                                        <div className="flex gap-4">
                                            <Button
                                                size="lg"
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleMarkAttendance('present')}
                                                disabled={marking}
                                            >
                                                <Check className="mr-2 w-4 h-4" /> Present
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => handleMarkAttendance('absent')}
                                                disabled={marking}
                                            >
                                                <X className="mr-2 w-4 h-4" /> Absent
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })()}
                    </CardContent>
                </Card>

                {/* Stats Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedBooking?.frequency !== 'Daily' && (
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-slate-500">Frequency</span>
                                <span className="font-medium">{selectedBooking?.frequency}</span>
                            </div>
                        )}
                        {selectedBooking?.frequency === 'Weekly' && (
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-slate-500">Days</span>
                                <span className="font-medium">
                                    {selectedBooking?.weeklyDays?.map(d =>
                                        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
                                    ).join(', ')}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-sm text-slate-500">Start Date</span>
                            <span className="font-medium">
                                {selectedBooking?.startDate ? format(new Date(selectedBooking.startDate), 'dd-MM-yyyy') : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-sm text-slate-500">
                                {selectedBooking?.frequency === 'Daily' ? 'Renews On' : 'End Date'}
                            </span>
                            <span className="font-medium">
                                {selectedBooking?.endDate ? format(new Date(selectedBooking.endDate), 'dd-MM-yyyy') : 'N/A'}
                            </span>
                        </div>

                        {/* CORRECTED: Get stats from overview data */}
                        {(() => {
                            const bookingStats = overview.find(b => b._id === selectedBooking?._id);
                            return (
                                <div className="pt-2 grid grid-cols-2 gap-2">
                                    <div className="bg-green-50 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {bookingStats ? bookingStats.presentDays : 0}
                                        </div>
                                        <div className="text-xs text-green-700 font-medium">Present</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {bookingStats ? bookingStats.absentDays : 0}
                                        </div>
                                        <div className="text-xs text-red-700 font-medium">Absent</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>

            {/* Calendar View */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                    <CardDescription>View past attendance records</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-4 md:p-6 overflow-x-auto">
                    <Calendar
                        mode="single"
                        selected={calendarDate}
                        onSelect={setCalendarDate}
                        disabled={isDateDisabled}
                        modifiers={{
                            present: (date) => getDateStatus(date) === 'present',
                            absent: (date) => getDateStatus(date) === 'absent',
                        }}
                        modifiersStyles={{
                            present: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' },
                            absent: { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' },
                        }}
                        className="rounded-md border shadow-sm"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function AttendanceSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-[280px]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-[300px] md:col-span-2 rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
            </div>
            <Skeleton className="h-[400px] rounded-xl" />
        </div>
    );
}
