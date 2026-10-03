import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import './Auth.css';

export default function LoginPage({ 
  onNavigateRegister, 
  onNavigateForgotPassword, 
  onLoginSuccess, 
  onBackToStore,
  redirectTarget = null 
}) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await signIn({ email: email.trim(), password });
      if (onLoginSuccess) {
        onLoginSuccess(redirectTarget, data?.user);
      }
    } catch (err) {
      console.warn('[LoginPage] Sign in failed:', err?.message);
      const rawMsg = err?.message || '';
      let friendlyMsg = 'Invalid email or password. Please verify your credentials and try again.';

      if (rawMsg.toLowerCase().includes('invalid login credentials')) {
        friendlyMsg = 'Invalid email or password. Please verify your credentials and try again.';
      } else if (rawMsg.toLowerCase().includes('email not confirmed')) {
        friendlyMsg = 'Your email address has not been confirmed. Please check your inbox for the confirmation link.';
      } else if (rawMsg.toLowerCase().includes('rate limit') || rawMsg.toLowerCase().includes('too many requests')) {
        friendlyMsg = 'Too many sign-in attempts. Please wait a few moments before trying again.';
      } else if (rawMsg.toLowerCase().includes('network') || rawMsg.toLowerCase().includes('failed to fetch')) {
        friendlyMsg = 'Unable to connect to the authentication service. Please check your internet connection.';
      } else if (rawMsg) {
        friendlyMsg = rawMsg;
      }

      setErrorMsg(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {onBackToStore && (
          <button 
            type="button" 
            onClick={onBackToStore} 
            className="auth-back-btn"
            aria-label="Return to Storefront"
          >
            <ArrowLeft size={14} /> Back to Store
          </button>
        )}

        <div className="auth-header">
          <div className="auth-badge">
            <Sparkles size={12} /> Yasraf Client Concierge
          </div>
          <h1 className="auth-title">Client Sign In</h1>
          <p className="auth-subtitle">
            {redirectTarget === 'checkout'
              ? 'Sign in to access your saved delivery addresses and track this order.'
              : 'Access your curated orders, saved addresses, and atelier profile.'}
          </p>
        </div>

        {errorMsg && (
          <div id="login-error-banner" className="auth-error-banner" role="alert">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className={`auth-input ${errorMsg ? 'has-error' : ''}`}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <div className="auth-actions-row">
              <label className="auth-label" htmlFor="login-password">
                Password
              </label>
              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="auth-link"
                tabIndex={0}
              >
                Forgot Password?
              </button>
            </div>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className={`auth-input ${errorMsg ? 'has-error' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In to Atelier <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to Yasraf?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              className="auth-link auth-link-primary"
            >
              Create an Account &rarr;
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
