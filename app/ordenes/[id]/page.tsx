import { obtenerOrdenPorId } from "@/lib/services/orden-supabase-service"
import { OrdenDetalleView } from "@/components/ordenes/orden-detalle-view"
import { notFound } from "next/navigation"

interface OrdenPageProps {
  params: {
    id: string
  }
}

export default async function OrdenPage({ params }: OrdenPageProps) {
  const orden = await obtenerOrdenPorId(params.id)

  if (!orden) {
    notFound()
  }

  return <OrdenDetalleView orden={orden} />
}

