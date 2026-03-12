"use client";

interface ChevronLeftIconProps {
  size?: number;
}

export function ChevronLeftIcon({ size = 8 }: ChevronLeftIconProps) {
  const height = size * 1.5;
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 8 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.5 1L1.5 6L6.5 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
