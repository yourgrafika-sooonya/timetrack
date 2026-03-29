"use client"

import { Calendar, ChevronDown, Filter, X } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type DashboardFilters, hasActiveFilters } from "@/lib/dashboard-data"

interface FiltersProps {
  filters: DashboardFilters
  onChange: (key: keyof DashboardFilters, value: string) => void
  onReset: () => void
  options: {
    employees: string[]
    clients: string[]
    workTypes: string[]
    periods: string[]
  }
  isLoading?: boolean
  error?: string | null
}

export function Filters({ filters, onChange, onReset, options, isLoading, error }: FiltersProps) {
  const active = hasActiveFilters(filters)
  const disabled = Boolean(isLoading)

  const selectClass =
    "min-w-[160px] appearance-none rounded-lg border border-border bg-secondary px-4 py-2.5 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed"

  return (
    <div
      className="rounded-lg border border-sidebar-border/70 bg-background/60 p-6"
      aria-busy={isLoading}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-5 w-5" />
          <span className="text-sm font-medium">Фильтры:</span>
        </div>

        <div className="flex flex-1 flex-wrap gap-3">
          {isLoading ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-[180px] rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <div className="relative">
                <select
                  value={filters.employee}
                  onChange={(e) => onChange("employee", e.target.value)}
                  disabled={disabled}
                  className={`${selectClass} min-w-[180px]`}
                >
                  {options.employees.map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              <div className="relative">
                <select
                  value={filters.client}
                  onChange={(e) => onChange("client", e.target.value)}
                  disabled={disabled}
                  className={`${selectClass} min-w-[180px]`}
                >
                  {options.clients.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              <div className="relative">
                <select
                  value={filters.workType}
                  onChange={(e) => onChange("workType", e.target.value)}
                  disabled={disabled}
                  className={`${selectClass} min-w-[160px]`}
                >
                  {options.workTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filters.period}
                  onChange={(e) => onChange("period", e.target.value)}
                  disabled={disabled}
                  className={`${selectClass} min-w-[150px] pl-10`}
                >
                  {options.periods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </>
          )}
        </div>

        {active && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Сбросить
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Не удалось обновить фильтры</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
