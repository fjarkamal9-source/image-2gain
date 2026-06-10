import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SwipeIntro() {
  const navigate = useNavigate();
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      boxSizing: 'border-box',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: 28,
        fontWeight: 900,
        color: '#111111',
        marginBottom: 12,
      }}>
        Prêt à trouver ton partenaire sportif ?
      </h1>
      <p style={{
        fontSize: 16,
        color: '#555555',
        marginBottom: 40,
      }}>
        Swipe pour découvrir des sportifs près de toi
      </p>
      <button
        onClick={() => navigate('/home')}
        style={{
          background: '#FF6B00',
          color: '#ffffff',
          border: 'none',
          borderRadius: 12,
          padding: '16px 48px',
          fontSize: 18,
          fontWeight: 700,
          cursor: 'pointer',
          width: '100%',
          maxWidth: 320,
        }}
      >
        Découvrir
      </button>
    </div>
  );
}
