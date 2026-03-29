# Timetrack dashboard

Next.js 15 App Router приложение c клиентской визуализацией и минимальным backend для агрегирования данных рабочего времени из публичных Google Sheets.

## Backend API

| Метод | Route | Назначение |
|-------|-------|------------|
| `GET` | `/api/health` | Проверка живости backend. Возвращает `{ status: "ok" }`. |
| `GET` | `/api/data?sheetId=...` | Сырые записи (агрегация по двум листам). Поддерживает фильтр `sheetId`. |
| `GET` | `/api/filters` | Множества сотрудников, заказчиков, типов работ, список листов и диапазон дат. |
| `GET` | `/api/analytics/summary` | Общие метрики: суммарные часы, ТОП сотрудников, разбивка по заказчикам/видам работ. |

Все обработчики используют Route Handlers App Router и читают данные из Google Sheets → CSV (`/export?format=csv`). Запросы кешируются через `fetch` + React `cache()` и уважают лимиты Vercel Hobby.

## Переменные окружения

Создайте файл `.env.local` на основе [`env.example`](env.example):

```env
GOOGLE_SHEETS_SOURCES=[
  {
    "id": "1zavGOGsAvlmqN3dPfU_OYaTTtC158HVEWZnivpagqZQ",
    "name": "Timesheet A",
    "defaultYear": 2024
  },
  {
    "id": "1uqseFKIV1NGbvcYOums0UAUTRVvZwcwRTi9oFJv5JwQ",
    "name": "Timesheet B",
    "defaultYear": 2024
  }
]
SHEETS_CACHE_SECONDS=300
ANALYTICS_CACHE_SECONDS=180
DEFAULT_TIMEZONE=Europe/Moscow
```

Без указания `GOOGLE_SHEETS_SOURCES` backend использует такую же дефолтную конфигурацию. Чтобы добавить приватные листы, нужно хранить JSON с объектами `{ id, name, gid?, timezone?, defaultYear? }`.

## Локальный запуск

```bash
npm install
npm run dev
```

### Проверка API

- `curl http://localhost:3000/api/health`
- `curl http://localhost:3000/api/data`
- `curl "http://localhost:3000/api/data?sheetId=1zavG..."`
- `curl http://localhost:3000/api/filters`
- `curl http://localhost:3000/api/analytics/summary`

## Внутренние модули

| Файл | Назначение |
|------|------------|
| [`lib/server/types.ts`](lib/server/types.ts) | Типы DTO для записей, фильтров и аналитики. |
| [`lib/server/env.ts`](lib/server/env.ts) | Чтение env + дефолтные источники. |
| [`lib/server/google-sheet.ts`](lib/server/google-sheet.ts) | Загрузка CSV, нормализация и кеширование записей. |
| [`lib/server/analytics.ts`](lib/server/analytics.ts) | Агрегаторы фильтров и summary. |

## Ограничения

- Google Sheets должны быть публичными (доступ по ссылке) — иначе нужен сервисный аккаунт.
- CSV-парсинг выполняется на Node.js runtime; для больших таблиц (>5k строк) рекомендуется уменьшить revalidate и ввести пагинацию.
- Храните токены/конфиги в `Vercel Environment Variables`, чтобы не коммитить приватные данные.

## TODO

- Подключить UI к API (Server Components/SWR).
- Добавить тесты на агрегации.
- Перейти на приватный доступ и/или базу данных для истории изменений.
