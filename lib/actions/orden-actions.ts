"use server"

import { revalidatePath } from "next/cache"
import { getClientById, getAssetById } from "@/lib/data"
import type { OrdenInput, OrdenDetalleInput } from "@/lib/types/orden-types"
import {
  crearOrden,
  obtenerOrdenes,
  obtenerOrdenPorId,
  eliminarOrden,
  actualizarEstadoOrden as updateOrdenEstado,
} from "@/lib/services/orden-supabase-service"
import { createServerClient } from "@/lib/supabase/server"
import type { OrdenObservacionInput } from "@/lib/types/orden-types"

// Agregar una observación a una orden
export async function agregarObservacionOrden(
  ordenId: string,
  texto: string,
  usuarioId?: string,
  usuarioNombre?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    const observacion: OrdenObservacionInput = {
      orden_id: ordenId,
      texto,
      usuario_id: usuarioId,
      usuario_nombre: usuarioNombre,
    }

    const { error } = await supabase.from("orden_observaciones").insert(observacion)

    if (error) throw error

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/ordenes")
    revalidatePath(`/ordenes/${ordenId}`)

    return { success: true }
  } catch (error: any) {
    console.error("Error al agregar observación:", error)
    return { success: false, error: error.message || "Error al agregar la observación" }
  }
}

// Tipo para los datos del formulario de orden individual
interface IndividualOrderFormData {
  clientId: string
  assetId: string
  operationType: string
  quantity: number
  price: number
  isMarketOrder: boolean
  market: string
  notes?: string
}

// Tipo para los datos del formulario de orden masiva
interface BulkOrderFormData {
  clientId: string
  orders: {
    assetId: string
    operationType: string
    quantity: number
    price: number
    market: string
    term: string
  }[]
  notes?: string
}

// Tipo para los datos del formulario de swap
interface SwapOrderFormData {
  clientId: string
  sellOrder: {
    assetId: string
    quantity: number
    price: number
    market: string
    term: string
  }
  buyOrder: {
    assetId: string
    quantity: number
    price: number
    market: string
    term: string
  }
  notes?: string
}

// Función para crear una orden individual
export async function crearOrdenIndividual(data: IndividualOrderFormData) {
  try {
    // Obtener información del cliente
    const cliente = await getClientById(data.clientId)
    if (!cliente) {
      return { success: false, error: "Cliente no encontrado" }
    }

    // Obtener información del activo
    const activo = await getAssetById(data.assetId)
    if (!activo) {
      return { success: false, error: "Activo no encontrado" }
    }

    // Preparar datos para la orden
    const ordenInput: OrdenInput = {
      cliente_id: data.clientId,
      cliente_nombre: cliente.name || cliente.denominacion || cliente.titular || `Cliente ${data.clientId}`,
      cliente_cuenta: cliente.accountNumber || cliente.idCliente || "",
      tipo_operacion: data.operationType === "buy" ? "Compra" : "Venta",
      estado: "pendiente",
      mercado: data.market,
      notas: data.notes,
    }

    // Preparar detalles de la orden
    const detalleInput: OrdenDetalleInput = {
      orden_id: "", // Se asignará después de crear la orden
      ticker: activo.ticker,
      cantidad: data.quantity,
      precio: data.isMarketOrder ? 0 : data.price,
      es_orden_mercado: data.isMarketOrder,
    }

    // Crear la orden en Supabase
    const resultado = await crearOrden(ordenInput, [detalleInput])

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/ordenes")

    return resultado
  } catch (error: any) {
    console.error("Error al crear orden individual:", error)
    return { success: false, error: error.message || "Error al crear la orden" }
  }
}

// Función para crear órdenes masivas
export async function crearOrdenesMasivas(data: BulkOrderFormData) {
  try {
    // Obtener información del cliente
    const cliente = await getClientById(data.clientId)
    if (!cliente) {
      return { success: false, error: "Cliente no encontrado" }
    }

    // Crear una orden por cada item en el formulario
    const resultados = []

    for (const orden of data.orders) {
      // Obtener información del activo
      const activo = await getAssetById(orden.assetId)
      if (!activo) {
        continue // Saltar este activo si no se encuentra
      }

      // Preparar datos para la orden
      const ordenInput: OrdenInput = {
        cliente_id: data.clientId,
        cliente_nombre: cliente.name || cliente.denominacion || cliente.titular || `Cliente ${data.clientId}`,
        cliente_cuenta: cliente.accountNumber || cliente.idCliente || "",
        tipo_operacion: orden.operationType === "buy" ? "Compra" : "Venta",
        estado: "pendiente",
        mercado: orden.market,
        plazo: orden.term,
        notas: data.notes,
      }

      // Preparar detalles de la orden
      const detalleInput: OrdenDetalleInput = {
        orden_id: "", // Se asignará después de crear la orden
        ticker: activo.ticker,
        cantidad: orden.quantity,
        precio: orden.price,
        es_orden_mercado: false,
      }

      // Crear la orden en Supabase
      const resultado = await crearOrden(ordenInput, [detalleInput])
      resultados.push(resultado)
    }

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/ordenes")

    // Verificar si todas las órdenes se crearon correctamente
    const todasExitosas = resultados.every((r) => r.success)
    const ordenesCreadas = resultados.filter((r) => r.success).length

    return {
      success: todasExitosas,
      message: `${ordenesCreadas} órdenes creadas exitosamente`,
      error: todasExitosas ? undefined : "Algunas órdenes no pudieron ser creadas",
    }
  } catch (error: any) {
    console.error("Error al crear órdenes masivas:", error)
    return { success: false, error: error.message || "Error al crear las órdenes" }
  }
}

