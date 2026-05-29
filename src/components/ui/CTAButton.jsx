export default function CTAButton({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const cls = ['cta-btn', `cta-btn--${variant}`, disabled ? 'cta-btn--disabled' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
