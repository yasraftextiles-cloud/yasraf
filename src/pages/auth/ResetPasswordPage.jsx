import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import './Auth.css';

export default function ResetPasswordPage({ onResetSuccess, onBackToStore }) {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(newPassword);
      setIsDone(true);
    } catch (err) {
      console.warn('[ResetPassword] Error:', err.message);
      setErrorMsg(err.message || 'Unable to update password. Your recovery link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDone) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="w-14 h-14 rounded-full bg-[#f0fdf4] text-[#166534] mx-auto flex items-center justify-center mb-4 border border-[#bbf7d0]">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="auth-title">Password Updated</h1>
          <p className="auth-subtitle mb-6">
            Your password has been successfully updated. Your account is now secured with your new credentials.
          </p>
          <button
            type="button"
            onClick={onResetSuccess || onBackToStore}
            className="auth-submit-btn"
          >
            Open My Account &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">
            <Sparkles size={12} /> Account Security
          </div>
          <h1 className="auth-title">Set New Password</h1>
          <p className="auth-subtitle">
            Please enter a strong new password for your Yasraf atelier account.
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
            <label className="auth-label" htmlFor="reset-new-password">
              New Password (Min 6 Characters)
            </label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
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
            <label className="auth-label" htmlFor="reset-confirm-password">
              Confirm New Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="reset-confirm-password"
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
                Updating Password...
              </>
            ) : (
              <>
                Save New Password <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
