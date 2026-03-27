"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdvisorsTable } from "@/hooks/useAdvisorsTable"

export function AdvisorsTable() {
  const { data, loading } = useAdvisorsTable(7)

  return (
    <Card className="border-border/50 bg-card col-span-full">
      <CardHeader>
        <CardTitle>Rendimiento de Asesores</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Sin datos en los últimos 7 días
          </div>
        ) : (
          <div className="space-y-4">

            <div className="hidden md:grid md:grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-2">
              <div className="col-span-3">Asesor</div>
              <div className="col-span-1 text-center">Citas</div>
              <div className="col-span-2 text-center">Creadas</div>
              <div className="col-span-2 text-center">Reagendadas</div>
              <div className="col-span-2 text-center">Canceladas</div>
              <div className="col-span-2 text-center">Efectividad</div>
            </div>

            {data.map((advisor) => {
              const efectividad = advisor.citas > 0
                ? Math.round(((advisor.creadas + advisor.reagendadas) / advisor.citas) * 100)
                : 0

              return (
                <div
                  key={advisor.id}
                  className="border-b border-border/50 last:border-0 py-3"
                >
                  <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/5 text-sky-600 text-sm">
                          {advisor.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{advisor.nombre}</p>
                        <p className="text-xs text-muted-foreground">{advisor.sede}</p>
                      </div>
                    </div>
                    <div className="col-span-1 text-center font-medium">{advisor.citas}</div>
                    <div className="col-span-2 text-center">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">{advisor.creadas}</Badge>
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-600 border-0">{advisor.reagendadas}</Badge>
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">{advisor.canceladas}</Badge>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Progress value={efectividad} className="h-2" />
                        <span className="text-sm font-medium w-10">{efectividad}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/5 text-sky-600 text-sm">
                            {advisor.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{advisor.nombre}</p>
                          <p className="text-xs text-muted-foreground">{advisor.sede}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {advisor.citas} citas
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Creadas</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">{advisor.creadas}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Reagendadas</span>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-600 border-0">{advisor.reagendadas}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Canceladas</span>
                        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">{advisor.canceladas}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20 shrink-0">Efectividad</span>
                      <Progress value={efectividad} className="h-2 flex-1" />
                      <span className="text-sm font-medium w-10 text-right">{efectividad}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}