import { NextResponse } from "next/server"

export const revalidate = 60

export function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() })
}
