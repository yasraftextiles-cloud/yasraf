import React, { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { 
  Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, 
  Loader2, Eye, EyeOff, Sparkles, CheckCircle2 
} from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin({ onLoginSuccess, onBackToStore }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [roleNotice, setRoleNotice] = useState(null);

  const handleBackToStore = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (typeof onBackToStore === 'function') {
      onBackToStore();
    } else {
      window.location.href = '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your administrator email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRoleNotice(null);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setErrorMessage('Authentication failed. No user profile returned.');
        setIsLoading(false);
        return;
      }

      // 2. Check Admin Role in user_roles table or via is_admin RPC
      let isAdmin = false;

      // Method A: Check via is_admin RPC
      try {
        const { data: rpcAdmin } = await supabase.rpc('is_admin');
        if (rpcAdmin === true) {
          isAdmin = true;
        }
      } catch (rpcErr) {
        console.warn('is_admin RPC notice:', rpcErr);
      }

      // Method B: Check user_roles table directly
      if (!isAdmin) {
        try {
          const { data: roleRow } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (roleRow && roleRow.role === 'admin') {
            isAdmin = true;
          }
        } catch (roleErr) {
          console.warn('user_roles check notice:', roleErr);
        }
      }

      // Method C: Check trusted app_metadata role (not user_metadata)
      if (!isAdmin && data.user.app_metadata?.role === 'admin') {
        isAdmin = true;
      }

      if (!isAdmin) {
        setRoleNotice({
          userId: data.user.id,
          email: data.user.email
        });
        setIsLoading(false);
        return;
      }

      // Successfully authenticated and verified as admin -> navigate to dashboard
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper select-none">
      
      {/* Container with max width */}
      <div className="w-full max-w-[920px] flex flex-col">
        
        {/* Navigation row directly above card - Back to Storefront outside form */}
        <div className="w-full mb-4 flex justify-between items-center px-1">
          <a
            href="/"
            onClick={handleBackToStore}
            className="admin-back-link group"
            aria-label="Back to Storefront Homepage"
          >
            <ArrowLeft size={15} aria-hidden="true" className="back-arrow shrink-0 pointer-events-none" />
            <span>Back to Storefront</span>
          </a>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#9f7f52] font-semibold bg-[#faf6f0] border border-[#e8dfd3] px-2.5 py-1">
            <ShieldCheck size={13} className="text-[#c5a880]" />
            <span>Admin Portal</span>
          </div>
        </div>

        {/* Two-panel Luxury Card */}
        <div className="admin-login-card">
          
          {/* 1. Left Dark Branded Panel */}
          <div className="admin-login-brand-panel p-6 sm:p-8 md:p-10 lg:p-12">
            
            {/* Top Branding Section */}
            <div>
              <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.24em] text-[#c5a880] font-semibold mb-4 sm:mb-6">
                <Sparkles size={13} className="text-[#c5a880] shrink-0" />
                <span>Haute Couture Atelier</span>
              </div>

              <h1 
                className="text-3xl sm:text-4xl md:text-3xl lg:text-4xl text-[#faf8f6] font-normal tracking-[0.2em] leading-none mb-3"
                style={{ fontFamily: 'var(--font-family-editorial, "Cormorant Garamond", Georgia, serif)' }}
              >
                YASRAF
              </h1>

              {/* Decorative Muted Gold Line */}
              <div className="w-12 h-[1.5px] bg-[#c5a880] mb-4 sm:mb-6 opacity-85" />

              <p className="text-[11.5px] uppercase tracking-[0.22em] text-[#dfc7a7] font-medium mb-3">
                Atelier Management
              </p>

              <p className="text-[13px] text-[#b8b2a8] leading-relaxed font-light hidden md:block">
                Secure administrative suite for couture catalog curation, bespoke client inquiries, and live inventory management.
              </p>
            </div>

            {/* Bottom Status / Security Detail (Desktop Only) */}
            <div className="pt-6 border-t border-white/10 hidden md:flex items-center justify-between text-[11px] tracking-[0.16em] uppercase text-[#8c867f]">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-pulse" />
                Verified Portal
              </span>
              <span>EST. 2024</span>
            </div>

          </div>

          {/* 2. Right Ivory Form Panel */}
          <div className="admin-login-form-panel p-6 sm:p-8 md:p-10 lg:p-12 text-left">
            
            {/* Form Heading & Supporting Text */}
            <div className="mb-6 sm:mb-8">
              <h2 
                className="text-2xl sm:text-3xl text-[#1a1814] font-normal tracking-wide mb-1.5"
                style={{ fontFamily: 'var(--font-family-editorial, "Cormorant Garamond", Georgia, serif)' }}
              >
                Welcome Back
              </h2>
              <p className="text-[13px] text-[#59534c] tracking-normal font-normal">
                Sign in to manage your store.
              </p>
            </div>

            {/* Error Alert Notice */}
            {errorMessage && (
              <div 
                role="alert" 
                className="mb-6 p-3.5 bg-[#fdf2f2] border border-[#f5c6cb] text-[#721c24] text-[13px] flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#a82533]" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Non-Admin Role Notice */}
            {roleNotice && (
              <div className="mb-6 p-4 bg-[#fff9db] border border-[#ffe066] text-[#856404] text-[12px] space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-[12.5px] text-[#665100]">
                  <AlertCircle size={15} /> Access Restricted (Not an Administrator)
                </div>
                <p className="text-[#665100]">
                  Signed in as <strong>{roleNotice.email}</strong>, but this account does not have the <code>admin</code> role assigned in the <code>public.user_roles</code> table.
                </p>
                <p className="text-[11px] text-[#7a6200]">
                  To grant admin access, execute this SQL query in your Supabase SQL Editor:
                </p>
                <div className="p-2 bg-white/95 border border-[#e0c85c] font-mono text-[11px] select-all break-all text-[#1a1814]">
                  INSERT INTO public.user_roles (user_id, role) VALUES ('{roleNotice.userId}', 'admin') ON CONFLICT DO NOTHING;
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => supabase.auth.signOut().then(() => setRoleNotice(null))}
                    className="text-[11.5px] underline font-medium text-[#4a3b00] hover:text-black cursor-pointer"
                  >
                    Sign out and try another account
                  </button>
                </div>
              </div>
            )}

            {/* Main Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
              
              {/* Email Address Field */}
              <div>
                <label 
                  htmlFor="admin-email"
                  className="block text-[11.5px] uppercase tracking-[0.14em] font-semibold text-[#1a1814] mb-2"
                >
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 pointer-events-none text-[#78716c] flex items-center justify-center">
                    <Mail size={16} aria-hidden="true" />
                  </span>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="username email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@yasrafclothing.com"
                    className="admin-login-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="admin-password"
                  className="block text-[11.5px] uppercase tracking-[0.14em] font-semibold text-[#1a1814] mb-2"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 pointer-events-none text-[#78716c] flex items-center justify-center">
                    <Lock size={16} aria-hidden="true" />
                  </span>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="admin-login-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="admin-password-toggle"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={16} aria-hidden="true" />
                    ) : (
                      <Eye size={16} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Prominent Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="admin-login-submit-btn mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-current" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

            </form>

            {/* Simple Luxury Footer Notice */}
            <div className="mt-8 pt-6 border-t border-[#ebe6df] text-center">
              <p className="text-[12px] text-[#59534c] leading-relaxed font-normal">
                Authorized administrators only.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
