import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDiscountPercentage(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "0"
  }

  return Math.round(value).toString()
}
