import { NextRequest, NextResponse } from "next/server"

import { getEntriesBySheet } from "@/lib/server/google-sheet"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sheetId = searchParams.get("sheetId") ?? undefined
  const isForced = searchParams.has("refresh")

  if (isForced) {
    console.info("[/api/data] manual refresh triggered")
  }

  const { entries, fetchedAt } = await getEntriesBySheet(sheetId)
  const serverTime = new Date().toISOString()

  return NextResponse.json(
    { entries, totalEntries: entries.length, fetchedAt, serverTime },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    },
  )
}
