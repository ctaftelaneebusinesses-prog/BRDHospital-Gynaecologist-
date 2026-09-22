import logoIcon from "../assets/brd-hospital-logo-icon.png";

export function Logo({ className = "" }: { className?: string }) {
  return <img src={logoIcon} alt="BRD Hospital" className={`object-contain ${className}`} />;
}
