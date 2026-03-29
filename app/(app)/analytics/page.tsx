import { BarChart3 } from "lucide-react"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Расширенная аналитика"
        highlightWord="аналитика"
        subtitle="Дополнительные отчёты появятся после подключения новых срезов"
      />

      <div className="p-8 grid gap-6 lg:grid-cols-2">
        <Card className="border border-sidebar-border/70 bg-background/70">
          <CardHeader>
            <CardTitle>Прогноз загрузки</CardTitle>
            <CardDescription>Сводные графики по неделям и проектам</CardDescription>
          </CardHeader>
          <CardContent>
            <Empty className="border border-dashed border-muted/30 bg-muted/5 py-12">
              <EmptyHeader>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
                <EmptyTitle>Прогноз в разработке</EmptyTitle>
              </EmptyHeader>
              <EmptyDescription>
                После подключения дополнительных таблиц с план-фактами здесь появится интерактивный график прогнозной
                загрузки и сравнение с целевыми KPI.
              </EmptyDescription>
            </Empty>
          </CardContent>
        </Card>

        <Card className="border border-sidebar-border/70 bg-background/70">
          <CardHeader>
            <CardTitle>Сегменты бизнеса</CardTitle>
            <CardDescription>Аналитика по департаментам и направлениям</CardDescription>
          </CardHeader>
          <CardContent>
            <Empty className="border border-dashed border-muted/30 bg-muted/5 py-12">
              <EmptyHeader>
                <EmptyTitle>Ещё немного терпения</EmptyTitle>
              </EmptyHeader>
              <EmptyDescription>
                Используйте текущий дашборд для мониторинга часов. В этом разделе скоро появятся тепловые карты и
                сегментация с деталью до отдельных команд.
              </EmptyDescription>
            </Empty>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
