"use client";

import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";

export default function ImageUpload({ value, onChange, disabled }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const uploadFile = async (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            toast.error("Please upload an image or video file");
            return;
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            toast.error("File size must be less than 50MB");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Upload failed");
            }

            onChange(data.url || data.imageUrl);
            toast.success(file.type.startsWith('video/') ? "Video uploaded successfully" : "Image uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        await uploadFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !isUploading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled || isUploading) return;

        const file = e.dataTransfer.files?.[0];
        await uploadFile(file);
    };

    const handleRemove = () => {
        onChange("");
    };

    const isVideo = value && (
        value.includes('.mp4') ||
        value.includes('.webm') ||
        value.includes('.mov') ||
        value.includes('.ogg') ||
        value.includes('.m4v') ||
        value.includes('.avi') ||
        value.includes('/video/upload/') // Cloudinary specific
    );

    return (
        <div className="flex flex-col gap-4">
            {value ? (
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden border border-slate-200">
                    <div className="absolute top-2 right-2 z-10">
                        <Button
                            type="button"
                            onClick={handleRemove}
                            variant="destructive"
                            size="icon"
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    {isVideo ? (
                        <video
                            src={value}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover pointer-events-none"
                        />
                    ) : (
                        <img
                            src={value}
                            alt="Upload"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center w-full">
                    <label
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploading ? (
                                <Loader2 className="h-8 w-8 text-slate-400 animate-spin mb-2" />
                            ) : (
                                <Upload className={`h-8 w-8 mb-2 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                            )}
                            <p className="mb-2 text-sm text-slate-500">
                                <span className="font-semibold">
                                    {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
                                </span>
                            </p>
                            <p className="text-xs text-slate-500">
                                Images or Videos (MAX. 10MB)
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="image/*,video/*,.svg"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={disabled || isUploading}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
