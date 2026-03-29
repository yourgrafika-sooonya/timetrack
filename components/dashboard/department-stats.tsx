"use client"

import { BarChart3, Building2, Clock, Users } from "lucide-react"

import type { DepartmentRow } from "@/lib/dashboard-data"
import { Spinner } from "@/components/ui/spinner"

interface DepartmentStatsProps {
  items: DepartmentRow[]
  isLoading?: boolean
}

export function DepartmentStats({ items, isLoading }: DepartmentStatsProps) {
  const isEmpty = !items.length
  return (
    <div className="rounded-lg" style={{ backgroundColor: 'transparent', border: '1px solid #545454' }}>
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Статистика по отделам
        </h3>
        <p className="text-sm text-muted-foreground">Общие показатели</p>
      </div>
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Spinner className="mr-2" /> Сводим отделы…
          </div>
        ) : isEmpty ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Нет данных по отделам</div>
        ) : (
          <div className="space-y-4">
            {items.map((dept) => (
              <div 
                key={dept.name} 
                className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-8 rounded-full ${dept.color}`} />
                    <h3 className="font-semibold text-foreground">{dept.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{dept.avgEfficiency}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{dept.employees}</p>
                      <p className="text-xs text-muted-foreground">человек</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{dept.totalHours}</p>
                      <p className="text-xs text-muted-foreground">часов</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{dept.clients}</p>
                      <p className="text-xs text-muted-foreground">заказчиков</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
