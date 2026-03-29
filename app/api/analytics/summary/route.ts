import { NextResponse } from "next/server"

import { getAnalyticsSummary } from "@/lib/server/analytics"

export const revalidate = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const forceRefresh = searchParams.has("refresh")
  const summary = await getAnalyticsSummary(forceRefresh)
  return NextResponse.json(summary, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
  })
}
