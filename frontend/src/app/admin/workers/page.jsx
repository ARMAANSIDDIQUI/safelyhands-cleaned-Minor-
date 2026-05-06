"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Pencil, Trash2, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/ui/image-upload";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function AdminWorkers() {
    const { user, loading: authLoading } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentWorkerId, setCurrentWorkerId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        profession: "",
        experienceYears: "",
        imageUrl: "",
        bio: "",
        isAvailable: true
    });

    const fetchWorkers = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers`);
            const data = await res.json();
            if (Array.isArray(data)) setWorkers(data);
        } catch (err) {
            toast.error("Failed to fetch workers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (user?.token) {
                fetchWorkers();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOpenDialog = (worker = null) => {
        if (worker) {
            setIsEditing(true);
            setCurrentWorkerId(worker._id);
            setFormData({
                name: worker.name,
                profession: worker.profession,
                experienceYears: worker.experienceYears,
                imageUrl: worker.imageUrl || "",
                bio: worker.bio || "",
                isAvailable: worker.isAvailable
            });
        } else {
            setIsEditing(false);
            setCurrentWorkerId(null);
            setFormData({
                name: "",
                profession: "",
                experienceYears: "",
                imageUrl: "",
                bio: "",
                isAvailable: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing
            ? `${process.env.NEXT_PUBLIC_API_URL}/workers/${currentWorkerId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/workers`;
        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Something went wrong");

            toast.success(isEditing ? "Worker updated" : "Worker added");
            setIsDialogOpen(false);
            fetchWorkers();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers/${deletingId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${user?.token}` }
            });

            if (res.ok) {
                toast.success("Worker deleted");
                fetchWorkers();
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Failed to delete worker");
            }
        } catch (error) {
            toast.error("Error deleting worker");
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold text-slate-900">Manage Workers</h1>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Worker
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {workers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
                        <UserIcon className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">No Workers Added Yet</h3>
                        <p className="mb-4">Get started by adding your first team member.</p>
                        <Button onClick={() => handleOpenDialog()}>Add Worker</Button>
                    </div>
                ) : (
                    workers.map((worker) => (
                        <Card key={worker._id} className="flex flex-col text-center items-center pt-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-slate-100">
                                {worker.imageUrl ? (
                                    <img src={worker.imageUrl} alt={worker.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <UserIcon size={40} />
                                    </div>
                                )}
                            </div>
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-lg">{worker.name}</CardTitle>
                                <CardDescription>{worker.profession}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2">
                                <Badge variant={worker.isAvailable ? "default" : "destructive"}>
                                    {worker.isAvailable ? "Available" : "Unavailable"}
                                </Badge>
                                <p className="text-sm text-slate-500">{worker.experienceYears} Years Exp.</p>
                            </CardContent>
                            <CardFooter className="flex gap-2 w-full justify-center pb-6">
                                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(worker)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => {
                                    setDeletingId(worker._id);
                                    setIsDeleteDialogOpen(true);
                                }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>

                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Worker" : "Add New Worker"}</DialogTitle>
                        <DialogDescription>
                            Enter the details of the domestic help professional.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="profession" className="text-right">Profession</Label>
                                <Input id="profession" name="profession" value={formData.profession} onChange={handleInputChange} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="experienceYears" className="text-right">Experience</Label>
                                <Input id="experienceYears" name="experienceYears" type="number" value={formData.experienceYears} onChange={handleInputChange} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">Image</Label>
                                <div className="col-span-3">
                                    <ImageUpload
                                        value={formData.imageUrl}
                                        onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="bio" className="text-right">Bio/Story</Label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    className="col-span-3 flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Brief story about the worker..."
                                />
                            </div>
                            {isEditing && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="isAvailable" className="text-right">Available</Label>
                                    <input
                                        type="checkbox"
                                        id="isAvailable"
                                        name="isAvailable"
                                        checked={formData.isAvailable}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {isEditing ? "Save Changes" : "Add Worker"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Delete Worker"
                description="Are you sure you want to delete this team member? This will also PERMANENTLY delete all of their historical attendance records. This action cannot be undone."
                confirmText="Delete"
                loading={loading}
            />
        </div >
    );
}