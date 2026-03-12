"use client";

interface RefreshIconProps {
  size?: number;
}

export function RefreshIcon({ size = 18 }: RefreshIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.5 3V7.5H6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 15V10.5H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.715 6.75C14.2789 5.57852 13.5161 4.55418 12.5146 3.79693C11.5131 3.03967 10.3145 2.58118 9.06101 2.47483C7.80757 2.36848 6.55021 2.61874 5.43924 3.19464C4.32827 3.77055 3.41056 4.64739 2.79 5.73L1.5 7.5M16.5 10.5L15.21 12.27C14.5894 13.3526 13.6717 14.2295 12.5608 14.8054C11.4498 15.3813 10.1924 15.6315 8.939 15.5252C7.68555 15.4188 6.48689 14.9603 5.48542 14.2031C4.48395 13.4458 3.72112 12.4215 3.285 11.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
