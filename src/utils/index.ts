import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format numbers for display
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num)
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
