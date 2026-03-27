"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarPlus, CalendarX, CalendarClock, Users } from "lucide-react"
import { useStatsCards } from "@/hooks/useStatsCards"

export function StatsCards() {
  const { stats, loading } = useStatsCards()

  const statConfig = [
    {
      title: "Citas Creadas",
      value: stats.citasCreadas,
      change: stats.cambioCreadas,
      icon: CalendarPlus,
      color: "text-green-700",
      bgColor: "bg-green-100",
    },
    {
      title: "Citas Canceladas",
      value: stats.citasCanceladas,
      change: stats.cambioCanceladas,
      icon: CalendarX,
      color: "text-red-700",
      bgColor: "bg-red-100",
    },
    {
      title: "Citas Reagendadas",
      value: stats.citasReagendadas,
      change: stats.cambioReagendadas,
      icon: CalendarClock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Asesores Activos",
      value: stats.asesores,
      change: stats.cambioAsesores,
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/50 bg-card animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-muted mb-2" />
              <div className="h-3 w-32 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  console.log(stats)
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statConfig.map((stat) => (
        <Card key={stat.title} className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={stat.change >= 0 ? "text-success" : "text-destructive"}>
                {stat.change >= 0 ? "+" : ""}{stat.change}%
              </span>{" "}
              vs últimos 7 días
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}