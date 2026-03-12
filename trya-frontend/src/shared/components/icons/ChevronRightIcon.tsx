"use client";

interface ChevronRightIconProps {
  size?: number;
}

export function ChevronRightIcon({ size = 8 }: ChevronRightIconProps) {
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
        d="M1.5 1L6.5 6L1.5 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
