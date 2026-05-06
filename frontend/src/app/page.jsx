import HeroSection from "@/components/sections/hero";
import WorkerBenefitCards from "@/components/sections/worker-benefits-cards";
import AppPromotion from "@/components/sections/app-promotion";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";
import dynamic from 'next/dynamic';

const FeaturedServices = dynamic(() => import("@/components/sections/featured-services"), {
    loading: () => <div className="h-96" />
});
const Highlights = dynamic(() => import("@/components/sections/highlights"));
const HumansOfBroomees = dynamic(() => import("@/components/sections/humans-of-broomees"));
const WhyChooseUs = dynamic(() => import("@/components/sections/why-choose-us"));
const FAQs = dynamic(() => import("@/components/sections/faqs"));
const CustomerTestimonial = dynamic(() => import("@/components/sections/customer-testimonial"));
const CTACards = dynamic(() => import("@/components/sections/cta-cards"));

export default function Home() {
    return (
        <main className="min-h-screen relative">
            <HeroSection />
            <FeaturedServices />
            <Highlights />
            <HumansOfBroomees />
            <WhyChooseUs />
            <CustomerTestimonial />
            <CTACards />
            <FAQs />
            <WorkerBenefitCards />
            <AppPromotion />
            <Footer />
            <ChatWidget />
        </main>
    );
}
