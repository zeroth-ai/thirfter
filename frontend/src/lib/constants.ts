import type { OnboardingQuestion } from "@/types";

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "style",
    question: "What's your go-to style vibe? 🎨",
    type: "multiple",
    options: [
      { value: "vintage", label: "Vintage", icon: "🎭", description: "Retro classics from the 60s-90s" },
      { value: "y2k", label: "Y2K", icon: "💿", description: "Early 2000s aesthetic" },
      { value: "grunge", label: "Grunge", icon: "🎸", description: "Distressed, edgy, rock-inspired" },
      { value: "minimalist", label: "Minimalist", icon: "◻️", description: "Clean lines, neutral tones" },
      { value: "streetwear", label: "Streetwear", icon: "🛹", description: "Urban, sporty, bold" },
      { value: "cottagecore", label: "Cottagecore", icon: "🌸", description: "Pastoral, romantic, nature" },
      { value: "old-money", label: "Old Money", icon: "🎩", description: "Classic, preppy, refined" },
      { value: "bohemian", label: "Bohemian", icon: "🌻", description: "Free-spirited, eclectic" },
    ],
  },
  {
    id: "budget",
    question: "What's your typical thrifting budget per visit? 💰",
    type: "single",
    options: [
      { value: "budget-low", label: "Under ₹500", description: "Student on a shoestring" },
      { value: "budget-mid", label: "₹500 - ₹1,500", description: "Casual thrifter" },
      { value: "budget-high", label: "₹1,500 - ₹3,000", description: "Selective shopper" },
      { value: "budget-premium", label: "₹3,000+", description: "Quality over quantity" },
    ],
  },
  {
    id: "categories",
    question: "What do you usually hunt for? 👕",
    type: "multiple",
    options: [
      { value: "tees", label: "T-Shirts & Tops", icon: "👕" },
      { value: "jeans", label: "Jeans & Pants", icon: "👖" },
      { value: "jackets", label: "Jackets & Outerwear", icon: "🧥" },
      { value: "dresses", label: "Dresses & Skirts", icon: "👗" },
      { value: "shoes", label: "Footwear", icon: "👟" },
      { value: "accessories", label: "Accessories", icon: "🧢" },
      { value: "ethnic", label: "Ethnic Wear", icon: "🥻" },
      { value: "sports", label: "Sportswear", icon: "🏃" },
    ],
  },
  {
    id: "sizes-tops",
    question: "What's your usual top size? 📏",
    type: "single",
    options: [
      { value: "xs", label: "XS" },
      { value: "s", label: "S" },
      { value: "m", label: "M" },
      { value: "l", label: "L" },
      { value: "xl", label: "XL" },
      { value: "xxl", label: "XXL+" },
    ],
  },
  {
    id: "sizes-bottoms",
    question: "And your bottom size? 👖",
    type: "single",
    options: [
      { value: "26-28", label: "26-28" },
      { value: "28-30", label: "28-30" },
      { value: "30-32", label: "30-32" },
      { value: "32-34", label: "32-34" },
      { value: "34-36", label: "34-36" },
      { value: "36+", label: "36+" },
    ],
  },
  {
    id: "locations",
    question: "Which areas do you prefer exploring? 📍",
    type: "multiple",
    options: [
      { value: "hsr-layout", label: "HSR Layout" },
      { value: "koramangala", label: "Koramangala" },
      { value: "jayanagar", label: "Jayanagar" },
      { value: "jpnagar", label: "JP Nagar" },
      { value: "indiranagar", label: "Indiranagar" },
      { value: "central", label: "Commercial St / Brigade" },
      { value: "malleshwaram", label: "Malleshwaram" },
      { value: "whitefield", label: "Whitefield" },
    ],
  },
  {
    id: "frequency",
    question: "How often do you go thrifting? 🛒",
    type: "single",
    options: [
      { value: "weekly", label: "Weekly", description: "I'm a regular!" },
      { value: "biweekly", label: "Twice a month", description: "When I need retail therapy" },
      { value: "monthly", label: "Once a month", description: "Planned shopping trips" },
      { value: "occasional", label: "Occasionally", description: "When the mood strikes" },
    ],
  },
  {
    id: "sustainability",
    question: "How important is sustainability to you? 🌱",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    labels: { min: "Nice to have", max: "Top priority" },
  },
  {
    id: "vintage-preference",
    question: "Do you prefer finding true vintage pieces? 🏺",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    labels: { min: "Don't care", max: "Obsessed with vintage" },
  },
  {
    id: "brand-preference",
    question: "What's your brand preference? 🏷️",
    type: "single",
    options: [
      { value: "luxury", label: "Luxury Brands", description: "Designer labels, even if pre-owned" },
      { value: "high-street", label: "High Street", description: "Zara, H&M, etc." },
      { value: "budget", label: "Budget-Friendly", description: "Unbranded is fine" },
      { value: "no-preference", label: "No Preference", description: "It's all about the piece!" },
    ],
  },
];

export const STYLE_CATEGORIES = [
  { id: "trending", label: "Trending Now", emoji: "🔥" },
  { id: "vintage", label: "Vintage Finds", emoji: "🎭" },
  { id: "streetwear", label: "Street Style", emoji: "🛹" },
  { id: "sustainable", label: "Sustainable", emoji: "🌱" },
  { id: "designer", label: "Designer Deals", emoji: "✨" },
  { id: "budget", label: "Under ₹500", emoji: "💰" },
  { id: "denim", label: "Denim Heaven", emoji: "👖" },
  { id: "winter", label: "Winter Layers", emoji: "🧥" },
];

export const AESTHETIC_VIBES = [
  { id: "dark-academia", label: "Dark Academia", colors: ["#2C1810", "#8B7355", "#4A3728"] },
  { id: "light-academia", label: "Light Academia", colors: ["#F5F5DC", "#D4A574", "#8B7355"] },
  { id: "coastal", label: "Coastal Granddaughter", colors: ["#E8F4F8", "#87CEEB", "#2F4F4F"] },
  { id: "clean-girl", label: "Clean Girl", colors: ["#FFFFFF", "#F5F5F5", "#E8E8E8"] },
  { id: "indie", label: "Indie Sleaze", colors: ["#000000", "#FF0000", "#FFD700"] },
  { id: "soft-girl", label: "Soft Girl", colors: ["#FFB6C1", "#FFC0CB", "#FFE4E1"] },
  { id: "e-girl", label: "E-Girl / E-Boy", colors: ["#000000", "#FF69B4", "#7B68EE"] },
  { id: "coquette", label: "Coquette", colors: ["#FFB6C1", "#FFFFFF", "#DC143C"] },
];

export const PRICE_RANGES = [
  { label: "Any", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 - ₹2,000", min: 1000, max: 2000 },
  { label: "₹2,000+", min: 2000, max: Infinity },
];

