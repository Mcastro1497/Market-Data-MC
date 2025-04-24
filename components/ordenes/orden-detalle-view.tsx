"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, MessageSquare, History } from "lucide-react"
import type { Orden } from "@/lib/types/orden-types"

interface OrdenDetalleViewProps {
  orden: Orden
}

export function OrdenDetalleView({ orden }: OrdenDetalleViewProps) {
  const [activeTab, setActiveTab] = useState("detalles")

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Orden #{orden.id.substring(0, 8)}</CardTitle>
              <CardDescription>Creada el {formatDate(orden.created_at)}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(orden.estado)} className="flex items-center">
              {getStatusIcon(orden.estado)}
              {orden.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="detalles" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Detalles
              </TabsTrigger>
              <TabsTrigger value="observaciones" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Observaciones
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                Historial
              </TabsTrigger>
            </TabsList>
            <TabsContent value="detalles" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cliente</h3>
                  <p className="text-base font-medium">{orden.cliente_nombre}</p>
                  {orden.cliente_cuenta && (
                    <p className="text-sm text-muted-foreground">Cuenta: {orden.cliente_cuenta}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tipo de operación</h3>
                  <p className="text-base font-medium">{orden.tipo_operacion}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Detalles de la operación</h3>
                {orden.detalles && orden.detalles.length > 0 ? (
                  <div className="border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ticker
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orden.detalles.map((detalle, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{detalle.ticker}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{detalle.cantidad}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {detalle.precio ? formatCurrency(detalle.precio) : "Mercado"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {detalle.precio ? formatCurrency(detalle.precio * detalle.cantidad) : "A determinar"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay detalles disponibles</p>
                )}
              </div>

              {orden.instrucciones && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Instrucciones</h3>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded-md">{orden.instrucciones}</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="observaciones" className="pt-4">
              {orden.observaciones && orden.observaciones.length > 0 ? (
                <div className="space-y-4">
                  {orden.observaciones.map((obs, index) => (
                    <div key={index} className="border p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{obs.usuario || "Sistema"}</p>
                        <span className="text-xs text-muted-foreground">{formatDate(obs.fecha)}</span>
                      </div>
                      <p className="mt-1 text-sm">{obs.texto}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay observaciones registradas.</p>
              )}
            </TabsContent>
            <TabsContent value="historial" className="pt-4">
              {orden.historial && orden.historial.length > 0 ? (
                <div className="relative border-l-2 pl-4 ml-2 space-y-6">
                  {orden.historial.map((evento, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[1.65rem] bg-background border-2 rounded-full w-4 h-4"></div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">{formatDate(evento.fecha)}</span>
                        <span className="font-medium">{evento.estado}</span>
                        {evento.usuario && <span className="text-sm">Por: {evento.usuario}</span>}
                        {evento.comentario && <span className="text-sm mt-1">{evento.comentario}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay historial disponible.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Volver</Button>
        {orden.estado.toLowerCase() === "pendiente" && (
          <>
            <Button variant="secondary">Tomar orden</Button>
            <Button variant="destructive">Rechazar</Button>
          </>
        )}
        {orden.estado.toLowerCase() === "tomada" && (
          <>
            <Button>Ejecutar</Button>
            <Button variant="destructive">Cancelar</Button>
          </>
        )}
      </div>
    </div>
  )
}
