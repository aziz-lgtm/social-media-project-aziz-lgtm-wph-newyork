/**
 * Shared backdrop for the register/login pages, reproduced from the Figma
 * "Gradient" frame's actual export: two heavily blurred gradient blobs
 * (paint0/paint1, feGaussianBlur stdDeviation 150) clipped inside a
 * 1920x1080 rounded-120px black panel offset at (-404, 150) within the
 * 1440x1024 page — same path data and gradient stops as the source SVG,
 * so the curve shape matches exactly instead of being approximated.
 */
export function AuthBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1440 1024"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <clipPath id="auth-bg-panel-clip">
            <rect x="-404" y="150" width="1920" height="1080" rx="120" />
          </clipPath>
          <linearGradient
            id="auth-bg-paint0"
            x1="1069.81"
            y1="1038.65"
            x2="-40.3002"
            y2="1038.65"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5613A3" />
            <stop offset="1" stopColor="#522BC8" />
          </linearGradient>
          <linearGradient
            id="auth-bg-paint1"
            x1="1171.38"
            y1="1226.52"
            x2="-127.194"
            y2="1016.2"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#AC88FF" />
            <stop offset="0.682692" stopColor="#AD3AE7" />
          </linearGradient>
          <filter
            id="auth-bg-blur1"
            x="-967.963"
            y="-585.5"
            width="3448.26"
            height="3060.53"
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation="150" />
          </filter>
          <filter
            id="auth-bg-blur2"
            x="-990.957"
            y="372.292"
            width="3130.49"
            height="2264.09"
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation="150" />
          </filter>
        </defs>

        <g clipPath="url(#auth-bg-panel-clip)">
          <rect x="-404" y="150" width="1920" height="1080" fill="black" />
          <g filter="url(#auth-bg-blur1)">
            <path
              d="M513.499 818.5C1217.62 952.743 1785.67 266.446 1790 -285.5C1978.26 -68.7291 1966.99 742.758 2153.95 1503.46C2387.66 2454.34 1017.88 2153.77 -46.7924 2033.55C-898.527 1937.37 -671.494 520.351 -533 -150C-258.521 -98.7695 -289.001 665.5 513.499 818.5Z"
              fill="url(#auth-bg-paint0)"
            />
          </g>
          <g filter="url(#auth-bg-blur2)">
            <path
              d="M51.6451 1089.65C736.646 1511.72 1408.05 922.959 1839.54 672.292C1677.33 1075.67 1347.79 1887.49 1327.29 1907.77C1301.65 1933.12 382.836 2347.21 351.635 2336.16C326.674 2327.33 -308.93 1729.61 -623.612 1431.85C-804.884 1077.6 -633.355 667.571 51.6451 1089.65Z"
              fill="url(#auth-bg-paint1)"
            />
          </g>
        </g>

        <rect
          x="-403"
          y="151"
          width="1918"
          height="1078"
          rx="119"
          fill="none"
          stroke="black"
          strokeOpacity="0.6"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
