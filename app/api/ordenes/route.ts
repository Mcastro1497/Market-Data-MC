import { type NextRequest, NextResponse } from "next/server"
import { crearOrden } from "@/lib/services/orden-supabase-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orden, detalles } = body

    const resultado = await crearOrden(orden, detalles)

    if (!resultado.success) {
      return NextResponse.json({ error: resultado.error || "Error al crear la orden" }, { status: 400 })
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error("Error en API de creación de orden:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
