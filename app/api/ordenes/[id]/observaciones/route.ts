import { type NextRequest, NextResponse } from "next/server"
import { agregarObservacion } from "@/lib/services/orden-supabase-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ordenId = params.id
    const observacion = await request.json()

    // Asegurarse de que la observación tenga el ID de la orden correcto
    observacion.orden_id = ordenId

    const resultado = await agregarObservacion(observacion)

    if (!resultado.success) {
      return NextResponse.json({ error: resultado.error || "Error al agregar la observación" }, { status: 400 })
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error(`Error en API de agregar observación a orden ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
