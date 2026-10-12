import React from 'react';
import { useNavigate } from '../router/Router.jsx';

export function NotFoundPage() {
  const navigate = useNavigate();

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
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🧵</div>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px', color: '#880e4f' }}>
          404 — Page Not Found
        </h2>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5' }}>
          The tailoring route you requested does not exist or has moved. Return to the main DigiTailor workspace.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(216, 27, 96, 0.3)',
          }}
        >
          🏠 Go Home
        </button>
      </div>
    </div>
  );
}
