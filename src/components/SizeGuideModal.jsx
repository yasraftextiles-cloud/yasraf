import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('women-shirts');
  const [unit, setUnit] = useState('inches'); // 'inches' | 'cm'

  if (!isOpen) return null;

  const dataWomenShirts = [
    { size: 'XS', chest: { in: '36', cm: '91' }, waist: { in: '33', cm: '84' }, shoulder: { in: '14.0', cm: '35.5' }, length: { in: '40', cm: '101' }, sleeve: { in: '21.5', cm: '54.5' } },
    { size: 'S', chest: { in: '38', cm: '96.5' }, waist: { in: '35', cm: '89' }, shoulder: { in: '14.5', cm: '37' }, length: { in: '41', cm: '104' }, sleeve: { in: '22.0', cm: '56' } },
    { size: 'M', chest: { in: '41', cm: '104' }, waist: { in: '38', cm: '96.5' }, shoulder: { in: '15.0', cm: '38' }, length: { in: '42', cm: '106.5' }, sleeve: { in: '22.5', cm: '57' } },
    { size: 'L', chest: { in: '44', cm: '112' }, waist: { in: '41', cm: '104' }, shoulder: { in: '15.5', cm: '39.5' }, length: { in: '43', cm: '109' }, sleeve: { in: '23.0', cm: '58.5' } },
    { size: 'XL', chest: { in: '47', cm: '119.5' }, waist: { in: '44', cm: '112' }, shoulder: { in: '16.0', cm: '40.5' }, length: { in: '44', cm: '112' }, sleeve: { in: '23.5', cm: '59.5' } }
  ];

  const dataWomenPants = [
    { size: 'XS', waist: { in: '26-28', cm: '66-71' }, hip: { in: '38', cm: '96.5' }, length: { in: '37', cm: '94' }, thigh: { in: '23', cm: '58.5' } },
    { size: 'S', waist: { in: '28-30', cm: '71-76' }, hip: { in: '40', cm: '101.5' }, length: { in: '38', cm: '96.5' }, thigh: { in: '24', cm: '61' } },
    { size: 'M', waist: { in: '30-33', cm: '76-84' }, hip: { in: '43', cm: '109' }, length: { in: '39', cm: '99' }, thigh: { in: '25.5', cm: '65' } },
    { size: 'L', waist: { in: '34-37', cm: '86-94' }, hip: { in: '46', cm: '117' }, length: { in: '40', cm: '101.5' }, thigh: { in: '27', cm: '68.5' } },
    { size: 'XL', waist: { in: '38-41', cm: '96-104' }, hip: { in: '49', cm: '124.5' }, length: { in: '41', cm: '104' }, thigh: { in: '28.5', cm: '72.5' } }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          padding: '2.2rem 2rem',
          maxHeight: '90vh',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c5a880', marginBottom: '0.3rem' }}>
          <Ruler size={18} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Women's Size Guide
          </span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#141414', marginBottom: '1.2rem' }}>
          Find Your Perfect Fit
        </h3>

        {/* Tab & Unit Selector */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #ede8de',
          paddingBottom: '0.8rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('women-shirts')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.78rem',
                fontWeight: activeTab === 'women-shirts' ? 700 : 500,
                backgroundColor: activeTab === 'women-shirts' ? '#121212' : '#f5f0ea',
                color: activeTab === 'women-shirts' ? '#ffffff' : '#121212',
                cursor: 'pointer'
              }}
            >
              Shirts / Kurtas
            </button>
            <button
              onClick={() => setActiveTab('women-pants')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.78rem',
                fontWeight: activeTab === 'women-pants' ? 700 : 500,
                backgroundColor: activeTab === 'women-pants' ? '#121212' : '#f5f0ea',
                color: activeTab === 'women-pants' ? '#ffffff' : '#121212',
                cursor: 'pointer'
              }}
            >
              Trousers & Cigarette Pants
            </button>
          </div>

          {/* Unit Toggle */}
          <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <button
              onClick={() => setUnit('inches')}
              style={{
                padding: '0.3rem 0.7rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: unit === 'inches' ? '#c5a880' : '#fff',
                color: unit === 'inches' ? '#121212' : '#666',
                cursor: 'pointer'
              }}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              style={{
                padding: '0.3rem 0.7rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: unit === 'cm' ? '#c5a880' : '#fff',
                color: unit === 'cm' ? '#121212' : '#666',
                cursor: 'pointer'
              }}
            >
              CM
            </button>
          </div>
        </div>

        {/* Measurement Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f7f2', borderBottom: '2px solid #ede8de' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#141414' }}>Size</th>
                {activeTab === 'women-shirts' && (
                  <>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Chest</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Waist</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Shoulder</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Length</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Sleeve</th>
                  </>
                )}
                {activeTab === 'women-pants' && (
                  <>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Waist (Elastic)</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Hip</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Length</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Thigh</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'women-shirts' && dataWomenShirts.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f2eee8', backgroundColor: i % 2 === 0 ? '#fff' : '#fcfbf9' }}>
                  <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>{row.size}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{unit === 'inches' ? `${row.chest.in}"` : `${row.chest.cm} cm`}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{unit === 'inches' ? `${row.waist.in}"` : `${row.waist.cm} cm`}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{unit === 'inches' ? `${row.shoulder.in}"` : `${row.shoulder.cm} cm`}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{unit === 'inches' ? `${row.length.in}"` : `${row.length.cm} cm`}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{unit === 'inches' ? `${row.sleeve.in}"` : `${row.sleeve.cm} cm`}</td>
                </tr>
              ))}

              {activeTab === 'women-pants' && dataWomenPants.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f2eee8', backgroundColor: i % 2 === 0 ? '#fff' : '#fcfbf9' }}>
                  <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>{row.size}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{unit === 'inches' ? `${row.waist.in}"` : `${row.waist.cm} cm`}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{unit === 'inches' ? `${row.hip.in}"` : `${row.hip.cm} cm`}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{unit === 'inches' ? `${row.length.in}"` : `${row.length.cm} cm`}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{unit === 'inches' ? `${row.thigh.in}"` : `${row.thigh.cm} cm`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
