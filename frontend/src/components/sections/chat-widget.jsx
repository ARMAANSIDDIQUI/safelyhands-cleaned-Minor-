"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Minus, MessageCircle, Send, Loader2, PlayCircle, ChevronUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTutorial } from "@/context/TutorialContext";
import { usePathname } from "next/navigation";

const PREDEFINED_QA = [
  {
    question: "What services do you offer?",
    answer: "We offer a range of household services including Cooks, Babysitters, Elderly Care, Japa Maids, and All-rounder domestic help. You can also book on-demand help for quick tasks."
  },
  {
    question: "How do I book a service?",
    answer: "You can book a service by navigating to the Services section, selecting your required service (e.g., Cook), and filling out the booking form. For urgent needs, use the 'Quick Book' option."
  },
  {
    question: "Are your workers verified?",
    answer: "Yes, all our professionals undergo a strict background check, police verification, and training process to ensure your safety and quality of service."
  },
  {
    question: "What are the charges?",
    answer: "Charges vary based on the service type, frequency (One-time, Daily, Live-in), and requirements. You can see the estimated price on the service details page before booking."
  },
  {
    question: "How can I contact support?",
    answer: "You can reach us at Safelyhands@gmail.com or call us at +91 888 888 8888. Our support team is available Mon-Sat, 9 AM - 6 PM."
  }
];

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today with Safely Hands services?", sender: "bot", time: new Date() }
  ]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { startTutorial } = useTutorial();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide ChatWidget on specific pages
  if (pathname.includes("/dashboard") || pathname.includes("/booking") || pathname.includes("/profile") || pathname.includes("/admin")) {
    return null;
  }

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text) => {
    if (!text || !text.trim()) return;

    const userMsg = { text, sender: "user", time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let responseText = "I'm not sure about that. Please select one of the common questions below or contact our support.";

      // Simple keyword matching for static response
      if (lowerText.includes("hello") || lowerText.includes("hi")) {
        responseText = "Hello! How can I help you today?";
      } else if (lowerText.includes("price") || lowerText.includes("cost") || lowerText.includes("charge")) {
        responseText = PREDEFINED_QA[3].answer;
      } else if (lowerText.includes("book")) {
        responseText = PREDEFINED_QA[1].answer;
      } else if (lowerText.includes("service")) {
        responseText = PREDEFINED_QA[0].answer;
      } else if (lowerText.includes("safe") || lowerText.includes("verified")) {
        responseText = PREDEFINED_QA[2].answer;
      } else if (lowerText.includes("contact") || lowerText.includes("support") || lowerText.includes("call")) {
        responseText = PREDEFINED_QA[4].answer;
      } else if (lowerText.includes("help") || lowerText.includes("guide") || lowerText.includes("tutorial") || lowerText.includes("tour")) {
        responseText = "I can guide you through the app! Click the button below to start the tour.";
      }

      setMessages(prev => [...prev, { text: responseText, sender: "bot", time: new Date() }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuestion = (question) => {
    handleSend(question);
  };


  return (
    <div className="fixed bottom-[20px] right-[20px] z-[9999] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="pointer-events-auto flex flex-col w-[350px] max-w-[calc(100vw-40px)] h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-5 duration-300"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {/* Header */}
          <div className="bg-[#72bcd4] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[45px] h-[45px] rounded-full overflow-hidden border-2 border-white bg-white flex items-center justify-center p-1">
                <img src="/favicon.png" alt="Support" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[#212529] font-bold text-[16px] leading-[1.2] m-0">Safely Hands Support</h3>
                <span className="text-[12px] font-medium text-[#212529] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <button onClick={toggleChat} className="p-2 hover:bg-black/10 rounded-full transition-colors">
              <Minus className="w-5 h-5 text-[#212529]" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#F8F9FA] flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start'}`}>
                <div className={`p-3 rounded-2xl shadow-sm text-[14px] leading-relaxed 
                  ${msg.sender === 'user' ? 'bg-[#72bcd4] text-white rounded-tr-none' : 'bg-white text-[#212529] border border-[#E5E5E5] rounded-tl-none'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1 self-start bg-white p-3 rounded-2xl rounded-tl-none border border-[#E5E5E5]">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            )}
            <div ref={messagesEndRef} />

            {/* Quick Questions Chips */}
            {!isTyping && messages.length < 5 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    startTutorial();
                  }}
                  className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-1"
                >
                  <PlayCircle size={12} /> Start App Tour
                </button>
                {PREDEFINED_QA.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(qa.question)}
                    className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    {qa.question}
                  </button>
                ))}
              </div>
            )}

            {/* Show start tour button if help was asked */}
            {!isTyping && messages.length >= 5 && messages[messages.length - 1].sender === 'bot' && messages[messages.length - 1].text.includes("tour") && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  startTutorial();
                }}
                className="self-start text-xs bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm mt-1"
              >
                <PlayCircle size={14} /> Start Guided Tour
              </button>
            )}
          </div>

          {/* Input Area Removed as per request */}
        </div>
      )}

      {/* Action Buttons (Scroll to Top + Chat Toggle) */}
      <div className="flex flex-col gap-3 pointer-events-auto items-center">
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-slate-900 border-2 border-white/20 text-white shadow-lg hover:bg-slate-800 hover:scale-110 transition-all duration-300 animate-in fade-in zoom-in"
            title="Scroll to Top"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}

        {/* WhatsApp Floating Button */}


        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/917618341297"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-[60px] h-[60px] rounded-full bg-[#25D366] border-2 border-white/20 text-white shadow-lg hover:scale-110 transition-all duration-300 animate-in fade-in zoom-in"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp className="w-7 h-7" />
        </a>

        {/* Chat Trigger Button */}
        <button
          onClick={toggleChat}
          className="relative flex items-center justify-center w-[60px] h-[60px] rounded-full bg-[#72bcd4] shadow-lg hover:scale-110 transition-transform duration-200 group"
        >
          <div className="z-10 text-[#212529]">
            {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7 fill-white text-white" />}
          </div>
          {!isOpen && <div className="absolute inset-0 rounded-full animate-ping bg-[#72bcd4]/50"></div>}
        </button>
      </div>
    </div>
  );
}