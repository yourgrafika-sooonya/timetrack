import { Clock } from "lucide-react"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function TimeTrackingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Учёт времени"
        highlightWord="времени"
        subtitle="Следите за активностью команд и проектами"
      />

      <div className="p-8">
        <Card className="border border-sidebar-border/70 bg-background/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Журналы учёта</CardTitle>
            <Button size="sm" variant="outline" disabled>
              Подключите Google Sheet
            </Button>
          </CardHeader>
          <CardContent>
            <Empty className="border border-dashed border-muted/30 bg-muted/5 py-12">
              <EmptyHeader>
                <Clock className="h-8 w-8 text-muted-foreground" />
                <EmptyTitle>История записей будет добавлена</EmptyTitle>
              </EmptyHeader>
              <EmptyDescription>
                Здесь появится единый список последних логов с возможностью фильтрации по сотрудникам, проектам и
                заказчикам. Используйте кнопку «Обновить данные» на дашборде, чтобы получать свежие часы уже сейчас.
              </EmptyDescription>
            </Empty>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
