import { createServerClient as createSupaServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export function createServerClient() {
  const cookieStore = cookies()

  return createSupaServerClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Cookies can only be set in a Server Action or Route Handler
          console.error("Error setting cookie:", error)
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Cookies can only be deleted in a Server Action or Route Handler
          console.error("Error removing cookie:", error)
        }
      },
    },
  })
}

// Añadimos esta exportación para mantener compatibilidad con el código existente
export const createClient = createServerClient

