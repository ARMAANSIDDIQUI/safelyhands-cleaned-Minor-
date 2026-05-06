import HeroIntro from "@/components/sections/hero-intro";
import ServicesGrid from "@/components/sections/services-grid";
import WhyChooseUs from "@/components/sections/why-choose-us";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";

import ThreeDBackground from "@/components/three-d-background";

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-transparent pt-[64px]">
            <HeroIntro />
            <ServicesGrid />
            <WhyChooseUs />
            <Footer />
            <ChatWidget />
        </main>
    );
}
