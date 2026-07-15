# Resta — backend handoff

**Что нужно от бэкенда** для активации фич, которые уже подготовлены на фронте.
UI/engineering — [`AI_DEVELOPMENT_GUIDELINES.md`](AI_DEVELOPMENT_GUIDELINES.md). Канон проекта — [`.cursorrules`](.cursorrules).

Иерархия документов и приоритет — см. [`.cursorrules`](.cursorrules).

**Если фактический API расходится с этим файлом** — сначала обновить `HANDOFF.md`, потом фронт. Не подгонять типы и endpoints под «как сейчас на бэке» без фиксации контракта здесь.

---

## ⚡ Что нужно от бэкенда (TODO)

> Проверено против кода `resta_backend` на ветке `main` 15.07.2026. В файле — **только невыполненное**: блокеры (🔴), желательные доработки (🟡) и ещё не замёрженные контракты.

### 🔴 Блокирует фичи (фронт готов, ждёт бэк)

**1. Фильтр смен по заведению (для экрана «Все вакансии заведения»)**

Файл: `app/controllers/api/v1/shifts_controller.rb` (`filter_params`) + `app/queries/shifts_query.rb`.
Сейчас `GET /api/v1/shifts` не умеет фильтровать по владельцу — `filter_params` не пермитит `user_id`, в `ShiftsQuery` нет `filter_by_user`. Нужно принять `user_id` и вернуть открытые вакансии этого заведения:

```
GET /api/v1/shifts?user_id=42&shift_type=vacancy
→ только открытые смены/вакансии, где shift.user_id = 42
```

Фронт уже готов (кнопка «Все вакансии и смены» на профиле заведения, `VenueListingsDrawer`): шлёт `user_id` и временно дофильтровывает по `ownerId` на клиенте (грузит ленту целиком — неэффективно).

### 🟡 Желательно (не блокирует — фронт деградирует штатно)

| #   | Что добавить                                            | Сейчас                                     | Зачем                                                               |
| --- | ------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| 3   | `completed_shifts` в `UserBlueprint` (`GET /users/:id`) | поля нет, фронт считает сам из `my_shifts` | KPI «Смен» станет точным (вся история, а не только активные смены)  |
| 4   | `earned_total_byn` (сумма оплат по `completed`)         | поля нет                                   | KPI «Заработок» сотрудника; сейчас `—`                              |
| 6   | `PATCH /api/v1/me { theme }`                            | хранения нет                               | синхронизация темы между устройствами; сейчас только `localStorage` |

---

## Терминология

| Контекст            | Канон                                                        | Не использовать в контрактах |
| ------------------- | ------------------------------------------------------------ | ---------------------------- |
| Роль аккаунта (API) | `employee` · `restaurant` · `supplier` · `unverified`        | `venue`                      |
| Срочная смена       | `urgent: boolean`                                            | `is_sos`                     |
| Продвижение в ленте | `boosted: boolean`, `boost_position?: number`                | `is_boosted`                 |
| Принятие кандидата  | `application.status = 'accepted'`, `shift.status = 'filled'` | `hired`                      |

На фронте `venue` — только внутренний UI‑alias навигации (`UiRole`), в API и `HANDOFF` — всегда `restaurant`.

---

## Готовые точки на фронте

| Фича                   | Компонент / место                                                                                                         | Без бэка                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| KPI профиля            | [`ProfileOverview`](src/shared/ui/user-profile/components/ProfileOverview.tsx), [`KpiRow`](src/components/ui/kpi-row.tsx) | `—` в заработке (нет `earned_total_byn`)                                                               |
| Accept / Reject заявок | [`shiftsApi.ts`](src/services/api/shiftsApi.ts) — `acceptApplication` / `rejectApplication`                               | статус меняется; профиль после accept уже может получить контакты, но ответ accept их не содержит (§1) |
| AI-match               | список кандидатов R04                                                                                                     | бейдж скрыт                                                                                            |

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

**Статус:** мутации `acceptApplication` / `rejectApplication` уже в [`shiftsApi.ts`](src/services/api/shiftsApi.ts), смена статуса работает. После `accepted` политика `UserPolicy#show_contacts?` уже разрешает повторно получить профиль сотрудника с контактами. 🟡 **Желательное улучшение:** `accept` сейчас возвращает только `{ message }`; поле `contact` позволит показать контакты сразу, без дополнительного запроса профиля.

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
