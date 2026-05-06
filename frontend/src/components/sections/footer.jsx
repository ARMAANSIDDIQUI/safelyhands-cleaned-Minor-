"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerServices = [
    { title: 'Domestic Help', slug: 'domestic-help' },
    { title: 'Cook', slug: 'cooks' },
    { title: 'Babysitter', slug: 'babysitter' },
    { title: 'Elderly Care', slug: 'elderly-care' },
    { title: 'All-Rounder', slug: 'all-rounder' },
    { title: '24 Hrs Live-in', slug: '24-hour-live-in' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold font-display text-white">Safely Hands</span>
            </Link>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm">
              We are a technology-enabled platform simplifying the process of hiring domestic help in Moradabad. Verified, trained, and reliable.
            </p>
            <div className="flex gap-4">
              <Link href="https://www.facebook.com/profile.php?id=61588587803610" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Facebook size={18} />
              </Link>
              <Link href="https://www.instagram.com/safelyhands?igsh=aG43bTdta3NyMTM5" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Instagram size={18} />
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Services</h4>
            <ul className="space-y-4 text-sm">
              {footerServices.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="hover:text-primary transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
              <li><Link href="/services" className="hover:text-primary transition-colors font-bold mt-2 inline-block">View All →</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Contact</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="text-primary shrink-0" />
                <span>Near Sai mandir Ramganga vihar,<br />MDA Moradabad 244001</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={20} className="text-primary shrink-0" />
                <a href="mailto:Safelyhands@gmail.com" className="hover:text-white transition-colors">Safelyhands@gmail.com</a>
              </li>
              <li className="flex items-start gap-4">
                <Phone size={20} className="text-primary shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+917618341297" className="hover:text-white transition-colors">7618341297</a>
                  <a href="tel:+918218303038" className="hover:text-white transition-colors">8218303038</a>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Safely Hands. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/sitemap" className="hover:text-slate-300">Sitemap</Link>
            <Link href="/disclaimer" className="hover:text-slate-300">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;