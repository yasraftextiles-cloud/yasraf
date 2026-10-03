import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';
import { WhatsAppIcon } from './SocialIcons';

export default function WhatsAppFloat({ onOpenChannelModal }) {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-7 sm:right-7 z-[9000] flex flex-col items-end gap-2">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div style={{
          backgroundColor: '#ffffff',
          color: '#141414',
          padding: '0.75rem 1rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          border: '1px solid rgba(197, 168, 128, 0.4)',
          maxWidth: '220px',
          fontSize: '0.76rem',
          lineHeight: 1.4,
          position: 'relative',
          animation: 'fadeIn 0.3s ease-out',
          borderRadius: '4px'
        }}>
          <button
            onClick={() => setShowTooltip(false)}
            aria-label="Close tooltip"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              color: '#999',
              padding: '2px',
              cursor: 'pointer'
            }}
          >
            <X size={12} />
          </button>
          <strong style={{ color: '#1d4838', display: 'block', marginBottom: '2px' }}>
            VIP Fashion Concierge
          </strong>
          <span>Need styling advice or want our secret 10% drop voucher?</span>
          {onOpenChannelModal && (
            <button
              onClick={onOpenChannelModal}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '4px 8px',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                backgroundColor: '#f6ece4',
                color: '#1a1814',
                border: '1px solid rgba(197, 168, 128, 0.5)',
                cursor: 'pointer',
                display: 'block',
                textAlign: 'center'
              }}
            >
              Get 10% Off VIP Pass &rarr;
            </button>
          )}
        </div>
      )}

      {/* Floating WhatsApp Action Button */}
      <a
        href={BRAND_CONFIG.getWhatsAppSupportUrl('Hello YASRAF Clothing! I would like assistance with your women\'s collection.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        <WhatsAppIcon size={30} color="#ffffff" className="w-[30px] h-[30px] fill-white" />
      </a>
    </div>
  );
}

export { WhatsAppFloat as WhatsAppButton, WhatsAppFloat as FloatingWhatsApp };
