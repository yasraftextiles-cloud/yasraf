import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Send, Check, Phone, Mail, Clock } from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';
import { InstagramIcon, FacebookIcon, TikTokIcon, SnapchatIcon, WhatsAppIcon } from '../components/SocialIcons';

export default function ContactPage({ onBackToHome }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: 'Order Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div className="w-full bg-[#ffffff] min-h-screen text-[#1a1814] pt-24 sm:pt-28 pb-20 select-none">
      
      {/* 1. Breadcrumbs */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-3 border-b border-neutral-200/50 mb-10">
        <div className="flex items-center gap-2 text-[11.5px] uppercase tracking-[0.14em] text-[#8c867f]">
          <button 
            onClick={onBackToHome}
            className="hover:text-[#1a1814] transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back to Home
          </button>
          <span>/</span>
          <span className="text-[#1a1814] font-medium">Client Concierge & Contact</span>
        </div>
      </div>

      {/* 2. Header */}
      <div className="text-center max-w-xl mx-auto px-4 mb-12 sm:mb-16">
        <span className="text-[10.5px] uppercase tracking-[0.24em] font-medium text-[#8c867f] block mb-2">
          CLIENT CARE ATELIER
        </span>
        <h1 
          className="text-3xl sm:text-4xl lg:text-[46px] text-[#67615c] font-light tracking-tight leading-tight mb-3"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          We Are Here For You
        </h1>
        <p className="text-xs sm:text-[13px] text-[#78716a] font-light leading-relaxed">
          Whether you need assistance with custom sizing, order tracking, or styling recommendations, our team is at your service.
        </p>
      </div>

      {/* 3. Main Two-Column Stage */}
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Direct Support & Social Channels */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* VIP WhatsApp Card */}
            <div className="p-6 bg-[#faf8f6] border border-[#ebe6e0]">
              <div className="flex items-center gap-2 text-[#25D366] text-[11px] font-bold uppercase tracking-[0.16em] mb-2">
                <MessageCircle size={16} /> Instant VIP Concierge
              </div>
              <h3 className="text-xl font-normal text-[#1a1814] mb-2" style={{ fontFamily: 'var(--font-family-editorial)' }}>
                Chat on WhatsApp
              </h3>
              <p className="text-xs text-[#67615c] leading-relaxed mb-4">
                Fastest response for size inquiries, fabric availability, and direct order placement:
              </p>
              <a
                href={BRAND_CONFIG.getWhatsAppSupportUrl('Hello Yasraf Team! I have an inquiry regarding your collection.')}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-4 flex items-center justify-center gap-2 text-[11.5px] font-semibold tracking-[0.16em] uppercase transition-all shadow-sm cursor-pointer"
                style={{ fontFamily: 'var(--font-family-primary)' }}
              >
                <span>OPEN WHATSAPP ({BRAND_CONFIG.whatsappDisplay})</span>
              </a>
            </div>

            {/* Operating Hours */}
            <div className="p-6 bg-white border border-[#ebe6e0] space-y-3">
              <div className="flex items-center gap-2.5 text-[12.5px] text-[#1a1814]">
                <Clock size={16} className="text-[#c5a880]" />
                <span><strong>Concierge Hours:</strong> {BRAND_CONFIG.supportHours}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[12.5px] text-[#1a1814]">
                <Mail size={16} className="text-[#c5a880]" />
                <span><strong>Email:</strong> {BRAND_CONFIG.contactEmail}</span>
              </div>
            </div>

            {/* Official Social Media Channels */}
            <div className="p-6 bg-white border border-[#ebe6e0]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8c867f] block mb-3">
                Official Social Profiles
              </span>
              <div className="space-y-2.5 text-[12px]">
                <a 
                  href={BRAND_CONFIG.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-[#67615c] hover:text-[#1a1814] transition-colors"
                >
                  <InstagramIcon size={16} /> Instagram: @yasrafclothing
                </a>
                <a 
                  href={BRAND_CONFIG.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-[#67615c] hover:text-[#1a1814] transition-colors"
                >
                  <FacebookIcon size={16} /> Facebook: Yasraf Clothing
                </a>
                <a 
                  href={BRAND_CONFIG.socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-[#67615c] hover:text-[#1a1814] transition-colors"
                >
                  <TikTokIcon size={16} /> TikTok: @yasrafclothing
                </a>
                <a 
                  href={BRAND_CONFIG.socialLinks.snapchat}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-[#67615c] hover:text-[#1a1814] transition-colors"
                >
                  <SnapchatIcon size={16} /> Snapchat: @yasrafclothing
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Inquiry Message Form */}
          <div className="lg:col-span-7 bg-[#faf8f6] p-6 sm:p-8 lg:p-10 border border-[#ebe6e0] text-left">
            <h2 
              className="text-2xl sm:text-3xl text-[#1a1814] font-normal mb-2"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              Send an Atelier Inquiry
            </h2>
            <p className="text-xs text-[#78716a] mb-6">
              Fill in your details and our senior fashion representative will reach out within 2 to 4 business hours.
            </p>

            {submitted ? (
              <div className="p-6 bg-white border border-emerald-300 text-center space-y-2">
                <Check size={28} className="text-emerald-600 mx-auto" />
                <h3 className="text-lg font-medium text-[#1a1814]" style={{ fontFamily: 'var(--font-family-editorial)' }}>
                  Message Received with Honor
                </h3>
                <p className="text-xs text-[#67615c]">
                  Thank you, {formData.name || 'valued customer'}. Our team will contact you via WhatsApp or Email promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] font-medium text-[#67615c] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fatima Khan"
                    className="w-full h-11 px-3 bg-white border border-[#ebe6e0] text-[13px] text-[#1a1814] outline-none focus:border-[#1a1814] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.14em] font-medium text-[#67615c] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@example.com"
                      className="w-full h-11 px-3 bg-white border border-[#ebe6e0] text-[13px] text-[#1a1814] outline-none focus:border-[#1a1814] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.14em] font-medium text-[#67615c] mb-1">
                      WhatsApp / Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full h-11 px-3 bg-white border border-[#ebe6e0] text-[13px] text-[#1a1814] outline-none focus:border-[#1a1814] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] font-medium text-[#67615c] mb-1">
                    Subject / Concern
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-11 px-3 bg-white border border-[#ebe6e0] text-[13px] text-[#1a1814] outline-none focus:border-[#1a1814] transition-colors"
                  >
                    <option value="Order Inquiry">Order Status & Tracking</option>
                    <option value="Sizing Advice">Sizing & Fitting Consultation</option>
                    <option value="Custom Order">Custom Stitching & Bridal Inquiry</option>
                    <option value="Exchange">Exchange or Return Assistance</option>
                    <option value="Other">Other Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] font-medium text-[#67615c] mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please describe how we can assist you..."
                    className="w-full p-3 bg-white border border-[#ebe6e0] text-[13px] text-[#1a1814] outline-none focus:border-[#1a1814] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#1a1814] hover:bg-[#33302c] text-white flex items-center justify-center gap-2 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
                  style={{ fontFamily: 'var(--font-family-primary)' }}
                >
                  <Send size={15} />
                  <span>TRANSMIT INQUIRY</span>
                </button>
              </form>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
