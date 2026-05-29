import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../../components/ui/CTAButton';
import { getOnboarding, setOnboarding } from '../../utils/storage';
import { isAtLeast18 } from '../../utils/age';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i);

export default function OnboardingBirthDate() {
  const navigate = useNavigate();
  const [day, setDay] = useState(getOnboarding('birth_day', ''));
  const [month, setMonth] = useState(getOnboarding('birth_month', ''));
  const [year, setYear] = useState(getOnboarding('birth_year', ''));
  const filled = day && month && year;
  const valid18 = filled && isAtLeast18(day, month, year);

  return (
    <div className="onboarding-page">
      <h1 className="onboarding-title">Quelle est ta date de naissance ?</h1>
      <p className="onboarding-sub">Tu dois avoir au moins 18 ans</p>
      <div className="birth-selects">
        <select value={day} onChange={(e) => setDay(e.target.value)} className="birth-select">
          <option value="">Jour</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="birth-select">
          <option value="">Mois</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="birth-select">
          <option value="">Année</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      {filled && !valid18 && (
        <p className="error-text">Tu dois avoir au moins 18 ans pour utiliser 2GAIN.</p>
      )}
      <div className="onboarding-footer">
        <CTAButton
          disabled={!valid18}
          onClick={() => {
            setOnboarding('birth_day', day);
            setOnboarding('birth_month', month);
            setOnboarding('birth_year', year);
            navigate('/onboarding/gender');
          }}
        >
          Continuer
        </CTAButton>
      </div>
    </div>
  );
}
