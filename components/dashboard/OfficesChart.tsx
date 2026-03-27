"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocationsChart } from "@/hooks/useLocationsChart"

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

const chartConfig = {
  cantidad: {
    label: "Citas",
  },
}

export function OfficesChart() {
  const { data, loading } = useLocationsChart(7)
  const total = data.reduce((acc, item) => acc + item.cantidad, 0)

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle>Citas por Sede</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Sin datos en los últimos 7 días
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="cantidad"
                  nameKey="sede"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: { color?: string }) => (
                    <span style={{ color: entry.color ?? "var(--color-foreground)" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold">{total.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total de citas</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}