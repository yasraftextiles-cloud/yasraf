import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import './Auth.css';

export default function AuthCallbackPage({ onNavigateLogin, onNavigateResetPassword, onNavigateAccount, onBackToStore }) {
  const [status, setStatus] = useState('processing'); // 'processing' | 'confirmed' | 'recovery' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const hash = window.location.hash || '';
        const search = window.location.search || '';

        // Check for error in hash or query
        const params = new URLSearchParams(hash.replace(/^#\/?/, '').replace(/^\?/, '') || search);
        const error = params.get('error');
        const errorDesc = params.get('error_description');
        const type = params.get('type');

        if (error || errorDesc) {
          setStatus('error');
          setMessage(errorDesc || 'The authentication link has expired or is invalid. Please request a new one.');
          return;
        }

        if (type === 'recovery') {
          setStatus('recovery');
          if (onNavigateResetPassword) {
            onNavigateResetPassword();
          }
          return;
        }

        // Verify active session from Supabase
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          setStatus('error');
          setMessage(sessionErr.message || 'Session verification failed.');
          return;
        }

        if (session) {
          setStatus('confirmed');
          setMessage('Your email has been confirmed and your Yasraf atelier account is now fully active.');
        } else {
          // If no session yet, wait a moment or notify user to sign in
          setStatus('confirmed');
          setMessage('Email confirmed successfully! You can now sign in with your credentials.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred while verifying your account.');
      }
    };

    processCallback();
  }, [onNavigateResetPassword]);

  if (status === 'processing') {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin text-[#c5a880] mx-auto mb-4" />
          <h1 className="auth-title">Verifying Credential</h1>
          <p className="auth-subtitle">
            Synchronizing your session with the atelier...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="w-14 h-14 rounded-full bg-[#fef2f2] text-[#991b1b] mx-auto flex items-center justify-center mb-4 border border-[#fecaca]">
            <AlertCircle size={28} />
          </div>
          <h1 className="auth-title">Verification Issue</h1>
          <p className="auth-subtitle mb-6 text-[#991b1b]">
            {message}
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="auth-submit-btn"
            >
              Go to Sign In &rarr;
            </button>
            {onBackToStore && (
              <button
                type="button"
                onClick={onBackToStore}
                className="auth-link text-center pt-2"
              >
                Return to Storefront
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="w-14 h-14 rounded-full bg-[#f0fdf4] text-[#166534] mx-auto flex items-center justify-center mb-4 border border-[#bbf7d0]">
          <CheckCircle2 size={28} />
        </div>
        <div className="auth-badge">
          <Sparkles size={12} /> The Yasraf Circle
        </div>
        <h1 className="auth-title">Welcome to Yasraf</h1>
        <p className="auth-subtitle mb-6">
          {message}
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onNavigateAccount || onBackToStore}
            className="auth-submit-btn"
          >
            Access My Account &rarr;
          </button>
          {onBackToStore && (
            <button
              type="button"
              onClick={onBackToStore}
              className="auth-link text-center pt-2"
            >
              Explore Collections
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
