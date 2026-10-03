import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';

export default function SupabaseDevConnectionTest() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'testing' | 'success' | 'error'
  const [resultMessage, setResultMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Strict guard: completely stripped from production builds
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleTestConnection = async () => {
    setStatus('testing');
    setResultMessage('');
    setErrorDetails('');
    setIsOpen(true);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !apiKey || supabaseUrl.includes('your-project-id')) {
      setStatus('error');
      setResultMessage('Configuration Error');
      setErrorDetails('Missing or unconfigured VITE_SUPABASE_URL or API key in environment.');
      return;
    }

    try {
      const endpoint = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/settings`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.status === 200) {
        let payload;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        // Verify that the response is genuine Supabase Auth settings JSON
        const isAuthSettings = payload && typeof payload === 'object' && ('external' in payload || 'disable_signup' in payload);

        if (isAuthSettings) {
          setStatus('success');
          setResultMessage('Connection successful');
          setErrorDetails('HTTP 200: Validated live Supabase Auth settings endpoint.');
        } else {
          setStatus('error');
          setResultMessage('Unexpected Response (HTTP 200)');
          setErrorDetails('Received HTTP 200, but payload did not match expected Auth settings schema.');
        }
      } else {
        let errorMsg = `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMsg += ` - ${errData.message}`;
          }
        } catch {
          // ignore parsing error
        }
        setStatus('error');
        setResultMessage(`Connection Failed (HTTP ${response.status})`);
        setErrorDetails(errorMsg);
      }
    } catch (err) {
      setStatus('error');
      setResultMessage('Network / Connection Error');
      setErrorDetails(err.message || 'Failed to fetch Supabase endpoint. Check network or CORS.');
    }
  };

  return (
    <aside 
      aria-label="Development Diagnostic Panel"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 99999,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Expanded status card */}
      {isOpen && status !== 'idle' && (
        <div style={{
          marginBottom: '10px',
          backgroundColor: '#1f2937',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '14px 16px',
          width: '320px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          border: '1px solid #374151',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', fontWeight: 600 }}>
              Supabase Diagnostics (Dev Only)
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close diagnostic panel"
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
            >
              <X size={15} />
            </button>
          </div>

          {status === 'testing' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Querying /auth/v1/settings...</span>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>
                <CheckCircle2 size={18} />
                <span>{resultMessage}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#d1d5db', marginTop: '4px', lineHeight: 1.4 }}>
                {errorDetails}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 600, marginBottom: '4px' }}>
                <AlertTriangle size={18} />
                <span>{resultMessage}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px', lineHeight: 1.4 }}>
                {errorDetails}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Dev Button */}
      <button
        id="dev-test-supabase-btn"
        onClick={handleTestConnection}
        disabled={status === 'testing'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: status === 'success' ? '#065f46' : status === 'error' ? '#991b1b' : '#111827',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          cursor: status === 'testing' ? 'wait' : 'pointer',
          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.35)',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        title="Development Only: Test read-only connection to Supabase /auth/v1/settings"
      >
        {status === 'testing' ? (
          <Loader2 size={14} className="animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle2 size={14} color="#34d399" />
        ) : status === 'error' ? (
          <AlertTriangle size={14} color="#f87171" />
        ) : (
          <Database size={14} color="#38bdf8" />
        )}
        <span>Test Supabase Connection</span>
        <span style={{
          fontSize: '0.62rem',
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          padding: '1px 6px',
          borderRadius: '9999px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          DEV
        </span>
      </button>
    </aside>
  );
}
