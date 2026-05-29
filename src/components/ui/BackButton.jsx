import { useNavigate } from 'react-router-dom';

export default function BackButton({ onClick, className = '' }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={`back-btn ${className}`}
      onClick={onClick || (() => navigate(-1))}
      aria-label="Retour"
    >
      &lt;
    </button>
  );
}
