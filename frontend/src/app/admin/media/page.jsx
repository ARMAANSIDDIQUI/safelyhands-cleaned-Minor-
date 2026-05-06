"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, Copy, Check, X, Image, Film, Trash2, Link2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function MediaLibraryPage() {
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploads, setUploads] = useState([]); // session history
    const [copiedId, setCopiedId] = useState(null);

    const handleFiles = useCallback(async (files) => {
        const file = files[0];
        if (!file) return;

        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) {
            toast.error("Only images and videos are supported");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("image", file); // field name expected by backend

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${user?.token}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Upload failed");

            const entry = {
                id: Date.now(),
                url: data.url || data.imageUrl,
                name: file.name,
                type: data.resourceType || (isImage ? "image" : "video"),
                size: file.size,
            };
            setUploads((prev) => [entry, ...prev]);
            toast.success("Uploaded successfully!");
        } catch (err) {
            console.error("DEBUG [UPLOAD FETCH ERROR]:", err);
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                console.error("Possible CORS issue or Network failure. If uploading a large file, this likely means Nginx rejected the request with 413.");
            }
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    }, [user]);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);

    const copyToClipboard = (id, url) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.success("URL copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const copyTag = (entry) => {
        const tag = entry.type === "video"
            ? `<video src="${entry.url}" autoplay loop muted playsinline style="max-width:100%;border-radius:8px;pointer-events:none;"></video>`
            : `<img src="${entry.url}" alt="" style="max-width:100%;border-radius:8px;" />`;
        navigator.clipboard.writeText(tag);
        toast.success(`${entry.type === "video" ? "<video>" : "<img>"} tag copied!`);
    };

    const removeEntry = (id) => setUploads((prev) => prev.filter((u) => u.id !== id));

    const formatSize = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900">Media Library</h1>
                <p className="text-slate-500 mt-1">Upload images & videos to Cloudinary and copy the URL to use anywhere.</p>
            </div>

            {/* Upload Zone */}
            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 group",
                    isDragging
                        ? "border-sky-400 bg-sky-50 scale-[1.01]"
                        : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50",
                    uploading && "cursor-not-allowed opacity-70"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,.gif"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                {uploading ? (
                    <>
                        <div className="w-16 h-16 rounded-full border-4 border-sky-200 border-t-sky-500 animate-spin" />
                        <p className="text-slate-600 font-semibold text-lg">Uploading to Cloudinary...</p>
                    </>
                ) : (
                    <>
                        <div className={cn(
                            "w-20 h-20 rounded-2xl flex items-center justify-center transition-colors",
                            isDragging ? "bg-sky-100" : "bg-white border border-slate-200 group-hover:bg-sky-50"
                        )}>
                            <Upload size={36} className={isDragging ? "text-sky-500" : "text-slate-400 group-hover:text-sky-400"} />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-700 font-bold text-lg">
                                {isDragging ? "Drop it!" : "Drag & drop or click to upload"}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">Images (JPG, PNG, WebP) · Animated GIFs · Videos (MP4, MOV, WebM) · Up to 50 MB</p>
                        </div>
                    </>
                )}
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-amber-800">
                    To embed in inclusions, use{" "}
                    <code className="bg-amber-100 px-1 rounded font-mono text-xs">{"<img src=\"URL\" />"}</code> or{" "}
                    <code className="bg-amber-100 px-1 rounded font-mono text-xs">{"<video src=\"URL\" controls>"}</code>.
                    Use the <strong>Copy Tag</strong> button below for a ready-to-paste snippet.
                </p>
            </div>

            {/* Uploaded Files */}
            {uploads.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800">Session Uploads ({uploads.length})</h2>
                    <div className="space-y-3">
                        {uploads.map((entry) => (
                            <div key={entry.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 shadow-sm">
                                {/* Preview */}
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                                    {entry.type === "video" ? (
                                        <video
                                            src={entry.url}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={entry.url}
                                            alt={entry.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {entry.type === "video"
                                            ? <Film size={14} className="text-purple-500" />
                                            : <Image size={14} className="text-sky-500" />
                                        }
                                        <span className="font-semibold text-slate-800 text-sm truncate">{entry.name}</span>
                                        <span className="text-xs text-slate-400 shrink-0">{formatSize(entry.size)}</span>
                                    </div>

                                    {/* URL Row */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 font-mono truncate">
                                            {entry.url}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        <button
                                            onClick={() => copyToClipboard(entry.id, entry.url)}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                                        >
                                            {copiedId === entry.id ? <Check size={13} /> : <Copy size={13} />}
                                            {copiedId === entry.id ? "Copied!" : "Copy URL"}
                                        </button>
                                        <button
                                            onClick={() => copyTag(entry)}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors"
                                        >
                                            <Link2 size={13} />
                                            Copy Tag
                                        </button>
                                        <a
                                            href={entry.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                        >
                                            Open ↗
                                        </a>
                                        <button
                                            onClick={() => removeEntry(entry.id)}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors ml-auto"
                                        >
                                            <Trash2 size={13} />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {uploads.length === 0 && !uploading && (
                <div className="text-center py-10 text-slate-400">
                    <div className="flex justify-center gap-4 mb-3 opacity-30">
                        <Image size={32} />
                        <Film size={32} />
                    </div>
                    <p className="text-sm">No files uploaded yet this session</p>
                </div>
            )}
        </div>
    );
}
