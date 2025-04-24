"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Filter, ArrowUpDown, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { StatusUpdateDialog } from "@/components/status-update-dialog"
import { SendOrdersDialog } from "@/components/send-orders-dialog"
import { SentOrdersDialog } from "@/components/sent-orders-dialog"
import { OrdenService } from "@/lib/services/orden-supabase-service-client" // Actualizado para importar desde el cliente
import type { Orden } from "@/lib/types/orden-types"

export function TradingOrdersTable() {
  const [orders, setOrders] = useState<Orden[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Orden[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Orden; direction: "asc" | "desc" } | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [isSentDialogOpen, setIsSentOrdersDialogOpen] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const router = useRouter()

  // Cargar órdenes
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await OrdenService.obtenerOrdenes()
        setOrders(data)
        setFilteredOrders(data)
      } catch (error) {
        console.error("Error al cargar órdenes:", error)
      }
    }

    loadOrders()
  }, [])

  // Filtrar órdenes
  useEffect(() => {
    let result = orders

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (order) =>
          order.cliente_nombre.toLowerCase().includes(term) ||
          order.id.toLowerCase().includes(term) ||
          (order.detalles && order.detalles.some((detalle) => detalle.ticker.toLowerCase().includes(term))),
      )
    }

    // Filtrar por estado
    if (statusFilter) {
      result = result.filter((order) => order.estado.toLowerCase() === statusFilter.toLowerCase())
    }

    // Ordenar
    if (sortConfig) {
      result = [...result].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredOrders(result)
  }, [orders, searchTerm, statusFilter, sortConfig])

  // Ordenar por columna
  const handleSort = (key: keyof Orden) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Manejar selección de órdenes
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  // Abrir diálogo de actualización de estado
  const openStatusDialog = (orderId: string) => {
    setCurrentOrderId(orderId)
    setIsStatusDialogOpen(true)
  }

  // Obtener el color del badge según el estado
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
        return <CheckCircle2 className="h-4 w-4 mr-1" />
      case "cancelada":
      case "rechazada":
        return <XCircle className="h-4 w-4 mr-1" />
      default:
        return <Clock className="h-4 w-4 mr-1" />
    }
  }

  // Actualizar órdenes después de cambios
  const handleOrdersUpdated = async () => {
    try {
      const data = await OrdenService.obtenerOrdenes()
      setOrders(data)
      setSelectedOrders([])
    } catch (error) {
      console.error("Error al actualizar órdenes:", error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Órdenes para Trading</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsSendDialogOpen(true)} disabled={selectedOrders.length === 0}>
            Enviar a Mercado
          </Button>
          <Button variant="outline" onClick={() => setIsSentOrdersDialogOpen(true)}>
            Ver Enviadas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o ticker..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar por Estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pendiente")}>Pendiente</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("tomada")}>Tomada</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("en proceso")}>En Proceso</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("ejecutada")}>Ejecutada</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completada")}>Completada</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("cancelada")}>Cancelada</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rechazada")}>Rechazada</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(filteredOrders.map((order) => order.id))
                        } else {
                          setSelectedOrders([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("cliente_nombre")}>
                      Cliente
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("tipo_operacion")}>
                      Operación
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("created_at")}>
                      Fecha
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("estado")}>
                      Estado
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs" onClick={() => router.push(`/ordenes/${order.id}`)}>
                        {order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell onClick={() => router.push(`/ordenes/${order.id}`)}>
                        <div className="font-medium">{order.cliente_nombre}</div>
                        <div className="text-xs text-muted-foreground">{order.cliente_cuenta}</div>
                      </TableCell>
                      <TableCell onClick={() => router.push(`/ordenes/${order.id}`)}>
                        <Badge
                          variant={order.tipo_operacion === "Compra" ? "default" : "destructive"}
                          className="whitespace-nowrap"
                        >
                          {order.tipo_operacion}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => router.push(`/ordenes/${order.id}`)}>
                        {order.detalles && order.detalles.length > 0
                          ? order.detalles.map((detalle) => detalle.ticker).join(", ")
                          : "-"}
                      </TableCell>
                      <TableCell onClick={() => router.push(`/ordenes/${order.id}`)}>
                        {order.detalles && order.detalles.length > 0
                          ? order.detalles.map((detalle) => detalle.cantidad.toLocaleString()).join(", ")
                          : "-"}
                      </TableCell>
                      <TableCell onClick={() => router.push(`/ordenes/${order.id}`)}>
                        {order.detalles && order.detalles.length > 0
                          ? order.detalles.map((detalle) =>
                              detalle.es_orden_mercado
                                ? "Mercado"
                                : `$${detalle.precio.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`,
                            )
                          : "-"}
                      </TableCell>
                      <TableCell onClick={() => router.push(`/ordenes/${order.id}`)}>
                        {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell onClick={() => router.push(`/ordenes/${order.id}`)}>
                        <Badge
                          variant={getStatusBadgeVariant(order.estado)}
                          className="whitespace-nowrap flex items-center"
                        >
                          {getStatusIcon(order.estado)}
                          {order.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/ordenes/${order.id}`)}>
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openStatusDialog(order.id)}>
                              Cambiar estado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No se encontraron órdenes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Diálogos */}
      {currentOrderId && (
        <StatusUpdateDialog
          orderId={currentOrderId}
          open={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          onStatusUpdated={handleOrdersUpdated}
        />
      )}

      <SendOrdersDialog
        orderIds={selectedOrders}
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        onOrdersSent={handleOrdersUpdated}
      />

      <SentOrdersDialog open={isSentDialogOpen} onOpenChange={setIsSentOrdersDialogOpen} />
    </Card>
  )
}
