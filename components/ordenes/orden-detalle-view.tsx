"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, FileText, MessageSquare, Send } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Orden } from "@/lib/types/orden-types"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface OrdenDetalleViewProps {
  orden: Orden
}

export function OrdenDetalleView({ orden }: OrdenDetalleViewProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState("detalles")

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "ejecutada":
        return "bg-green-500 hover:bg-green-600"
      case "rechazada":
        return "bg-red-500 hover:bg-red-600"
      case "cancelada":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  // Función para actualizar el estado de la orden
  const handleUpdateStatus = async (newStatus: string) => {
    if (confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)) {
      setIsUpdating(true)
      try {
        // Aquí iría la llamada a la API para actualizar el estado
        // await updateOrderStatus(orden.id, newStatus);
        toast({
          title: "Estado actualizado",
          description: `La orden ha sido marcada como "${newStatus}"`,
        })
        router.refresh()
      } catch (error) {
        console.error("Error al actualizar estado:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la orden",
          variant: "destructive",
        })
      } finally {
        setIsUpdating(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/ordenes" className="inline-flex items-center">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a órdenes
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Orden #{orden.id}</h1>
          <Badge className={getStatusColor(orden.estado)}>{orden.estado}</Badge>
        </div>

        <div className="flex space-x-2">
          {orden.estado === "Pendiente" && (
            <>
              <Button variant="outline" onClick={() => handleUpdateStatus("Cancelada")} disabled={isUpdating}>
                Cancelar
              </Button>
              <Button onClick={() => handleUpdateStatus("Ejecutada")} disabled={isUpdating}>
                Marcar como ejecutada
              </Button>
            </>
          )}
          {orden.estado === "Ejecutada" && (
            <Button variant="outline" onClick={() => handleUpdateStatus("Pendiente")} disabled={isUpdating}>
              Reabrir
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="detalles">
            <FileText className="mr-2 h-4 w-4" />
            Detalles
          </TabsTrigger>
          <TabsTrigger value="historial">
            <Clock className="mr-2 h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="comentarios">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comentarios
          </TabsTrigger>
          <TabsTrigger value="ejecucion">
            <Send className="mr-2 h-4 w-4" />
            Ejecución
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Orden</CardTitle>
                <CardDescription>Detalles básicos de la orden</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                    <p className="text-lg font-medium">{orden.tipo_operacion}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                    <p className="text-lg font-medium">{formatDate(orden.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <p className="text-lg font-medium">{orden.estado}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Operador</p>
                    <p className="text-lg font-medium">{orden.operador || "No asignado"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
                <CardDescription>Información del cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                  <p className="text-lg font-medium">{orden.cliente_nombre}</p>
                </div>
                {orden.cliente_cuenta && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cuenta</p>
                    <p className="text-lg font-medium">{orden.cliente_cuenta}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {orden.detalles && orden.detalles.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Detalles del Activo</CardTitle>
                  <CardDescription>Información sobre los activos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orden.detalles.map((detalle, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Ticker</p>
                          <p className="text-lg font-medium">{detalle.ticker}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Cantidad</p>
                          <p className="text-lg font-medium">{detalle.cantidad.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Precio</p>
                          <p className="text-lg font-medium">
                            {detalle.es_orden_mercado ? "Orden a mercado" : formatCurrency(detalle.precio)}
                          </p>
                        </div>
                        {!detalle.es_orden_mercado && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total</p>
                            <p className="text-lg font-medium">{formatCurrency(detalle.precio * detalle.cantidad)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de la Orden</CardTitle>
              <CardDescription>Registro de cambios y actualizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              {orden.historial && orden.historial.length > 0 ? (
                <div className="space-y-4">
                  {orden.historial.map((evento, index) => (
                    <div key={index} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                      <div className="w-12 text-center">
                        <div className="bg-primary/10 rounded-full p-2 inline-flex">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{evento.accion}</p>
                        <p className="text-sm text-muted-foreground">{evento.detalles}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(evento.fecha)} - {evento.usuario}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No hay registros en el historial de esta orden.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comentarios">
          <Card>
            <CardHeader>
              <CardTitle>Comentarios</CardTitle>
              <CardDescription>Comentarios y notas sobre la orden</CardDescription>
            </CardHeader>
            <CardContent>
              {orden.observaciones && orden.observaciones.length > 0 ? (
                <div className="space-y-4">
                  {orden.observaciones.map((obs, index) => (
                    <div key={index} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                      <div className="w-12 text-center">
                        <div className="bg-primary/10 rounded-full p-2 inline-flex">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{obs.texto}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(obs.created_at)} - {obs.usuario_nombre || "Usuario"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No hay comentarios para esta orden.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ejecucion">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de Ejecución</CardTitle>
              <CardDescription>Información sobre la ejecución de la orden</CardDescription>
            </CardHeader>
            <CardContent>
              {orden.estado === "Ejecutada" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de Ejecución</p>
                      <p className="text-lg font-medium">
                        {orden.fecha_ejecucion ? formatDate(orden.fecha_ejecucion) : formatDate(orden.updated_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Operador</p>
                      <p className="text-lg font-medium">{orden.operador || "No registrado"}</p>
                    </div>
                  </div>

                  {orden.notas && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notas de Ejecución</p>
                      <p className="p-4 bg-muted rounded-md mt-2">{orden.notas}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Esta orden aún no ha sido ejecutada.</p>
                  {orden.estado === "Pendiente" && (
                    <Button onClick={() => handleUpdateStatus("Ejecutada")} className="mt-4" disabled={isUpdating}>
                      Marcar como ejecutada
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
