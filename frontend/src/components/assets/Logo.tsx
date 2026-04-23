import { cn } from '../../lib/cn'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-8 w-8', className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g" x1="10" y1="6" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22C55E" />
          <stop offset="0.55" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>

      <path
        d="M32 6c12.7 0 23 10.3 23 23 0 13.6-8.9 24.6-21.5 28.5-1.3.4-2.7.4-4 0C16.9 53.6 8 42.6 8 29 8 16.3 18.3 6 31 6h1Z"
        fill="url(#g)"
        opacity="0.9"
      />

      <path
        d="M26.2 40.8c0-7.7 5.1-13.5 12.8-16.5 1.4-.6 2.3-1.9 2.3-3.4 0-2.2-2.2-3.9-4.3-3-10.2 4-17 12-17 22.9 0 1.8 1.5 3.2 3.2 3.2s3.3-1.4 3.3-3.2Z"
        fill="#0B1220"
        opacity="0.55"
      />

      <path
        d="M36 20.5a3.2 3.2 0 0 1 3.2-3.2h.3a3.2 3.2 0 1 1 0 6.4h-.3A3.2 3.2 0 0 1 36 20.5Z"
        fill="#0B1220"
        opacity="0.65"
      />

      <path
        d="M32 18.2c-6.6 0-12 5.4-12 12 0 9.7 9.2 15.9 12 21.3 2.8-5.4 12-11.6 12-21.3 0-6.6-5.4-12-12-12Zm0 6.1a5.9 5.9 0 1 1 0 11.8 5.9 5.9 0 0 1 0-11.8Z"
        fill="#0B1220"
        opacity="0.16"
      />
    </svg>
  )
}

