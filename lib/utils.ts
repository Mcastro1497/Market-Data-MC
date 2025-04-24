import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número como moneda
 * @param value - El valor a formatear
 * @param currency - La moneda (por defecto ARS)
 * @returns El valor formateado como moneda
 */
export function formatCurrency(value: number, currency = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Formatea una fecha en formato legible
 * @param date - La fecha a formatear (string, Date o número)
 * @param formatStr - El formato a utilizar (por defecto "dd/MM/yyyy HH:mm")
 * @returns La fecha formateada como string
 */
export function formatDate(date: string | Date | number, formatStr = "dd/MM/yyyy HH:mm"): string {
  if (!date) return "N/A"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, formatStr, { locale: es })
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return "Fecha inválida"
  }
}

/**
 * Formatea una fecha relativa al momento actual (ej: "hace 5 minutos")
 * @param date - La fecha a formatear
 * @returns La fecha formateada como tiempo relativo
 */
export function formatRelativeDate(date: string | Date | number): string {
  if (!date) return "N/A"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
  } catch (error) {
    console.error("Error al formatear fecha relativa:", error)
    return "Fecha inválida"
  }
}
