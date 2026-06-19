# Тикет 1 — `restaurant_free`: не настроены цены покупок (`purchase_prices`)

**Тип:** bug / config
**Приоритет:** высокий (блокирует покупку слотов)

## Проблема
`POST /api/v1/purchases/checkout { "purchase_type": "vacancy_slot" }` под рестораном возвращает **422**:
```json
{ "success": false, "errors": ["Purchase price not configured."], "code": "unprocessable_content" }
```
У плана `restaurant_free` пустое поле `purchase_prices`, поэтому checkout не может создать invoice.

## Ожидание (PURCHASES_API_SPEC / MONETIZATION.md)
У `restaurant_free` должны быть прописаны цены покупок:
- `vacancy_slot: 50`
- `replacement_slot: 30`
- `urgent_boost: 100`

Тогда `purchases/checkout` отдаёт `{ "data": { "invoice_url": "..." } }`, и эти же цены приходят в ответе **402** (`price`).

## Что сделать
1. Заполнить `purchase_prices` у плана `restaurant_free` (сидом/миграцией данных плана).
2. Проверить `employee_free` — для `replacement_slot` цена тоже должна быть настроена.

## Критерий готовности
- `POST /purchases/checkout` под рестораном → **200** + `invoice_url`.
- Ответ **402** при создании смены сверх лимита содержит корректный `price`.

## Контекст
Воспроизведено токеном ресторана (user 639). Фронт обрабатывает 422 корректно — показывает тост «Не удалось оформить покупку» (`monetization.purchase.error`); правок на фронте не требуется.
