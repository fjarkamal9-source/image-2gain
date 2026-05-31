export default function Tag({ type = 'sport', children, className = '' }) {
  return <span className={`tag tag--${type} ${className}`}>{children}</span>;
}
