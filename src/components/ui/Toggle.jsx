export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle-row">
      {label && <span className="toggle-row__label">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? 'toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle__knob" />
      </button>
    </label>
  );
}
