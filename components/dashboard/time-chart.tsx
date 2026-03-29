"use client"

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { AnalyticsSummary } from "@/lib/server/types"
import { buildClientChartData } from "@/lib/dashboard-data"
import { Spinner } from "@/components/ui/spinner"

const colors = [
  "oklch(0.85 0.15 145)",
  "oklch(0.7 0.15 200)",
  "oklch(0.75 0.12 45)",
  "oklch(0.65 0.18 280)",
  "oklch(0.8 0.15 30)",
  "oklch(0.5 0 0)",
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      name: string
      hours: number
      percentage: number
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
          {data.hours} часов ({data.percentage}%)
        </p>
      </div>
    )
  }
  return null
}

interface TimeChartProps {
  summary: AnalyticsSummary | null
  isLoading?: boolean
}

export function TimeChart({ summary, isLoading }: TimeChartProps) {
  const chartData = buildClientChartData(summary)
  return (
    <div className="rounded-lg" style={{ backgroundColor: 'transparent', border: '1px solid #545454' }}>
      <div className="p-6 pb-2">
        <h3 className="text-lg font-semibold text-foreground">
          Распределение времени по заказчикам
        </h3>
        <p className="text-sm text-muted-foreground">
          {summary ? `Обновлено в ${new Date(summary.updatedAt).toLocaleTimeString('ru-RU')}` : '—'}
        </p>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Spinner className="mr-2" /> Загрузка данных…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={140}
                  tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.18 0 0)" }} />
                <Bar dataKey="hours" radius={[0, 6, 6, 0]} barSize={24}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-border">
           {chartData.slice(0, 3).map((item, index) => (
             <div key={item.name} className="flex items-center gap-2">
               <div 
                 className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-xs text-muted-foreground truncate">{item.name}</span>
              <span className="text-xs font-semibold text-foreground ml-auto">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
