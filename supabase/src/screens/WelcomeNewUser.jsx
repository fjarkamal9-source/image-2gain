import { useNavigate } from 'react-router-dom';

export default function WelcomeNewUser() {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundImage: 'url(/img/auth-hero.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Overlay sombre */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.5)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'relative',
        background: 'white',
        borderRadius: '24px',
        padding: '32px 24px',
        textAlign: 'center',
        maxWidth: '340px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1A1A2E', marginBottom: '12px' }}>
          Bienvenue sur 2GAIN !
        </h2>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.5', marginBottom: '28px' }}>
          Ton compte Google n'est pas encore enregistré.<br />
          On va créer ton profil en quelques étapes.
        </p>
        <button
          onClick={() => navigate('/onboarding/welcome-rules')}
          style={{
            width: '100%',
            padding: '16px',
            background: '#FF6B00',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Commencer l'inscription →
        </button>
      </div>
    </div>
  );
}
