interface BotAvatarIconProps {
  size?: number;
}

export function BotAvatarIcon({ size = 40 }: BotAvatarIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
    >
      <rect width="40" height="40" rx="20" fill="#BEE1EB" />
      <path d="M17.5 10H22.5V30H17.5V10Z" fill="#0A3A3A" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30.0001 22.5L30.0001 17.5L17.5001 17.5L17.5001 22.5L30.0001 22.5ZM16.7501 22.5L16.7501 17.5L10.0001 17.5L10.0001 22.5L16.7501 22.5Z"
        fill="#0A3A3A"
      />
    </svg>
  );
}
