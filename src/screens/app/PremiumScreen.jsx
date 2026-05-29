import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/ui/BackButton';
import CTAButton from '../../components/ui/CTAButton';

const BENEFITS = [
  { icon: '⚡', title: 'Likes illimités', desc: 'Swipez sans limite' },
  { icon: '👁', title: 'Voir qui vous a liké', desc: 'Accédez aux likes reçus' },
  { icon: '🎯', title: 'Filtres avancés', desc: 'Affinez votre recherche' },
];

export default function PremiumScreen() {
  const navigate = useNavigate();

  return (
    <div className="app-frame premium-screen">
      <header className="edit-profile-header">
        <BackButton />
        <h1>Premium</h1>
        <span className="edit-profile-header__spacer" />
      </header>
      <div className="premium-body">
        <h2 className="premium-title">2GAIN Premium</h2>
        <p className="premium-subtitle">Débloquez toutes les fonctionnalités</p>
        <div className="premium-cards">
          {BENEFITS.map((b) => (
            <div key={b.title} className="premium-card">
              <span className="premium-card__icon">{b.icon}</span>
              <div>
                <p className="premium-card__title">{b.title}</p>
                <p className="premium-card__desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="premium-note">3 jours gratuits, puis 9,99€/mois</p>
      </div>
      <div className="premium-footer">
        <CTAButton onClick={() => {}}>Commencer l&apos;essai gratuit</CTAButton>
        <CTAButton variant="secondary" onClick={() => navigate(-1)}>
          Peut-être plus tard
        </CTAButton>
      </div>
    </div>
  );
}
