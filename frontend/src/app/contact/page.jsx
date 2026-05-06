import ContactForm from "@/components/sections/contact-form";
import SupportChannels from "@/components/sections/support-channels";
import Footer from "@/components/sections/footer";
import ChatWidget from "@/components/sections/chat-widget";

export default function ContactPage() {
    return (
        <main className="min-h-screen pt-[64px]">
            <div className="py-12">
                <h1 className="text-center text-4xl font-bold font-display text-slate-800 mb-4">Contact Us</h1>
                <p className="text-center text-slate-600 max-w-2xl mx-auto px-4">
                    We&apos;re here to help you with any queries or concerns. Fill out the form below or reach out to us directly.
                </p>
            </div>
            <ContactForm />

            {/* Map Section */}
            <div className="container mx-auto px-4 mb-16">
                <div className="w-full h-[300px] md:h-[450px] rounded-[32px] overflow-hidden border border-slate-200 shadow-lg">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3493.9171894205365!2d78.75134717550957!3d28.871081075535315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjjCsDUyJzE1LjkiTiA3OMKwNDUnMTQuMSJF!5e0!3m2!1sen!2sin!4v1771193171590!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>

            <SupportChannels />
            <Footer />
            <ChatWidget />
        </main>
    );
}
