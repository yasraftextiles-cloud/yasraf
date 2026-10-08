import React from 'react';

/**
 * Universal Error Boundary to prevent white screen of death
 * Catches unhandled render errors gracefully in child components.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[YASRAF UI ErrorBoundary]: Caught render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          backgroundColor: '#faf9f6',
          color: '#1a1814',
          maxWidth: '480px',
          margin: '2rem auto',
          borderRadius: '4px',
          border: '1px solid #ebe6df',
          fontFamily: 'inherit'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {this.props.title || 'An unexpected error occurred'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#7a756f', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {this.props.message || 'We encountered a momentary issue displaying this content. Please try again.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            style={{
              padding: '0.65rem 1.4rem',
              backgroundColor: '#141414',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
