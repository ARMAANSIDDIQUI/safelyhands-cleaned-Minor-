import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";

export const metadata = {
    title: "Refund Policy - Safely Hands",
    description: "Details regarding cancellations and refunds for Safely Hands services.",
};

export default function RefundPage() {
    return (
        <main className="min-h-screen bg-transparent">
            <Header />
            <div className="pt-[120px] pb-20 container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-8">Refund Policy</h1>
                <article className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600">
                    <p>Our goal is ensuring your satisfaction with our services.</p>
                    <h3>1. Subscription Refunds</h3>
                    <p>Refunds are processed on a pro-rata basis if you cancel your subscription within the first 7 days.</p>
                    <h3>2. Replacement Policy</h3>
                    <p>If you are unhappy with a professional, we offer unlimited replacements during your active subscription period instead of a refund.</p>
                    <h3>3. Processing Time</h3>
                    <p>Approved refunds are processed within 5-7 business days to the original payment method.</p>
                    <p className="text-sm text-slate-500 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
                </article>
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
