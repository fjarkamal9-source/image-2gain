import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';

export default function SwipeIntro() {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <img src="/img/swipe-intro.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.48)', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px 64px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Arial Black, Arial', fontSize: 28, color: '#fff', marginBottom: 12 }}>Prêt à trouver ton partenaire ?</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 40 }}>Découvre des sportifs près de toi</p>
        <CTAButton onClick={() => navigate('/home', { replace: true })}>Découvrir 💪</CTAButton>
      </div>
    </div>
  );
}
