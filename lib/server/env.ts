import { SheetSource } from "./types"

const FALLBACK_SOURCES: SheetSource[] = [
  {
    id: "1zavGOGsAvlmqN3dPfU_OYaTTtC158HVEWZnivpagqZQ",
    name: "Timesheet A",
    defaultYear: 2024,
  },
  {
    id: "1uqseFKIV1NGbvcYOums0UAUTRVvZwcwRTi9oFJv5JwQ",
    name: "Timesheet B",
    defaultYear: 2024,
  },
]

function parseSources(): SheetSource[] {
  const raw = process.env.GOOGLE_SHEETS_SOURCES
  if (!raw) {
    return FALLBACK_SOURCES
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return FALLBACK_SOURCES
    }

    return parsed.map((item) => ({
      id: String(item.id),
      name: String(item.name ?? item.id),
      gid: item.gid ? String(item.gid) : undefined,
      timezone: item.timezone ? String(item.timezone) : undefined,
      defaultYear: item.defaultYear ? Number(item.defaultYear) : undefined,
    }))
  } catch (error) {
    console.warn("Failed to parse GOOGLE_SHEETS_SOURCES env, fallback used", error)
    return FALLBACK_SOURCES
  }
}

export const sheetSources: SheetSource[] = parseSources()

const defaultCacheSeconds = process.env.NODE_ENV === "production" ? 60 : 0

export const sheetsCacheSeconds = Number(process.env.SHEETS_CACHE_SECONDS ?? defaultCacheSeconds)
export const analyticsCacheSeconds = Number(process.env.ANALYTICS_CACHE_SECONDS ?? defaultCacheSeconds)
export const defaultTimezone = process.env.DEFAULT_TIMEZONE ?? "Europe/Moscow"
export const isProduction = process.env.NODE_ENV === "production"
