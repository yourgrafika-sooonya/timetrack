import { Building2 } from "lucide-react"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function ClientsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Заказчики"
        highlightWord="Заказчики"
        subtitle="Анализируйте загрузку клиентов и пайплайн"
      />

      <div className="p-8">
        <Card className="border border-sidebar-border/70 bg-background/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Портфель клиентов</CardTitle>
            <Button size="sm" disabled>
              В разработке
            </Button>
          </CardHeader>
          <CardContent>
            <Empty className="border border-dashed border-muted/30 bg-muted/5 py-12">
              <EmptyHeader>
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <EmptyTitle>Визуализация заказчиков скоро появится</EmptyTitle>
              </EmptyHeader>
              <EmptyDescription>
                Здесь будут отчёты по выручке, активности и прогнозу часов по каждому заказчику. Добавьте Google Sheet с
                CRM-показателями, чтобы получить более глубокую аналитику.
              </EmptyDescription>
            </Empty>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
