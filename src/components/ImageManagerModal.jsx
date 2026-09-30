import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Check, Folder, RefreshCw, AlertCircle } from 'lucide-react';

export default function ImageManagerModal({
  isOpen,
  onClose,
  products,
  onUpdateProductImage
}) {
  if (!isOpen) return null;

  const [copiedPath, setCopiedPath] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'yas-001');

  const folderPath = "c:\\Users\\hp\\Documents\\yasraf\\public\\products";

  const handleCopyFolder = () => {
    navigator.clipboard.writeText(folderPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2500);
  };

  const handleFileUpload = (e, prodId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateProductImage(prodId, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '2.5rem' }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          padding: '2.2rem 2rem',
          maxHeight: '88vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            padding: '0.4rem',
            borderRadius: '50%',
            backgroundColor: '#f5f0ea',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#c5a880', marginBottom: '0.3rem' }}>
          <ImageIcon size={18} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Product Photography & Image Manager
          </span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#141414', marginBottom: '0.5rem' }}>
          Apni Real Product Photos Lagayein
        </h3>

        {/* Instructions Box */}
        <div style={{
          backgroundColor: '#faf7f2',
          border: '1px solid #dfc298',
          padding: '1.2rem',
          marginBottom: '2rem',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          color: '#3d3832'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#141414', marginBottom: '0.4rem' }}>
            <Folder size={18} style={{ color: '#c5a880' }} />
            <span>Folder Location (Direct File Drop):</span>
          </div>
          <p style={{ marginBottom: '0.6rem' }}>
            Aap apni real photos ko seedha is folder mein paste kar sakte hain:
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            backgroundColor: '#ffffff',
            padding: '0.6rem 0.8rem',
            border: '1px solid #d5cfc4',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            wordBreak: 'break-all'
          }}>
            <span style={{ flex: 1 }}>{folderPath}</span>
            <button
              onClick={handleCopyFolder}
              style={{
                padding: '0.3rem 0.75rem',
                backgroundColor: '#121212',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {copiedPath ? 'Copied! ✓' : 'Copy Path'}
            </button>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#7a756f', marginTop: '0.6rem' }}>
            💡 <strong>Tariqa:</strong> Apni pictures ko rename karein jaise <code>product-1.jpg</code>, <code>product-2.jpg</code>, <code>product-3.jpg</code> aur is folder mein replace kar dein.
          </div>
        </div>

        {/* Live Upload & Preview Per Product */}
        <h4 style={{ fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', color: '#141414' }}>
          Ya yahan se direct photo upload karein:
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '1.2rem'
        }}>
          {products.map((prod) => (
            <div
              key={prod.id}
              style={{
                backgroundColor: '#fbf9f6',
                border: '1px solid #ede8de',
                padding: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                position: 'relative'
              }}
            >
              {/* Product Preview Image */}
              <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#eae4d8', position: 'relative' }}>
                <img
                  src={prod.image}
                  alt={prod.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#c5a880', textTransform: 'uppercase' }}>
                  {prod.categoryLabel}
                </span>
                <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#888', backgroundColor: '#eee', padding: '0.1rem 0.3rem', borderRadius: '2px' }}>
                  {`product-${products.indexOf(prod) + 1}.jpg`}
                </span>
              </div>

              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#141414', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {prod.title}
              </div>

              {/* Upload Input Button */}
              <label style={{
                padding: '0.45rem',
                backgroundColor: '#121212',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}>
                <Upload size={12} /> Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, prod.id)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            onClick={() => {
              if (window.confirm('Kya aap default images wapas lana chahte hain?')) {
                localStorage.removeItem('yasraf_custom_images');
                window.location.reload();
              }
            }}
            style={{
              fontSize: '0.74rem',
              color: '#8c867f',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Reset All Photos to Default
          </button>

          <button
            onClick={onClose}
            className="btn-luxury"
          >
            Done / Close Manager
          </button>
        </div>
      </div>
    </div>
  );
}
