import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20": variant === "primary",
            "bg-white text-slate-900 shadow-sm border border-slate-200 hover:bg-slate-50": variant === "secondary",
            "border-2 border-primary-600 text-primary-600 hover:bg-primary-50": variant === "outline",
            "hover:bg-slate-100 text-slate-700": variant === "ghost",
            "h-9 px-4 text-sm": size === "sm",
            "h-12 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
