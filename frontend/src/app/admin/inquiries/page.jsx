"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Loader2, Search, CheckCircle, XCircle, Clock, Filter, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/ui/confirmation-modal';

export default function AdminInquiriesPage() {
    const { user, loading: authLoading } = useAuth();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedInquiry, setSelectedInquiry] = useState(null); // For detail modal

    // Delete Confirmation State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [inquiryToDelete, setInquiryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const token = user?.token;
            if (!token) return;

            let url = `${process.env.NEXT_PUBLIC_API_URL}/inquiries?`;
            if (selectedType !== 'All') url += `type=${encodeURIComponent(selectedType)}&`;
            if (selectedStatus !== 'All') url += `status=${encodeURIComponent(selectedStatus)}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setInquiries(data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch inquiries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchInquiries();
        }
    }, [user, authLoading, selectedType, selectedStatus]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Status updated');
                if (selectedInquiry?._id === id) {
                    setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
                }
                fetchInquiries();
            }
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const confirmDelete = async () => {
        if (!inquiryToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiries/${inquiryToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Inquiry deleted successfully');
                setInquiries(prev => prev.filter(item => item._id !== inquiryToDelete));
                if (selectedInquiry?._id === inquiryToDelete) {
                    setSelectedInquiry(null);
                }
                setDeleteModalOpen(false);
                setInquiryToDelete(null);
            } else {
                toast.error(data.message || 'Failed to delete inquiry');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete inquiry');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteClick = (id, event) => {
        if (event) event.stopPropagation();
        setInquiryToDelete(id);
        setDeleteModalOpen(true);
    };

    if (loading && inquiries.length === 0) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inquiry Management</h1>
                    <p className="text-slate-500 text-sm">Track and manage worker welfare requests</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Types</option>
                        <option value="Child Education">Child Education</option>
                        <option value="Worker Registration">Worker Registration</option>
                        <option value="Health Insurance">Health Insurance</option>
                        <option value="Worker Referral">Worker Referral</option>
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">From</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inquiries.map((inquiry) => (
                                <tr key={inquiry._id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${inquiry.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                                inquiry.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                    inquiry.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                                        `}>
                                            {inquiry.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{inquiry.type}</td>
                                    <td className="px-6 py-4 text-slate-600">{inquiry.name}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex flex-col">
                                            <span>{inquiry.phone}</span>
                                            <span className="text-xs text-slate-400">{inquiry.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {format(new Date(inquiry.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedInquiry(inquiry)}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Eye size={16} /> View
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(inquiry._id, e)}
                                                className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                                title="Delete Inquiry"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {inquiries.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            No inquiries found matching your filters.
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedInquiry && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInquiry(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedInquiry.type}</h3>
                                <p className="text-sm text-slate-500">ID: {selectedInquiry._id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => handleDeleteClick(selectedInquiry._id, e)}
                                    className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                                    title="Delete this inquiry"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <XCircle className="text-slate-400" size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-400">Applicant Name</label>
                                    <p className="text-slate-900 font-medium">{selectedInquiry.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-400">Submitted On</label>
                                    <p className="text-slate-900 font-medium">{format(new Date(selectedInquiry.createdAt), 'PPpp')}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-400">Phone</label>
                                    <p className="text-slate-900 font-medium">{selectedInquiry.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-400">Email</label>
                                    <p className="text-slate-900 font-medium">{selectedInquiry.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Application Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(selectedInquiry.details || {}).map(([key, value]) => (
                                        <div key={key} className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                            <p className="text-slate-800 text-sm">{value?.toString() || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Update Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['New', 'In Progress', 'Resolved', 'Rejected'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedInquiry._id, status)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedInquiry.status === status
                                                ? 'bg-slate-900 text-white shadow-lg'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Inquiry"
                message="Are you sure you want to delete this inquiry? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    );
}
