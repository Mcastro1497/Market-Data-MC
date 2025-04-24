"use client"

import type { Orden, OrdenInput, OrdenDetalleInput, OrdenObservacionInput } from "@/lib/types/orden-types"

// Re-export types
export type { Orden, OrdenInput, OrdenDetalleInput, OrdenObservacionInput }

// Funciones individuales para uso directo
export async function crearOrden(orden: OrdenInput, detalles: OrdenDetalleInput[]) {
  const { crearOrden: serverCrearOrden } = await import("./orden-supabase-service")
  return serverCrearOrden(orden, detalles)
}

export async function createOrden(orden: OrdenInput, detalles: OrdenDetalleInput[]) {
  const { createOrden: serverCreateOrden } = await import("./orden-supabase-service")
  return serverCreateOrden(orden, detalles)
}

export async function obtenerOrdenes() {
  const { obtenerOrdenes: serverObtenerOrdenes } = await import("./orden-supabase-service")
  return serverObtenerOrdenes()
}

export async function obtenerOrdenPorId(id: string) {
  const { obtenerOrdenPorId: serverObtenerOrdenPorId } = await import("./orden-supabase-service")
  return serverObtenerOrdenPorId(id)
}

export async function actualizarOrden(id: string, datos: Partial<OrdenInput>) {
  const { actualizarOrden: serverActualizarOrden } = await import("./orden-supabase-service")
  return serverActualizarOrden(id, datos)
}

export async function eliminarOrden(id: string) {
  const { eliminarOrden: serverEliminarOrden } = await import("./orden-supabase-service")
  return serverEliminarOrden(id)
}

export async function deleteOrden(id: string) {
  const { deleteOrden: serverDeleteOrden } = await import("./orden-supabase-service")
  return serverDeleteOrden(id)
}

export async function agregarObservacion(observacion: OrdenObservacionInput) {
  const { agregarObservacion: serverAgregarObservacion } = await import("./orden-supabase-service")
  return serverAgregarObservacion(observacion)
}

export async function actualizarEstadoOrden(id: string, estado: string, observacion?: string) {
  const { actualizarEstadoOrden: serverActualizarEstadoOrden } = await import("./orden-supabase-service")
  return serverActualizarEstadoOrden(id, estado, observacion)
}

export async function updateOrdenEstado(id: string, estado: string, observacion?: string) {
  const { updateOrdenEstado: serverUpdateOrdenEstado } = await import("./orden-supabase-service")
  return serverUpdateOrdenEstado(id, estado, observacion)
}

export async function obtenerOrdenesPorCliente(clienteId: string) {
  const { obtenerOrdenesPorCliente: serverObtenerOrdenesPorCliente } = await import("./orden-supabase-service")
  return serverObtenerOrdenesPorCliente(clienteId)
}

export async function obtenerOrdenesPorEstado(estado: string) {
  const { obtenerOrdenesPorEstado: serverObtenerOrdenesPorEstado } = await import("./orden-supabase-service")
  return serverObtenerOrdenesPorEstado(estado)
}
