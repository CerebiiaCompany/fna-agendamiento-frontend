"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppointmentsChart } from "@/hooks/useAppointmentsChart"

const chartConfig = {
  creadas: {
    label: "Creadas",
    color: "var(--color-chart-1)",
  },
  canceladas: {
    label: "Canceladas",
    color: "var(--color-chart-4)",
  },
  reagendadas: {
    label: "Reagendadas",
    color: "var(--color-chart-3)",
  },
}

const LEGEND = [
  { key: "creadas",     label: "Creadas",     color: "bg-chart-1" },
  { key: "canceladas",  label: "Canceladas",  color: "bg-chart-4" },
  { key: "reagendadas", label: "Reagendadas", color: "bg-chart-3" },
]

export function AppointmentsChart() {
  const { data, loading } = useAppointmentsChart()

  return (
    <Card className="border-border/50 bg-card col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span>Tendencia de Citas</span>
          <div className="flex items-center gap-3 sm:ml-auto text-sm font-normal flex-wrap">
            {LEGEND.map((item) => (
              <div key={item.key} className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${item.color}`} />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2 sm:px-6">
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <div className="overflow-x-auto">
            <ChartContainer
              config={chartConfig}
              className="h-[300px] min-w-[280px] w-full"
            >
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  {[
                    { id: "fillCreadas",     color: "var(--color-chart-1)" },
                    { id: "fillCanceladas",  color: "var(--color-chart-4)" },
                    { id: "fillReagendadas", color: "var(--color-chart-3)" },
                  ].map(({ id, color }) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />

                <XAxis
                  dataKey="fecha"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  width={32}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />

                <ChartTooltip content={<ChartTooltipContent />} />

                <Area
                  type="monotone"
                  dataKey="creadas"
                  stroke="var(--color-chart-1)"
                  fill="url(#fillCreadas)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="canceladas"
                  stroke="var(--color-chart-4)"
                  fill="url(#fillCanceladas)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="reagendadas"
                  stroke="var(--color-chart-3)"
                  fill="url(#fillReagendadas)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}