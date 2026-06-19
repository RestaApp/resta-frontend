# CLAUDE.md

Точка входа для Claude Code. **Не дублирует канон** — указывает на него. Подробности живут в трёх документах ниже; здесь только то, что нужно агенту, чтобы быстро сориентироваться и не нарушить правила.

Этот репозиторий — **фронтенд** (Telegram Mini App). Язык комментариев и пользовательского текста по умолчанию — **русский**.

---

## Где правда (иерархия документов)

| #   | Документ                                                                 | Зона                                                                 |
| --- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| 1   | Задача пользователя (чат / PR)                                           | —                                                                    |
| 2   | [`.cursorrules`](.cursorrules)                                           | **Канон**: стек, структура, Redux/RTK Query, TypeScript, антипаттерны |
| 3a  | [`AI_DEVELOPMENT_GUIDELINES.md`](AI_DEVELOPMENT_GUIDELINES.md) §1–§13     | Design system, UI-примитивы, hooks, forms, a11y, verification        |
| 3a* | `AI_DEVELOPMENT_GUIDELINES.md` §14                                       | Архитектура, направленность зависимостей, opacity-токены, cleanup — **продолжение канона** |
| 3b  | [`HANDOFF.md`](HANDOFF.md)                                               | Готовность фронта к интеграции (что подготовлено под бэкенд)         |
| 4   | Паттерны целевых файлов                                                  | Локальные соглашения модуля                                          |

**При конфликте:** `.cursorrules` (+ §14) > специализированный документ в его зоне > код. Перед изменением, затрагивающим архитектуру / Redux / UI-kit / контракты — сверься с соответствующим документом, не действуй по памяти.

---

## Бэкенд (`resta_backend/`)

В корне лежит **отдельный** Rails-проект бэкенда (untracked в этом репо, своя история и свой `resta_backend/CLAUDE.md`). Фронт ходит на него через `VITE_API_URL`.

- **Фактический контракт API** — [`resta_backend/API.md`](resta_backend/API.md). Это источник истины по эндпоинтам/полям.
- [`HANDOFF.md`](HANDOFF.md) описывает готовность фронта и терминологию (`employee`/`restaurant`/`supplier`/`unverified`; `urgent`, `boosted`, `accepted`/`filled`). При расхождении контракта — **сначала зафиксировать в `HANDOFF.md`/сверить с `API.md`, потом править фронт**. Не подгонять типы под «как сейчас на бэке» молча.
- Меняешь фронт — не редактируй файлы под `resta_backend/` заодно (это другой проект).

---

## Стек и структура (кратко; детали — в `.cursorrules`)

Vite 7 · React 19 · TypeScript strict · Tailwind 4 · Redux Toolkit + redux-persist · RTK Query · i18next. Алиас `@/*` → `src/*`.

- `src/app/` — bootstrap, контексты (Telegram), глобальные хуки
- `src/pages/` — страницы · `src/features/<домен>/` — `model/` + `ui/`
- `src/components/ui/` — **feature-agnostic** UI-kit (не импортирует из `features/`)
- `src/shared/` — `api/` (один `createApi` в `shared/api/api.ts`), `shifts/`, `ui/`, `lib/`, `i18n/`, `utils/`
- `src/services/api/*Api.ts` — endpoints через `injectEndpoints`, регистрация в `services/api/index.ts`
- `src/store/` — store, slices, hooks

**Направленность зависимостей:** `features/<X> → shared/* → components/ui/*`. Cross-feature импорты — только из `navigation`; иначе общий код переносится в `src/shared/`.

---

## Команды

```bash
npm run dev            # Vite dev-сервер
npm run build          # tsc -b && vite build  (обязательно перед коммитом)
npm run lint           # ESLint            (lint:fix — с автоправками)
npm run format:check   # Prettier          (format — записать)
npm run test:run       # Vitest однократно (test — watch, test:coverage — с покрытием)
npm run test:visual    # Playwright (visual snapshots в tests/visual)
npm run knip           # мёртвый код / неиспользуемые зависимости
```

Vitest: jsdom, setup `src/test/setup.ts`, тесты — `src/**/*.{test,spec}.{ts,tsx}` рядом с кодом.

**Перед коммитом:** `npm run lint` → `npm run format:check` → `npm run build`. Если правка затрагивает flow / orchestration / mapping / form validation / query params — добавить или обновить тест рядом.

---

## Guardrails (полный список и обоснования — в `.cursorrules` → «Антипаттерны»)

- ❌ `any`; второй store / второй `createApi`; мутация Redux вне RTK/Immer.
- ❌ `console.*` — только через логгер `@/shared/utils/logger`.
- ❌ Хардкод строк вместо i18n; новые ключи — **во всех локалях** (`en.json`, `ru.json`).
- ❌ Доступ к `window.Telegram` напрямую — только через контексты/хуки `app/contexts/telegram`.
- ❌ `font-mono` (Tailwind default) — в проекте только `font-mono-resta`.
- ❌ Hand-rolled аватары → `<Avatar>`/`<AvatarImage>`/`<AvatarFallback>`; кастомный sticky bottom CTA → `BottomActionBar`/`DrawerFooter`.
- ❌ `components/ui/*`, импортирующий из `features/*`.
- ❌ Произвольные opacity-варианты рядом со стандартом (`/10`, `/15`).
- ❌ **`manualChunks` в `vite.config.ts`** без явного запроса — ломало `react`/`redux`/`motion` в Telegram WebView (см. `.cursor/rules/vite-build-chunking.mdc`).
- ❌ Proxy-модули / barrel `index.ts` с ≤2 потребителями / мёртвые пропсы / косметический рефакторинг вне задачи.
- ✅ Меняй только нужное для задачи. RTK Query cache — источник истины для server state, не зеркалить в Redux без причины. Файл >300 LOC не-composition / не-types — повод вынести логику.

---

## Прочее

- Секреты — в `.env`; клиентские переменные — префикс `VITE_` (`VITE_API_URL`, `VITE_MOCK_INIT_DATA`, `VITE_MONETIZATION`).
- `VITE_MONETIZATION === 'true'` (см. `src/shared/config/monetization.ts`, `MONETIZATION_ENABLED`) гейтит проактивный UI монетизации (PRO-карточка, `UsageIndicator`). Поток покупок по слотам флаг не гейтит — он реагирует только на реальный HTTP **402** от бэкенда.
- `AGENTS.md` — короткий указатель на эти же документы.
