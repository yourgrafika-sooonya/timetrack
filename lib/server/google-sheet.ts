import Papa from "papaparse"

import { sheetSources } from "./env"
import type { SheetSource, TimeEntry } from "./types"

const CSV_ENDPOINT = "https://docs.google.com/spreadsheets/d"

type RawRow = Record<string, unknown>

function normalizeKey(key: string) {
  return key
    .toLowerCase()
    .replace(/\ufeff/g, "")
    .replace(/[^a-z0-9\u0430-\u044f\u0401\u0451]/g, "")
}

function toNumberHours(value: unknown): number {
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "string") {
    const normalized = value.replace(",", ".")
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function normalizeDate(value: string, source: SheetSource): { iso: string; label: string } {
  const targetYear = source.defaultYear ?? new Date().getFullYear()
  const [dayStr, monthStr, yearStr] = value.split(/[.]/)

  const day = Number(dayStr)
  const month = Number(monthStr) - 1
  const year = yearStr ? Number(yearStr) : targetYear

  const date = new Date(Date.UTC(year, month, day))

  return {
    iso: date.toISOString(),
    label: value,
  }
}

type ColumnDescriptor = { key: string; normalized: string }

function pickValue(
  row: RawRow,
  columns: ColumnDescriptor[],
  candidates: string[],
  fallbackIndex: number,
) {
  for (const column of columns) {
    if (candidates.some((candidate) => column.normalized.includes(candidate))) {
      return String(row[column.key] ?? "").trim()
    }
  }

  const fallbackColumn = columns[fallbackIndex]
  if (!fallbackColumn) return ""
  return String(row[fallbackColumn.key] ?? "").trim()
}

function normalizeRow(row: RawRow, index: number, source: SheetSource): TimeEntry | null {
  const columnKeys = Object.keys(row)
  if (!columnKeys.length) return null

  const columns: ColumnDescriptor[] = columnKeys.map((key) => ({ key, normalized: normalizeKey(key) }))

  const dateCell = pickValue(row, columns, ["дата", "date"], 0)
  const client = pickValue(row, columns, ["заказ", "client"], 1)
  const task = pickValue(row, columns, ["задач", "task", "опис"], 2)
  const hoursRaw = pickValue(row, columns, ["час", "hour"], 3) || "0"
  const workType = pickValue(row, columns, ["вид", "type"], 4)
  const employee = pickValue(row, columns, ["фам", "сотр", "employee", "name"], columns.length - 1)

  if (!dateCell || !hoursRaw || !employee) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[sheets] skip row ${index} (${source.name})`, {
        dateCell,
        hoursRaw,
        employee,
      })
    }
    return null
  }

  const { iso, label } = normalizeDate(dateCell, source)
  const hours = toNumberHours(hoursRaw)

  return {
    id: `${source.id}-${index}`,
    sheetId: source.id,
    sheetName: source.name,
    rowIndex: index,
    date: iso,
    dateLabel: label,
    hours,
    rawHours: hoursRaw,
    client,
    task,
    workType,
    employee,
  }
}

async function fetchSheet(source: SheetSource): Promise<TimeEntry[]> {
  const gidParam = source.gid ? `/export?format=csv&gid=${source.gid}` : "/export?format=csv"
  const url = `${CSV_ENDPOINT}/${source.id}${gidParam}`
  const fetchStarted = Date.now()
  const fetchedAt = new Date().toISOString()

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    throw new Error(`Failed to load sheet ${source.id}: ${response.status}`)
  }

  const csv = await response.text()
  const parsed = Papa.parse<RawRow>(csv, { header: true })

  if (parsed.errors.length) {
    console.warn(`CSV parse errors for sheet ${source.id}`, parsed.errors.slice(0, 3))
  }

  const entries = parsed.data
    .map((row: RawRow, index: number) => normalizeRow(row, index + 2, source))
    .filter((row): row is TimeEntry => Boolean(row))

  console.info(`[sheets] ${source.name}`, {
    fetchedAt,
    durationMs: Date.now() - fetchStarted,
    rawRows: parsed.data.length,
    normalizedEntries: entries.length,
    sampleRowIndex: entries.slice(0, 3).map((entry) => entry.rowIndex),
  })

  return entries
}

type LoadedEntries = {
  entries: TimeEntry[]
  fetchedAt: string
}

async function loadEntries(): Promise<LoadedEntries> {
  const startedAt = Date.now()
  const entriesArrays = await Promise.all(sheetSources.map((source) => fetchSheet(source)))
  const entries = entriesArrays.flat()
  const fetchedAt = new Date().toISOString()

  console.info("[sheets] aggregated", {
    fetchedAt,
    durationMs: Date.now() - startedAt,
    totalEntries: entries.length,
    sample: entries.slice(0, 3).map((entry) => ({ sheetId: entry.sheetId, rowIndex: entry.rowIndex })),
  })

  return { entries, fetchedAt }
}

export async function getAllEntries(): Promise<LoadedEntries> {
  return loadEntries()
}

export async function getEntriesBySheet(sheetId?: string): Promise<LoadedEntries> {
  const { entries, fetchedAt } = await getAllEntries()
  if (!sheetId) {
    return { entries, fetchedAt }
  }
  return {
    entries: entries.filter((entry) => entry.sheetId === sheetId),
    fetchedAt,
  }
}

export function groupBy<T, Key extends string | number>(items: T[], getKey: (item: T) => Key) {
  return items.reduce<Record<Key, T[]>>((acc, item) => {
    const key = getKey(item)
    if (!acc[key]) {
      acc[key] = [] as T[]
    }
    acc[key].push(item)
    return acc
  }, {} as Record<Key, T[]>)
}