// Función para crear una operación swap
export async function crearOperacionSwap(data: SwapOrderFormData) {
  try {
    // Obtener información del cliente
    const cliente = await getClientById(data.clientId)
    if (!cliente) {
      return { success: false, error: "Cliente no encontrado" }
    }

    // Obtener información de los activos
    const activoVenta = await getAssetById(data.sellOrder.assetId)
    if (!activoVenta) {
      return { success: false, error: "Activo de venta no encontrado" }
    }

    const activoCompra = await getAssetById(data.buyOrder.assetId)
    if (!activoCompra) {
      return { success: false, error: "Activo de compra no encontrado" }
    }

    // Generar un ID único para el grupo de swap
    const swapId = `SWAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Preparar datos para la orden de venta
    const ordenVentaInput: OrdenInput = {
      cliente_id: data.clientId,
      cliente_nombre: cliente.name || cliente.denominacion || cliente.titular || `Cliente ${data.clientId}`,
      cliente_cuenta: cliente.accountNumber || cliente.idCliente || "",
      tipo_operacion: "Venta",
      estado: "pendiente",
      mercado: data.sellOrder.market,
      plazo: data.sellOrder.term,
      notas: `Parte de operación swap (${swapId}). ${data.notes || ""}`,
    }

    // Preparar detalles de la orden de venta
    const detalleVentaInput: OrdenDetalleInput = {
      orden_id: "", // Se asignará después de crear la orden
      ticker: activoVenta.ticker,
      cantidad: data.sellOrder.quantity,
      precio: data.sellOrder.price,
      es_orden_mercado: false,
    }

    // Crear la orden de venta en Supabase
    const resultadoVenta = await crearOrden(ordenVentaInput, [detalleVentaInput])

    if (!resultadoVenta.success) {
      return resultadoVenta
    }

    // Preparar datos para la orden de compra
    const ordenCompraInput: OrdenInput = {
      cliente_id: data.clientId,
      cliente_nombre: cliente.name || cliente.denominacion || cliente.titular || `Cliente ${data.clientId}`,
      cliente_cuenta: cliente.accountNumber || cliente.idCliente || "",
      tipo_operacion: "Compra",
      estado: "pendiente",
      mercado: data.buyOrder.market,
      plazo: data.buyOrder.term,
      notas: `Parte de operación swap (${swapId}). Fondos provenientes de venta de ${activoVenta.ticker}. ${data.notes || ""}`,
    }

    // Preparar detalles de la orden de compra
    const detalleCompraInput: OrdenDetalleInput = {
      orden_id: "", // Se asignará después de crear la orden
      ticker: activoCompra.ticker,
      cantidad: data.buyOrder.quantity,
      precio: data.buyOrder.price,
      es_orden_mercado: false,
    }

    // Crear la orden de compra en Supabase
    const resultadoCompra = await crearOrden(ordenCompraInput, [detalleCompraInput])

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/ordenes")

    return {
      success: resultadoCompra.success,
      message: "Operación swap creada exitosamente",
      id: resultadoVenta.id,
      error: resultadoCompra.success ? undefined : "Error al crear la orden de compra",
    }
  } catch (error: any) {
    console.error("Error al crear operación swap:", error)
    return { success: false, error: error.message || "Error al crear la operación swap" }
  }
}

// Actualizar el estado de una orden
export async function actualizarEstadoOrdenAction(
  id: string,
  estado: string,
  observacion?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Actualizar el estado de la orden usando el servicio de Supabase
    const resultado = await updateOrdenEstado(id, estado, observacion)

    if (!resultado.success) {
      return { success: false, error: resultado.error || "Error al actualizar el estado de la orden" }
    }

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/ordenes")
    revalidatePath(`/ordenes/${id}`)

    return { success: true }
  } catch (error: any) {
    console.error(`Error al actualizar estado de orden con ID ${id}:`, error)
    return { success: false, error: error.message || "Error al actualizar el estado de la orden" }
  }
}

// Función para eliminar una orden
export async function eliminarOrdenAction(id: string) {
  try {
    const resultado = await eliminarOrden(id)

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/ordenes")

    return resultado
  } catch (error: any) {
    console.error(`Error al eliminar orden ${id}:`, error)
    return { success: false, error: error.message || "Error al eliminar la orden" }
  }
}

// Función para obtener todas las órdenes
export async function obtenerOrdenesAction() {
  try {
    return await obtenerOrdenes()
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return []
  }
}

// Función para obtener una orden por ID
export async function obtenerOrdenPorIdAction(id: string) {
  try {
    return await obtenerOrdenPorId(id)
  } catch (error) {
    console.error(`Error al obtener orden ${id}:`, error)
    return null
  }
}

// Enviar órdenes al mercado
export async function enviarOrdenesAlMercado(
  ordenIds: string[],
): Promise<{ success: boolean; error?: string; results?: any[] }> {
  try {
    const supabase = createServerClient()

    // Simulación de envío al mercado
    const results = []

    for (const id of ordenIds) {
      // Actualizar el estado de la orden a "En Proceso"
      const { error } = await supabase
        .from("ordenes")
        .update({
          estado: "En Proceso",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Agregar observación
      await supabase.from("orden_observaciones").insert({
        orden_id: id,
        texto: "Orden enviada al mercado",
      })

      results.push({ id, status: "sent" })
    }

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/ordenes")
    revalidatePath("/trading")

    return { success: true, results }
  } catch (error: any) {
    console.error("Error al enviar órdenes al mercado:", error)
    return { success: false, error: error.message || "Error al enviar las órdenes al mercado" }
  }
}

// Obtener órdenes enviadas al mercado
export async function obtenerOrdenesEnviadas(): Promise<any[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("ordenes")
      .select("*")
      .in("estado", ["En Proceso", "Ejecutada"])
      .order("updated_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error al obtener órdenes enviadas:", error)
    return []
  }
}
