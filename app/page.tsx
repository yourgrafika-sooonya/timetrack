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

        const query = params.toString()
        const [dataRes, summaryRes] = await Promise.all([
          fetch(`/api/data${query ? `?${query}` : ""}`, { signal: controller.signal }),
          fetch("/api/analytics/summary", { signal: controller.signal }),
        ])

        if (!dataRes.ok) throw new Error("Failed to load data")
        const dataJson = await dataRes.json()
        const summaryJson = summaryRes.ok ? await summaryRes.json() : null
        if (controller.signal.aborted) return

        setEntries(dataJson.entries ?? [])
        setSummary(summaryJson)

        const periods = [DEFAULT_FILTERS.period, ...extractPeriods(dataJson.entries ?? [])]
        setOptions((prev) => ({ ...prev, periods }))
        if (!periods.includes(filters.period)) {
          setFilters((prev) => ({ ...prev, period: DEFAULT_FILTERS.period }))
        }
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("loadData", err)
        setError("Не удалось загрузить данные. Попробуйте обновить страницу.")
      } finally {
        if (!controller.signal.aborted) {
          setIsDataLoading(false)
        }
      }
    }
    loadData()
    return () => controller.abort()
  }, [filters.employee, filters.client, filters.workType, filters.period])

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
