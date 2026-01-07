import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getVibeLabel(vibe: string): string {
  const labels: Record<string, string> = {
    nike_greatness: "Nike Greatness",
    horror_thread: "Horror Thread",
    educational: "Educational",
    business_case: "Business Case",
    luxury_brand: "Luxury Brand",
    tech_reveal: "Tech Reveal",
  };
  return labels[vibe] || vibe;
}

export function getVibeDescription(vibe: string): string {
  const descriptions: Record<string, string> = {
    nike_greatness: "Motivational, powerful, aspirational storytelling",
    horror_thread: "Suspenseful, dark, viral horror narrative",
    educational: "Clear, informative, value-driven content",
    business_case: "Professional, data-driven, strategic storytelling",
    luxury_brand: "Elegant, sophisticated, premium narrative",
    tech_reveal: "Innovative, exciting, futuristic presentation",
  };
  return descriptions[vibe] || "";
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    HOOK: "bg-terracotta text-white",
    CONTEXT: "bg-blue-500 text-white",
    DOPAMINE: "bg-purple-500 text-white",
    CLIMAX: "bg-red-600 text-white",
    CTA: "bg-green-600 text-white",
  };
  return colors[role] || "bg-gray-500 text-white";
}
