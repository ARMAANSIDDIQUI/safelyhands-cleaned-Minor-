"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import ImageUpload from "@/components/ui/image-upload";

export default function TeamManagement() {
    const { user, loading: authLoading } = useAuth();
    const [categories, setCategories] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMemberId, setCurrentMemberId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        imageUrl: "",
        isActive: true
    });

    useEffect(() => {
        if (!authLoading && user?.token) {
            fetchCategories();
            fetchMembers();
        }
    }, [user, authLoading]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-categories`);
            if (res.ok) setCategories(await res.json());
        } catch (error) {
            toast.error("Failed to fetch categories");
        }
    };

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team`);
            if (res.ok) setMembers(await res.json());
        } catch (error) {
            toast.error("Failed to fetch team members");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (member = null) => {
        if (member) {
            setIsEditing(true);
            setCurrentMemberId(member._id);
            setFormData({
                name: member.name,
                category: member.category?._id || member.category || "",
                imageUrl: member.imageUrl || "",
                isActive: member.isActive ?? true
            });
        } else {
            setIsEditing(false);
            setCurrentMemberId(null);
            setFormData({
                name: "",
                category: "",
                imageUrl: "",
                isActive: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const url = isEditing
            ? `${process.env.NEXT_PUBLIC_API_URL}/team/${currentMemberId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/team`;
        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(isEditing ? "Member updated" : "Member added");
                setIsDialogOpen(false);
                fetchMembers();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to save");
            }
        } catch (error) {
            toast.error("Error saving team member");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this team member?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${user.token}` }
            });
            if (res.ok) {
                toast.success("Member deleted");
                fetchMembers();
            } else {
                toast.error("Failed to delete member");
            }
        } catch (error) {
            toast.error("Error deleting member");
        }
    };

    if (loading && !members.length) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-display">Team Management</h1>
                    <p className="text-slate-500 text-sm">Manage team members displayed on the About page</p>
                </div>
                <button
                    onClick={() => handleOpenDialog()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-100"
                >
                    <Plus size={18} /> Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {members.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 text-slate-400">
                        <User size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="font-medium">No team members found. Add your first member!</p>
                    </div>
                )}
                {members.map((member) => (
                    <div key={member._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group hover:shadow-md transition-all">
                        <div className="aspect-square relative overflow-hidden bg-slate-50">
                            {member.imageUrl ? (
                                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <User size={64} strokeWidth={1.5} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={() => handleOpenDialog(member)}
                                    className="p-2.5 bg-white/90 backdrop-blur rounded-xl shadow-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(member._id)}
                                    className="p-2.5 bg-white/90 backdrop-blur rounded-xl shadow-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{member.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    {member.category?.name || "No Category"}
                                </span>
                                {!member.isActive && (
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dialog Overlay */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {isEditing ? "Edit Team Member" : "Add New Member"}
                                </h2>
                                <button type="button" onClick={() => setIsDialogOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Member Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full name of the team member"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-medium appearance-none"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Profile Picture</label>
                                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-4">
                                        <ImageUpload
                                            value={formData.imageUrl}
                                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-blue-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold text-blue-900 cursor-pointer select-none">Show on About Page</label>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50/50 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : isEditing ? "Save Changes" : "Create Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
