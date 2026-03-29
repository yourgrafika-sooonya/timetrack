"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

import type { AnalyticsSummary } from "@/lib/server/types"
import { buildWorkTypeChartData } from "@/lib/dashboard-data"
import { Spinner } from "@/components/ui/spinner"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      name: string
      value: number
      hours: number
    }
  }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-popover-foreground">{data.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.hours} часов ({data.value}%)
        </p>
      </div>
    )
  }
  return null
}

interface WorkTypesChartProps {
  summary: AnalyticsSummary | null
  isLoading?: boolean
}

const colors = [
  "oklch(0.85 0.15 145)",
  "oklch(0.7 0.15 200)",
  "oklch(0.75 0.12 45)",
  "oklch(0.65 0.18 280)",
  "oklch(0.8 0.15 30)",
  "oklch(0.5 0 0)",
]

export function WorkTypesChart({ summary, isLoading }: WorkTypesChartProps) {
  const data = buildWorkTypeChartData(summary)
  const totalHours = data.reduce((acc, item) => acc + item.hours, 0)

  return (
    <div className="rounded-lg" style={{ backgroundColor: 'transparent', border: '1px solid #545454' }}>
      <div className="p-6 pb-2">
        <h3 className="text-lg font-semibold text-foreground">
          Виды работ
        </h3>
        <p className="text-sm text-muted-foreground">Распределение по типам</p>
      </div>
      <div className="p-6 pt-0">
        <div className="flex items-center gap-6">
          <div className="relative h-[200px] w-[200px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Spinner className="mr-2" /> Обновляем…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{totalHours}</span>
              <span className="text-xs text-muted-foreground">часов</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                  <span className="text-xs text-muted-foreground ml-2">{item.hours}ч</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
