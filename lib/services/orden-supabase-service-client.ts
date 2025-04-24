"use client"

import { createClient } from "@/lib/supabase/client"

// Tipos para las órdenes
export interface OrdenInput {
  cliente_id: string
  cliente_nombre: string
  cliente_cuenta: string
  tipo_operacion: string
  estado: string
  mercado?: string
  plazo?: string
  notas?: string
}

export interface OrdenDetalleInput {
  orden_id: string
  ticker: string
  cantidad: number
  precio: number
  es_orden_mercado: boolean
}

export interface OrdenObservacionInput {
  orden_id: string
  texto: string
  usuario_id?: string
  usuario_nombre?: string
}

export interface Orden {
  id: string
  cliente_id: string
  cliente_nombre: string
  cliente_cuenta: string
  tipo_operacion: string
  estado: string
  mercado?: string
  plazo?: string
  notas?: string
  created_at: string
  updated_at: string
  detalles?: OrdenDetalle[]
  observaciones?: OrdenObservacion[]
}

export interface OrdenDetalle {
  id: string
  orden_id: string
  ticker: string
  cantidad: number
  precio: number
  es_orden_mercado: boolean
  created_at: string
  updated_at: string
}

export interface OrdenObservacion {
  id: string
  orden_id: string
  texto: string
  usuario_id?: string
  usuario_nombre?: string
  created_at: string
}

// Crear una nueva orden (versión cliente)
export async function crearOrden(
  orden: OrdenInput,
  detalles: OrdenDetalleInput[],
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = createClient()

    // Insertar la orden
    const { data: ordenData, error: ordenError } = await supabase.from("ordenes").insert(orden).select("id").single()

    if (ordenError) throw ordenError

    const ordenId = ordenData.id

    // Insertar los detalles de la orden
    const detallesConOrdenId = detalles.map((detalle) => ({
      ...detalle,
      orden_id: ordenId,
    }))

    const { error: detallesError } = await supabase.from("orden_detalles").insert(detallesConOrdenId)

    if (detallesError) throw detallesError

    return { success: true, id: ordenId }
  } catch (error: any) {
    console.error("Error al crear orden:", error)
    return { success: false, error: error.message || "Error al crear la orden" }
  }
}

// Servicio para interactuar con las tablas de órdenes en Supabase (versión cliente)
export const OrdenService = {
  // Obtener todas las órdenes
  async obtenerOrdenes(): Promise<Orden[]> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("ordenes").select("*").order("created_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error al obtener órdenes:", error)
      return []
    }
  },

  // Obtener una orden por ID con sus detalles y observaciones
  async obtenerOrdenPorId(id: string): Promise<Orden | null> {
    try {
      const supabase = createClient()

      // Obtener la orden
      const { data: orden, error: ordenError } = await supabase.from("ordenes").select("*").eq("id", id).single()

      if (ordenError) throw ordenError

      // Obtener los detalles de la orden
      const { data: detalles, error: detallesError } = await supabase
        .from("orden_detalles")
        .select("*")
        .eq("orden_id", id)

      if (detallesError) throw detallesError

      // Obtener las observaciones de la orden
      const { data: observaciones, error: observacionesError } = await supabase
        .from("orden_observaciones")
        .select("*")
        .eq("orden_id", id)
        .order("created_at", { ascending: false })

      if (observacionesError) throw observacionesError

      return {
        ...orden,
        detalles: detalles || [],
        observaciones: observaciones || [],
      }
    } catch (error) {
      console.error(`Error al obtener orden con ID ${id}:`, error)
      return null
    }
  },

  // Obtener órdenes por cliente
  async obtenerOrdenesPorCliente(clienteId: string): Promise<Orden[]> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("ordenes")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error(`Error al obtener órdenes del cliente ${clienteId}:`, error)
      return []
    }
  },

  // Obtener órdenes por estado
  async obtenerOrdenesPorEstado(estado: string): Promise<Orden[]> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("ordenes")
        .select("*")
        .eq("estado", estado)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error(`Error al obtener órdenes con estado ${estado}:`, error)
      return []
    }
  },

  // Actualizar el estado de una orden
  async actualizarEstadoOrden(
    id: string,
    estado: string,
    observacion?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      // Actualizar el estado de la orden
      const { error: ordenError } = await supabase
        .from("ordenes")
        .update({
          estado,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (ordenError) throw ordenError

      // Si hay observación, agregarla
      if (observacion) {
        const { error: observacionError } = await supabase.from("orden_observaciones").insert({
          orden_id: id,
          texto: `Cambio de estado a "${estado}": ${observacion}`,
        })

        if (observacionError) throw observacionError
      }

      return { success: true }
    } catch (error: any) {
      console.error(`Error al actualizar estado de orden con ID ${id}:`, error)
      return { success: false, error: error.message || "Error al actualizar el estado de la orden" }
    }
  },

  // Agregar una observación a una orden
  async agregarObservacion(
    observacion: OrdenObservacionInput,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("orden_observaciones").insert(observacion).select("id").single()

      if (error) throw error

      return { success: true, id: data.id }
    } catch (error: any) {
      console.error("Error al agregar observación:", error)
      return { success: false, error: error.message || "Error al agregar la observación" }
    }
  },

  /**
   * Cuenta las órdenes por estado
   * @param status Estado de las órdenes a contar
   * @returns Número de órdenes con el estado especificado
   */
  async countOrdersByStatus(status: string): Promise<number> {
    try {
      const supabase = createClient()
      const { count, error } = await supabase
        .from("ordenes")
        .select("*", { count: "exact", head: true })
        .eq("estado", status)

      if (error) {
        console.error("Error al contar órdenes por estado:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error("Error al contar órdenes por estado:", error)
      return 0
    }
  },
}

// Actualizar una orden (versión cliente)
export async function actualizarOrden(
  id: string,
  datos: Partial<OrdenInput>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("ordenes")
      .update({ ...datos, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error(`Error al actualizar orden con ID ${id}:`, error)
    return { success: false, error: error.message || "Error al actualizar la orden" }
  }
}

// Eliminar una orden (versión cliente)
export async function eliminarOrden(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Eliminar la orden (las restricciones de clave foránea eliminarán automáticamente los detalles y observaciones)
    const { error } = await supabase.from("ordenes").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error(`Error al eliminar orden con ID ${id}:`, error)
    return { success: false, error: error.message || "Error al eliminar la orden" }
  }
}

