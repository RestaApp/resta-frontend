# Resta — backend handoff

**Что нужно от бэкенда** для активации фич, которые уже подготовлены на фронте.
UI/engineering — [`AI_DEVELOPMENT_GUIDELINES.md`](AI_DEVELOPMENT_GUIDELINES.md). Канон проекта — [`.cursorrules`](.cursorrules).

Иерархия документов и приоритет — см. [`.cursorrules`](.cursorrules).

**Если фактический API расходится с этим файлом** — сначала обновить `HANDOFF.md`, потом фронт. Не подгонять типы и endpoints под «как сейчас на бэке» без фиксации контракта здесь.

---

## ⚡ Что нужно от бэкенда (TODO)

> Проверено против кода `resta_backend` на ветке `main` (перепроверено 29.06.2026; полностью готовые на фронте и бэке контракты удалены). В файле — **только невыполненное**: блокеры (🔴), желательные доработки (🟡) и нереализованные на бэке фичи (§1–§3).

### ✅ Закрыто на бэке (в PR, ждёт merge/деплой)

**1. Фильтр смен по заведению** — `GET /api/v1/shifts?user_id=<id>` фильтрует на сервере (`ShiftFilterService#filter_by_owner`). Фронт уже шлёт `user_id`; клиентская дофильтровка по `ownerId` в `VenueListingsDrawer` оставлена как защитный no-op (deploy-safe), убрать можно после деплоя бэка. *(resta_backend PR #21)*

**2. Детерминизм `application_for`** — возвращает самую свежую активную заявку (`max_by [created_at, id]`), одинаково во всех эндпоинтах. *(resta_backend PR #16)*

### 🟡 Желательно (не блокирует — фронт деградирует штатно)

| # | Что добавить | Сейчас | Зачем |
| - | ------------ | ------ | ----- |
| 3 | `completed_shifts` в `UserBlueprint` (`GET /users/:id`) | поля нет, фронт считает сам из `my_shifts` | KPI «Смен» станет точным (вся история, а не только активные смены) |
| 4 | `earned_total_byn` (сумма оплат по `completed`) | поля нет | KPI «Заработок» сотрудника; сейчас `—` |
| 6 | `PATCH /api/v1/me { theme }` | хранения нет | синхронизация темы между устройствами; сейчас только `localStorage` |
| 7 | In-app `Notification`-записи для **new-shift / urgent** | по этим типам бэк шлёт только в Telegram | события **заявок** (created/accepted/rejected/cancelled) уже пишут in-app записи — *resta_backend PR #20*. Остались broadcast-типы new-shift/urgent (другие сервисы) |

---

## Терминология

| Контекст | Канон | Не использовать в контрактах |
| -------- | ----- | ---------------------------- |
| Роль аккаунта (API) | `employee` · `restaurant` · `supplier` · `unverified` | `venue` |
| Срочная смена | `urgent: boolean` | `is_sos` |
| Продвижение в ленте | `boosted: boolean`, `boost_position?: number` | `is_boosted` |
| Принятие кандидата | `application.status = 'accepted'`, `shift.status = 'filled'` | `hired` |

На фронте `venue` — только внутренний UI‑alias навигации (`UiRole`), в API и `HANDOFF` — всегда `restaurant`.

---

## Готовые точки на фронте

| Фича                    | Компонент / место                                                                                                      | Без бэка                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| KPI профиля             | [`ProfileOverview`](src/shared/ui/user-profile/components/ProfileOverview.tsx), [`KpiRow`](src/components/ui/kpi-row.tsx) | `—` в заработке (нет `earned_total_byn`) |
| Accept / Reject заявок  | [`shiftsApi.ts`](src/services/api/shiftsApi.ts) — `acceptApplication` / `rejectApplication`                            | статус меняется; контакты не отдаются (§1) |
| AI-match                | список кандидатов R04                                                                                                  | бейдж скрыт                      |

RTK Query: новые endpoints — `src/services/api/*Api.ts` + импорт в [`services/api/index.ts`](src/services/api/index.ts).

---

## 1. Accept / Reject заявок — открытие контактов (R06)

Статусы заявки: `pending` · `accepted` · `rejected`.
Статусы смены: `open` · `filled` · `completed` · `cancelled`.

```
POST /api/v1/shift_applications/:id/accept
  effect:  application.status = 'accepted',
           shift.status = 'filled',
           shift.selected_applicant_id = user_id,
           контакты доступны обеим сторонам
  returns: { contact: { telegram_username: string|null, phone: string|null } }

POST /api/v1/shift_applications/:id/reject
  effect:  application.status = 'rejected'
```

**Статус:** мутации `acceptApplication` / `rejectApplication` уже в [`shiftsApi.ts`](src/services/api/shiftsApi.ts), смена статуса работает. ⚠️ **Осталось на бэке:** `accept` сейчас возвращает только `{ message }` — поле `contact` (`telegram_username` / `phone`) **не отдаётся**. Без него ключевой цикл «принят → обменялись контактами» не закрывается.

Не использовать статус `hired` и endpoint `/applications/:id/hire`.

---

## 3. Тема пользователя — ⛔ на бэкенде нет

`PATCH /api/v1/me { theme }` в `API.md` отсутствует. Тема остаётся только в `localStorage` ([`theme.ts`](src/utils/theme.ts)). Если появится серверное хранение — читать при старте сессии, `setTheme` единая точка записи.

---

## После интеграции

```bash
npm run lint && npm run format:check && npm run build
```

Компоненты подключены через props/RTK Query — правки UI не требуются, если контракты совпадают с этим документом.

**Новые контракты** — дописывать сюда, не в чат и не в `.cursorrules`.
