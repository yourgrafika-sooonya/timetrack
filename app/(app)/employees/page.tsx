import { Users } from "lucide-react"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function EmployeesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Команда"
        highlightWord="Команда"
        subtitle="Просматривайте структуру и вовлечённость сотрудников"
      />

      <div className="p-8">
        <Card className="border border-sidebar-border/70 bg-background/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>База сотрудников</CardTitle>
            <Button size="sm" variant="outline" disabled>
              Скоро
            </Button>
          </CardHeader>
          <CardContent>
            <Empty className="border border-dashed border-muted/30 bg-muted/5 py-12">
              <EmptyHeader>
                <Users className="h-8 w-8 text-muted-foreground" />
                <EmptyTitle>Список сотрудников появится здесь</EmptyTitle>
              </EmptyHeader>
              <EmptyDescription>
                После подключения внутренних HR-данных вы сможете просматривать карточки сотрудников, их роль,
                загрузку и историю участия в проектах.
              </EmptyDescription>
            </Empty>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
