import { NextResponse } from "next/server"

import { getAnalyticsSummary } from "@/lib/server/analytics"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const debug = searchParams.has("debug")
  const summary = await getAnalyticsSummary({ forceRefresh: true, debug })
  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  })
}
