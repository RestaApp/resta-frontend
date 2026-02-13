import { memo } from 'react'

type Props = {
  className?: string
}

export const EmptySearchIllustration = memo(function EmptySearchIllustration({ className }: Props) {
  return (
    <svg
      className={className}
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g1" x1="10" y1="18" x2="86" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgb(107 33 168)" stopOpacity="0.22" />
          <stop offset="1" stopColor="rgb(236 72 153)" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <circle cx="46" cy="44" r="26" fill="url(#g1)" />
      <circle cx="46" cy="44" r="18" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M62 62L78 78"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M32 44H60"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M36 52H56"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
})

export const EmptyFiltersIllustration = memo(function EmptyFiltersIllustration({ className }: Props) {
  return (
    <svg
      className={className}
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g2" x1="12" y1="16" x2="84" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgb(147 51 234)" stopOpacity="0.22" />
          <stop offset="1" stopColor="rgb(34 211 238)" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <rect x="14" y="18" width="68" height="60" rx="18" fill="url(#g2)" />
      <path
        d="M30 34H66"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="40" cy="34" r="6" fill="currentColor" fillOpacity="0.18" />
      <path
        d="M26 50H70"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="58" cy="50" r="6" fill="currentColor" fillOpacity="0.16" />
      <path
        d="M34 66H62"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="48" cy="66" r="6" fill="currentColor" fillOpacity="0.14" />
    </svg>
  )
})

export const EmptyInboxIllustration = memo(function EmptyInboxIllustration({ className }: Props) {
  return (
    <svg
      className={className}
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g3" x1="16" y1="18" x2="84" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgb(107 33 168)" stopOpacity="0.2" />
          <stop offset="1" stopColor="rgb(236 72 153)" stopOpacity="0.14" />
        </linearGradient>
      </defs>
      <path
        d="M22 34C22 28.477 26.477 24 32 24H64C69.523 24 74 28.477 74 34V68C74 73.523 69.523 78 64 78H32C26.477 78 22 73.523 22 68V34Z"
        fill="url(#g3)"
      />
      <path
        d="M30 38H66"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M30 48H60"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M30 58H54"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 70H64"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
})

export const EmptyBriefcaseIllustration = memo(function EmptyBriefcaseIllustration({
  className,
}: Props) {
  return (
    <svg
      className={className}
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g4" x1="16" y1="18" x2="84" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgb(34 211 238)" stopOpacity="0.16" />
          <stop offset="1" stopColor="rgb(147 51 234)" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <rect x="18" y="34" width="60" height="42" rx="16" fill="url(#g4)" />
      <path
        d="M34 34V30C34 26.686 36.686 24 40 24H56C59.314 24 62 26.686 62 30V34"
        stroke="currentColor"
        strokeOpacity="0.24"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 48H78"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M44 44H52"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="48" cy="44" r="3" fill="currentColor" fillOpacity="0.16" />
    </svg>
  )
})

