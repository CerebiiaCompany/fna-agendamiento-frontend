"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { useServicesChart } from "@/hooks/useServicesChart"

const chartConfig = {
  cantidad: {
    label: "Citas",
    color: "var(--color-chart-1)",
  },
}

export function ServicesChart() {
  const { data, loading } = useServicesChart(7, 5)

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle>Servicios Más Agendados</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Sin datos en los últimos 7 días
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                dataKey="servicio"
                type="category"
                tickLine={false}
                axisLine={false}
                width={120}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="cantidad"
                fill="var(--color-chart-1)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}