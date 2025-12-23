"use client";

import { type HTMLAttributes } from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-canvas-subtle border border-border",
          sizes[size],
          className
        )}
        {...props}
      >
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-medium",
        "bg-gradient-to-br from-accent-blue to-accent-purple text-white",
        sizes[size],
        className
      )}
      {...props}
    >
      {name ? getInitials(name) : "?"}
    </div>
  );
}

