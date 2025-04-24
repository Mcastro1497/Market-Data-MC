import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// Cliente para componentes del lado del servidor
export const createServerClient = () => {
  try {
    return createServerComponentClient<Database>({ cookies })
  } catch (error) {
    // Fallback para entornos que no soportan cookies
    return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  }
}

// Cliente de servicio para operaciones administrativas
export const createServiceClient = () => {
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Alias para mantener compatibilidad con el nombre requerido
export const createClient = createServerClient
