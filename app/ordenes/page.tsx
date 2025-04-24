import { obtenerOrdenes } from "@/lib/services/orden-supabase-service"
import { OrdenesTable } from "@/components/ordenes/ordenes-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function OrdenesPage() {
  const ordenes = await obtenerOrdenes()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Órdenes</h1>
        <Link href="/ordenes/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </Link>
      </div>
      <OrdenesTable ordenes={ordenes} />
    </div>
  )
}

