export default function CTAButton({
  children,
  onClick,
  disabled = false,
  variant = 'solid',
  type = 'button',
  className = '',
}) {
  if (variant === 'primary' || variant === 'secondary') {
    const cls = ['cta-btn', `cta-btn--${variant}`, disabled ? 'cta-btn--disabled' : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <button type={type} className={cls} disabled={disabled} onClick={onClick}>
        {children}
      </button>
    );
  }

  const isOutline = variant === 'outline';

  return (
    <button
      type={type}
      className={`cta-button cta-btn ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: isOutline ? 'transparent' : '#FF6B00',
        border: isOutline ? '2px solid #FF6B00' : 'none',
        color: isOutline ? '#C2410C' : '#fff',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
