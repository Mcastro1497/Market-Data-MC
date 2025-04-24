import { type NextRequest, NextResponse } from "next/server"
import { actualizarEstadoOrden } from "@/lib/services/orden-supabase-service"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { estado, observacion } = await request.json()

    const resultado = await actualizarEstadoOrden(id, estado, observacion)

    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error || "Error al actualizar el estado de la orden" },
        { status: 400 },
      )
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error(`Error en API de actualización de estado de orden ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
