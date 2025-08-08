import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format numbers for display
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num)
}

// Format quantity in a simple way
export function formatQuantity(quantity: number): string {
  if (quantity >= 1000000) {
    const millions = quantity / 1000000
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`
  }
  if (quantity >= 1000) {
    const thousands = quantity / 1000
    return thousands % 1 === 0 ? `${thousands}mil` : `${thousands.toFixed(1)}mil`
  }
  return quantity.toString()
}

// Format quantity as packages (each package = 500 units)
export function formatQuantityAsPackages(quantity: number): string {
  const packages = quantity / 500
  if (packages >= 1000000) {
    const millions = packages / 1000000
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`
  }
  if (packages >= 1000) {
    const thousands = packages / 1000
    return thousands % 1 === 0 ? `${thousands}mil` : `${thousands.toFixed(1)}mil`
  }
  // For packages, show decimal if not whole number
  return packages % 1 === 0 ? packages.toString() : packages.toFixed(1)
}

// Format quantity for input/editing (thousands as decimal)
export function formatQuantityForInput(quantity: number): string {
  if (quantity >= 1000) {
    const thousands = quantity / 1000
    // Remove trailing zeros but keep precision
    return thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(1)
  }
  return quantity.toString()
}

// Format quantity for packages input (packages as decimal)
export function formatQuantityForPackagesInput(quantity: number): string {
  const packages = quantity / 500
  // Remove trailing zeros but keep precision
  return packages % 1 === 0 ? packages.toString() : packages.toFixed(1)
}

// Parse quantity from input back to full number
export function parseQuantityFromInput(input: string): number {
  const num = parseFloat(input)
  if (isNaN(num)) return 0
  
  // If it's a reasonable "thousands" number (like 2.5), multiply by 1000
  if (num > 0 && num < 1000) {
    return num * 1000
  }
  
  return num
}

// Parse packages from input back to units
export function parsePackagesFromInput(input: string): number {
  const num = parseFloat(input)
  if (isNaN(num)) return 0
  
  // Convert packages to units (multiply by 500)
  return num * 500
}

// Format time
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date).replace(',', ' -')
}

// Get time ago
export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'agora'
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `há ${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
