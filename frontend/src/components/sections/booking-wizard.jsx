"use client";

import React, { useState, useEffect } from "react";
import { Check, Calendar, MapPin, User, ChevronRight, ChevronLeft, Loader2, Star, Plus, ArrowLeft, Trash2, Clock, Info, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import DynamicServiceModal from "./DynamicServiceModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchServices, selectAllServices, selectServiceStatus } from "@/store/slices/serviceSlice";
import ImageUpload from "@/components/ui/image-upload";

export default function BookingWizard() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Steps: 1=City, 2=Service, 3=SubCategory(Cart), 4=Details
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);

    // Data
    const [cities, setCities] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    // Selections
    const [selectedCity, setSelectedCity] = useState("");
    const [regionInput, setRegionInput] = useState("");
    const [selectedService, setSelectedService] = useState(null);

    // Cart
    const [cart, setCart] = useState([]); // [{ subCategory, answers, price, quantity, _tempId }]

    // Modal
    const [showDynamicModal, setShowDynamicModal] = useState(false);
    const [currentSubCategory, setCurrentSubCategory] = useState(null);

    // Form Data (for Step 4)
    const [formData, setFormData] = useState({
        date: "",
        time: "",
        address: "",
        phone: "",
        notes: "",
        genderPreference: "Female", // Default global preference
        babyDOB: "2025-12-01",
        paymentProofUrl: "",
        // Additional fields can be added here
    });

    useEffect(() => {
        if (user && user.phone) {
            setFormData(prev => ({ ...prev, phone: user.phone }));
        }
    }, [user]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redux
    const dispatch = useAppDispatch();
    const services = useAppSelector(selectAllServices);
    const servicesStatus = useAppSelector(selectServiceStatus);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Cities (Local for now)
                const citiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cities`);
                if (citiesRes.ok) setCities((await citiesRes.json()).filter(c => c.isActive));

                // Fetch Services (Redux)
                if (servicesStatus === 'idle') {
                    await dispatch(fetchServices()).unwrap();
                }

            } catch (error) {
                console.error('Failed to fetch data', error);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch, servicesStatus]);

    // URL Step & Service Synchronization for Tour/Deep-linking
    useEffect(() => {
        const serviceSlug = searchParams.get('service');
        const stepParam = searchParams.get('step');

        if (serviceSlug && services.length > 0) {
            const preSelected = services.find(s => s.slug === serviceSlug);
            if (preSelected) {
                setSelectedService(preSelected);
            }
        }

        if (stepParam) {
            const targetStep = parseInt(stepParam);
            if (targetStep >= 1 && targetStep <= 4) {
                setStep(targetStep);

                // Helper: if forcing a step, ensure minimum state exists to prevent crash
                if (targetStep >= 2 && !selectedCity) setSelectedCity('moradabad'); // Default for tour
                if (targetStep >= 3 && !selectedService && services.length > 0) setSelectedService(services[0]); // Default for tour
            }
        }
    }, [searchParams, services]);

    const [babyDOB, setBabyDOB] = useState("2024-11-04"); // Default recent date
    const [showJapaAlert, setShowJapaAlert] = useState(false);

    // Fetch SubCategories when Service Selected
    useEffect(() => {
        if (selectedService) {
            const fetchSubs = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${selectedService._id}/subcategories`);
                    if (res.ok) {
                        const data = await res.json();
                        setSubCategories(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch subcategories", err);
                }
            };
            fetchSubs();
            // Only clear cart if the service changes or if it's a fresh selection
            // We might want to keep cart if just navigating back/forth? 
            // For now, simple clear is safer to avoid mismatches
            setCart([]);

            // Reset baby specific states if not babysitter
            if (selectedService.slug !== 'babysitter') {
                setShowJapaAlert(false);
            }
        }
    }, [selectedService]);

    // Baby Age Calculation Logic
    useEffect(() => {
        if (selectedService?.slug === 'babysitter' && babyDOB) {
            const dob = new Date(babyDOB);
            const today = new Date();
            const diffTime = Math.abs(today - dob);
            const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44); // Approx months

            if (diffMonths < 2) {
                setShowJapaAlert(true);
            } else {
                setShowJapaAlert(false);
            }
        }
    }, [selectedService, babyDOB]);

    const filteredSubCategories = subCategories.filter(sub => {
        // Always hide inactive subcategories
        if (sub.isActive === false) return false;

        if (selectedService?.slug !== 'babysitter') return true;

        if (showJapaAlert) {
            return sub.name.toLowerCase().includes('japa');
        } else {
            return !sub.name.toLowerCase().includes('japa');
        }
    });


    // Navigation Handlers
    const handleNext = () => {
        if (step === 1) {
            if (!selectedCity) return toast.error("Please select your city");
            if (selectedCity === 'near-moradabad' && !regionInput) return toast.error("Please specify your region");

            // Auto-skip Step 2 if service is already selected (e.g. via URL)
            if (selectedService) {
                setStep(3);
                return;
            }
        }
        if (step === 2 && !selectedService) return toast.error("Please select a service");
        if (step === 3 && cart.length === 0) return toast.error("Please select at least one option");

        setStep(prev => Math.min(prev + 1, 4));
    };

    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    // Cart Handlers
    const initAddSubCat = (subCat) => {
        setCurrentSubCategory(subCat);
        setShowDynamicModal(true);
    };

    const handleModalConfirm = (answers, price) => {
        const newItem = {
            subCategory: currentSubCategory,
            answers,
            price,
            quantity: 1,
            _tempId: Date.now() // Simple ID for frontend key
        };

        if (selectedService.selectionMode === 'single') {
            setCart([newItem]);
        } else {
            setCart(prev => [...prev, newItem]);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(item => item._tempId !== itemId));
    };

    // Helper to calculate total
    const calculatedTotal = cart.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);

    const [bookingSuccess, setBookingSuccess] = useState(null); // Stores booking ID on success

    // Submission
    const handleSubmit = async () => {
        if (!user) {
            toast.error("Please login to complete your booking");
            router.push("/login?redirect=/booking");
            return;
        }

        if (!formData.date || !formData.address || !formData.time || !formData.phone) {
            toast.error("Please fill all required details (Date, Time, Address, Phone)");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            serviceType: selectedService.title,
            items: cart.map(item => ({
                subCategory: item.subCategory._id,
                quantity: item.quantity,
                answers: item.answers,
                price: item.price
            })),
            genderPreference: formData.genderPreference,
            date: formData.date,
            time: formData.time,
            address: `${formData.address}${regionInput ? `, ${regionInput}` : ''}`,
            phone: formData.phone,
            city: selectedCity,
            notes: formData.notes,
            totalAmount: calculatedTotal,
            frequency: 'Daily',
            paymentProofUrl: formData.paymentProofUrl
        };

        try {
            console.log("BookingWizard: Submitting booking. Token:", user.token);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Booking failed");

            // Success: Show success screen instead of redirect
            setBookingSuccess(data._id);
            // Optional: Scroll to top to ensure visibility
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto md:py-8">
            <div className="bg-white/80 backdrop-blur-xl md:rounded-[24px] shadow-2xl overflow-hidden min-h-[600px] flex flex-col border-y md:border border-white/20">

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        {step > 1 && (
                            <button onClick={handleBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <ArrowLeft size={24} className="text-slate-800" />
                            </button>
                        )}
                        <h1 className="text-2xl font-display font-bold text-slate-800">
                            {step === 1 ? 'Select City' :
                                step === 2 ? 'Select Service' :
                                    step === 3 ? 'Customize Package' : 'Final Details'}
                        </h1>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 md:p-10 relative bg-white/50">

                    {/* SUCCESS SCREEN */}
                    {bookingSuccess ? (
                        <div className="flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-sm">
                                <Check size={48} strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                            <p className="text-slate-500 max-w-md mb-8">
                                Your booking request has been received. Our team will review it and assign a professional shortly.
                            </p>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 max-w-sm w-full">
                                <p className="text-sm text-slate-500 font-medium mb-1">Booking Reference ID</p>
                                <p className="text-xl font-mono font-bold text-slate-800 tracking-wider">
                                    #{bookingSuccess.slice(-6).toUpperCase()}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                <button
                                    onClick={() => router.push("/dashboard/bookings")}
                                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-sky-100 transition-all"
                                >
                                    Go to My Bookings
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-600 py-4 rounded-xl font-bold text-lg transition-all"
                                >
                                    Book Another
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>

                            {/* STEP 1: CITY */}
                            {step === 1 && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-lg mx-auto">
                                    <div className="text-center mb-10">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Where are you located?</h2>
                                        <p className="text-slate-500">Select your city to see available services</p>
                                    </div>
                                    <div className="space-y-4 relative" id="booking-city-select">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer hover:bg-slate-100/50"
                                        >
                                            <option value="" disabled>Choose a city...</option>
                                            {cities.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                    </div>
                                    {cities.find(c => c.slug === selectedCity)?.isOther && (
                                        <input
                                            type="text"
                                            placeholder="Enter your region..."
                                            value={regionInput}
                                            onChange={(e) => setRegionInput(e.target.value)}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    )}
                                </div>
                            )}

                            {/* STEP 2: SERVICE */}
                            {step === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6" id="booking-service-heading">Choose a Service</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="booking-service-type">
                                        {services.map(service => (
                                            <div
                                                key={service._id}
                                                onClick={() => setSelectedService(service)}
                                                className={cn(
                                                    "group relative bg-white rounded-2xl p-4 shadow-sm border-2 transition-all cursor-pointer flex gap-4 hover:border-sky-200",
                                                    selectedService?._id === service._id ? "border-sky-500 bg-sky-50/10" : "border-slate-100"
                                                )}
                                            >
                                                <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                    <Image src={service.imageUrl || "/placeholder.jpg"} alt={service.title} fill className="object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-900">{service.title}</h3>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{service.description}</p>
                                                </div>
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1",
                                                    selectedService?._id === service._id ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300"
                                                )}>
                                                    {selectedService?._id === service._id && <Check size={14} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: SUB-CATEGORIES (CART) */}
                            {step === 3 && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col md:flex-row gap-8 min-h-[500px]">
                                    {/* Left: Options */}
                                    <div className="flex-1 space-y-6" id="booking-options-container">
                                        <div className="flex justify-between items-center" id="booking-options-header">
                                            <h2 className="text-xl font-bold text-slate-800" id="booking-subcategory-heading">Available Options</h2>
                                            <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-600 rounded-full">
                                                {selectedService?.selectionMode === 'multiple' ? 'Multi-Select' : 'Single Select'}
                                            </span>
                                        </div>

                                        {selectedService?.slug === 'babysitter' && (
                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Baby's Date of Birth</label>
                                                <div className="flex gap-4 items-center">
                                                    <input
                                                        type="date"
                                                        value={babyDOB}
                                                        onChange={(e) => setBabyDOB(e.target.value)}
                                                        className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
                                                    />
                                                    {showJapaAlert && (
                                                        <div className="text-sm text-blue-600 font-bold bg-blue-100 px-3 py-1 rounded-full animate-pulse">
                                                            Results updated for newborn care (Japa)
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4" id="booking-subcategory-list">
                                            {filteredSubCategories.map(sub => {
                                                const isInCart = cart.some(item => item.subCategory._id === sub._id);
                                                return (
                                                    <div key={sub._id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 transition-all hover:shadow-md">
                                                        <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                            <Image
                                                                src={sub.image || selectedService.imageUrl}
                                                                alt={sub.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 768px) 96px, 128px"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-slate-900">{sub.name}</h3>
                                                            <p className="text-sm text-sky-500 font-bold">₹{sub.price}</p>
                                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sub.description}</p>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {sub.features.slice(0, 2).map((feat, i) => (
                                                                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600">{feat}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col justify-center">
                                                            {isInCart ? (
                                                                <button
                                                                    disabled
                                                                    className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center cursor-not-allowed font-bold text-xl"
                                                                >
                                                                    <Check size={20} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => initAddSubCat(sub)}
                                                                    className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all font-bold text-xl"
                                                                >
                                                                    <Plus size={20} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Right: Cart Summary */}
                                    <div className="w-full md:w-80 flex-shrink-0" id="booking-cart-summary">
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 sticky top-4">
                                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-sky-500" />
                                                Your Package
                                            </h3>

                                            {cart.length === 0 ? (
                                                <div className="text-center py-8 text-slate-400 text-sm">
                                                    No items selected
                                                </div>
                                            ) : (
                                                <div className="space-y-4 mb-6">
                                                    {cart.map((item) => (
                                                        <div key={item._tempId} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative group">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-bold text-sm text-slate-800 leading-tight">{item.subCategory.name}</span>
                                                                <span className="font-bold text-xs text-sky-500">₹{item.price}</span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 space-y-1">
                                                                {Object.entries(item.answers).map(([key, val]) => (
                                                                    <div key={key} className="flex justify-between">
                                                                        <span className="capitalize">{key}:</span>
                                                                        <span className="font-medium">{val}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button
                                                                onClick={() => removeFromCart(item._tempId)}
                                                                className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    <div className="border-t border-slate-200 pt-4">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm font-medium text-slate-600">Duration</span>
                                                            <span className="text-sm font-bold text-slate-800">1 Month (Daily Service)</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-slate-700">Total</span>
                                                            <span className="font-bold text-xl text-sky-600">₹{calculatedTotal}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* STEP 4: DETAILS */}
                            {step === 4 && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Final Details</h2>

                                    <div className="space-y-6">
                                        {/* Duration Info */}
                                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                                            <Info className="text-blue-600 mt-0.5" size={20} />
                                            <div>
                                                <h4 className="font-bold text-blue-800 text-sm">Monthly Service Plan</h4>
                                                <p className="text-xs text-blue-600 mt-1">
                                                    This booking is for a duration of 30 days. The worker will visit daily at your preferred time.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Date & Time */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                                                <div className="relative" id="booking-date-time">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="date"
                                                        value={formData.date}
                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Time</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="time"
                                                        value={formData.time}
                                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address & Phone */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Complete Address</label>
                                                <textarea
                                                    id="booking-address"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    placeholder="House No, Street, Landmark..."
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 h-24 resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                                <div className="flex h-12">
                                                    <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-bold">
                                                        +91
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 bg-slate-50 border border-slate-200 rounded-r-xl focus:outline-none focus:border-sky-500 font-medium text-slate-700"
                                                        placeholder="10-digit number"
                                                        maxLength={10}
                                                        value={formData.phone}
                                                        onChange={(e) => {
                                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                            setFormData({ ...formData, phone: digits });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shared Gender Pref (if applicable) */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Gender of Worker</label>
                                            <div className="flex gap-4">
                                                {['Female', 'Male', 'Any'].map(g => (
                                                    <button
                                                        key={g}
                                                        onClick={() => setFormData({ ...formData, genderPreference: g })}
                                                        className={cn(
                                                            "flex-1 py-3 rounded-xl border font-bold transition-all",
                                                            formData.genderPreference === g ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes</label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="Any specific requirements..."
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 h-24 resize-none"
                                            />
                                        </div>

                                        {/* Payment Details */}
                                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl mt-6">
                                            <h3 className="text-lg font-bold text-slate-800 mb-4">Payment Details</h3>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1">
                                                    <p className="text-sm text-slate-600 mb-3">Please scan the QR code to make the payment. Bank details are also provided below.</p>
                                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4 flex justify-center">
                                                        <img src="/images/qr.jpeg" alt="Payment QR Code" className="rounded-lg object-contain w-[200px] h-[200px]" />
                                                    </div>
                                                    <div className="space-y-1 text-sm bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                        <p><span className="font-semibold">Bank:</span> State Bank of India</p>
                                                        <p><span className="font-semibold">A/c Holder:</span> Nikhil Bansal</p>
                                                        <p><span className="font-semibold">A/c No:</span> 37830110244</p>
                                                        <p><span className="font-semibold">IFSC:</span> SBIN0050690</p>
                                                        <p><span className="font-semibold">Branch:</span> Lajpat Nagar Moradabad</p>
                                                        <div className="border-t my-2 pt-2">
                                                            <p><span className="font-semibold flex items-center gap-1">UPI ID:</span> 6399980449@ybl</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-col">
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload Payment Proof (Optional)</label>
                                                    <ImageUpload
                                                        value={formData.paymentProofUrl}
                                                        onChange={(url) => setFormData({ ...formData, paymentProofUrl: url })}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-2 text-center">Supported formats: Images/Videos</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </>
                    )}

                </div>

                {/* Footer Actions */}
                {!bookingSuccess && (
                    <div className="p-6 bg-white/10 backdrop-blur-md border-t border-white/10 flex justify-between items-center">
                        <div className="hidden md:block">
                            {step === 3 && (
                                <p className="text-sm text-slate-500">
                                    Total Estimate: <span className="font-bold text-slate-900">₹{calculatedTotal}</span>
                                </p>
                            )}
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                id="booking-submit-btn"
                                onClick={step === 4 ? handleSubmit : handleNext}
                                disabled={isSubmitting}
                                className="flex-1 md:w-48 h-12 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : (step === 4 ? "Confirm Booking" : "Next")}
                                {!isSubmitting && step < 4 && <ChevronRight size={18} />}
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Dynamic Modal */}
            <DynamicServiceModal
                isOpen={showDynamicModal}
                onClose={() => setShowDynamicModal(false)}
                subCategory={currentSubCategory}
                onConfirm={handleModalConfirm}
            />
        </div >
    );
}
