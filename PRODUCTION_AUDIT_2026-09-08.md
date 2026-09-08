# Resta: аудит готовности к продакшену — 8 сентября 2026

> Ниже — исходный аудит до исправлений. После него выполнен отдельный проход по двум вкладкам Google Docs: исправлены frontend-фото отзывов, счётчик смен, UI-модерация, переход к откликам и другие пункты. Актуальный статус и остаточные ограничения: [DOCUMENT_REVIEW_2026-09-08.md](/Users/Inessa/Downloads/Resta/DOCUMENT_REVIEW_2026-09-08.md). Backend/security-риски исходного аудита этим проходом не закрыты.

## Вывод

Текущий `main` я не рекомендую принимать как готовый к широкому запуску. Есть воспроизведённый обход срока Telegram-авторизации, отсутствие авторизации административных Telegram-команд, ошибки отзывов и незавершённые сценарии монетизации. Успешная сборка и зелёный backend CI этих проблем не исключают.

Это инженерный аудит критических цепочек и конфигурации, а не утверждение, что каждый файл и экран проверен. Код приложения не исправлялся. Ни деплой, ни workflow, ни реальные платежи, ни сообщения пользователям не запускались.

## Проверенная версия и проверки

- Фронт: `fe79632e76ee08ca09de84b70afb695de79ca745`, совпадает с `origin/main` после fetch.
- Бэкенд: `80b24db04d5f57c08f24089a021b93a1129ea56d`, актуальный `origin/main`, отдельный worktree `/private/tmp/resta-backend-audit-20260908`.
- Рабочий бэкенд пользователя остался на `agent/fix-rejected-reapplication`, `246273c`; staged-правка spec сохранена. Эта ветка не является актуальным main и разрешает повторный отклик после отказа, вопреки текущему правилу main.
- Фронт локально: 50 файлов тестов, 247 тестов — PASS; lint — 0 ошибок, 1 предупреждение TanStack Virtual; TypeScript + production build — PASS. Предупреждение о крупном чанке само по себе не блокер.
- [Frontend CI на проверенном SHA](https://github.com/RestaApp/resta-frontend/actions/runs/31628346099) — FAILURE: `Invalid URL`, затем таймауты API-тестов.
- [Backend CI на проверенном SHA](https://github.com/RestaApp/resta_backend/actions/runs/34055931092) — SUCCESS: RSpec, RuboCop, Brakeman, bundle audit. Это проверенный удалённый результат, не локальный прогон.
- Полный локальный Rails/RSpec не запускался: в shell Ruby 2.6 вместо требуемой 3.3.5, нужный Bundler отсутствует. Отдельная проверка авторизации выполнена в Ruby 3.3 Docker сначала с ActiveModel 7.2.2, затем подтверждена с точной версией 7.2.3.2 из backend lockfile; исходник валидатора подключён read-only, данные вымышленные. Скрипт: `/private/tmp/resta-auth-audit-20260908.rb`. Docker-образ `ruby:3.3-slim` загружен локально; контейнеры после проверки удалены автоматически.
- Воспроизведены отдельно: неверный `success?` после просроченной Telegram-подписи; `short_comment` на `nil`; извлечение ID из JWT с `user_id`; падение frontend API-теста при пустом `VITE_API_URL`.

Классификация: REAL — установленный дефект; UNKNOWN — требуется дополнительная проверка окружения или продуктового решения. Для REAL отдельно указано, где есть исполненное воспроизведение, а где вывод следует из кода. P1 — исправить до запуска затронутого сценария; P2 — исправить до широкой эксплуатации.

## P1: безопасность и целостность основных сценариев

### 1. REAL, воспроизведено: просроченные Telegram initData проходят проверку успеха логина

В [TelegramAuthValidator](/private/tmp/resta-backend-audit-20260908/app/services/telegram_auth_validator.rb:27) `success?` вызывает `valid? && @valid`. Флаг `@valid = true` устанавливается после правильной подписи, до проверки timestamp. Просроченные данные заставляют `call` вернуть false, но [UserAuthenticationService](/private/tmp/resta-backend-audit-20260908/app/services/user_authentication_service.rb:22) игнорирует этот результат и вызывает `success?`. `valid?` повторяет только декларативные проверки наличия полей и очищает ошибки timestamp — это подтверждено [реализацией Rails 7.2](https://api.rubyonrails.org/v7.2/classes/ActiveModel/Validations.html#method-i-valid-3F).

Результат запуска настоящего валидатора с тестовой подписью:

```text
fresh:          call=true,  success?=true
stale_25_hours: call=false, success?=true, errors после success?=[]
```

Последствие: имеющий старые корректно подписанные данные может повторно использовать их после установленного срока. Это не подделка подписи и не вход без каких-либо данных; сломана защита от повторного использования старых данных. HTTP sign_in с реальной БД не вызывался.

Нужно сделать результатом успеха всю цепочку проверки, а вызывающий сервис должен явно проверять результат `call`. Добавить интеграционный тест sign_in на старый корректно подписанный payload без моков валидатора.

### 2. REAL, код: административные тикеты доступны через Telegram без проверки администратора

[TicketsHandler#call](/private/tmp/resta-backend-audit-20260908/app/services/telegram/commands/tickets_handler.rb:6) сразу получает общую очередь обращений. [UpdateRouter](/private/tmp/resta-backend-audit-20260908/app/services/telegram/update_router.rb:9) маршрутизирует `/tickets` без проверки отправителя; BaseHandler её тоже не делает. [TicketCallbackHandler#call](/private/tmp/resta-backend-audit-20260908/app/services/telegram/ticket_callback_handler.rb:23) находит произвольный тикет и выполняет действие. Получение тикета по ID и режим ответа в UpdateRouterHelpers также не проверяют права.

Путь: обычный пользователь пишет боту `/tickets`, получает список и кнопку поиска по ID, затем карточку обращения с действиями. Доступны чужие обращения и административные операции. Проверка секретного заголовка webhook подтверждает Telegram как источник, но не права пользователя Telegram.

Нужна единая серверная авторизация администратора во всех командах, callback и обработчиках продолжения диалога. Проверить отказ для обычного, отсутствующего и деактивированного пользователя. На реальном боте сценарий не выполнялся.

### 3. REAL, код: платное открытие контактов обходится через публичный Telegram username

[UserBlueprint](/private/tmp/resta-backend-audit-20260908/app/blueprints/user_blueprint.rb:12) отдаёт `username` в default view. [ProfileHero](/Users/Inessa/Downloads/Resta/src/shared/ui/user-profile/components/ProfileHero.tsx:38) показывает `@username` до открытия контакта. Сам backend использует это поле как Telegram-контакт — UserAuthenticationService синхронизирует его из Telegram.

Для сотрудника с username заведение получает способ связи из каталога/профиля без покупки пакета. Ограничение `phone/email/telegram_id` не закрывает этот путь. Это относится именно к пассивным кандидатам каталога; бесплатный контакт кандидата, который сам откликнулся, отдельно предусмотрен документацией и не считается ошибкой.

Нужно согласовать состав защищаемого контакта и применить его к сериализации, вложенным объектам и UI. Если username сознательно публичен, продукт должен явно отказаться от обещания платного открытия самого способа связи.

### 4. REAL, код + воспроизведение метода: отзыв без текста ломает сериализацию

Фронт [reviewsApi](/Users/Inessa/Downloads/Resta/src/services/api/reviewsApi.ts:93) при пустом комментарии не отправляет поле. БД разрешает NULL, модель не требует комментарий. Однако [Review#short_comment](/private/tmp/resta-backend-audit-20260908/app/models/review.rb:69) вызывает `comment.length`, а ReviewBlueprint вызывает этот метод при сериализации.

Исполнение точного метода из исходника с `comment=nil` даёт `NoMethodError: undefined method length for nil`. В create запись сохраняется до сериализации; поэтому возможны сохранённый отзыв и ответ 500 одновременно. Этот же отзыв затем ломает сериализацию списка, в который попадает.

Нужен nil-safe сериализатор и request-тесты создания/чтения отзыва только с оценкой, включая отсутствие дубликата при повторной попытке после ошибки ответа.

### 5. REAL, код: возврат Stars не отзывает пакет контактов

[ProcessPurchasePaymentService](/private/tmp/resta-backend-audit-20260908/app/services/payments/process_purchase_payment_service.rb:82) создаёт `ContactRevealPackage` для соответствующего SKU. [ProcessRefundService#call](/private/tmp/resta-backend-audit-20260908/app/services/payments/process_refund_service.rb:27) ищет только Subscription и Purchase. Пакет не находится, refund логируется как неизвестный и завершается без изменения доступа.

Следствие: после возврата денег пакет и уже открытые через него контакты остаются доступными до обычного истечения. У модели пакета даже нет статуса refunded.

Нужны обработка пакетов, явная политика уже потраченных открытий и идемпотентные тесты refund. Реальные деньги не использовались.

### 6. REAL, код: два конкурентных accept могут выбрать двух кандидатов на одну смену

[AcceptService](/private/tmp/resta-backend-audit-20260908/app/services/shift_applications/accept_service.rb:27) проверяет pending/open до транзакции, не блокирует смену и не перечитывает её состояние под блокировкой. Два запроса по разным кандидатам могут оба увидеть open, оба сохранить accepted, затем по очереди перезаписать `selected_applicant_id`.

В [схеме](/private/tmp/resta-backend-audit-20260908/db/structure.sql:1616) уникальность задана для пары пользователь–смена; ограничения «один accepted на смену» нет. Транзакция сама по себе не предотвращает это чередование.

Нужна сериализация переходов на одной записи Shift, повторная проверка внутри блокировки и согласованный порядок блокировок accept/reject/cancel/complete. Проверить параллельными транзакциями на PostgreSQL. Конкурентный тест в этом аудите не запускался.

### 7. REAL, код: на удалённую смену можно откликнуться

[ShiftApplicationsController#set_shift](/private/tmp/resta-backend-audit-20260908/app/controllers/api/v1/shift_applications_controller.rb:88) использует `Shift.find`, а не kept. Удаление смены через ShiftsController вызывает discard, сохраняя open. ShiftPolicy#apply? проверяет open, но не discarded. CreateService также этого не проверяет.

При известном ID удалённой открытой смены прямой create application проходит эти защиты. Аналогично следует проверить accept оставшихся заявок на удалённой смене. Чтение исторических удалённых смен для старого кандидата может быть допустимо; новые действия — отдельный вопрос.

Нужны запрет мутаций discarded-смен на сервере и request-тесты, а не только скрытая кнопка.

### 8. REAL, код: повторное открытие контакта не полностью защищено от конкуренции

[RevealContactService](/private/tmp/resta-backend-audit-20260908/app/services/monetization/reveal_contact_service.rb:61) проверяет `already_revealed?` до блокировки пакета. Два запроса одного заведения к одному сотруднику могут оба пройти проверку. После ожидания блокировки второй не проверяет открытие заново и пытается вставить дубль. Уникальный индекс предотвращает дубль внутри пакета, но ошибка здесь не обработана. При переходе на другой пакет уникальность `(package_id, employee_id)` не защищает от повторного списания между пакетами.

Нужно сериализовать действие на уровне заведения и повторять проверку после получения блокировки. Проверить случаи: два запроса, одно оставшееся открытие, несколько пакетов. PostgreSQL-воспроизведение остаётся обязательной следующей проверкой.

## P2: пользовательские баги и эксплуатация

### 9. REAL, код: ошибка первичного логина оставляет production в загрузке

В [useTelegramAuth](/Users/Inessa/Downloads/Resta/src/app/contexts/telegram/useTelegramAuth.ts:176) catch выставляет ready только в DEV. При первом входе без сохранённой сессии и неуспешном sign_in в production нет ни состояния готовности, ни доступного retry. AuthProvider выводит `isLoading: !telegramReady`.

Нужен явный экран ошибки/повторного входа, а также сценарии offline, 429, 422 и 5xx. В браузере не воспроизводилось; вывод по цепочке состояний.

### 10. REAL, воспроизведено: JWT helper не читает реальное имя поля ID

[JwtTokenService](/private/tmp/resta-backend-audit-20260908/app/services/jwt_token_service.rb:23) выдаёт `user_id`, а [authService](/Users/Inessa/Downloads/Resta/src/services/auth.ts:108) читает только `id`, `sub`, `userId`. Загрузка настоящего frontend-модуля и передача тестового payload `{user_id:123, exp:9999999999}` вернули `null`.

Persisted userData обычно маскирует дефект. Если JWT есть, а сохранённого профиля нет, восстановление через ID токена не работает и требуется новый sign_in.

### 11. REAL, код: refresh после истечения JWT не может восстановить сессию

[rtkQuery](/Users/Inessa/Downloads/Resta/src/shared/api/rtkQuery.ts:75) вызывает refresh после 401 с тем же access token. Backend AuthController#refresh проходит обычный authenticate_user!, а JwtTokenService отклоняет просроченный JWT. Для истечения срока этот путь гарантированно не обновляет сессию. После этого Redux очищается, но AuthContext слушает отдельные browser events, а middleware отправляет только Redux action; ready логин-хука уже true.

Нужно выбрать согласованный механизм: раннее обновление ещё действующего JWT либо повторный Telegram sign_in с валидными данными, синхронизировав AuthContext и store. Не ослаблять проверку срока JWT ради работоспособности refresh.

### 12. REAL, код: KPI сотрудника считает не ту историю, чужому профилю ставит ноль

Backend уже отдаёт `completed_shifts_count` ([UserBlueprint](/private/tmp/resta-backend-audit-20260908/app/blueprints/user_blueprint.rb:57)). Фронт не читает это поле: [свой профиль](/Users/Inessa/Downloads/Resta/src/features/profile/model/hooks/useProfileViewModelData.ts:112) считает completed из my_shifts, который на backend выбирает созданные пользователем смены, а не смены, где он был исполнителем. [Чужой профиль](/Users/Inessa/Downloads/Resta/src/shared/ui/user-profile/useExternalProfileViewModel.ts:107) передаёт `completedShifts: 0`. Карточка кандидата ищет другое имя — `completed_shifts`.

Нужен единый контракт `completed_shifts_count` для трёх поверхностей. HANDOFF утверждает, что поля ещё нет, и требует актуализации.

### 13. REAL, код: «Все вакансии заведения» видит только первые 100 элементов общей ленты

[VenueListingsDrawer](/Users/Inessa/Downloads/Resta/src/shared/ui/user-profile/VenueListingsDrawer.tsx:37) запрашивает page 1/per_page 100 и фильтрует результат по владельцу. Backend filter_params не принимает user_id. Вакансия за пределами первых 100 пропадает; возможно ложное сообщение, что у заведения вакансий нет.

Это не только неэффективность, указанная в HANDOFF, но и потеря полноты результата. Нужны серверный фильтр и пагинация результата конкретного заведения.

### 14. REAL, код: удалённый отзыв продолжает влиять на рейтинг

[ReviewsController#destroy](/private/tmp/resta-backend-audit-20260908/app/controllers/api/v1/reviews_controller.rb:54) делает soft delete. Список использует kept, но [Review.for_rating](/private/tmp/resta-backend-audit-20260908/app/models/review.rb:58) фильтрует только approved. Callback пересчёта не реагирует на discarded_at, counter_cache тоже не уменьшается при discard. Даже последующий пересчёт среднего включает скрытую запись.

Нужно согласовать агрегаты и видимый список и проверить rating/count после discard/undiscard. Сейчас «отзыв исчез, оценка осталась» следует из кода.

### 15. REAL, код: после оплаты пакета контактов нет ожидания backend webhook

[ContactRevealPackagesDrawer](/Users/Inessa/Downloads/Resta/src/features/monetization/ui/ContactRevealPackagesDrawer.tsx:38) сразу вызывает onPurchased после `paid`. [UserProfileDrawer](/Users/Inessa/Downloads/Resta/src/shared/ui/user-profile/UserProfileDrawer.tsx:211) сразу повторяет reveal. Если пакет ещё не появился в БД, получается 402; reveal возвращает false, но callback это значение теряет, а drawer закрывается.

Для создания смен и boost backoff уже есть — их здесь не считаю сломанными. Нужно аналогичное ожидание для пакета контактов и различать «оплачено, обрабатывается» и необходимость новой покупки. В subscription checkout также стоит проверять изменение конкретной подписки/срока: наличие старой active/trial ещё не доказывает зачисление новой оплаты.

### 16. REAL, код: успешный HTTP health скрывает отказ БД/Redis

[HealthController](/private/tmp/resta-backend-audit-20260908/app/controllers/api/v1/health_controller.rb:9) ловит ошибки зависимостей, записывает `database: error`/`redis: error`, но оставляет `status: ok` и HTTP 200. Монитор, проверяющий только HTTP, не заметит отказ. В DEPLOYMENT.md пример использует `/health`, хотя маршруты содержат `/` и `/api/v1/health`.

Нужно разделить liveness/readiness, вернуть неуспешный HTTP при недоступных обязательных зависимостях и проверить фактический путь монитора.

### 17. REAL, код: платёжное событие может быть потеряно при сбое обработки и enqueue

UpdateRouter ставит retry job при исключении обработки оплаты/возврата — это существующая защита. Но если постановка job тоже падает, [WebhooksController](/private/tmp/resta-backend-audit-20260908/app/controllers/telegram/webhooks_controller.rb:12) всё равно возвращает HTTP 200. В таком сценарии событие не обработано и не сохранено для повтора, а успешный ответ уже отправлен.

Нужно подтверждать событие после надёжного сохранения либо возвращать ошибку при невозможности enqueue. Проверить fault injection: ошибка БД + недоступная очередь. Не считать все ошибки webhook потерей платежа: при успешном enqueue существующий retry работает.

### 18. REAL, код: повторный запуск завершения смен не защищён от одновременного исполнения

[CompleteFinishedShiftsJob](/private/tmp/resta-backend-audit-20260908/app/jobs/complete_finished_shifts_job.rb:58) выбирает filled-смены до транзакции и внутри не блокирует/не перечитывает status. Два уже начавшихся прогона могут оба завершить одну смену и дважды увеличить completed_shifts_count. Пересекается с гонкой отклонения принятого кандидата.

Нужно сделать переход атомарным и обновлять счётчик только когда переход действительно выполнен. Обычный последовательный повтор после завершения не воспроизводит эту гонку; нужен параллельный тест.

## Недостающие релизные гарантии

### 19. REAL: frontend CI не воспроизводит локальные зелёные тесты

`API_BASE_URL = import.meta.env.VITE_API_URL`; API-тесты мокают fetch, но не базовый URL. В workflow нет тестового URL. В удалённом логе на текущем SHA: `Failed to parse URL from /api/v1/notifications/1`, затем таймауты. Локальная проверка с пустым VITE_API_URL также падает.

Нужно задать детерминированный тестовый origin в окружении тестов и получить зелёный удалённый CI. Нельзя заменять это увеличением timeout. Production build также не валидирует обязательный API URL — корректность реального Vercel env остаётся UNKNOWN.

### 20. REAL: нет проверенной сквозной защиты основных сценариев

В inspected frontend CI есть lint/unit/build. [Playwright](/Users/Inessa/Downloads/Resta/tests/visual/smoke.spec.ts:52) проверяет только boot screenshot; это не e2e регистрации, отклика или оплаты. В конфигурации дополнительный разрыв: [Playwright](/Users/Inessa/Downloads/Resta/playwright.config.ts:26) ждёт 5173, а [Vite](/Users/Inessa/Downloads/Resta/vite.config.ts:49) по умолчанию запускается на 5174. Без внешнего PORT этот запуск не согласован.

До запуска нужны сквозные сценарии: первый/повторный вход; заполнение каждой роли; создание и удаление смены; отклик/отмена/accept/reject; отзыв без текста; платёж с задержкой webhook; refund пакета; отсутствие доступа к чужим тикетам и закрытым контактам. Telegram WebView нужно отдельно проверить на реальных iOS/Android, включая клавиатуру, safe area и возврат из invoice.

### 21. REAL: frontend runtime errors не попадают в удалённый мониторинг из кода приложения

[ErrorBoundary](/Users/Inessa/Downloads/Resta/src/app/ErrorBoundary.tsx:29) отправляет ошибку только в logger, а [logger.error](/Users/Inessa/Downloads/Resta/src/shared/utils/logger.ts:20) в production ничего не делает. Клиентского отправителя ошибок в проверенном коде нет. Backend Sentry этого не заменяет.

Нужен клиентский сбор исключений с версией релиза и безопасным контекстом; затем проверка доставки тестового исключения. Внешняя инъекция мониторинга платформой не проверялась.

### UNKNOWN: что нельзя подтвердить по репозиториям

- Какие SHA реально развёрнуты в Vercel/Render; соответствуют ли frontend/backend друг другу.
- Реальные значения env и Flipper; webhook secret; разрешённые origins; доступность worker и расписаний.
- Наличие и успешное восстановление резервной копии БД; срок хранения, RPO/RTO и проверенный rollback.
- Алерты на очередь, failed/dead jobs, оплату без выданного права, расхождения refund и доступов.
- Ограничения ресурсов под реальной нагрузкой; размеры my_shifts/applied_shifts и сериализуемых заявок. Эти API сейчас возвращают потенциально большие наборы.
- Продуктовая политика удаления истории: CleanupOldCompletedShiftsJob через год физически удаляет смены и связанные отзывы; CleanupRejectedApplicationsJob через три месяца удаляет записи отказов. Нужно явно решить, должны ли репутация и окончательность отказа жить дольше этих сроков.
- Полный визуальный и accessibility аудит всех экранов, реальные платежи и production smoke не выполнялись.

UNKNOWN здесь не означает «этого нет». Это означает, что подтверждающих записей/проверки конфигурации в текущем аудите не было.

## Охват и порядок дальнейшей работы

Прочитаны критические реализации: Telegram/JWT auth и frontend bootstrap/store; Telegram webhook/router/ticket handlers; serializers/policies пользователей, смен, заявок и отзывов; create/accept/reject/cancel; платежи/refund/retry/contact reveal; completion/cleanup; frontend API/контактные drawers/KPI/покупки; CI, production/CORS/rate-limit/cron/health/deploy-конфиги. Сверены HANDOFF и локальное отличие backend-ветки. Полного построчного чтения всех UI-компонентов, всех миграций и всех тестов не было.

Порядок исправлений:

1. Закрыть обход срока авторизации и доступ к административным тикетам.
2. Устранить падение отзывов, публичную выдачу защищаемого контакта и отсутствие refund пакетов.
3. Защитить переходы смен и списания контактов от конкурентных запросов; закрыть мутации удалённых смен.
4. Согласовать auth recovery, KPI, фильтрацию вакансий, рейтинг и ожидание оплаты.
5. Получить зелёный удалённый frontend CI, запустить сквозные сценарии и проверить реальные deployment/readiness/backup/monitoring.

Локальную backend-ветку повторных откликов нельзя автоматически принимать как исправление: текущий main специально закрепляет окончательный отказ. Её дальнейшая судьба требует продуктового решения, а не технического merge по умолчанию.
