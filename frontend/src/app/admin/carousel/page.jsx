"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUpload from "@/components/ui/image-upload";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function AdminCarousel() {
    const { user, loading: authLoading } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        imageUrl: "",
        name: ""
    });

    const fetchImages = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carousel`);
            const data = await res.json();
            if (Array.isArray(data)) setImages(data);
        } catch (err) {
            toast.error("Failed to fetch carousel images");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (user?.token) {
                fetchImages();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenDialog = () => {
        setFormData({ imageUrl: "", name: "" });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carousel`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Something went wrong");

            toast.success("Image added successfully");
            setIsDialogOpen(false);
            fetchImages();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carousel/${deletingId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${user?.token}` }
            });

            if (res.ok) {
                toast.success("Image deleted");
                fetchImages();
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Failed to delete image");
            }
        } catch (error) {
            toast.error("Error deleting image");
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold text-slate-900">Carousel Management</h1>
                <Button onClick={handleOpenDialog}>
                    <Plus className="mr-2 h-4 w-4" /> Add Image
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">
                        <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">No Images in Carousel</h3>
                        <p className="mb-4">Add images to showcase your company.</p>
                        <Button onClick={() => handleOpenDialog()}>Add Image</Button>
                    </div>
                ) : (
                    images.map((item) => (
                        <Card key={item._id} className="overflow-hidden group">
                            <div className="relative aspect-video w-full bg-slate-100">
                                <img
                                    src={item.imageUrl}
                                    alt={item.name || "Carousel Image"}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="destructive" size="sm" onClick={() => {
                                        setDeletingId(item._id);
                                        setIsDeleteDialogOpen(true);
                                    }}>
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </div>
                            {item.name && (
                                <CardFooter className="p-3 bg-slate-50 border-t">
                                    <p className="text-sm font-medium text-slate-600 truncate">{item.name}</p>
                                </CardFooter>
                            )}
                        </Card>

                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Image</DialogTitle>
                        <DialogDescription>
                            Add a new image URL to the company carousel.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name (Optional)</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" placeholder="e.g. Office Team" />
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
                        </div>
                        <DialogFooter>
                            <Button type="submit">Add Image</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Delete Carousel Image"
                description="Are you sure you want to delete this image from the carousel? This action cannot be undone."
                confirmText="Delete"
                loading={loading}
            />
        </div >
    );
}
