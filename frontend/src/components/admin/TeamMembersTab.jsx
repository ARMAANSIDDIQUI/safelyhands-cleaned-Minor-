"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, User } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";

export default function TeamMembersTab() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        title: "",
        image: "",
        category: "All"
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [membersRes, categoriesRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-members`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-categories`)
            ]);

            if (membersRes.ok && categoriesRes.ok) {
                const membersData = await membersRes.json();
                const categoriesData = await categoriesRes.json();
                setMembers(membersData);
                setCategories(categoriesData);
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (error) {
            toast.error("Error loading team data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!formData.image) {
            toast.error("Please upload a profile photo");
            setSubmitting(false);
            return;
        }

        try {
            const url = currentMember
                ? `${process.env.NEXT_PUBLIC_API_URL}/team-members/${currentMember._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/team-members`;

            const method = currentMember ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(currentMember ? "Member updated" : "Member added");
                fetchData(); // Refresh list
                setIsDialogOpen(false);
                resetForm();
            } else {
                toast.error(data.message || "Operation failed");
            }
        } catch (error) {
            toast.error("Error saving member");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to remove this team member?")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-members/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user?.token}`
                }
            });

            if (res.ok) {
                toast.success("Member removed");
                fetchData();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting member");
        }
    };

    const openEdit = (member) => {
        setCurrentMember(member);
        setFormData({
            name: member.name,
            title: member.title,
            image: member.image,
            category: member.category || "All"
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setCurrentMember(null);
        setFormData({ name: "", title: "", image: "", category: "All" });
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Team Members</h3>
                    <p className="text-sm text-slate-500">Manage people displayed on the About page</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (!open) resetForm();
                    setIsDialogOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus size={16} className="mr-2" /> Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{currentMember ? "Edit Member" : "Add Team Member"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Profile Photo</Label>
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    onRemove={() => setFormData({ ...formData, image: "" })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Jane Doe"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. CEO, Senior Developer"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Team Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">Uncategorized</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                    Save Member
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
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        No team members found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                members.map((member) => (
                                    <TableRow key={member._id}>
                                        <TableCell>
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 relative">
                                                {member.image ? (
                                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell className="text-slate-600">{member.title}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {member.category || "Uncategorized"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(member)}>
                                                    <Pencil size={16} className="text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(member._id)}>
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
