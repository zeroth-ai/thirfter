import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getShopSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return past.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export const styleEmojis: Record<string, string> = {
  vintage: "🎭",
  y2k: "💿",
  grunge: "🎸",
  minimalist: "◻️",
  streetwear: "🛹",
  cottagecore: "🌸",
  "old-money": "🎩",
  bohemian: "🌻",
  preppy: "🎾",
  athleisure: "🏃",
};

export const tagColors: Record<string, string> = {
  Surplus: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Thrift: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Vintage: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Budget: "bg-green-500/10 text-green-400 border-green-500/20",
  Premium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Streetwear: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Sport: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Denim: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  default: "bg-canvas text-fg-muted border-border",
};

export function getTagColor(tag: string): string {
  return tagColors[tag] || tagColors.default;
}

