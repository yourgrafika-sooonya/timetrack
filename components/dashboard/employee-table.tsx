"use client"

import { ArrowRight, MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react"

import type { EmployeeRow } from "@/lib/dashboard-data"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface EmployeeTableProps {
  employees: EmployeeRow[]
  isLoading?: boolean
}

export function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
  const isEmpty = !employees.length
  return (
    <div className="rounded-lg" style={{ backgroundColor: 'transparent', border: '1px solid #545454' }}>
      <div className="flex flex-row items-center justify-between p-6 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Сотрудники
          </h3>
          <p className="text-sm text-muted-foreground">Топ по активности за месяц</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          Все сотрудники
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Spinner className="mr-2" /> Подгружаем сотрудников…
            </div>
          ) : isEmpty ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Нет данных для выбранных фильтров</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Сотрудник
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Отдел
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Часы
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Основной заказчик
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Эффективность
                    </th>
                    <th className="text-right py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {employees.map((employee) => (
                    <tr 
                      key={employee.id} 
                      className="hover:bg-secondary/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">{employee.clientsCount} заказчиков</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${employee.badgeColor}`}>
                          {employee.department}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-foreground">{employee.hours}ч</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-muted-foreground">{employee.mainClient}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${employee.efficiency}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">{employee.efficiency}%</span>
                          {employee.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-primary" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  )
}
