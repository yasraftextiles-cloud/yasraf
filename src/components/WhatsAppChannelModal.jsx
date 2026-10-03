import React, { useState } from 'react';
import { X, Check, Copy, ArrowRight } from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';
import { WhatsAppIcon } from './SocialIcons';

export default function WhatsAppChannelModal({ isOpen, onClose, onApplyVoucher }) {
  const [copied, setCopied] = useState(false);
  const voucherCode = 'YASRAF10';

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(voucherCode);
    setCopied(true);
    if (onApplyVoucher) onApplyVoucher(voucherCode);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoinChannel = () => {
    handleCopyCode();
    const url = BRAND_CONFIG.getWhatsAppChannelUrl 
      ? BRAND_CONFIG.getWhatsAppChannelUrl()
      : `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello Yasraf! I would like to join the WhatsApp channel for drop updates and member privileges.')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      {/* Subtle Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Minimal Card */}
      <div className="relative w-full max-w-[420px] bg-[#ffffff] p-8 sm:p-10 shadow-2xl border border-[#ebe6e0] z-10 text-center animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-[#8c867f] hover:text-[#1a1814] transition-colors cursor-pointer p-1"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Minimal Sub-header */}
        <span 
          className="text-[10px] uppercase tracking-[0.24em] font-medium text-[#8c867f] block mb-3"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          EXCLUSIVE PRIVILEGE
        </span>

        {/* Headline */}
        <h2 
          id="whatsapp-modal-title"
          className="text-2xl sm:text-[28px] font-normal text-[#1a1814] leading-[1.2] tracking-tight mb-3"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          Enjoy 10% Off Your Order
        </h2>

        {/* Concise Body */}
        <p 
          className="text-[12.5px] text-[#67615c] font-light leading-relaxed mb-6 max-w-[320px] mx-auto"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          Join our official WhatsApp channel for early drop access and exclusive member privileges.
        </p>

        {/* Minimal Voucher Box */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#faf8f6] border border-[#ebe6e0] mb-5">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] tracking-[0.14em] uppercase text-[#8c867f]">CODE:</span>
            <span className="text-[13px] tracking-[0.16em] font-semibold text-[#1a1814]">{voucherCode}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-[11px] font-medium tracking-[0.08em] uppercase text-[#67615c] hover:text-[#1a1814] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Primary Action Button / Link */}
        <a
          href="https://whatsapp.com/channel/0029VbE5FWq8kyyW1WA1K83c"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            handleCopyCode();
            onClose();
          }}
          className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 px-4 text-[11.5px] font-medium tracking-[0.2em] uppercase transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer mb-3 flex items-center justify-center gap-2.5 no-underline"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          <WhatsAppIcon size={16} color="#ffffff" className="shrink-0 text-white" aria-hidden="true" />
          <span>JOIN WHATSAPP CHANNEL</span>
          <ArrowRight size={14} className="text-white shrink-0" />
        </a>

        {/* Subtle Dismiss Link */}
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-[#8c867f] hover:text-[#1a1814] transition-colors cursor-pointer tracking-wider uppercase"
        >
          No thanks, continue browsing
        </button>

      </div>
    </div>
  );
}
