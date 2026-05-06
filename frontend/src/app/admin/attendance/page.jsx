"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Calendar, User, Briefcase, FileText, Search, Download, Clock, MapPin, History, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { isSameDay } from "date-fns";
import { getToken } from "@/lib/auth";

export default function AdminAttendancePage() {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        workerId: "",
        serviceType: "",
        startDate: new Date().toLocaleDateString('en-CA'),
        endDate: new Date().toLocaleDateString('en-CA')
    });
    const [selectedBookingData, setSelectedBookingData] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Workers for dropdown
                const workersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                if (workersRes.ok) {
                    const data = await workersRes.json();
                    setWorkers(data);
                }

                // Fetch Services for dropdown
                const servicesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
                if (servicesRes.ok) {
                    const data = await servicesRes.json();
                    setServices(data);
                }

                // Fetch attendance with the default "today" filters
                const today = new Date().toLocaleDateString('en-CA');
                const query = new URLSearchParams({
                    startDate: today,
                    endDate: today
                }).toString();

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/all?${query}&t=${Date.now()}`, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                    cache: 'no-store'
                });
                if (res.ok) {
                    const data = await res.json();
                    setAttendance(data);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) fetchInitialData();
    }, [user]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/all?${query}&t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setAttendance(data);
            } else {
                toast.error("Failed to fetch attendance logs");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching attendance logs");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (bookingId) => {
        if (!bookingId) {
            toast.error("Cannot download: Booking data missing");
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/booking/${bookingId}/download-pdf`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Attendance_${bookingId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                toast.error("Failed to download attendance sheet");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error downloading attendance sheet");
        }
    };

    const handleDownloadReport = async () => {
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/admin/download-report?${query}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Attendance_Report.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                toast.error("Failed to download attendance report");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error downloading attendance report");
        }
    };

    const handleAttendanceUpdate = async (bookingId, attendanceStatus, date) => {
        if (!bookingId) {
            toast.error("Cannot update: Booking reference lost");
            return;
        }
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/attendance`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ attendanceStatus, date }),
                cache: 'no-store'
            });

            if (res.ok) {
                toast.success(`Attendance updated`);
                fetchAttendance(); // Refresh list to see real instead of synthetic
            } else {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to update attendance");
            }
        } catch (error) {
            console.error(`Attendance Error:`, error);
            toast.error(error.message || "Failed to update attendance");
        }
    };

    const fetchBookingHistory = async (bookingId) => {
        if (!bookingId) {
            toast.error("Cannot view history: Booking reference lost");
            return;
        }
        setHistoryLoading(true);
        setShowHistoryModal(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/valid-dates/${bookingId}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedBookingData(data);
            } else {
                toast.error("Failed to fetch booking history");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching history");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display text-slate-900">Attendance Reports</h1>
                    <p className="text-slate-500">Manage and download attendance sheets across all services and workers.</p>
                </div>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleDownloadReport}>
                    <Download size={16} />
                    Download Full Report
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-slate-200">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Worker</label>
                            <Select onValueChange={(val) => handleFilterChange("workerId", val === "all" ? "" : val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Workers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Workers</SelectItem>
                                    {workers.map(w => (
                                        <SelectItem key={w._id} value={w._id}>{w.userId?.name || w.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Service Type</label>
                            <Select onValueChange={(val) => handleFilterChange("serviceType", val === "all" ? "" : val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Services" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Services</SelectItem>
                                    {services.map(service => (
                                        <SelectItem key={service._id} value={service.title}>{service.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Date From</label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Date To</label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button className="w-full gap-2 variant-outline border-slate-200" onClick={fetchAttendance}>
                                <Search size={16} />
                                Filter Logs
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Attendance Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Worker</TableHead>
                                    <TableHead>Service / Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-slate-500">Loading logs...</TableCell>
                                    </TableRow>
                                ) : attendance.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <ClipboardList className="w-10 h-10 text-slate-200" />
                                                <div className="font-semibold text-slate-900">No logs found for this period</div>
                                                <p className="text-sm max-w-[250px] mx-auto">
                                                    Trying adjusting your date filters or select a different worker.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    attendance.map((log) => (
                                        <TableRow key={log._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{formatDate(log.date)}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                                        {log.worker?.name?.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium">{log.worker?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <div className="text-sm font-bold capitalize text-slate-700">{log.booking?.serviceType || log.serviceType || "N/A"}</div>
                                                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                                        <User size={10} /> {log.booking?.user?.name || log.user?.name || "Deleted Customer"}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${log.status === 'present' ? 'bg-green-100 text-green-700' :
                                                            log.status === 'not_marked' ? 'bg-slate-100 text-slate-500' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {log.status === 'not_marked' ? 'Not Marked' : log.status}
                                                    </span>
                                                    {log.isSynthetic && (
                                                        <span className="text-[9px] text-slate-400 italic">
                                                            {log.status === 'not_marked' ? 'Pending mark' : 'Auto-calculated (Missed)'}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 text-[11px] gap-1.5 border-slate-200 ${log.status === 'present' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                        onClick={() => handleAttendanceUpdate(log.booking?._id, log.status === 'present' ? 'absent' : 'present', log.date)}
                                                    >
                                                        {log.status === 'present' ? <X size={14} /> : <Check size={14} />}
                                                        {log.status === 'present' ? 'Mark Absent' : 'Mark Present'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[11px] gap-1.5 border-slate-200 hover:bg-slate-50"
                                                        onClick={() => fetchBookingHistory(log.booking?._id)}
                                                    >
                                                        <History size={14} />
                                                        History
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[11px] gap-1.5 border-slate-200 hover:bg-blue-50"
                                                        onClick={() => handleDownloadPDF(log.booking?._id)}
                                                    >
                                                        <Download size={14} />
                                                        Sheet
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {/* History Modal */}
            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Attendance History</DialogTitle>
                        <DialogDescription>
                            Visual breakdown of attendance for {selectedBookingData?.serviceType || 'Service'}
                        </DialogDescription>
                    </DialogHeader>

                    {historyLoading ? (
                        <div className="flex justify-center py-10">Loading history...</div>
                    ) : selectedBookingData ? (
                        <div className="space-y-6 pt-4">
                            <div className="flex justify-center">
                                <CalendarUI
                                    mode="single"
                                    disabled={(date) => {
                                        const isValid = selectedBookingData.validDates?.some(vd =>
                                            isSameDay(new Date(vd), date)
                                        );
                                        return !isValid;
                                    }}
                                    modifiers={{
                                        present: (date) => {
                                            const dStr = date.toISOString().split('T')[0];
                                            return selectedBookingData.markedDates?.find(m =>
                                                new Date(m.date).toISOString().split('T')[0] === dStr
                                            )?.status === 'present';
                                        },
                                        absent: (date) => {
                                            const dStr = date.toISOString().split('T')[0];
                                            return selectedBookingData.markedDates?.find(m =>
                                                new Date(m.date).toISOString().split('T')[0] === dStr
                                            )?.status === 'absent';
                                        },
                                    }}
                                    modifiersStyles={{
                                        present: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' },
                                        absent: { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' },
                                    }}
                                    className="rounded-md border shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="text-xs text-slate-500 uppercase font-bold tracking-tight mb-1">Frequency</div>
                                    <div className="text-sm font-semibold capitalize">{selectedBookingData.frequency}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="text-xs text-slate-500 uppercase font-bold tracking-tight mb-1">Status</div>
                                    <div className={`text-sm font-semibold ${selectedBookingData.isActive ? 'text-green-600' : 'text-slate-500'}`}>
                                        {selectedBookingData.isActive ? 'Active' : 'Ended'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-10 text-center text-slate-500">No data found.</div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
