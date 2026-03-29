import type { ReactNode } from "react"

import { Sidebar } from "@/components/dashboard/sidebar"

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="ml-64 flex min-h-screen flex-1 flex-col bg-background">
        {children}
      </div>
    </div>
  )
}
