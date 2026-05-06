import AboutHero from "@/components/sections/about-hero";
import CompanyCarousel from "@/components/sections/company-carousel";
import MissionSection from "@/components/sections/mission";
import AboutTeamGrid from "@/components/sections/about-team-grid";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";
import CredibilityLogos from "@/components/sections/credibility-logos";

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-[64px] bg-transparent">
            <AboutHero />
            <CompanyCarousel />
            <MissionSection />
            <AboutTeamGrid />
            {/* 6. Credibility Section */}
            <CredibilityLogos />

            <Footer />
            <ChatWidget />
        </main>
    );
}
