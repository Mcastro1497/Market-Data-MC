// This is a client-side file that imports server functions and re-exports them as an object
// for easier consumption by client components

import {
  crearOrden,
  createOrden,
  obtenerOrdenes,
  obtenerOrdenPorId,
  actualizarOrden,
  eliminarOrden,
  deleteOrden,
  agregarObservacion,
  actualizarEstadoOrden,
  updateOrdenEstado,
  obtenerOrdenesPorCliente,
  obtenerOrdenesPorEstado,
} from "./orden-supabase-service"

// Re-export the functions as an object for client components
export const OrdenService = {
  crearOrden,
  createOrden,
  obtenerOrdenes,
  obtenerOrdenPorId,
  actualizarOrden,
  eliminarOrden,
  deleteOrden,
  agregarObservacion,
  actualizarEstadoOrden,
  updateOrdenEstado,
  obtenerOrdenesPorCliente,
  obtenerOrdenesPorEstado,
}

// Also export individual functions for direct imports
export {
  crearOrden,
  createOrden,
  obtenerOrdenes,
  obtenerOrdenPorId,
  actualizarOrden,
  eliminarOrden,
  deleteOrden,
  agregarObservacion,
  actualizarEstadoOrden,
  updateOrdenEstado,
  obtenerOrdenesPorCliente,
  obtenerOrdenesPorEstado,
}
