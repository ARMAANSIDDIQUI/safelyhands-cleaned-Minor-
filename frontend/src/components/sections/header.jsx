"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Baby, ChefHat, Home, HeartPulse, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// import { Button } from "@/components/ui/button";

const SERVICE_ICONS = {
  'babysitter': Baby,
  'cooks': ChefHat,
  'domestic-help': Home,
  'elderly-care': HeartPulse,
  'all-rounder': Clock,
  '24-hour-live-in': Clock,
};

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [equalizerBars, setEqualizerBars] = useState([]);
  const [services, setServices] = useState([]);
  const pathname = usePathname();

  useEffect(() => {
    setEqualizerBars(
      Array.from({ length: 40 }).map(() => ({
        animationDuration: Math.random() * 2 + 2.5, // Much slower: 2.5s to 4.5s
        animationDelay: Math.random() * 1,
        height: Math.random() * 40 + 20
      }))
    );
  }, []);

  // Check if header should be hidden
  const shouldHideHeader = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/worker');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const fetchServices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setServices(data.slice(0, 6)); // Top 6 for dropdown
        }
      } catch (err) {
        console.error("Failed to fetch services for header", err);
      }
    };

    fetchServices();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  if (shouldHideHeader) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isMenuOpen
        ? "bg-[#f0f9ff] py-2 shadow-md border-b border-blue-100"
        : isScrolled
          ? "bg-[#f0f9ff]/90 backdrop-blur-md py-0.5 shadow-md border-b border-blue-100"
          : "bg-transparent py-1.5"
        }`}
    >
      {/* Dynamic Equalizer Bars (Inverted Bass) - Only Visible When Unscrolled */}
      {equalizerBars.length > 0 && (
        <div
          className={`absolute top-0 left-0 w-full h-32 -z-10 flex items-start justify-between px-2 overflow-hidden pointer-events-none transition-opacity duration-500 
            ${(!isScrolled && !isMenuOpen) ? "opacity-60" : "opacity-0"}`}
        >
          {equalizerBars.map((bar, i) => (
            <div
              key={i}
              className="w-1 md:w-2 bg-sky-400 rounded-b-full mx-[2px] animate-equalizer"
              style={{
                animationDuration: `${bar.animationDuration}s`,
                animationDelay: `${bar.animationDelay}s`,
                height: `${bar.height}px`
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`relative transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'w-48 h-12' : 'w-64 h-16'}`}>
            <Image
              src="/headerlogo.png"
              alt="Safely Hands"
              fill
              className="object-contain object-left"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors"> {/* Increased text-base to text-lg */}
            Home
          </Link>
          <div className="relative group">
            <Link href="/services" className="flex items-center gap-1 text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors"> {/* Increased text-base to text-lg */}
              Services <ChevronDown size={14} strokeWidth={3} />
            </Link>
            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {services.map((service) => {
                const Icon = SERVICE_ICONS[service.slug] || ChefHat;
                return (
                  <Link
                    key={service._id}
                    href={`/services/${service.slug || service._id}`}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Icon size={16} className="text-blue-500" />
                    {service.title}
                  </Link>
                );
              })}
              <div className="border-t border-slate-100 mt-2 pt-2">
                <Link href="/services" className="block px-4 py-2.5 text-sm font-extrabold text-blue-600 hover:bg-blue-50 transition-colors">
                  View All Services →
                </Link>
              </div>
            </div>
          </div>
          <Link href="/about" className="text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-base font-bold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-base font-bold hover:shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <LayoutDashboard size={18} />
                  Admin Panel
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors"
                >
                  <User size={18} className="text-blue-600" />
                  <span className="text-base font-semibold text-slate-700">{user.name}</span>
                  <ChevronDown size={14} className="text-slate-600" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-2 text-base text-slate-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-base text-purple-600 hover:bg-purple-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={16} />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-base font-bold text-slate-600 hover:text-blue-600 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/booking"
                id="header-book-btn"
                className="bg-slate-900 text-white px-6 py-2 rounded-full text-base font-bold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-300"
              >
                Book Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-slate-800 hover:bg-blue-50 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Tagline Ticker - Only on Home Page */}
      {pathname === "/" && (
        <div className={`w-full overflow-hidden whitespace-nowrap py-0 bg-blue-600/5 border-t border-blue-200/30 transition-all duration-500 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
          <div className="inline-block animate-ticker">
            <span className="inline-flex items-center gap-2 px-8 text-blue-800/80 font-bold text-xs uppercase tracking-[0.2em] py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Har zaroorat ke liye ek bharosemand haath
              <span className="mx-12 opacity-30">•</span>
              Trusted Care & Staffing Services
              <span className="mx-12 opacity-30">•</span>
              Verified Professional Help
            </span>
            <span className="inline-flex items-center gap-2 px-8 text-blue-800/80 font-bold text-xs uppercase tracking-[0.2em] py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Har zaroorat ke liye ek bharosemand haath
              <span className="mx-12 opacity-30">•</span>
              Trusted Care & Staffing Services
              <span className="mx-12 opacity-30">•</span>
              Verified Professional Help

            </span>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 w-[280px] h-[100dvh] bg-white shadow-2xl z-[1001] transition-transform duration-300 transform lg:hidden flex flex-col border-l border-slate-200 ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="font-bold text-lg text-slate-900">Menu</div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {['Home', 'Services', 'About Us', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'About Us' ? '/about' : `/${item.toLowerCase().replace(' ', '-') === 'home' ? '' : item.toLowerCase().replace(' ', '-')}`}
                className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>

          {!user && (
            <div className="mt-8 px-4">
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="font-bold text-blue-900 mb-1">New here?</div>
                <p className="text-xs text-blue-700 mb-3">Create an account to manage your bookings easily.</p>
                <Link
                  href="/signup"
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          {user ? (
            <>
              <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Logged in as</p>
                <p className="font-semibold text-slate-900">{user.name}</p>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold mb-2 hover:bg-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-semibold mb-2 hover:shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Admin Panel
                </Link>
              )}
              <Link
                href="/dashboard/profile"
                className="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold mb-2 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} />
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full border border-red-200 text-red-600 py-2.5 rounded-xl font-semibold hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center justify-center w-full border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold mb-3 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/booking"
                className="flex items-center justify-center w-full bg-slate-900 text-white py-3 rounded-xl font-semibold shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Book a Service
              </Link>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: inline-block;
          animation: ticker 25s linear infinite;
        }
        @keyframes equalizer {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
        .animate-equalizer {
          animation: equalizer 2s ease-in-out infinite;
          transform-origin: top;
        }
      `}</style>
    </header>
  );
};

export default Header;
