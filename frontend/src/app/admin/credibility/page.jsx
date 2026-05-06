"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Loader2, Link as LinkIcon, ExternalLink } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import Image from "next/image";

export default function CredibilityAdmin() {
    const { user } = useAuth();
    const [logos, setLogos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        type: "registered", // 'registered' or 'backed'
        imageUrl: "",
        url: "",
        order: "0",
        isActive: true
    });

    const fetchLogos = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credibility/admin`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLogos(data);
            }
        } catch (error) {
            console.error("Failed to fetch logos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) fetchLogos();
    }, [user?.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingId
                ? `${process.env.NEXT_PUBLIC_API_URL}/credibility/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/credibility`;

            const method = editingId ? "PUT" : "POST";

            const payload = {
                ...form,
                order: parseInt(form.order) || 0
            };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingId ? "Logo updated" : "Logo created");
                setIsDialogOpen(false);
                resetForm();
                fetchLogos();
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

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this logo?")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credibility/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user?.token}` }
            });

            if (res.ok) {
                toast.success("Logo deleted");
                fetchLogos();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setForm({
            name: item.name,
            type: item.type,
            imageUrl: item.imageUrl,
            url: item.url || "",
            order: item.order.toString(),
            isActive: item.isActive
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({
            name: "",
            type: "registered",
            imageUrl: "",
            url: "",
            order: "0",
            isActive: true
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Credibility Badges</h1>
                    <p className="text-muted-foreground">Manage "Registered With" and "Backed By" logos.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Badge
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Badge" : "Add Badge"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        placeholder="e.g. Startup India"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={form.type}
                                        onValueChange={(val) => setForm({ ...form, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="registered">Registered With</SelectItem>
                                            <SelectItem value="backed">Backed By</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Order</Label>
                                    <Input
                                        type="number"
                                        value={form.order}
                                        onChange={(e) => setForm({ ...form, order: e.target.value })}
                                    />
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
                                <Label>Website URL (Optional)</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="https://..."
                                        value={form.url}
                                        onChange={(e) => setForm({ ...form, url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <ImageUpload
                                    value={form.imageUrl}
                                    onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
                                    disabled={submitting}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                {editingId ? "Update Badge" : "Create Badge"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="animate-spin mx-auto h-8 w-8 text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : logos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No badges found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logos.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        <div className="relative w-12 h-12 bg-white rounded border flex items-center justify-center p-1">
                                            {item.imageUrl ? (
                                                <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="object-contain max-h-full" />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No Img</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{item.name}</div>
                                        {item.url && (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                Visit Link <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.type === "registered" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                                            {item.type === "registered" ? "Registered With" : "Backed By"}
                                        </span>
                                    </TableCell>
                                    <TableCell>{item.order}</TableCell>
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
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}>
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
        </div>
    );
}
