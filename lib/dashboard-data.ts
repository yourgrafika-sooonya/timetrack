import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"

import type { AnalyticsSummary, TimeEntry } from "@/lib/server/types"

export const DEFAULT_FILTERS = {
  employee: "Все сотрудники",
  client: "Все заказчики",
  workType: "Все виды работ",
  period: "Все периоды",
}

export type DashboardFilters = typeof DEFAULT_FILTERS

export interface EmployeeRow {
  id: string
  name: string
  department: string
  hours: number
  clientsCount: number
  mainClient: string
  efficiency: number
  trend: "up" | "down"
  badgeColor: string
}

export interface DepartmentRow {
  name: string
  employees: number
  totalHours: number
  clients: number
  avgEfficiency: number
  color: string
}

export interface ActivityRow {
  id: string
  employee: string
  client: string
  action: string
  duration: string
  time: string
}

const COLOR_CLASSES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
const BADGE_CLASSES = [
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/20 text-chart-3",
  "bg-chart-4/20 text-chart-4",
  "bg-chart-5/20 text-chart-5",
]

export function hasActiveFilters(filters: DashboardFilters) {
  return (
    filters.employee !== DEFAULT_FILTERS.employee ||
    filters.client !== DEFAULT_FILTERS.client ||
    filters.workType !== DEFAULT_FILTERS.workType ||
    filters.period !== DEFAULT_FILTERS.period
  )
}

export function createPeriodLabel(date: string) {
  try {
    const value = format(parseISO(date), "LLLL yyyy", { locale: ru })
    return value.charAt(0).toUpperCase() + value.slice(1)
  } catch {
    return "Без даты"
  }
}

export function extractPeriods(entries: TimeEntry[]) {
  const map = new Map<string, number>()
  entries.forEach((entry) => {
    if (!entry.date) return
    const label = createPeriodLabel(entry.date)
    const timestamp = Date.parse(entry.date)
    if (!map.has(label) || (timestamp && timestamp > (map.get(label) ?? 0))) {
      map.set(label, timestamp)
    }
  })

  return Array.from(map.entries())
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([label]) => label)
}

export function filterEntries(entries: TimeEntry[], filters: DashboardFilters) {
  return entries.filter((entry) => {
    if (filters.employee !== DEFAULT_FILTERS.employee && entry.employee !== filters.employee) {
      return false
    }
    if (filters.client !== DEFAULT_FILTERS.client && entry.client !== filters.client) {
      return false
    }
    if (filters.workType !== DEFAULT_FILTERS.workType && entry.workType !== filters.workType) {
      return false
    }
    if (filters.period !== DEFAULT_FILTERS.period) {
      const label = entry.date ? createPeriodLabel(entry.date) : DEFAULT_FILTERS.period
      if (label !== filters.period) {
        return false
      }
    }
    return true
  })
}

