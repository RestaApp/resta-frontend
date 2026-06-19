# Тикеты бэку

Найдено при сквозной проверке фронт↔бэк по всем ролям (employee / restaurant / supplier) против `https://resta-backend.onrender.com` (2026-06-19). Все — на стороне **бэка/инфраструктуры**, фронт менять не нужно.

| # | Тикет | Тип | Приоритет |
|---|---|---|---|
| 1 | [restaurant_free: не настроены цены покупок](./01-purchase-prices-not-configured.md) | bug / config | высокий |
| 2 | [Завышенные месячные лимиты планов](./02-plan-limits-mismatch.md) | config / data | средний |
| 3 | [Смены не переходят filled → completed](./03-shifts-not-completing.md) | bug / infra | высокий |
| 4 | [Расхождение каталога restaurant_formats и данных](./04-restaurant-format-catalog-mismatch.md) | data / config | низкий |

Контекст проверки: 32 PASS / 1 FAIL по API-контракту; UI всех ролей грузится без ошибок. Фронт корректно реагирует на все находки (скрывает CTA отзыва без полей, показывает тост при 422 checkout, читает usage/limits как есть, локализует форматы фолбэком).
