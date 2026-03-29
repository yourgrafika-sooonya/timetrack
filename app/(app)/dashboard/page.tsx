"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Header } from "@/components/dashboard/header"
import { DepartmentStats } from "@/components/dashboard/department-stats"
import { EmployeeTable } from "@/components/dashboard/employee-table"
import { Filters } from "@/components/dashboard/filters"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TimeChart } from "@/components/dashboard/time-chart"
import { WorkTypesChart } from "@/components/dashboard/work-types-chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RotateCcw, Loader2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

const INITIAL_OPTIONS = {
  employees: [DEFAULT_FILTERS.employee],
  clients: [DEFAULT_FILTERS.client],
  workTypes: [DEFAULT_FILTERS.workType],
  periods: [DEFAULT_FILTERS.period],
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [options, setOptions] = useState(INITIAL_OPTIONS)
  const [isFiltersLoading, setIsFiltersLoading] = useState(true)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [filtersError, setFiltersError] = useState<string | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isManualRefresh, setIsManualRefresh] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const manualRefreshRef = useRef(false)

  const markManualRefresh = (next: boolean) => {
    manualRefreshRef.current = next
    setIsManualRefresh(next)
  }

  useEffect(() => {
    const controller = new AbortController()
    async function loadFilters() {
      try {
        setIsFiltersLoading(true)
        setFiltersError(null)
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
        setFiltersError("Не удалось загрузить фильтры")
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
        setDataError(null)
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
        setLastUpdatedAt(dataJson.serverTime ?? new Date().toISOString())

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

        if (manualRefreshRef.current) {
          toast({
            title: "Данные обновлены",
            description: "Последние изменения из Google Sheets применены",
          })
          markManualRefresh(false)
        }

        const periods = [DEFAULT_FILTERS.period, ...extractPeriods(dataJson.entries ?? [])]
        setOptions((prev) => ({ ...prev, periods }))
        if (!periods.includes(filters.period)) {
          setFilters((prev) => ({ ...prev, period: DEFAULT_FILTERS.period }))
        }
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("loadData", { refreshVersion, err })
        setDataError("Не удалось загрузить данные. Попробуйте обновить страницу.")
        if (manualRefreshRef.current) {
          toast({
            title: "Ошибка обновления",
            description: "Проверьте соединение и попробуйте ещё раз",
            variant: "destructive",
          })
          markManualRefresh(false)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsDataLoading(false)
        }
      }
    }
    loadData()
    return () => controller.abort()
  }, [filters.employee, filters.client, filters.workType, filters.period, refreshVersion, toast])

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
  const triggerRefresh = () => {
    if (isDataLoading) return
    markManualRefresh(true)
    setRefreshVersion((prev) => {
      const nextValue = prev + 1
      console.log("[dashboard] refresh button clicked", { nextValue })
      return nextValue
    })
  }

  const formattedUpdatedAt = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Аналитика рабочего времени"
        highlightWord="Аналитика"
        subtitle="Отслеживайте и анализируйте эффективность вашей команды"
      />

      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={triggerRefresh}
              disabled={isDataLoading}
            >
              {isManualRefresh ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              {isManualRefresh ? "Обновляем..." : "Обновить данные"}
            </Button>
            {isDataLoading && !isManualRefresh && (
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Загружаем свежие данные
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formattedUpdatedAt ? `Последнее обновление: ${formattedUpdatedAt}` : "Данные загрузятся автоматически"}
          </p>
        </div>

        {dataError && (
          <Alert variant="destructive">
            <AlertTitle>Не удалось загрузить данные</AlertTitle>
            <AlertDescription>{dataError}</AlertDescription>
          </Alert>
        )}

        <StatsCards summary={derivedSummary} isLoading={isDataLoading} />
        <Filters
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          options={options}
          isLoading={isFiltersLoading}
          error={filtersError}
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
    </div>
  )
}
