"use client"

import { useEffect, useMemo, useState } from "react"

import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DepartmentStats } from "@/components/dashboard/department-stats"
import { EmployeeTable } from "@/components/dashboard/employee-table"
import { Filters } from "@/components/dashboard/filters"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TimeChart } from "@/components/dashboard/time-chart"
import { WorkTypesChart } from "@/components/dashboard/work-types-chart"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import {
  DEFAULT_FILTERS,
  type DashboardFilters,
  buildActivityRows,
  buildDepartmentRows,
  buildEmployeeRows,
  buildSummaryFromEntries,
  extractPeriods,
  filterEntries,
} from "@/lib/dashboard-data"
import type { AnalyticsSummary, TimeEntry } from "@/lib/server/types"

const INITIAL_OPTIONS = {
  employees: [DEFAULT_FILTERS.employee],
  clients: [DEFAULT_FILTERS.client],
  workTypes: [DEFAULT_FILTERS.workType],
  periods: [DEFAULT_FILTERS.period],
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [options, setOptions] = useState(INITIAL_OPTIONS)
  const [isFiltersLoading, setIsFiltersLoading] = useState(true)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function loadFilters() {
      try {
        setIsFiltersLoading(true)
        const res = await fetch("/api/filters", { signal: controller.signal })
        if (!res.ok) throw new Error("Failed to load filters")
        const data = await res.json()
        setOptions((prev) => ({
          ...prev,
          employees: [DEFAULT_FILTERS.employee, ...data.employees],
          clients: [DEFAULT_FILTERS.client, ...data.clients],
          workTypes: [DEFAULT_FILTERS.workType, ...data.workTypes],
        }))
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("loadFilters", err)
        setError("Не удалось загрузить фильтры")
      } finally {
        if (!controller.signal.aborted) {
          setIsFiltersLoading(false)
        }
      }
    }
    loadFilters()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function loadData() {
      try {
        setIsDataLoading(true)
        setError(null)
        const params = new URLSearchParams()
        ;(Object.keys(filters) as Array<keyof DashboardFilters>).forEach((key: keyof DashboardFilters) => {
          const value = filters[key]
          if (value !== DEFAULT_FILTERS[key]) {
            params.append(key, value)
          }
        })

        const dataParams = new URLSearchParams(params)
        const summaryParams = new URLSearchParams()
        if (refreshVersion) {
          dataParams.append("refresh", "1")
          summaryParams.append("refresh", "1")
        }
        const dataQuery = dataParams.toString()
        const summaryQuery = summaryParams.toString()
        const dataUrl = `/api/data${dataQuery ? `?${dataQuery}` : ""}`
        const summaryUrl = `/api/analytics/summary${summaryQuery ? `?${summaryQuery}` : ""}`

        console.log("[dashboard] fetch start", {
          filtersSnapshot: { ...filters },
          refreshVersion,
          dataUrl,
          summaryUrl,
        })

        const [dataRes, summaryRes] = await Promise.all([
          fetch(dataUrl, { signal: controller.signal, cache: "no-store" }),
          fetch(summaryUrl, { signal: controller.signal, cache: "no-store" }),
        ])

        if (!dataRes.ok) throw new Error("Failed to load data")
        const dataJson = await dataRes.json()
        const summaryJson = summaryRes.ok ? await summaryRes.json() : null
        if (controller.signal.aborted) return

        setEntries(dataJson.entries ?? [])
        setSummary(summaryJson)

        console.log("[dashboard] fetch success", {
          refreshVersion,
          dataServerTime: dataJson.serverTime,
          dataFetchedAt: dataJson.fetchedAt,
          entriesCount: dataJson.entries?.length ?? 0,
          summaryServerTime: summaryJson?.serverTime,
          summaryFetchedAt: summaryJson?.fetchedAt,
          summaryTotalEntries: summaryJson?.totalEntries,
          summaryTotalHours: summaryJson?.totalHours,
        })

        const periods = [DEFAULT_FILTERS.period, ...extractPeriods(dataJson.entries ?? [])]
        setOptions((prev) => ({ ...prev, periods }))
        if (!periods.includes(filters.period)) {
          setFilters((prev) => ({ ...prev, period: DEFAULT_FILTERS.period }))
        }
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("loadData", { refreshVersion, err })
        setError("Не удалось загрузить данные. Попробуйте обновить страницу.")
      } finally {
        if (!controller.signal.aborted) {
          setIsDataLoading(false)
        }
      }
    }
    loadData()
    return () => controller.abort()
  }, [filters.employee, filters.client, filters.workType, filters.period, refreshVersion])

  const filteredEntries = useMemo(() => filterEntries(entries, filters), [entries, filters])
  const derivedSummary = useMemo(() => {
    if (filteredEntries.length) {
      return buildSummaryFromEntries(filteredEntries)
    }
    return summary
  }, [filteredEntries, summary])

  const employeeRows = useMemo(() => buildEmployeeRows(filteredEntries), [filteredEntries])
  const departmentRows = useMemo(() => buildDepartmentRows(filteredEntries), [filteredEntries])
  const activityRows = useMemo(() => buildActivityRows(filteredEntries), [filteredEntries])

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => setFilters(DEFAULT_FILTERS)
  const triggerRefresh = () =>
    setRefreshVersion((prev) => {
      const nextValue = prev + 1
      console.log("[dashboard] refresh button clicked", { nextValue })
      return nextValue
    })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64">
        <Header 
          title="Аналитика рабочего времени" 
          highlightWord="Аналитика"
          subtitle="Отслеживайте и анализируйте эффективность вашей команды"
        />

        <div className="p-8 space-y-8">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={triggerRefresh}
              disabled={isDataLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Обновить данные
            </Button>
          </div>
          <StatsCards summary={derivedSummary} isLoading={isDataLoading} />
          <Filters
            filters={filters}
            onChange={handleFilterChange}
            onReset={resetFilters}
            options={options}
            isLoading={isFiltersLoading}
            error={error}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeChart summary={derivedSummary} isLoading={isDataLoading} />
            <WorkTypesChart summary={derivedSummary} isLoading={isDataLoading} />
          </div>

          <EmployeeTable employees={employeeRows} isLoading={isDataLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentStats items={departmentRows} isLoading={isDataLoading} />
            <RecentActivity items={activityRows} isLoading={isDataLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
