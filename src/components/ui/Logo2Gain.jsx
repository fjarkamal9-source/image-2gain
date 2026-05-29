function Logo2GainSymbol({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 186 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#FF6B00"
        d="M83.5 7.5C83.5 4.2 76.8 1.8 69.5 2.8 54.2 5.2 42.8 14.5 40.5 27.8 38.8 37.2 44.5 45.2 54.2 46.8 46.5 50.5 40.2 58.8 40.8 67.5 41.5 73.8 46.8 77.2 53.5 76.8 62.5 76.2 72.8 76.5 93 76.5 70.5 65.2 63.8 51.5 69.2 37.8 74.2 25.5 80.5 14.2 83.5 7.5Z"
      />
      <path
        fill="#1A3FCC"
        d="M102.5 7.5C102.5 4.2 109.2 1.8 116.5 2.8 131.8 5.2 143.2 14.5 145.5 27.8 147.2 37.2 141.5 45.2 131.8 46.8 139.5 50.5 145.8 58.8 145.2 67.5 144.5 73.8 139.2 77.2 132.5 76.8 123.5 76.2 113.2 76.5 93 76.5 115.5 65.2 122.2 51.5 116.8 37.8 111.8 25.5 105.5 14.2 102.5 7.5Z"
      />
    </svg>
  );
}

export default function Logo2Gain({ className = '' }) {
  return (
    <div className={`logo-2gain ${className}`.trim()} aria-label="2GAIN">
      <Logo2GainSymbol className="logo-2gain__symbol" />
      <span className="logo-2gain__wordmark" aria-hidden>
        <span className="logo-2gain__wordmark-blue">2</span>
        <span className="logo-2gain__wordmark-orange">GAIN</span>
      </span>
    </div>
  );
}
