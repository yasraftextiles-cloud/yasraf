import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Loader2, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import './Auth.css';

export default function ForgotPasswordPage({ onNavigateLogin, onBackToStore }) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your account email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await requestPasswordReset(email.trim());
      setIsSubmitted(true);
    } catch (err) {
      console.warn('[ForgotPassword] Request error:', err.message);
      setErrorMsg(err.message || 'Unable to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="w-14 h-14 rounded-full bg-[#f0fdf4] text-[#166534] mx-auto flex items-center justify-center mb-4 border border-[#bbf7d0]">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="auth-title">Instructions Dispatched</h1>
          <p className="auth-subtitle mb-6">
            If an account is registered with <strong>{email}</strong>, you will receive a secure password recovery link shortly.
          </p>
          <div className="bg-[#faf8f6] border border-[#e5dfd7] p-4 text-[12px] text-[#4a453e] text-left mb-6 leading-relaxed">
            <p className="m-0 text-[#8c867f]">
              Click the link in the email to set a new password. The link will remain active for 1 hour.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="auth-submit-btn"
          >
            Back to Sign In &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {onNavigateLogin && (
          <button 
            type="button" 
            onClick={onNavigateLogin} 
            className="auth-back-btn"
            aria-label="Back to Sign In"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        )}

        <div className="auth-header">
          <div className="auth-badge">
            <Sparkles size={12} /> Account Recovery
          </div>
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">
            Enter your registered email address and we will dispatch a secure reset link.
          </p>
        </div>

        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="forgot-email">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="auth-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Dispatching Link...
              </>
            ) : (
              <>
                Send Reset Link <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remembered your credentials?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="auth-link auth-link-primary"
            >
              Sign In Here &rarr;
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
