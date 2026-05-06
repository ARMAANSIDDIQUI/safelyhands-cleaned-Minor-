import Header from "@/components/sections/header";
import ServiceDetail from "@/components/sections/service-detail";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";

export const metadata = {
    title: "Elderly Care Services - Safely Hands",
    description: "Compassionate and professional elderly care services. Trusted caregivers for your loved ones.",
};

async function getService(slug) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/slug/${slug}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

export default async function ElderlyCarePage() {
    const slug = "elderly-care";
    const initialData = await getService(slug);

    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="pt-[80px]">
                <ServiceDetail slug={slug} initialData={initialData} />
            </div>
            <Footer />
            <ChatWidget />
        </main>
    );
}
