import React from 'react';
import { ArrowLeft, Truck, RefreshCw, ShieldCheck, CheckCircle2, Clock, Phone, AlertCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function ShippingPolicyPage({ onBackToHome, onOpenConcierge }) {
  return (
    <div className="w-full bg-[#ffffff] min-h-screen text-[#1a1814] pt-24 sm:pt-28 pb-20 select-none">
      
      {/* 1. Breadcrumbs */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-3 border-b border-neutral-200/50 mb-10">
        <div className="flex items-center gap-2 text-[11.5px] uppercase tracking-[0.14em] text-[#8c867f]">
          <button 
            onClick={onBackToHome}
            className="hover:text-[#1a1814] transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back to Store
          </button>
          <span>/</span>
          <span className="text-[#1a1814] font-medium">Shipping & Exchange Policy</span>
        </div>
      </div>

      {/* 2. Page Header */}
      <div className="text-center max-w-2xl mx-auto px-4 mb-14 sm:mb-18">
        <span className="text-[10.5px] uppercase tracking-[0.25em] font-medium text-[#8c867f] block mb-2">
          CLIENT ASSURANCE & SERVICE COMMITMENT
        </span>
        <h1 
          className="text-3xl sm:text-4xl lg:text-5xl text-[#67615c] font-light tracking-tight leading-tight mb-4"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          Delivery & Exchange Policy
        </h1>
        <p className="text-xs sm:text-[13px] text-[#78716a] font-light leading-relaxed">
          Crafted with care in our atelier, delivered swiftly to your doorstep across Pakistan with transparent terms and hassle-free support.
        </p>
      </div>

      {/* 3. Quick Highlights Bar */}
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-[#faf8f6] border border-[#ebe6e0] flex items-start gap-3.5">
            <Truck size={22} className="text-[#c5a880] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-semibold text-[#1a1814] uppercase tracking-[0.08em] mb-1">
                Complimentary Shipping
              </h4>
              <p className="text-[12px] text-[#67615c] leading-relaxed">
                Free courier delivery on orders above Rs. 4,990 nationwide.
              </p>
            </div>
          </div>

          <div className="p-5 bg-[#faf8f6] border border-[#ebe6e0] flex items-start gap-3.5">
            <Clock size={22} className="text-[#c5a880] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-semibold text-[#1a1814] uppercase tracking-[0.08em] mb-1">
                2 to 4 Days Delivery
              </h4>
              <p className="text-[12px] text-[#67615c] leading-relaxed">
                24-48 hrs in Lahore; 2-4 business days nationwide.
              </p>
            </div>
          </div>

          <div className="p-5 bg-[#faf8f6] border border-[#ebe6e0] flex items-start gap-3.5">
            <ShieldCheck size={22} className="text-[#c5a880] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-semibold text-[#1a1814] uppercase tracking-[0.08em] mb-1">
                Cash on Delivery (COD)
              </h4>
              <p className="text-[12px] text-[#67615c] leading-relaxed">
                Pay safely at your doorstep upon receiving your parcel.
              </p>
            </div>
          </div>

          <div className="p-5 bg-[#faf8f6] border border-[#ebe6e0] flex items-start gap-3.5">
            <RefreshCw size={22} className="text-[#c5a880] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-semibold text-[#1a1814] uppercase tracking-[0.08em] mb-1">
                7 Days Exchange
              </h4>
              <p className="text-[12px] text-[#67615c] leading-relaxed">
                Easy size or article exchange coordinated via WhatsApp.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Detailed Policy Sections */}
      <div className="w-full max-w-[980px] mx-auto px-4 sm:px-6 md:px-8 space-y-12">
        
        {/* Section 1: Nationwide Shipping */}
        <section className="border-b border-neutral-200/70 pb-10">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#c5a880] mb-2">
            <span>01. DOMESTIC SHIPPING</span>
          </div>
          <h2 
            className="text-2xl sm:text-3xl font-normal text-[#1a1814] mb-4"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            Nationwide Transit Timelines & Shipping Rates
          </h2>
          <p className="text-[13px] text-[#67615c] font-light leading-relaxed mb-4">
            Yasraf Clothing partners with leading courier networks across Pakistan (TCS, Trax, Leopards, and Call Courier) to ensure timely, insured delivery directly to your home or office address.
          </p>

          <div className="overflow-x-auto my-6 border border-[#ebe6e0]">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#faf8f6] border-b border-[#ebe6e0] text-[#1a1814] uppercase tracking-[0.1em] font-semibold">
                <tr>
                  <th className="py-3 px-4">Destination Region</th>
                  <th className="py-3 px-4">Estimated Transit Time</th>
                  <th className="py-3 px-4">Courier Partner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebe6e0] text-[#67615c]">
                <tr>
                  <td className="py-3 px-4 font-medium text-[#1a1814]">Lahore (Same / Next Day)</td>
                  <td className="py-3 px-4">24 – 48 Hours</td>
                  <td className="py-3 px-4">Direct Express Rider / Trax</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-[#1a1814]">Karachi, Islamabad, Rawalpindi</td>
                  <td className="py-3 px-4">2 – 3 Business Days</td>
                  <td className="py-3 px-4">TCS / Leopards Courier</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-[#1a1814]">Faisalabad, Multan, Sialkot, Gujranwala</td>
                  <td className="py-3 px-4">2 – 3 Business Days</td>
                  <td className="py-3 px-4">TCS / Trax</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-[#1a1814]">Peshawar, Quetta & Other Cities</td>
                  <td className="py-3 px-4">3 – 5 Business Days</td>
                  <td className="py-3 px-4">TCS Overland / Leopards</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#fbfaf8] border-l-2 border-[#c5a880] text-[12px] text-[#67615c] leading-relaxed">
            <strong>Standard Shipping Fee:</strong> Orders valued under Rs. 4,990 are charged a flat delivery fee of Rs. 250 anywhere in Pakistan. Orders over Rs. 4,990 qualify automatically for <strong>Free Standard Shipping</strong>.
          </div>
        </section>

        {/* Section 2: Cash on Delivery & Order Verification */}
        <section className="border-b border-neutral-200/70 pb-10">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#c5a880] mb-2">
            <span>02. PAYMENT & VERIFICATION</span>
          </div>
          <h2 
            className="text-2xl sm:text-3xl font-normal text-[#1a1814] mb-4"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            Cash on Delivery (COD) Guidelines
          </h2>
          <div className="space-y-3 text-[13px] text-[#67615c] font-light leading-relaxed">
            <p>
              1. <strong>Verification Call/WhatsApp:</strong> To prevent fraudulent bookings, orders placed via Cash on Delivery are verified through an automated WhatsApp prompt or quick call from our concierge team before dispatch.
            </p>
            <p>
              2. <strong>Exact Change:</strong> Kindly keep the exact cash amount ready upon delivery as courier riders may not always carry large amounts of cash change.
            </p>
            <p>
              3. <strong>Parcel Inspection:</strong> Per courier regulations in Pakistan, packages cannot be opened prior to payment handover to the courier rider. If you suspect any tampering, you may refuse delivery or contact our WhatsApp concierge immediately.
            </p>
          </div>
        </section>

        {/* Section 3: 7-Day Exchange Policy */}
        <section className="border-b border-neutral-200/70 pb-10">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#c5a880] mb-2">
            <span>03. RETURNS & EXCHANGES</span>
          </div>
          <h2 
            className="text-2xl sm:text-3xl font-normal text-[#1a1814] mb-4"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            7-Day Seamless Exchange Policy
          </h2>
          <p className="text-[13px] text-[#67615c] font-light leading-relaxed mb-4">
            We take pride in our impeccable tailoring and premium fabrication. If an article doesn't fit quite right or requires exchange, we offer a straightforward 7-day exchange window:
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex items-start gap-2 text-[12.5px] text-[#1a1814]">
              <CheckCircle2 size={16} className="text-[#25D366] shrink-0 mt-0.5" />
              <span>Article must be unworn, unwashed, and undamaged with original tags and packaging intact.</span>
            </div>
            <div className="flex items-start gap-2 text-[12.5px] text-[#1a1814]">
              <CheckCircle2 size={16} className="text-[#25D366] shrink-0 mt-0.5" />
              <span>Exchange requests must be lodged within 7 days of parcel receipt.</span>
            </div>
            <div className="flex items-start gap-2 text-[12.5px] text-[#1a1814]">
              <CheckCircle2 size={16} className="text-[#25D366] shrink-0 mt-0.5" />
              <span>Size exchange is free of charge; for article swaps of higher value, the difference is payable via COD.</span>
            </div>
          </div>

          <div className="p-5 bg-[#faf8f6] border border-[#ebe6e0]">
            <h4 className="text-[13px] font-semibold text-[#1a1814] uppercase tracking-[0.08em] mb-2">
              How to Initiate an Exchange
            </h4>
            <p className="text-[12px] text-[#67615c] leading-relaxed mb-3">
              Simply message our official WhatsApp concierge with your Order Number and photo of the article:
            </p>
            <a
              href={BRAND_CONFIG.getWhatsAppSupportUrl('Hello Yasraf Team! I would like to request an exchange for my order.')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors"
            >
              <span>MESSAGE WHATSAPP CONCIERGE ({BRAND_CONFIG.whatsappDisplay})</span>
            </a>
          </div>
        </section>

      </div>

    </div>
  );
}
