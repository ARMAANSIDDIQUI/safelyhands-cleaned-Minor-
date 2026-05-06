"use client";

import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";
import { AlertCircle } from "lucide-react";

export default function DisclaimerPage() {
    return (
        <main className="min-h-screen bg-transparent">
            <Header />
            <div className="pt-[120px] pb-20 container mx-auto px-6 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-slate-900">Disclaimer</h1>
                </div>

                <article className="prose prose-slate max-w-none bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-[32px] border border-white/20 shadow-xl">
                    <h3 className="text-slate-800">1. Information Accuracy</h3>
                    <p className="text-slate-600">
                        The information provided on Safely Hands is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind about the completeness, accuracy, reliability, or suitability with respect to the website.
                    </p>

                    <h3 className="text-slate-800">2. Service Intermediation</h3>
                    <p className="text-slate-600">
                        Safely Hands acts as a technology platform connecting customers with domestic help professionals. While we perform verification checks, customers are advised to perform their own due diligence before hiring.
                    </p>

                    <h3 className="text-slate-800">3. Liability</h3>
                    <p className="text-slate-600">
                        In no event will Safely Hands be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
                    </p>

                    <h3 className="text-slate-800">4. External Links</h3>
                    <p className="text-slate-600">
                        Through this website you may be able to link to other websites which are not under the control of Safely Hands. We have no control over the nature, content and availability of those sites.
                    </p>

                    <p className="text-sm text-slate-500 mt-12 italic border-t border-slate-200 pt-6">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </article>
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
