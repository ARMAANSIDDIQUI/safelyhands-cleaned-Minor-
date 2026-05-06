import SignupForm from "@/components/sections/signup-form";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";

export const metadata = {
    title: "Sign Up - Safely Hands",
    description: "Create your Safely Hands account to book trusted home services.",
};

export default function SignupPage() {
    return (
        <main className="min-h-screen">
            <div className="pt-[100px] pb-12 relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50/50">
                {/* Decorative Background Elements */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-300/20 rounded-full blur-[100px] pointer-events-none" />

                <SignupForm />
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
