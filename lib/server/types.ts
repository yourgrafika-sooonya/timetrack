export type SheetSource = {
  /** Google Sheet document ID */
  id: string
  /** Понятное имя листа (для логов и UI) */
  name: string
  /** Необязательный идентификатор вкладки (gid) */
  gid?: string
  /** Таймзона для нормализации дат (по умолчанию Europe/Moscow) */
  timezone?: string
  /** Год по умолчанию, если в таблице указаны только день и месяц */
  defaultYear?: number
}

export interface TimeEntry {
  id: string
  sheetId: string
  sheetName: string
  rowIndex: number
  date: string
  dateLabel: string
  hours: number
  rawHours: string
  client: string
  task: string
  workType: string
  employee: string
  description?: string
}

export interface FiltersResponse {
  employees: string[]
  clients: string[]
  workTypes: string[]
  sheets: Array<{ id: string; name: string }>
  dateRange: { from: string; to: string } | null
  totalEntries: number
}

export interface AnalyticsSummary {
  totalHours: number
  totalEntries: number
  uniqueEmployees: number
  uniqueClients: number
  averageHoursPerEntry: number
  topEmployees: Array<{ employee: string; hours: number; entries: number }>
  hoursByClient: Array<{ client: string; hours: number }>
  hoursByWorkType: Array<{ workType: string; hours: number }>
  updatedAt: string
  fetchedAt?: string
  serverTime?: string
}
