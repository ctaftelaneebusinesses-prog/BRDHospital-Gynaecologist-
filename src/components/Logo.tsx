export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="32" className="fill-plum" />
      <path
        d="M32 44C32 44 20 36.5 20 27.5C20 22.3 24.1 19 28.2 19C30.1 19 31.4 19.9 32 20.7C32.6 19.9 33.9 19 35.8 19C39.9 19 44 22.3 44 27.5C44 36.5 32 44 32 44Z"
        className="fill-rose-100"
      />
      <circle cx="32" cy="30" r="3.4" className="fill-rose-500" />
    </svg>
  );
}
