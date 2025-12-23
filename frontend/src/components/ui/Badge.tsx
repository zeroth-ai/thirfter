"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "accent" | "success" | "warning" | "error";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-canvas-subtle text-fg border-border",
    outline: "bg-transparent text-fg-muted border-border",
    accent: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
    success: "bg-accent-green/10 text-accent-green border-accent-green/20",
    warning: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        "transition-colors duration-200",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

