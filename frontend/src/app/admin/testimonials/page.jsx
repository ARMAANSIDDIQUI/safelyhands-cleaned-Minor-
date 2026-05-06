"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import Image from "next/image";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function TestimonialsAdmin() {
    const { user } = useAuth();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        designation: "",
        message: "",
        rating: "5",
        imageUrl: "",
        isActive: true
    });

    const fetchTestimonials = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/admin`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data);
            }
        } catch (error) {
            console.error("Failed to fetch testimonials", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) fetchTestimonials();
    }, [user?.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingId
                ? `${process.env.NEXT_PUBLIC_API_URL}/testimonials/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/testimonials`;

            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                toast.success(editingId ? "Testimonial updated" : "Testimonial created");
                setIsDialogOpen(false);
                resetForm();
                fetchTestimonials();
            } else {
                const data = await res.json();
                toast.error(data.message || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${deletingId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user?.token}` }
            });

            if (res.ok) {
                toast.success("Testimonial deleted");
                fetchTestimonials();
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setForm({
            name: item.name,
            designation: item.designation,
            message: item.message,
            rating: item.rating.toString(),
            imageUrl: item.imageUrl,
            isActive: item.isActive
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({
            name: "",
            designation: "",
            message: "",
            rating: "5",
            imageUrl: "",
            isActive: true
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
                    <p className="text-muted-foreground">Manage customer reviews and feedback.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <Input
                                        placeholder="e.g. Homeowner"
                                        value={form.designation}
                                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Review Message</Label>
                                <Textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    required
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    <Select
                                        value={form.rating}
                                        onValueChange={(val) => setForm({ ...form, rating: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map(r => (
                                                <SelectItem key={r} value={r.toString()}>{r} Stars</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={form.isActive ? "active" : "inactive"}
                                        onValueChange={(val) => setForm({ ...form, isActive: val === "active" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Customer Photo</Label>
                                <ImageUpload
                                    value={form.imageUrl}
                                    onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
                                    disabled={submitting}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                {editingId ? "Update Testimonial" : "Create Testimonial"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="animate-spin mx-auto h-8 w-8 text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : testimonials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No testimonials found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            testimonials.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100">
                                                {item.imageUrl ? (
                                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs font-bold text-slate-400">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.designation}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex text-amber-400">
                                            {[...Array(item.rating)].map((_, i) => (
                                                <Star key={i} size={14} fill="currentColor" />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-muted-foreground">
                                        {item.message}
                                    </TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                                            {item.isActive ? "Active" : "Inactive"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                <Pencil className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setDeletingId(item._id);
                                                setIsDeleteDialogOpen(true);
                                            }}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Delete Testimonial"
                description="Are you sure you want to delete this testimonial? This action cannot be undone."
                confirmText="Delete"
                loading={submitting}
            />
        </div>
    );
}
