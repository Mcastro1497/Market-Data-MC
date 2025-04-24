import { type NextRequest, NextResponse } from "next/server"
import { actualizarOrden, eliminarOrden } from "@/lib/services/orden-supabase-service"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    const resultado = await actualizarOrden(id, body)

    if (!resultado.success) {
      return NextResponse.json({ error: resultado.error || "Error al actualizar la orden" }, { status: 400 })
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error(`Error en API de actualización de orden ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const resultado = await eliminarOrden(id)

    if (!resultado.success) {
      return NextResponse.json({ error: resultado.error || "Error al eliminar la orden" }, { status: 400 })
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error(`Error en API de eliminación de orden ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
