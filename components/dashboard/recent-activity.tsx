"use client"

import { CalendarCheck, MessageSquare, PhoneCall } from "lucide-react"

import type { ActivityRow } from "@/lib/dashboard-data"
import { Spinner } from "@/components/ui/spinner"

interface RecentActivityProps {
  items: ActivityRow[]
  isLoading?: boolean
}

const ICONS = [PhoneCall, MessageSquare, CalendarCheck]
const ICON_COLORS = ["bg-chart-1/20 text-chart-1", "bg-chart-2/20 text-chart-2", "bg-chart-3/20 text-chart-3"]

export function RecentActivity({ items, isLoading }: RecentActivityProps) {
  const isEmpty = !items.length
  return (
    <div className="rounded-lg" style={{ backgroundColor: 'transparent', border: '1px solid #545454' }}>
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Последняя активность
        </h3>
        <p className="text-sm text-muted-foreground">Сырые записи Google Sheets</p>
      </div>
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Spinner className="mr-2" /> Подгружаем события…
          </div>
        ) : isEmpty ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Нет активности по текущим фильтрам</div>
        ) : (
          <div className="space-y-4">
            {items.map((activity, index) => {
              const Icon = ICONS[index % ICONS.length]
              const iconBg = ICON_COLORS[index % ICON_COLORS.length]
              return (
                <div key={activity.id} className="relative">
                  {index !== items.length - 1 && (
                    <div className="absolute left-[18px] top-10 bottom-0 w-px bg-border" />
                  )}
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${iconBg}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.action}
                        </p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.employee} • {activity.client}
                      </p>
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                        {activity.duration}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
