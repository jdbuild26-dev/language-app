export const LogoSVG = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-white drop-shadow-sm"
  >
    <path
      d="M16 4L28 28H4L16 4Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const FlagUKSVG = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 60 30"
    className="rounded-full shadow-sm object-cover ring-2 ring-white/30"
    preserveAspectRatio="xMidYMid slice"
  >
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#00247d" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path
      d="M0,0 L60,30 M60,0 L0,30"
      clipPath="url(#t)"
      stroke="#cf142b"
      strokeWidth="4"
    />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" />
  </svg>
);

export const FlagSpainSVG = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 750 500"
    className="rounded-full shadow-sm object-cover ring-2 ring-white/30"
    preserveAspectRatio="xMidYMid slice"
  >
    <rect width="750" height="500" fill="#c60b1e" />
    <rect y="125" width="750" height="250" fill="#ffc400" />
  </svg>
);
