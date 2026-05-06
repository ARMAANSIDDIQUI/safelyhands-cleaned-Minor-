import "./globals.css";

import { Toaster } from "sonner";

export const metadata = {
    title: {
        default: "Safely Hands - Trusted Home Makers in Moradabad (Cooks, Maids, Babysitters)",
        template: "%s | Safely Hands Moradabad"
    },
    description: "Find verified & trained home help in Moradabad. Hire professional Cooks, Housekeepers, Babysitters, Japa Maids, and Elderly Care staff. Your best alternative to Urban Company for reliable daily home services.",
    keywords: [
        "maid agency moradabad", "cook for home moradabad", "babysitter near me", "japa maid service", "elderly care at home",
        "housekeeping services", "domestic help agency", "safely hands", "broomees alternative", "urban company moradabad",
        "home servant service", "24 hour live in maid", "patient care taker", "newborn baby care"
    ],
    authors: [{ name: "Safely Hands" }],
    creator: "Safely Hands",
    publisher: "Safely Hands",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: "Safely Hands - Best Home Service Agency in Moradabad",
        description: "Hire verified Cooks, Maids, Babysitters & Caregivers in Moradabad. 100% Police Verified Staff. Book online or call now.",
        url: "https://safelyhands.com",
        siteName: "Safely Hands",
        images: [
            {
                url: "/headerlogo.png",
                width: 800,
                height: 600,
                alt: "Safely Hands Home Services",
            },
        ],
        locale: "en_IN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Safely Hands - Trusted Home Help Services",
        description: "Need a Cook, Maid, or Babysitter? Get verified home staff in Moradabad with Safely Hands.",
        images: ["/headerlogo.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/favicon.png",
    },
    manifest: '/manifest.json',
    alternates: {
        canonical: "https://safelyhands.com",
    }
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Safely Hands",
    "image": "https://safelyhands.com/headerlogo.png",
    "description": "Premium home service agency in Moradabad providing verified Cooks, Maids, Babysitters, and Elderly Care professionals.",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Civil Lines",
        "addressLocality": "Moradabad",
        "addressRegion": "UP",
        "postalCode": "244001",
        "addressCountry": "IN"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 28.8386,
        "longitude": 78.7733
    },
    "url": "https://safelyhands.com",
    "telephone": "+91-9876543210", // Replace with actual number if available
    "priceRange": "₹500 - ₹25000",
    "openingHoursSpecification": [
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            "opens": "09:00",
            "closes": "21:00"
        }
    ],
    "sameAs": [
        "https://www.facebook.com/safelyhands",
        "https://www.instagram.com/safelyhands"
    ]
};

import { Providers } from "@/providers";
import GlobalBackground from "@/components/global-background";
import ScrollToTop from "@/components/ui/ScrollToTop";
import Header from "@/components/sections/header";
import { ReduxProvider } from "@/components/providers/ReduxProvider";


export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <body className="antialiased">
                <Providers>
                    <ReduxProvider>
                        <ScrollToTop />
                        <GlobalBackground />
                        <Header />
                        {children}
                    </ReduxProvider>
                </Providers>
                <Toaster
                    position="top-center"
                    toastOptions={{
                        className: 'rounded-[20px] border-2 border-blue-100 shadow-2xl !bg-white !text-slate-900 text-lg font-medium',
                        style: {
                            padding: '16px 32px',
                            minWidth: '350px',
                            fontSize: '18px',
                            boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.4)'
                        }
                    }}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js');
                                });
                            }
                        `,
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </body>
        </html>
    );
}
