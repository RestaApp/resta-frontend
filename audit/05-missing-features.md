# E. Missing or incomplete features

## Таблица готовности

| Фича | FE | BE | Вердикт | Что не так |
|---|---|---|---|---|
| Контакты по доступу (избранный/принятый/PRO) | ❌ | ❌ | **P0** | `UserBlueprint` отдаёт контакты всем (= C1); FE рендерит `tel:`/`mailto:` любому (`ProfileOverview.tsx:60-63`). Нет ни гейта на BE, ни paywall на FE |
| Передача контактов при `accept` | 🟡 | 🟡 | **P0** | `shift_applications#accept` возвращает только `{message}`; HANDOFF §2 требует `{contact:{telegram_username,phone}}`. Ключевой цикл «принят → обменялись контактами» контакты не доставляет |
| In-app инбокс уведомлений | ✅ | 🟡 | **P1** | Только `review_reminder_notification_service` создаёт `Notification`-записи. Accept/reject/new-shift/new-application/urgent идут **только в Telegram** → колокольчик/инбокс практически пусты (вопреки ROADMAP «10 типов») |
| Модерация отзывов | ❌ | ❌ | **P1** | `Review#approve?/reject?/hide?` существуют (`review.rb:75-95`), но не вызываются ниоткуда (всё TODO). Отзывы на сотрудников зависают в `pending` без пути к публикации |
| `application_for` детерминизм | 🟡 | 🟡 | **P1** | `concerns/shift_applications_logic.rb:24` `.find{...}` без сортировки → при повторных заявках статус смены в фиде и в списке заявок расходятся |
| invite-to-shift (ресторан→сотрудник) | 🟡 | ❌ | **P2** | UI+мутация есть, backend не поддерживает `user_id`; выключено `STAFF_INVITE_ENABLED=false`. Реализовать эндпоинт или удалить мёртвый код |
| Запрос прайс-листа у поставщика | 🟡 | 🟡 | **P2** | Только трекинг `price_list_requested` (`UserProfileDrawer.tsx:62`); DM поставщику не уходит (вопреки USER_FLOWS §10) |
| Профильные KPI (`completed_shifts`, `earned_total`) | 🟡 | ❌ | — | Полей нет в API, FE считает клиентски/показывает `—`. Деградирует мягко, не блокер |
| Match-score badge («AI») | 🟡 | ❌ | — | Скрыто до появления поля. Отложено намеренно |
| Серверная синхронизация темы | 🟡 | ❌ | — | localStorage-only; нет `PATCH /me {theme}`. Приемлемо |

## Легенда

- ✅ полностью · 🟡 частично · ❌ заглушка/нет
- States на FE (valid/error/loading/empty) проверены для всех ✅-фич — присутствуют.
