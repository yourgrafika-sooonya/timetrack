import { NextRequest, NextResponse } from "next/server"

import { getEntriesBySheet } from "@/lib/server/google-sheet"

export const revalidate = 60

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sheetId = searchParams.get("sheetId") ?? undefined
  const forceRefresh = searchParams.has("refresh")

  const entries = await getEntriesBySheet(sheetId, forceRefresh)

  return NextResponse.json(
    { entries, total: entries.length },
    { status: 200, headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } },
  )
}
