"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from "@/components/ui/image-upload";
import { getToken } from '@/lib/auth';

export default function AddSubCategoryPage() {
    const router = useRouter();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [subcategory, setSubcategory] = useState({
        service: '',
        name: '',
        price: 0,
        description: '',
        image: '',
        features: [],
        inclusions: '',
        isActive: true,
        questions: [] // Dynamic questions for this subcategory
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (error) {
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!subcategory.service) {
            toast.error("Please select a parent service");
            return;
        }
        if (!subcategory.name) {
            toast.error("Please enter a subcategory name");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subcategories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(subcategory)
            });

            if (res.ok) {
                toast.success("Subcategory created successfully");
                router.push('/admin/subcategories');
            } else {
                toast.error("Failed to create subcategory");
            }
        } catch (error) {
            toast.error("Error creating subcategory");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Add New Subcategory</h1>
                        <p className="text-slate-500">Create a new subcategory with dynamic questions</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? "Creating..." : "Create Subcategory"}
                </button>
            </div>

            {/* Parent Service Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Parent Service</h2>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Service</label>
                    <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        value={subcategory.service}
                        onChange={(e) => setSubcategory({ ...subcategory, service: e.target.value })}
                    >
                        <option value="">-- Select a service --</option>
                        {services.map(service => (
                            <option key={service._id} value={service._id}>
                                {service.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Basic Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Subcategory Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Subcategory Name</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            value={subcategory.name}
                            onChange={(e) => setSubcategory({ ...subcategory, name: e.target.value })}
                            placeholder="e.g. Full-time Housekeeper"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Price (₹)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            value={subcategory.price}
                            onChange={(e) => setSubcategory({ ...subcategory, price: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={subcategory.isActive !== false}
                                onChange={(e) => setSubcategory({ ...subcategory, isActive: e.target.checked })}
                                className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                                Active (visible to users)
                            </label>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 h-24 resize-none"
                            value={subcategory.description}
                            onChange={(e) => setSubcategory({ ...subcategory, description: e.target.value })}
                            placeholder="Brief description of this subcategory..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Features (comma separated)</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            value={subcategory.features?.join(', ') || ''}
                            onChange={(e) => setSubcategory({
                                ...subcategory,
                                features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                            })}
                            placeholder="Feature 1, Feature 2, Feature 3"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">What's Included (detailed text)</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 h-32 resize-none"
                            value={subcategory.inclusions || ''}
                            onChange={(e) => setSubcategory({ ...subcategory, inclusions: e.target.value })}
                            placeholder="Detailed description of what's included in this subcategory..."
                        />
                    </div>
                </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-700 mb-6">Media</h2>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subcategory Image</label>
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6">
                        <ImageUpload
                            value={subcategory.image}
                            onChange={(url) => setSubcategory({ ...subcategory, image: url })}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">This image will be shown in the booking wizard. Falls back to service image if not provided.</p>
                </div>
            </div>

            {/* Dynamic Questions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Dynamic Questions</h2>
                        <p className="text-slate-500 text-sm">Define custom questions for this subcategory</p>
                    </div>
                    <button
                        onClick={() => setSubcategory(prev => ({
                            ...prev,
                            questions: [...(prev.questions || []), { stepTitle: "New Step", fields: [] }]
                        }))}
                        className="text-blue-500 font-bold text-sm flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Plus size={16} /> Add Step
                    </button>
                </div>

                <div className="space-y-8">
                    {subcategory.questions?.length === 0 && (
                        <p className="text-slate-400 italic text-center py-8">No dynamic questions yet. Add a step to get started.</p>
                    )}
                    {subcategory.questions?.map((step, stepIndex) => (
                        <div key={stepIndex} className="border-2 border-slate-100 rounded-xl p-6 relative bg-slate-50/50">
                            {/* Step Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <span className="bg-slate-200 text-slate-600 font-bold px-3 py-1 rounded text-xs">Step {stepIndex + 1}</span>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-800 text-lg px-2 py-1 transition-colors"
                                    value={step.stepTitle}
                                    placeholder="Step Title (e.g. Work Details)"
                                    onChange={(e) => {
                                        const updated = [...subcategory.questions];
                                        updated[stepIndex].stepTitle = e.target.value;
                                        setSubcategory({ ...subcategory, questions: updated });
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (!confirm("Remove this step?")) return;
                                        const updated = [...subcategory.questions];
                                        updated.splice(stepIndex, 1);
                                        setSubcategory({ ...subcategory, questions: updated });
                                    }}
                                    className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Fields */}
                            <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                                {step.fields?.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Label</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                                        value={field.label}
                                                        onChange={(e) => {
                                                            const updated = [...subcategory.questions];
                                                            updated[stepIndex].fields[fieldIndex].label = e.target.value;
                                                            setSubcategory({ ...subcategory, questions: updated });
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">JSON Key</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none font-mono"
                                                        value={field.name}
                                                        onChange={(e) => {
                                                            const updated = [...subcategory.questions];
                                                            updated[stepIndex].fields[fieldIndex].name = e.target.value;
                                                            setSubcategory({ ...subcategory, questions: updated });
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</label>
                                                    <select
                                                        className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                                        value={field.type}
                                                        onChange={(e) => {
                                                            const updated = [...subcategory.questions];
                                                            updated[stepIndex].fields[fieldIndex].type = e.target.value;
                                                            setSubcategory({ ...subcategory, questions: updated });
                                                        }}
                                                    >
                                                        <option value="radio">Radio Buttons</option>
                                                        <option value="select">Dropdown</option>
                                                        <option value="checkbox">Checkbox</option>
                                                        <option value="text">Text Input</option>
                                                        <option value="date">Date Picker</option>
                                                        <option value="number">Number Input</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center pt-5 gap-4">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required !== false}
                                                            onChange={(e) => {
                                                                const updated = [...subcategory.questions];
                                                                updated[stepIndex].fields[fieldIndex].required = e.target.checked;
                                                                setSubcategory({ ...subcategory, questions: updated });
                                                            }}
                                                            className="rounded text-blue-500 focus:ring-blue-500"
                                                        />
                                                        <span className="text-xs font-bold text-slate-600">Required</span>
                                                    </label>
                                                    {field.type === 'number' && (
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.isPricingReference === true}
                                                                onChange={(e) => {
                                                                    const updated = [...subcategory.questions];
                                                                    updated[stepIndex].fields[fieldIndex].isPricingReference = e.target.checked;
                                                                    setSubcategory({ ...subcategory, questions: updated });
                                                                }}
                                                                className="rounded text-blue-500 focus:ring-blue-500"
                                                            />
                                                            <span className="text-xs font-bold text-sky-600">Pricing Reference</span>
                                                        </label>
                                                    )}
                                                    {(field.type === 'radio' || field.type === 'select') && (
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.isPricingReference === true}
                                                                onChange={(e) => {
                                                                    const updated = [...subcategory.questions];
                                                                    updated[stepIndex].fields[fieldIndex].isPricingReference = e.target.checked;
                                                                    setSubcategory({ ...subcategory, questions: updated });
                                                                }}
                                                                className="rounded text-blue-500 focus:ring-blue-500"
                                                            />
                                                            <span className="text-xs font-bold text-sky-600">Pricing Reference</span>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const updated = [...subcategory.questions];
                                                    updated[stepIndex].fields.splice(fieldIndex, 1);
                                                    setSubcategory({ ...subcategory, questions: updated });
                                                }}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Conditional Visibility */}
                                        <div className="mt-3 pt-3 border-t border-slate-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Conditional Visibility (Optional)</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Show if field</label>
                                                    <input
                                                        type="text"
                                                        placeholder="field_name"
                                                        className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none font-mono"
                                                        value={field.condition?.key || ''}
                                                        onChange={(e) => {
                                                            const updated = [...subcategory.questions];
                                                            if (!updated[stepIndex].fields[fieldIndex].condition) {
                                                                updated[stepIndex].fields[fieldIndex].condition = {};
                                                            }
                                                            updated[stepIndex].fields[fieldIndex].condition.key = e.target.value;
                                                            setSubcategory({ ...subcategory, questions: updated });
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Equals value</label>
                                                    <input
                                                        type="text"
                                                        placeholder="expected_value"
                                                        className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none font-mono"
                                                        value={field.condition?.value || ''}
                                                        onChange={(e) => {
                                                            const updated = [...subcategory.questions];
                                                            if (!updated[stepIndex].fields[fieldIndex].condition) {
                                                                updated[stepIndex].fields[fieldIndex].condition = {};
                                                            }
                                                            updated[stepIndex].fields[fieldIndex].condition.value = e.target.value;
                                                            setSubcategory({ ...subcategory, questions: updated });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">This field will only show if another field has the specified value</p>
                                        </div>

                                        {/* Options Editor for Radio/Select */}
                                        {(field.type === 'radio' || field.type === 'select') && (
                                            <div className="bg-slate-50 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Options</span>
                                                    <button
                                                        onClick={() => {
                                                            const updated = [...subcategory.questions];
                                                            if (!updated[stepIndex].fields[fieldIndex].options) {
                                                                updated[stepIndex].fields[fieldIndex].options = [];
                                                            }
                                                            updated[stepIndex].fields[fieldIndex].options.push({ label: "New Option", value: "new_val", priceChange: 0 });
                                                            setSubcategory({ ...subcategory, questions: updated });
                                                        }}
                                                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        <Plus size={12} /> Add Option
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {field.options?.map((opt, optIndex) => (
                                                        <React.Fragment key={optIndex}>
                                                            <div className="flex gap-2 items-center">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Label"
                                                                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                    value={opt.label}
                                                                    onChange={(e) => {
                                                                        const updated = [...subcategory.questions];
                                                                        updated[stepIndex].fields[fieldIndex].options[optIndex].label = e.target.value;
                                                                        setSubcategory({ ...subcategory, questions: updated });
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Value"
                                                                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none font-mono"
                                                                    value={opt.value}
                                                                    onChange={(e) => {
                                                                        const updated = [...subcategory.questions];
                                                                        updated[stepIndex].fields[fieldIndex].options[optIndex].value = e.target.value;
                                                                        setSubcategory({ ...subcategory, questions: updated });
                                                                    }}
                                                                />
                                                                <div className="relative w-24">
                                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Price"
                                                                        className="w-full bg-white border border-slate-200 rounded pl-5 pr-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                        value={opt.priceChange}
                                                                        onChange={(e) => {
                                                                            const updated = [...subcategory.questions];
                                                                            updated[stepIndex].fields[fieldIndex].options[optIndex].priceChange = parseFloat(e.target.value) || 0;
                                                                            setSubcategory({ ...subcategory, questions: updated });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const updated = [...subcategory.questions];
                                                                        updated[stepIndex].fields[fieldIndex].options.splice(optIndex, 1);
                                                                        setSubcategory({ ...subcategory, questions: updated });
                                                                    }}
                                                                    className="text-slate-300 hover:text-red-500"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                            {/* Tiered Prices Section */}
                                                            {subcategory.questions?.some(s => s.fields.some(f => f.isPricingReference)) && !field.isPricingReference && (
                                                                <div className="ml-4 mt-2 mb-4 pl-4 border-l border-slate-200">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tiered Prices (for Reference)</span>
                                                                        <button
                                                                            onClick={() => {
                                                                                const updated = [...subcategory.questions];
                                                                                if (!updated[stepIndex].fields[fieldIndex].options[optIndex].tieredPrices) {
                                                                                    updated[stepIndex].fields[fieldIndex].options[optIndex].tieredPrices = [];
                                                                                }
                                                                                updated[stepIndex].fields[fieldIndex].options[optIndex].tieredPrices.push({ refValue: "", price: 0 });
                                                                                setSubcategory({ ...subcategory, questions: updated });
                                                                            }}
                                                                            className="text-[9px] text-blue-500 font-bold hover:underline"
                                                                        >
                                                                            + Add Tier
                                                                        </button>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {opt.tieredPrices?.map((tier, tierIndex) => (
                                                                            <div key={tierIndex} className="flex gap-2 items-center">
                                                                                <div className="flex gap-1 flex-wrap">
                                                                                    {subcategory.questions?.flatMap(s => s.fields).filter(f => f.isPricingReference).map((refField, refIdx) => {
                                                                                        const allRefs = subcategory.questions?.flatMap(s => s.fields).filter(f => f.isPricingReference);
                                                                                        const partIndex = allRefs.indexOf(refField);
                                                                                        const comboParts = tier.refValue.split('_');
                                                                                        const currentValue = comboParts[partIndex] || '';

                                                                                        return (
                                                                                            <select
                                                                                                key={refField.name}
                                                                                                className="min-w-[80px] bg-white border border-slate-100 rounded px-1 py-0.5 text-[10px] focus:outline-none"
                                                                                                value={currentValue}
                                                                                                onChange={(e) => {
                                                                                                    const updated = [...subcategory.questions];
                                                                                                    const currentParts = updated[stepIndex].fields[fieldIndex].options[optIndex].tieredPrices[tierIndex].refValue.split('_');

                                                                                                    // Fill array to match number of references
                                                                                                    while (currentParts.length < allRefs.length) currentParts.push("");

                                                                                                    currentParts[partIndex] = e.target.value;
                                                                                                    updated[stepIndex].fields[fieldIndex].options[optIndex].tieredPrices[tierIndex].refValue = currentParts.slice(0, allRefs.length).join('_');
                                                                                                    setSubcategory({ ...subcategory, questions: updated });
                                                                                                }}
                                                                                            >
                                                                                                <option value="">{refField.label.length > 12 ? refField.label.substring(0, 12) + '...' : refField.label}</option>
                                                                                                {refField.options?.map(o => (
                                                                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                                <div className="relative w-20">
                                                                                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">₹</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        placeholder="Price"
                                                                                        className="w-full bg-white border border-slate-100 rounded pl-3 pr-1 py-0.5 text-[10px] focus:outline-none"
                                                                                        value={tier.price}
                                                                                        onChange={(e) => {
                                                                                            const updated = [...subcategory.questions];
                                                                                            updated[stepIndex].fields[fieldIndex].options[optIndex].tieredPrices[tierIndex].price = parseFloat(e.target.value) || 0;
                                                                                            setSubcategory({ ...subcategory, questions: updated });
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const updated = [...subcategory.questions];
                                                                                        updated[stepIndex].fields[fieldIndex].options[optIndex].tieredPrices.splice(tierIndex, 1);
                                                                                        setSubcategory({ ...subcategory, questions: updated });
                                                                                    }}
                                                                                    className="text-slate-300 hover:text-red-500"
                                                                                >
                                                                                    <X size={10} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <button
                                    onClick={() => {
                                        const updated = [...subcategory.questions];
                                        updated[stepIndex].fields.push({
                                            name: "new_field",
                                            label: "New Field",
                                            type: "radio",
                                            options: [],
                                            required: true
                                        });
                                        setSubcategory({ ...subcategory, questions: updated });
                                    }}
                                    className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Add Field
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div >
        </div >
    );
}
