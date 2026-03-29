"use client"

import { Bell, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  title: string
  highlightWord?: string
  subtitle?: string
}

export function Header({ title, highlightWord, subtitle }: HeaderProps) {
  const renderTitle = () => {
    if (highlightWord && title.includes(highlightWord)) {
      const parts = title.split(highlightWord)
      return (
        <>
          {parts[0]}
          <span style={{ color: '#e91b3b' }}>{highlightWord}</span>
          {parts[1]}
        </>
      )
    }
    return title
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background px-8 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{renderTitle()}</h1>
          {subtitle && <p className="text-base text-muted-foreground mt-2">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Поиск..." 
              className="w-64 pl-10 bg-background border-border focus:border-primary"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative border border-border">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">
              3
            </span>
          </Button>

          {/* User */}
          <button className="flex items-center gap-3 rounded-lg px-3 py-2 border border-border hover:border-muted-foreground transition-colors">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">АИ</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Админ</p>
              <p className="text-xs text-muted-foreground">Менеджер</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  )
}
