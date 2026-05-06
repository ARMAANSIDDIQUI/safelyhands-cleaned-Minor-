"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, GripVertical } from "lucide-react";

export default function TeamCategoriesTab() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: "", order: 0 });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-categories`);
            const data = await res.json();
            if (res.ok) {
                // Sort by order
                setCategories(data.sort((a, b) => a.order - b.order));
            } else {
                toast.error("Failed to fetch categories");
            }
        } catch (error) {
            toast.error("Error loading categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = currentCategory
                ? `${process.env.NEXT_PUBLIC_API_URL}/team-categories/${currentCategory._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/team-categories`;

            const method = currentCategory ? "PUT" : "POST";

            // Generate slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({ ...formData, slug })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(currentCategory ? "Category updated" : "Category created");
                fetchCategories();
                setIsDialogOpen(false);
                resetForm();
            } else {
                toast.error(data.message || "Operation failed");
            }
        } catch (error) {
            toast.error("Error saving category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This will not delete members in this category.")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-categories/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                }
            });

            if (res.ok) {
                toast.success("Category deleted");
                fetchCategories();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting category");
        }
    };

    const openEdit = (category) => {
        setCurrentCategory(category);
        setFormData({ name: category.name, order: category.order || 0 });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setCurrentCategory(null);
        setFormData({ name: "", order: 0 });
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Team Positions</h3>
                    <p className="text-sm text-slate-500">Manage titles and their display order (e.g., Founders, Management)</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                            <Plus size={16} className="mr-2" /> Add Position
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentCategory ? "Edit Position" : "Add Position"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Position Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Founders"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    required
                                />
                                <p className="text-xs text-slate-500">Lower numbers appear first</p>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Order</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                        No positions found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-slate-100 p-1 rounded text-slate-500">
                                                    <GripVertical size={14} />
                                                </div>
                                                <span className="font-mono">{category.order}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell className="text-slate-500 text-sm">{category.slug}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                                                    <Pencil size={16} className="text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(category._id)}>
                                                    <Trash2 size={16} className="text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
