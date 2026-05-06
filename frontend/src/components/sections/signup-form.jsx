"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function SignupForm() {
    const { register, verifyEmail } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 1) {
            // Validate phone is exactly 10 digits
            if (!/^\d{10}$/.test(formData.phone)) {
                return toast.error("Please enter a valid 10-digit phone number");
            }

            if (formData.password !== formData.confirmPassword) {
                return toast.error("Passwords do not match");
            }

            setIsLoading(true);

            // Register returns { success, message, email } but DOES NOT log in
            const result = await register(formData.name, formData.email, formData.phone, formData.password);

            if (result.success) {
                toast.success(result.message || "OTP Sent to email!");
                setStep(2);
            } else {
                toast.error(result.message || "Signup failed");
            }
            setIsLoading(false);
        } else {
            // Verify OTP
            if (otp.length !== 6) {
                return toast.error("Please enter a valid 6-digit OTP");
            }

            setIsLoading(true);
            const result = await verifyEmail(formData.email, otp);

            if (result.success) {
                toast.success("Account verified successfully! Welcome.");
                // Redirect is handled in AuthContext
            } else {
                toast.error(result.message || "Verification failed");
            }
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Only allow digits for phone, max 10
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, phone: digitsOnly });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    return (
        <div className="w-full max-w-md px-6 z-10">
            <div className="glass-effect rounded-[24px] p-8 md:p-10 shadow-float border border-white/60 relative overflow-hidden">

                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold font-display text-slate-900 mb-2">
                        {step === 1 ? "Create Account" : "Verify Email"}
                    </h2>
                    <p className="text-slate-500">
                        {step === 1 ? "Join Safely Hands for trusted home services" : `Enter the OTP sent to ${formData.email}`}
                    </p>
                </div>

                {step === 1 && (
                    <>
                        {/* Google Signup */}
                        <button
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold h-[50px] rounded-xl transition-all duration-300 mb-6 group hover:shadow-md hover:border-slate-300"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Sign up with Google</span>
                        </button>

                        <div className="relative flex items-center justify-center mb-6">
                            <div className="border-t border-slate-200 w-full"></div>
                            <span className="bg-transparent px-3 text-xs text-slate-400 font-medium uppercase absolute bg-white/50 backdrop-blur-sm">Or with email</span>
                        </div>
                    </>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 ? (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="name">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full bg-white/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-11 pr-4 h-[50px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="phone">Phone Number</label>
                                <div className="relative flex">
                                    <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 text-slate-600 text-sm rounded-l-xl font-medium">
                                        +91
                                    </span>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        maxLength={10}
                                        className="w-full bg-white/80 border border-slate-200 text-slate-900 text-sm rounded-r-xl px-4 h-[50px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="email">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full bg-white/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-11 pr-4 h-[50px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="password">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a password"
                                        className="w-full bg-white/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-11 pr-12 h-[50px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="confirmPassword">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        className="w-full bg-white/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-11 pr-12 h-[50px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                                Please enter the 6-digit OTP sent to <strong>{formData.email}</strong>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="otp">One-Time Password</label>
                                <div className="relative">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setOtp(val);
                                        }}
                                        placeholder="123456"
                                        maxLength={6}
                                        className="w-full bg-white/80 border border-slate-200 text-slate-900 text-2xl tracking-[0.5em] font-mono text-center rounded-xl h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
                                >
                                    Change email address
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white font-bold h-[50px] rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-200/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {step === 1 ? "Create Account" : "Verify Email"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
