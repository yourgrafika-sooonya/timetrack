"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"

const menuItems = [
  { id: "dashboard", label: "Дашборд", icon: LayoutDashboard, href: "/dashboard" },
  { id: "employees", label: "Сотрудники", icon: Users, href: "/employees" },
  { id: "clients", label: "Заказчики", icon: Building2, href: "/clients" },
  { id: "time", label: "Учёт времени", icon: Clock, href: "/time-tracking" },
  { id: "analytics", label: "Аналитика", icon: BarChart3, href: "/analytics" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">TimeTrack</h1>
              <p className="text-xs text-muted-foreground">Аналитика времени</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-sidebar-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
                prefetch
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/80 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Settings className="h-5 w-5" />
            Настройки
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/80 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <LogOut className="h-5 w-5" />
            Выход
          </button>
        </div>
      </div>
    </aside>
  )
}
