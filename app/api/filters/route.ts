import { NextResponse } from "next/server"

import { getFilters } from "@/lib/server/analytics"

export const revalidate = 600

export async function GET() {
  const filters = await getFilters()
  return NextResponse.json(filters)
}
