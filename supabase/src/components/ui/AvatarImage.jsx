import { useState } from 'react';
import { getAvatarColor } from '../../data/mockProfiles';

export default function AvatarImage({ src, name = '?', size = 48, className = '' }) {
  const [error, setError] = useState(false);
  const initial = (name || '?').charAt(0).toUpperCase();
  const color = getAvatarColor(name || 'x');
  const dim = { width: size, height: size, fontSize: size * 0.42 };

  if (!src || error) {
    return (
      <div
        className={`avatar-fallback ${className}`}
        style={{ ...dim, backgroundColor: color }}
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={`avatar-img ${className}`}
      style={dim}
      onError={() => setError(true)}
    />
  );
}
