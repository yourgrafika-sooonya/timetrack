"use client"

import { Building2, Clock, TrendingUp, Users } from "lucide-react"

import type { AnalyticsSummary } from "@/lib/server/types"

interface StatsCardsProps {
  summary: AnalyticsSummary | null
  isLoading?: boolean
}

const numberFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 })

export function StatsCards({ summary, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Всего сотрудников",
      value: summary?.uniqueEmployees ?? null,
      hint: summary ? `${summary.totalEntries} записей` : "",
      icon: Users,
      color: "bg-chart-1/20 text-chart-1",
    },
    {
      title: "Суммарные часы",
      value: summary ? numberFormatter.format(summary.totalHours) : null,
      hint: "За всё время",
      icon: Clock,
      color: "bg-chart-2/20 text-chart-2",
    },
    {
      title: "Активных заказчиков",
      value: summary?.uniqueClients ?? null,
      hint: summary ? `${summary.hoursByClient.length} направлений` : "",
      icon: Building2,
      color: "bg-chart-3/20 text-chart-3",
    },
    {
      title: "Средняя длительность",
      value: summary ? `${numberFormatter.format(summary.averageHoursPerEntry)} ч` : null,
      hint: summary ? `Обновлено ${new Date(summary.updatedAt).toLocaleTimeString("ru-RU")}` : "",
      icon: TrendingUp,
      color: "bg-chart-4/20 text-chart-4",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.title}
            className="rounded-lg p-6 transition-colors"
            style={{ backgroundColor: "transparent", border: "1px solid #545454" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stat.value ?? (isLoading ? "…" : "—")}
                </p>
                {stat.hint && <p className="text-xs text-muted-foreground mt-2">{stat.hint}</p>}
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
