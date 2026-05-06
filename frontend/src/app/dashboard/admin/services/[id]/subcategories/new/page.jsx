"use client";

import React, { useState } from "react";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function NewSubCategoryPage() {
    const { id } = useParams(); // Service ID
    const router = useRouter();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        imageUrl: "", // We'll input URL for now, or cloud upload if implemented
        features: [""],
        isActive: true,
        questions: [] // [{ stepTitle, fields: [...] }]
    });

    // --- Basic Field Handlers ---
    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => setFormData({ ...formData, features: [...formData.features, ""] });
    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    // --- Question Builder Handlers ---
    const addQuestionStep = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                { stepTitle: "Details", fields: [] }
            ]
        });
    };

    const removeQuestionStep = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateStepTitle = (index, title) => {
        const newQuestions = [...formData.questions];
        newQuestions[index].stepTitle = title;
        setFormData({ ...formData, questions: newQuestions });
    };

    const addFieldToStep = (stepIndex) => {
        const newQuestions = [...formData.questions];
        newQuestions[stepIndex].fields.push({
            name: "",
            label: "",
            type: "radio",
            options: [{ label: "", value: "", priceChange: 0 }],
            required: true
        });
        setFormData({ ...formData, questions: newQuestions });
    };

    const removeField = (stepIndex, fieldIndex) => {
        const newQuestions = [...formData.questions];
        newQuestions[stepIndex].fields = newQuestions[stepIndex].fields.filter((_, i) => i !== fieldIndex);
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateField = (stepIndex, fieldIndex, fieldData) => {
        const newQuestions = [...formData.questions];
        newQuestions[stepIndex].fields[fieldIndex] = fieldData;
        setFormData({ ...formData, questions: newQuestions });
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                service: id
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}/subcategories`, { // We might need a direct POST endpoint for subcats
                // But typically REST would be POST /api/subcategories with serviceId in body OR POST /api/services/:id/subcategories
                // Assuming I need to create the endpoint for creating a subcat linked to service.
                // Let's check typical REST. I'll assume POST /api/services/:id/subcategories exists or create it. 
                // Wait, I updated `serviceController` but did NOT add `createSubCategory`.
                // I need to add that endpoint!
                // For now I'll code the frontend to hit it.
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("SubCategory created");
                router.push(`/dashboard/admin/services/${id}`);
            } else {
                toast.error("Failed to create");
            }
        } catch (error) {
            toast.error("Error submitting form");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">New SubCategory</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Basic Details */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Basic Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                placeholder="e.g. Morning Shift"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Base Price (₹)</label>
                            <input
                                required
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                            <input
                                type="text"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Features</label>
                            <div className="space-y-2">
                                {formData.features.map((feat, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={feat}
                                            onChange={(e) => handleFeatureChange(i, e.target.value)}
                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                                        />
                                        <button type="button" onClick={() => removeFeature(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addFeature} className="text-sm font-bold text-blue-500 hover:text-blue-600">
                                    + Add Feature
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Questions Builder */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">Question Steps</h2>
                        <button type="button" onClick={addQuestionStep} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900">
                            + Add Step
                        </button>
                    </div>

                    {formData.questions.map((step, stepIndex) => (
                        <div key={stepIndex} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative">
                            <button
                                type="button"
                                onClick={() => removeQuestionStep(stepIndex)}
                                className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Step Title</label>
                                <input
                                    type="text"
                                    value={step.stepTitle}
                                    onChange={(e) => updateStepTitle(stepIndex, e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                                />
                            </div>

                            {/* Fields in Step */}
                            <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                                {step.fields.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500">Label (Question)</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => {
                                                        const newField = { ...field, label: e.target.value };
                                                        updateField(stepIndex, fieldIndex, newField);
                                                    }}
                                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500">Key Name (Unique)</label>
                                                <input
                                                    type="text"
                                                    value={field.name}
                                                    onChange={(e) => {
                                                        const newField = { ...field, name: e.target.value };
                                                        updateField(stepIndex, fieldIndex, newField);
                                                    }}
                                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500">Type</label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => {
                                                        const newField = { ...field, type: e.target.value };
                                                        updateField(stepIndex, fieldIndex, newField);
                                                    }}
                                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded"
                                                >
                                                    <option value="radio">Radio Buttons</option>
                                                    <option value="select">Dropdown</option>
                                                    <option value="checkbox">Checkbox</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Options */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-slate-500">Options</p>
                                            {field.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex gap-2 items-center">
                                                    <input
                                                        placeholder="Label"
                                                        value={opt.label}
                                                        onChange={(e) => {
                                                            const newOpts = [...field.options];
                                                            newOpts[optIndex].label = e.target.value;
                                                            updateField(stepIndex, fieldIndex, { ...field, options: newOpts });
                                                        }}
                                                        className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded text-sm"
                                                    />
                                                    <input
                                                        placeholder="Value"
                                                        value={opt.value}
                                                        onChange={(e) => {
                                                            const newOpts = [...field.options];
                                                            newOpts[optIndex].value = e.target.value;
                                                            updateField(stepIndex, fieldIndex, { ...field, options: newOpts });
                                                        }}
                                                        className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded text-sm"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Price (+)"
                                                        value={opt.priceChange}
                                                        onChange={(e) => {
                                                            const newOpts = [...field.options];
                                                            newOpts[optIndex].priceChange = parseFloat(e.target.value) || 0;
                                                            updateField(stepIndex, fieldIndex, { ...field, options: newOpts });
                                                        }}
                                                        className="w-24 px-3 py-1 bg-white border border-slate-200 rounded text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newOpts = field.options.filter((_, i) => i !== optIndex);
                                                            updateField(stepIndex, fieldIndex, { ...field, options: newOpts });
                                                        }}
                                                        className="text-red-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newOpts = [...field.options, { label: "", value: "", priceChange: 0 }];
                                                    updateField(stepIndex, fieldIndex, { ...field, options: newOpts });
                                                }}
                                                className="text-xs font-bold text-blue-500 hover:text-blue-600"
                                            >
                                                + Add Option
                                            </button>
                                        </div>

                                        <div className="mt-2 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeField(stepIndex, fieldIndex)}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Remove Field
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addFieldToStep(stepIndex)} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 font-bold hover:border-slate-300 hover:text-slate-500">
                                    + Add Field
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xl flex justify-between items-center">
                    <p className="text-sm text-slate-500">Review details before saving.</p>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50"
                    >
                        {submitting ? "Saving..." : "Create SubCategory"}
                    </button>
                </div>

            </form>
        </div>
    );
}
