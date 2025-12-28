import React from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-[#13334c] text-white hover:bg-slate-800",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  outline: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-10 px-4 text-sm rounded-2xl",
  lg: "h-12 px-5 text-base rounded-2xl",
};

const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    { className, variant = "primary", size = "md", isLoading, disabled, children, ...props },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition",
          "focus:outline-none focus:ring-2 focus:ring-slate-300",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "max-w-full", // ✅ prevents overflow in tight layouts
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            <span className="min-w-0 truncate">{children}</span>
          </>
        ) : (
          <span className="min-w-0 truncate">{children}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
