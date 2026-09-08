import type { SVGProps } from "react";

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.3c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.42-3.9 4.02v2.24H8v3h2.36V21h3.14Z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.5 6.6c-.6.27-1.24.45-1.9.53a3.3 3.3 0 0 0 1.45-1.83c-.64.38-1.35.65-2.1.8a3.3 3.3 0 0 0-5.62 3.01 9.36 9.36 0 0 1-6.8-3.45 3.3 3.3 0 0 0 1.02 4.4c-.53-.02-1.03-.16-1.47-.4v.04a3.3 3.3 0 0 0 2.65 3.24c-.49.13-1.01.15-1.51.06a3.3 3.3 0 0 0 3.08 2.29A6.62 6.62 0 0 1 3 16.4a9.32 9.32 0 0 0 5.06 1.48c6.07 0 9.39-5.03 9.39-9.39l-.01-.43c.65-.46 1.2-1.04 1.06-1.46Z" />
    </svg>
  );
}
