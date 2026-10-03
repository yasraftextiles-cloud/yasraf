import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import './Auth.css';

export default function RegisterPage({ 
  onNavigateLogin, 
  onRegisterSuccess, 
  onBackToStore,
  redirectTarget = null 
}) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 7) {
      setErrorMsg('Please enter a valid contact phone number (at least 7 digits).');
      return;
    }

    if (!trimmedCity) {
      setErrorMsg('Please enter your city.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp({
        email: trimmedEmail,
        password,
        fullName: trimmedName,
        phone: trimmedPhone,
        city: trimmedCity
      });

      if (result.needsEmailConfirmation) {
        setNeedsConfirmation(true);
      } else if (onRegisterSuccess) {
        onRegisterSuccess(redirectTarget);
      }
    } catch (err) {
      console.warn('[RegisterPage] Sign up error:', err.message);
      setErrorMsg(err.message || 'Unable to complete registration. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="w-14 h-14 rounded-full bg-[#f0fdf4] text-[#166534] mx-auto flex items-center justify-center mb-4 border border-[#bbf7d0]">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle mb-6">
            We have dispatched a confirmation link to <strong>{email}</strong>. 
            Please open the link to activate your Yasraf atelier account.
          </p>
          <div className="bg-[#faf8f6] border border-[#e5dfd7] p-4 text-[12px] text-[#4a453e] text-left mb-6 leading-relaxed">
            <p className="font-semibold mb-1">Didn’t receive the email?</p>
            <p className="m-0 text-[#8c867f]">
              Check your spam or promotions folder. Once confirmed, you can proceed to sign in.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="auth-submit-btn"
          >
            Proceed to Sign In &rarr;
          </button>
        </div>
      </div>
    );
  }

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
            <Sparkles size={12} /> The Yasraf Circle
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join the atelier to enjoy seamless checkout, order tracking, and private collection previews.
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
            <label className="auth-label" htmlFor="reg-name">
              Full Name *
            </label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                placeholder="e.g. Ayesha Khan"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="auth-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="reg-email">
              Email Address *
            </label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="reg-email"
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

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="reg-phone">
              Contact Phone Number *
            </label>
            <div className="auth-input-wrapper">
              <Phone size={16} className="auth-input-icon" />
              <input
                id="reg-phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="0300 1234567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="auth-input"
                disabled={isLoading}
              />
            </div>
            <span className="text-[11px] text-[#8c867f] mt-1">
              Contact number for courier delivery & order status updates.
            </span>
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="reg-city">
              City *
            </label>
            <div className="auth-input-wrapper">
              <MapPin size={16} className="auth-input-icon" />
              <input
                id="reg-city"
                type="text"
                required
                autoComplete="address-level2"
                placeholder="e.g. Lahore, Karachi, Islamabad"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="auth-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="reg-password">
              Password (Min 6 Characters) *
            </label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="auth-input"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="reg-confirm-password">
              Confirm Password *
            </label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
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
                Creating Account...
              </>
            ) : (
              <>
                Register Account <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already an atelier client?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="auth-link auth-link-primary"
            >
              Sign In Instead &rarr;
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
