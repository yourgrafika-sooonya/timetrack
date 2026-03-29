"use client"

import { Calendar, ChevronDown, Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DEFAULT_FILTERS, type DashboardFilters, hasActiveFilters } from "@/lib/dashboard-data"

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
  const disabled = isLoading

  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: 'transparent', border: '1px solid #545454' }}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-5 w-5" />
            <span className="text-sm font-medium">Фильтры:</span>
          </div>

          <div className="flex flex-wrap gap-3 flex-1">
            {/* Employee filter */}
            <div className="relative group">
               <select
                 value={filters.employee}
                 onChange={(e) => onChange("employee", e.target.value)}
                 disabled={disabled}
                 className="appearance-none bg-secondary border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[180px]"
               >
                {options.employees.map((emp) => (
                   <option key={emp} value={emp}>{emp}</option>
                 ))}
               </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Client filter */}
            <div className="relative">
               <select
                 value={filters.client}
                 onChange={(e) => onChange("client", e.target.value)}
                 disabled={disabled}
                 className="appearance-none bg-secondary border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[180px]"
               >
                {options.clients.map((client) => (
                   <option key={client} value={client}>{client}</option>
                 ))}
               </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Work type filter */}
            <div className="relative">
               <select
                 value={filters.workType}
                 onChange={(e) => onChange("workType", e.target.value)}
                 disabled={disabled}
                 className="appearance-none bg-secondary border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[160px]"
               >
                {options.workTypes.map((type) => (
                   <option key={type} value={type}>{type}</option>
                 ))}
               </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Period filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
               <select
                 value={filters.period}
                 onChange={(e) => onChange("period", e.target.value)}
                 disabled={disabled}
                 className="appearance-none bg-secondary border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[150px]"
               >
                {options.periods.map((period) => (
                   <option key={period} value={period}>{period}</option>
                 ))}
               </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {active && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Сбросить
            </Button>
          )}
        </div>
        {error && (
          <p className="mt-3 text-xs text-destructive">{error}</p>
        )}
    </div>
  )
}
