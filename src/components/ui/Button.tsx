import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "md" | "lg" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-rose-600 text-cream hover:bg-rose-700 shadow-[0_10px_30px_-10px_rgba(156,77,97,0.55)]",
  secondary:
    "bg-plum text-cream hover:bg-[#3a1f26] shadow-[0_10px_30px_-10px_rgba(69,38,46,0.45)]",
  outline:
    "border border-plum/25 text-plum hover:border-plum/50 hover:bg-plum/5",
  ghost: "text-plum hover:bg-plum/5",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm gap-1.5",
  md: "px-6 py-3.5 text-sm gap-2",
  lg: "px-8 py-4 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, iconPosition = "right", className = "", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`group inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && (
        <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">{icon}</span>
      )}
    </button>
  );
});
