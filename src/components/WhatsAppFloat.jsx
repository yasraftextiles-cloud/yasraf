import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.8rem',
      right: '1.8rem',
      zIndex: 9000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.6rem'
    }}>
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
          borderRadius: '2px'
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
          Need help sizing or custom stitching? Chat with our team!
        </div>
      )}

      {/* Floating WhatsApp Action Button */}
      <a
        href={BRAND_CONFIG.getWhatsAppSupportUrl('Hello YASRAF Clothing! I would like assistance with your women\'s collection.')}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp VIP Concierge"
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(37, 211, 102, 0.45)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 211, 102, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 211, 102, 0.45)';
        }}
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
