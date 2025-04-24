"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Orden } from "@/lib/types/orden-types"

interface OrdenesTableProps {
  ordenes: Orden[]
}

export function OrdenesTable({ ordenes }: OrdenesTableProps) {
  const [filteredOrdenes, setFilteredOrdenes] = useState(ordenes)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // Filtrar órdenes por estado
  const filterByStatus = (status: string | null) => {
    setStatusFilter(status)
    if (status === null) {
      setFilteredOrdenes(ordenes)
    } else {
      setFilteredOrdenes(ordenes.filter((orden) => orden.estado.toLowerCase() === status.toLowerCase()))
    }
  }

  // Obtener el icono según el estado
  const getStatusIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return <Clock className="h-4 w-4 mr-1" />
      case "tomada":
      case "en proceso":
        return <AlertCircle className="h-4 w-4 mr-1" />
      case "ejecutada":
      case "completada":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "cancelada":
      case "rechazada":
        return <XCircle className="h-4 w-4 mr-1" />
      default:
        return <Clock className="h-4 w-4 mr-1" />
    }
  }

  // Determinar el color del badge según el estado
  const getStatusBadgeVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "outline"
      case "tomada":
      case "en proceso":
        return "secondary"
      case "ejecutada":
      case "completada":
        return "default"
      case "cancelada":
      case "rechazada":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={statusFilter === null ? "default" : "outline"} size="sm" onClick={() => filterByStatus(null)}>
          Todas
        </Button>
        <Button
          variant={statusFilter === "pendiente" ? "default" : "outline"}
          size="sm"
          onClick={() => filterByStatus("pendiente")}
        >
          Pendientes
        </Button>
        <Button
          variant={statusFilter === "ejecutada" ? "default" : "outline"}
          size="sm"
          onClick={() => filterByStatus("ejecutada")}
        >
          Ejecutadas
        </Button>
        <Button
          variant={statusFilter === "cancelada" ? "default" : "outline"}
          size="sm"
          onClick={() => filterByStatus("cancelada")}
        >
          Canceladas
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrdenes.length > 0 ? (
              filteredOrdenes.map((orden) => (
                <TableRow key={orden.id}>
                  <TableCell className="font-medium">{orden.id.substring(0, 8)}...</TableCell>
                  <TableCell>{orden.cliente_nombre}</TableCell>
                  <TableCell>{orden.tipo_operacion}</TableCell>
                  <TableCell>
                    {orden.detalles && orden.detalles.length > 0
                      ? orden.detalles.map((d) => d.ticker).join(", ")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{formatDate(orden.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(orden.estado)} className="flex items-center w-fit">
                      {getStatusIcon(orden.estado)}
                      {orden.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/ordenes/${orden.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No hay órdenes que coincidan con los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
