"use client";

import React, { useState } from "react";
import { ArrowLeft, Banknote, QrCode, Copy, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PaymentPage() {
    const [copiedStates, setCopiedStates] = useState({
        account: false,
        ifsc: false,
        upi: false
    });

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [field]: true }));
        toast.success(`Copied ${field} to clipboard`);
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [field]: false }));
        }, 2000);
    };

    return (
        <main className="min-h-screen bg-transparent pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 relative z-10">

                {/* Header Section */}
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
                            <ArrowLeft className="w-6 h-6 text-slate-700" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Payment Details</h1>
                        <p className="text-slate-500 mt-1">Please remit your payment using the details below.</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* QR Code Section */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center">
                        <div className="bg-sky-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <QrCode className="w-8 h-8 text-sky-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Scan QR Code</h2>
                        <p className="text-slate-500 text-sm mb-8">Open any UPI app to scan and pay</p>

                        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-md">
                            <div className="relative w-48 h-48">
                                <Image
                                    src="/images/qr.jpeg"
                                    alt="UPI QR Code"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>

                        <div className="mt-8 w-full p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div className="text-left">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">UPI ID</p>
                                <p className="font-mono font-medium text-slate-800">6399980449@ybl</p>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleCopy("6399980449@ybl", "upi")}
                                className={copiedStates.upi ? "text-green-600 border-green-200 bg-green-50" : ""}
                            >
                                {copiedStates.upi ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <Banknote className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Bank Transfer</h2>
                        <p className="text-slate-500 text-sm mb-8">Use NEFT, RTGS, or IMPS for direct bank transfers</p>

                        <div className="space-y-4 flex-1">

                            {/* Account Holder */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Holder</p>
                                <p className="font-medium text-slate-800 text-lg">Nikhil Bansal</p>
                            </div>

                            {/* Bank Name & Branch */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bank Name</p>
                                <p className="font-medium text-slate-800 mb-2 text-lg">State Bank of India</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Branch</p>
                                <p className="font-medium text-slate-800">Lajpat Nagar Moradabad</p>
                            </div>

                            {/* Account Number */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Number</p>
                                    <p className="font-mono font-bold text-slate-800 text-lg tracking-wider">37830110244</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleCopy("37830110244", "account")}
                                    className={copiedStates.account ? "text-green-600 border-green-200 bg-green-50" : ""}
                                >
                                    {copiedStates.account ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>

                            {/* IFSC Code */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">IFSC Code</p>
                                    <p className="font-mono font-bold text-slate-800 text-lg tracking-wider">SBIN0050690</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleCopy("SBIN0050690", "ifsc")}
                                    className={copiedStates.ifsc ? "text-green-600 border-green-200 bg-green-50" : ""}
                                >
                                    {copiedStates.ifsc ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Important Note */}
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 text-sky-800">
                    <h3 className="font-bold mb-2">Important Instructions:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-sky-700">
                        <li>Please ensure that the account details exactly match those provided above to prevent delays.</li>
                        <li>After completing your payment, please upload a screenshot of your successful transaction to your specific <strong>Booking Details</strong> page in your Dashboard.</li>
                        <li>This proof helps our admins verify your payment automatically and securely.</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
