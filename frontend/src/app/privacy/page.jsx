import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";

export const metadata = {
    title: "Privacy Policy - Safely Hands",
    description: "How Safely Hands collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-transparent">
            <Header />
            <div className="pt-[120px] pb-20 container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-8">Privacy Policy</h1>
                <article className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600">
                    <p>Your privacy is important to us. This policy outlines how we handle your data.</p>
                    <h3>1. Information Collection</h3>
                    <p>We collect information such as name, phone number, and address to facilitate service bookings.</p>
                    <h3>2. Data Usage</h3>
                    <p>Your data is used solely for providing services, communicating updates, and improving our platform.</p>
                    <h3>3. Data Protection</h3>
                    <p>We implement security measures to protect your personal information.</p>
                    <h3>4. Third Parties</h3>
                    <p>We do not sell your data to third parties. We may share data with verified service providers only for booking purposes.</p>
                    <p className="text-sm text-slate-500 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
                </article>
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
