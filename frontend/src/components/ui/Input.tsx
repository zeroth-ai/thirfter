"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  label?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, rightIcon, error, label, helperText, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-fg mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full h-10 rounded-lg bg-canvas-subtle border px-4 text-sm text-fg",
              "placeholder:text-fg-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue",
              "transition-all duration-200",
              icon && "pl-10",
              rightIcon && "pr-10",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                : "border-border",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-fg-muted">{helperText}</p>
        )}
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

