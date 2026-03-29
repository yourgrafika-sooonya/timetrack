import { NextRequest, NextResponse } from "next/server"

import { getEntriesBySheet } from "@/lib/server/google-sheet"

export const revalidate = 300

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sheetId = searchParams.get("sheetId") ?? undefined

  const entries = await getEntriesBySheet(sheetId)

  return NextResponse.json({ entries, total: entries.length }, { status: 200 })
}
