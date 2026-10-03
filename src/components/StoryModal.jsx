import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { STORIES } from '../data/products';

export default function StoryModal({ isOpen, initialIndex = 0, onClose, onSelectCategory }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const handleNext = () => {
    if (currentIndex < STORIES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [currentIndex, isOpen]);

  if (!isOpen) return null;

  const storyItem = STORIES[currentIndex] || STORIES[0];
  const story = storyItem.stories[0];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: 0 }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '92vh',
          backgroundColor: '#121212',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Image */}
        <img
          src={story.image}
          alt={story.heading}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 100%)'
        }} />

        {/* Top Header & Progress Bars */}
        <div style={{ position: 'relative', zIndex: 10, padding: '1rem 1.2rem' }}>
          {/* Progress Segments */}
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.8rem' }}>
            {STORIES.map((_, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: '3px',
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  height: '100%',
                  width: idx < currentIndex ? '100%' : (idx === currentIndex ? `${progress}%` : '0%'),
                  backgroundColor: '#ffffff',
                  transition: idx === currentIndex ? 'width 0.1s linear' : 'none'
                }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid #c5a880'
              }}>
                <img src={storyItem.previewImage} alt="Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em' }}>{storyItem.title}</span>
                <div style={{ fontSize: '0.62rem', color: '#c5a880' }}>Yasraf Official Story</div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tap areas for left / right navigation */}
        <div style={{ position: 'absolute', inset: '60px 0 140px', display: 'flex', zIndex: 5 }}>
          <div style={{ width: '40%', height: '100%', cursor: 'pointer' }} onClick={handlePrev} />
          <div style={{ width: '60%', height: '100%', cursor: 'pointer' }} onClick={handleNext} />
        </div>

        {/* Bottom Story Content & CTA */}
        <div style={{ position: 'relative', zIndex: 10, padding: '1.6rem 1.4rem', color: '#fff' }}>
          <span style={{
            fontSize: '0.65rem',
            color: '#c5a880',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '0.35rem',
            display: 'block'
          }}>
            {storyItem.tag}
          </span>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.4rem',
            lineHeight: 1.25,
            color: '#fff',
            marginBottom: '0.5rem'
          }}>
            {story.heading}
          </h3>
          <p style={{
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.55,
            marginBottom: '1.2rem'
          }}>
            {story.caption}
          </p>

          <button
            onClick={() => {
              onClose();
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              width: '100%',
              padding: '0.85rem',
              backgroundColor: '#c5a880',
              color: '#121212',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {story.cta} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
