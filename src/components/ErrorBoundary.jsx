import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DigiTailor Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justify: 'center',
            background: 'linear-gradient(135deg, #fff5f8 0%, #ffe4ec 100%)',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '24px',
            color: '#880e4f',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '40px 32px',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(136, 14, 79, 0.12)',
              maxWidth: '500px',
              width: '100%',
              border: '2px solid #f8bbd0',
            }}
          >
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✂️</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px', color: '#880e4f' }}>
              Something went wrong. Please try again.
            </h2>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5' }}>
              The Smart Digital Tailoring System encountered an exception. You can reload the page or return to the main portal.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(216, 27, 96, 0.3)',
                }}
              >
                🔄 Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  background: '#ffffff',
                  color: '#880e4f',
                  border: '2px solid #ad1457',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
