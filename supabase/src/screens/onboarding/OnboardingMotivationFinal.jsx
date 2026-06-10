import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushOnboardingToProfile } from '../../utils/completeOnboarding';

export default function OnboardingMotivationFinal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setLoading(true);
    try {
      await flushOnboardingToProfile();
      navigate('/swipe-intro');
    } catch (err) {
      console.error('flush error:', err);
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundImage: 'url(/img/swipe-intro.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center bottom',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      boxSizing: 'border-box',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.30)',
        zIndex: 0,
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '0 24px 48px 24px',
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <span style={{
            background: '#1A3FCC',
            color: '#ffffff',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 14,
            fontWeight: 700,
          }}>🏃 Jogging</span>
          <span style={{
            background: '#FF6B00',
            color: '#ffffff',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 14,
            fontWeight: 700,
          }}>🤝 Rencontre amicale</span>
        </div>
        <h1 style={{
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontSize: 32,
          fontWeight: 900,
          color: '#ffffff',
          margin: '0 0 12px 0',
          lineHeight: 1.2,
        }}>
          Qui se ressemble,{' '}
          <span style={{ color: '#FF6B00' }}>s&apos;entraîne</span>{' '}
          ensemble
        </h1>
        <p style={{
          color: '#ffffffcc',
          fontSize: 15,
          marginBottom: 32,
        }}>
          Trouve des partenaires sportifs près de toi et atteignez vos objectifs ensemble.
        </p>
        <button
          type="button"
          onClick={finish}
          disabled={loading}
          style={{
            background: '#FF6B00',
            color: '#ffffff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 0',
            fontSize: 18,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            opacity: loading ? 0.7 : 1,
          }}
        >
          Commence à trouver
        </button>
      </div>
    </div>
  );
}
