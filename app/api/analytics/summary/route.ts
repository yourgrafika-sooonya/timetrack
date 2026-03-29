import { NextResponse } from "next/server"

import { getAnalyticsSummary } from "@/lib/server/analytics"

export const revalidate = 180

export async function GET() {
  const summary = await getAnalyticsSummary()
  return NextResponse.json(summary, { headers: { "Cache-Control": "public, s-maxage=180" } })
}
