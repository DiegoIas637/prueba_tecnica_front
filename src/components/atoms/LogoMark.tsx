export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="SeguraVida"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#a7f3d0" />
        </linearGradient>
      </defs>
      <path
        d="M32 4 54 12v18c0 14-9.5 24.5-22 30C19.5 54.5 10 44 10 30V12L32 4Z"
        fill="url(#logo-grad)"
      />
      <path
        d="M23 32.5l6.2 6.2L42 25.5"
        fill="none"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
