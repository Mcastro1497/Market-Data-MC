"use client"

import { createClient } from "@/lib/supabase/client"
import type { Orden, OrdenInput, OrdenDetalleInput, OrdenObservacionInput } from "@/lib/types/orden-types"

// Definir el OrdenService para uso en el cliente
export const OrdenService = {
  // Obtener todas las órdenes
  obtenerOrdenes: async (): Promise<Orden[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("ordenes").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error("Error al obtener órdenes:", error)
      return []
    }
  },

  // Obtener una orden por ID
  obtenerOrdenPorId: async (id: string): Promise<Orden | null> => {
    try {
      const supabase = createClient()

      // Obtener la orden
      const { data: orden, error: ordenError } = await supabase.from("ordenes").select("*").eq("id", id).single()

      if (ordenError) {
        if (ordenError.code === "PGRST116") return null // No encontrado
        throw ordenError
      }

      // Obtener los detalles
      const { data: detalles, error: detallesError } = await supabase
        .from("orden_detalles")
        .select("*")
        .eq("orden_id", id)

      if (detallesError) throw detallesError

      // Obtener las observaciones
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
    } catch (error: any) {
      console.error(`Error al obtener orden ${id}:`, error)
      return null
    }
  },

  // Estas son funciones proxy que llamarán a las funciones del servidor
  crearOrden: async (orden: OrdenInput, detalles: OrdenDetalleInput[]) => {
    const response = await fetch("/api/ordenes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orden, detalles }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return await response.json()
  },

  actualizarOrden: async (id: string, datos: Partial<OrdenInput>) => {
    const response = await fetch(`/api/ordenes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return await response.json()
  },

  eliminarOrden: async (id: string) => {
    const response = await fetch(`/api/ordenes/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return await response.json()
  },

  agregarObservacion: async (observacion: OrdenObservacionInput) => {
    const response = await fetch(`/api/ordenes/${observacion.orden_id}/observaciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(observacion),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return await response.json()
  },

  actualizarEstadoOrden: async (id: string, estado: string, observacion?: string) => {
    const response = await fetch(`/api/ordenes/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado, observacion }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return await response.json()
  },

  obtenerOrdenesPorCliente: async (clienteId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("ordenes")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error(`Error al obtener órdenes del cliente ${clienteId}:`, error)
      return []
    }
  },

  obtenerOrdenesPorEstado: async (estado: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("ordenes")
        .select("*")
        .eq("estado", estado)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error(`Error al obtener órdenes con estado ${estado}:`, error)
      return []
    }
  },

  // Versiones en inglés
  createOrden: async (orden: OrdenInput, detalles: OrdenDetalleInput[]) => {
    return OrdenService.crearOrden(orden, detalles)
  },

  updateOrdenEstado: async (id: string, estado: string, observacion?: string) => {
    return OrdenService.actualizarEstadoOrden(id, estado, observacion)
  },

  deleteOrden: async (id: string) => {
    return OrdenService.eliminarOrden(id)
  },
}

// Re-exportar tipos para conveniencia
export type { Orden, OrdenInput, OrdenDetalleInput, OrdenObservacionInput }