export function buildSummaryFromEntries(entries: TimeEntry[]): AnalyticsSummary {
  const totalHours = entries.reduce((acc, entry) => acc + (entry.hours ?? 0), 0)
  const employeeMap = new Map<
    string,
    { hours: number; entries: number; clients: Map<string, number>; sheetName?: string }
  >()
  const clientMap = new Map<string, number>()
  const workTypeMap = new Map<string, number>()

  entries.forEach((entry) => {
    if (entry.client) {
      clientMap.set(entry.client, (clientMap.get(entry.client) ?? 0) + (entry.hours ?? 0))
    }
    if (entry.workType) {
      workTypeMap.set(entry.workType, (workTypeMap.get(entry.workType) ?? 0) + (entry.hours ?? 0))
    }
    if (entry.employee) {
      const record = employeeMap.get(entry.employee) ?? {
        hours: 0,
        entries: 0,
        clients: new Map<string, number>(),
        sheetName: entry.sheetName,
      }
      record.hours += entry.hours ?? 0
      record.entries += 1
      if (entry.client) {
        record.clients.set(entry.client, (record.clients.get(entry.client) ?? 0) + (entry.hours ?? 0))
      }
      if (entry.sheetName && !record.sheetName) {
        record.sheetName = entry.sheetName
      }
      employeeMap.set(entry.employee, record)
    }
  })

  const formatValue = (value: number) => Number(value.toFixed(2))

  const topEmployees = Array.from(employeeMap.entries())
    .map(([employee, stats]) => ({
      employee,
      hours: formatValue(stats.hours),
      entries: stats.entries,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5)

  const hoursByClient = Array.from(clientMap.entries())
    .map(([client, hours]) => ({ client, hours: formatValue(hours) }))
    .sort((a, b) => b.hours - a.hours)

  const hoursByWorkType = Array.from(workTypeMap.entries())
    .map(([workType, hours]) => ({ workType, hours: formatValue(hours) }))
    .sort((a, b) => b.hours - a.hours)

  return {
    totalHours: formatValue(totalHours),
    totalEntries: entries.length,
    uniqueEmployees: employeeMap.size,
    uniqueClients: clientMap.size,
    averageHoursPerEntry: entries.length ? formatValue(totalHours / entries.length) : 0,
    topEmployees,
    hoursByClient,
    hoursByWorkType,
    updatedAt: new Date().toISOString(),
  }
}

export function buildEmployeeRows(entries: TimeEntry[]): EmployeeRow[] {
  const map = new Map<
    string,
    { hours: number; clients: Map<string, number>; sheetName: string }
  >()

  entries.forEach((entry) => {
    if (!entry.employee) {
      return
    }
    const record = map.get(entry.employee) ?? {
      hours: 0,
      clients: new Map<string, number>(),
      sheetName: entry.sheetName ?? "—",
    }
    record.hours += entry.hours ?? 0
    if (entry.client) {
      record.clients.set(entry.client, (record.clients.get(entry.client) ?? 0) + (entry.hours ?? 0))
    }
    if (entry.sheetName) {
      record.sheetName = entry.sheetName
    }
    map.set(entry.employee, record)
  })

  const maxHours = Array.from(map.values()).reduce((acc, item) => Math.max(acc, item.hours), 0) || 1

  return Array.from(map.entries())
    .map(([employee, stats], index) => {
      const clientsList = Array.from(stats.clients.entries()).sort((a, b) => b[1] - a[1])
      const efficiency = Math.round((stats.hours / maxHours) * 100)
      const trend: "up" | "down" = efficiency >= 75 ? "up" : "down"
      return {
        id: employee,
        name: employee,
        department: stats.sheetName,
        hours: Number(stats.hours.toFixed(2)),
        clientsCount: stats.clients.size,
        mainClient: clientsList[0]?.[0] ?? "—",
        efficiency: Math.min(100, efficiency),
        trend,
        badgeColor: BADGE_CLASSES[index % BADGE_CLASSES.length],
      }
    })
    .sort((a, b) => b.hours - a.hours)
}

export function buildDepartmentRows(entries: TimeEntry[]): DepartmentRow[] {
  const map = new Map<string, { hours: number; employees: Set<string>; clients: Set<string> }>()

  entries.forEach((entry) => {
    const key = entry.sheetName ?? "Лист"
    const record = map.get(key) ?? { hours: 0, employees: new Set(), clients: new Set() }
    record.hours += entry.hours ?? 0
    if (entry.employee) record.employees.add(entry.employee)
    if (entry.client) record.clients.add(entry.client)
    map.set(key, record)
  })

  const maxHours = Array.from(map.values()).reduce((acc, item) => Math.max(acc, item.hours), 0) || 1

  return Array.from(map.entries()).map(([name, stats], index) => ({
    name,
    employees: stats.employees.size,
    totalHours: Number(stats.hours.toFixed(2)),
    clients: stats.clients.size,
    avgEfficiency: Math.round((stats.hours / maxHours) * 100) || 0,
    color: COLOR_CLASSES[index % COLOR_CLASSES.length],
  }))
}

export function buildActivityRows(entries: TimeEntry[]): ActivityRow[] {
  const sorted = [...entries].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  return sorted.slice(0, 6).map((entry, index) => ({
    id: entry.id ?? `${entry.employee}-${index}`,
    employee: entry.employee || "—",
    client: entry.client || "—",
    action: entry.task || "Работа",
    duration: formatDuration(entry.hours ?? 0, entry.rawHours),
    time: formatActivityTime(entry.date, entry.dateLabel),
  }))
}

function formatDuration(hours: number, raw?: string) {
  if (raw) {
    const normalized = raw.replace(",", ".")
    const value = Number(normalized)
    if (!Number.isNaN(value)) {
      hours = value
    }
  }
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h && m) return `${h}ч ${m}м`
  if (h) return `${h}ч`
  if (m) return `${m}м`
  return "—"
}

function formatActivityTime(date: string, fallback?: string) {
  if (!date) return fallback ?? ""
  try {
    return format(parseISO(date), "d MMM HH:mm", { locale: ru })
  } catch {
    return fallback ?? ""
  }
}

export function buildClientChartData(summary: AnalyticsSummary | null) {
  if (!summary) return []
  const total = summary.hoursByClient.reduce((acc, item) => acc + item.hours, 0) || 1
  return summary.hoursByClient.map((item) => ({
    name: item.client,
    hours: item.hours,
    percentage: Number(((item.hours / total) * 100).toFixed(2)),
  }))
}

export function buildWorkTypeChartData(summary: AnalyticsSummary | null) {
  if (!summary) return []
  const total = summary.hoursByWorkType.reduce((acc, item) => acc + item.hours, 0) || 1
  return summary.hoursByWorkType.map((item) => ({
    name: item.workType,
    value: Number(((item.hours / total) * 100).toFixed(2)),
    hours: item.hours,
  }))
}
