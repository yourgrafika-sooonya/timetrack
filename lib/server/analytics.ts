import { getAllEntries, groupBy } from "./google-sheet"
import type { AnalyticsSummary, FiltersResponse, TimeEntry } from "./types"

export async function getFilters(): Promise<FiltersResponse> {
  const entries = await getAllEntries()
  const employees = new Set<string>()
  const clients = new Set<string>()
  const workTypes = new Set<string>()

  entries.forEach((entry) => {
    if (entry.employee) employees.add(entry.employee)
    if (entry.client) clients.add(entry.client)
    if (entry.workType) workTypes.add(entry.workType)
  })

  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const dateRange = sortedEntries.length
    ? {
        from: sortedEntries[0].date,
        to: sortedEntries[sortedEntries.length - 1].date,
      }
    : null

  return {
    employees: [...employees].sort(),
    clients: [...clients].sort(),
    workTypes: [...workTypes].sort(),
    sheets: entries.reduce<FiltersResponse["sheets"]>((acc, entry) => {
      if (!acc.find((item) => item.id === entry.sheetId)) {
        acc.push({ id: entry.sheetId, name: entry.sheetName })
      }
      return acc
    }, []),
    dateRange,
    totalEntries: entries.length,
  }
}

function collectHours(entries: TimeEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.hours, 0)
}

type AnalyticsSummaryOptions = {
  forceRefresh?: boolean
  debug?: boolean
}

export async function getAnalyticsSummary(options: AnalyticsSummaryOptions = {}): Promise<AnalyticsSummary> {
  const { forceRefresh = false, debug = false } = options
  const entries = await getAllEntries(forceRefresh)
  const totalHours = collectHours(entries)
  const totalEntries = entries.length

  if (debug) {
    console.log("[analytics] summary recomputed", {
      timestamp: new Date().toISOString(),
      totalEntries,
      totalHours,
      forceRefresh,
    })
  }

  const employeesGroups = groupBy(entries, (entry) => entry.employee || "unknown")
  const topEmployees = Object.entries(employeesGroups)
    .map(([employee, items]) => ({
      employee,
      hours: collectHours(items),
      entries: items.length,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5)

  const clientsGroups = groupBy(entries, (entry) => entry.client || "unknown")
  const hoursByClient = Object.entries(clientsGroups)
    .map(([client, items]) => ({
      client,
      hours: collectHours(items),
    }))
    .sort((a, b) => b.hours - a.hours)

  const workTypeGroups = groupBy(entries, (entry) => entry.workType || "unknown")
  const hoursByWorkType = Object.entries(workTypeGroups)
    .map(([workType, items]) => ({
      workType,
      hours: collectHours(items),
    }))
    .sort((a, b) => b.hours - a.hours)

  return {
    totalHours,
    totalEntries,
    uniqueEmployees: Object.keys(employeesGroups).length,
    uniqueClients: Object.keys(clientsGroups).length,
    averageHoursPerEntry: totalEntries ? Number((totalHours / totalEntries).toFixed(2)) : 0,
    topEmployees,
    hoursByClient,
    hoursByWorkType,
    updatedAt: new Date().toISOString(),
  }
}
