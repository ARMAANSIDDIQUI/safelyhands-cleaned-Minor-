"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Check, Flag, MessageSquareMore } from "lucide-react";

const categories = [
  "Service-Complaints",
  "Booking-Queries",
  "Payment-Queries",
  "Others",
];

const subjects = {
  "Service-Complaints": [
    "Helper Replacement",
    "Helper Quality",
    "Worker Irreqularity",
    "Unresponsive RM",
  ],
  "Booking-Queries": [
    "Availability Queries",
    "Booking Process",
    "Turn Around Time",
    "Replacement Policies",
  ],
  "Payment-Queries": [
    "Mode of Payments",
    "Subscription Charges",
    "Helper Salaries",
    "Refund Queries",
  ],
  Others: [
    "Anything else that we need to know",
  ],
};

const ContactForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    category: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    // Only allow digits for phone, max 10
    if (id === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: digitsOnly });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSelection = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = (e) => {
    e.preventDefault();
    // Validate phone on step 1
    if (step === 1 && !/^\d{10}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Request submitted successfully!");
        setFormData({ fullName: "", phone: "", email: "", city: "", category: "", subject: "", message: "" });
        setStep(1);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  const resetToStep1 = () => {
    setStep(1);
  };

  const tickGreenIcon = <Check size={18} className="text-[#128807]" />;
  const flagIcon = <Flag size={16} className="text-[#262626]" />;
  const contactIcon = <MessageSquareMore size={40} className="text-blue-400 opacity-60" />;

  return (
    <div className="w-full flex justify-center py-10 px-4">
      <div className="w-full max-w-[550px] bg-white/80 backdrop-blur-md rounded-[20px] shadow-[0px_4px_30px_rgba(0,0,0,0.08)] p-6 md:p-8 transition-all duration-300">

        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            {contactIcon}
          </div>
          <h2 className="text-[20px] font-bold text-[#262626] leading-tight font-display">
            Fill the form to contact us quicker!
          </h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Step 1: Info Bar */}
          <div className="bg-[#fcfcfc] border border-[#eeeeee] rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Full Name */}
              <div className="p-3 border-b md:border-b-0 md:border-r border-[#eeeeee]">
                <label className="text-[12px] text-[#666666] font-medium block ml-1 mb-1">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  disabled={step > 1}
                  className="w-full bg-transparent border-none focus:ring-0 text-[#262626] text-[15px] p-1 h-8 disabled:opacity-70"
                />
              </div>

              {/* Phone Number */}
              <div className="p-3">
                <label className="text-[12px] text-[#666666] font-medium block ml-1 mb-1">Phone Number</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 shrink-0">
                    {flagIcon}
                    <span className="text-[14px] font-medium text-[#262626]">+91</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={step > 1}
                    className="w-full bg-transparent border-none focus:ring-0 text-[#262626] text-[15px] p-1 h-8 disabled:opacity-70"
                  />
                  {step > 1 && (
                    <button type="button" onClick={resetToStep1} className="text-[#72bcd4] text-[12px] font-bold underline shrink-0">Edit</button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-[#eeeeee]">
              {/* Email */}
              <div className="p-3 border-b md:border-b-0 md:border-r border-[#eeeeee]">
                <label className="text-[12px] text-[#666666] font-medium block ml-1 mb-1">Email ID</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  disabled={step > 1}
                  className="w-full bg-transparent border-none focus:ring-0 text-[#262626] text-[15px] p-1 h-8 disabled:opacity-70"
                />
              </div>

              {/* City */}
              <div className="p-3">
                <label className="text-[12px] text-[#666666] font-medium block ml-1 mb-1">City</label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Your City"
                  disabled={step > 1}
                  className="w-full bg-transparent border-none focus:ring-0 text-[#262626] text-[15px] p-1 h-8 disabled:opacity-70"
                />
              </div>
            </div>

            {/* Continue Bar */}
            <div className="p-3 border-t border-[#eeeeee] flex items-center justify-end">
              {step === 1 && (
                <button
                  onClick={nextStep}
                  disabled={!formData.fullName || !formData.phone || !formData.email || !formData.city}
                  className="bg-[#262626] text-white text-[14px] font-semibold px-6 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                >
                  continue
                </button>
              )}
            </div>
          </div>

          {/* Selection Summaries (visible when item is selected) */}
          {(step > 1 && (formData.category || formData.subject)) && (
            <div className="flex gap-4 mt-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {formData.category && (
                <div className="flex-1 bg-white border border-[#eeeeee] rounded-xl p-3 flex justify-between items-center shadow-sm">
                  <span className="text-[13px] font-medium text-[#262626]">{formData.category}</span>
                  {tickGreenIcon}
                </div>
              )}
              {formData.subject && (
                <div className="flex-1 bg-white border border-[#eeeeee] rounded-xl p-3 flex justify-between items-center shadow-sm">
                  <span className="text-[13px] font-medium text-[#262626]">{formData.subject}</span>
                  {tickGreenIcon}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Choose Category */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-[16px] font-semibold text-[#262626] mb-4">Choose a category to continue</h3>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => handleSelection("category", cat)}
                      className={`cursor-pointer border rounded-xl p-3 h-[60px] flex items-center justify-between transition-all duration-200 ${formData.category === cat ? "border-[#128807] bg-[#f0f9f0]" : "border-[#eeeeee] hover:border-[#72bcd4]"
                        }`}
                    >
                      <span className="text-[13px] font-medium text-[#262626] leading-tight">{cat}</span>
                      {formData.category === cat && tickGreenIcon}
                    </div>
                  ))}
                </div>
                <button
                  onClick={nextStep}
                  disabled={!formData.category}
                  className="bg-[#262626] text-white text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-black transition-colors disabled:opacity-50 h-[50px] mb-1"
                >
                  continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Choose Subject */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
              <h3 className="text-[16px] font-semibold text-[#262626] mb-2">Choose a subject & add a message</h3>
              <div className="grid grid-cols-2 gap-3">
                {(subjects[formData.category] || []).map((sub) => (
                  <div
                    key={sub}
                    onClick={() => handleSelection("subject", sub)}
                    className={`cursor-pointer border rounded-xl p-3 min-h-[60px] flex items-center justify-between transition-all duration-200 ${formData.subject === sub ? "border-[#128807] bg-[#f0f9f0]" : "border-[#eeeeee] hover:border-[#72bcd4]"
                      }`}
                  >
                    <span className="text-[13px] font-medium text-[#262626] leading-tight">{sub}</span>
                    {formData.subject === sub && tickGreenIcon}
                  </div>
                ))}
              </div>

              <div className="w-full">
                <label className="text-[12px] text-[#666666] font-medium block ml-1 mb-1">Message (Optional)</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us more about your query..."
                  className="w-full bg-[#fcfcfc] border border-[#eeeeee] focus:border-[#72bcd4] focus:ring-0 rounded-xl px-4 py-3 text-[#262626] text-[14px] min-h-[100px] resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!formData.subject}
                  className="bg-[#262626] text-white text-[14px] font-semibold px-8 py-3 rounded-xl hover:bg-black transition-all duration-300 disabled:opacity-50 shadow-lg shadow-slate-200"
                >
                  Submit Request
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactForm;