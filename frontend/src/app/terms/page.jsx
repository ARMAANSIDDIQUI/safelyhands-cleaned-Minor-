import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";

export const metadata = {
    title: "Terms of Service - Safely Hands",
    description: "Read our terms and conditions for using Safely Hands services.",
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-transparent">
            <Header />
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold font-display text-slate-900 mb-8">Terms of Service</h1>
                <article className="prose prose-slate max-w-none">
                    <p>Welcome to Safely Hands. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions.</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>Safely Hands connects customers with verified domestic help professionals. We act as an intermediary platform.</p>
                    <h3>2. User Responsibilities</h3>
                    <p>You agree to provide accurate information and treat our professionals with respect.</p>
                    <h3>3. Payments</h3>
                    <p>Payments for subscriptions must be made in advance. We do not store credit card details.</p>
                    <h3>4. Cancellations</h3>
                    <p>Please refer to our Refund Policy for details on cancellations.</p>
                    <p className="text-sm text-slate-500 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
                </article>
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
