import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// Función para crear un cliente de Supabase para el servidor
// Esta función NO usa next/headers para evitar problemas en pages/
export const createServerClient = () => {
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Cliente de servicio para operaciones administrativas
export const createServiceClient = () => {
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Alias para mantener compatibilidad con el nombre requerido
export const createClient = createServerClient
