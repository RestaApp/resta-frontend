/**
 * Z-index ladder — единый источник истины для слоёв UI.
 *
 * Правило: каждый новый слой берёт ближайший токен. Никаких `z-[60]` в TSX —
 * только `style={{ zIndex: Z_INDEX.modal }}` или CSS-class через `z-modal`
 * (см. utility ниже, если понадобится).
 *
 * Иерархия снизу вверх:
 *  base          — обычный контент, статические карточки.
 *  detailPage    — фон под нижней навигацией для полноэкранных detail-страниц.
 *  bottomNav     — фикс-панель навигации внизу.
 *  stickyHeader  — заголовки внутри страницы, sticky-фильтры.
 *  overlay       — затемнение под drawer/modal.
 *  drawer        — выезжающие side/bottom sheet'ы.
 *  modal         — диалоги (окна формы).
 *  popover       — выпадающие меню, тултипы.
 *  alertDialog   — критические подтверждения, должны быть выше modal.
 *  toast         — глобальные уведомления, перекрывают всё.
 */
export const Z_INDEX = {
  base: 0,
  detailPage: 20,
  bottomNav: 30,
  stickyHeader: 35,
  overlay: 40,
  drawer: 50,
  modal: 60,
  popover: 70,
  alertDialog: 80,
  toast: 90,
} as const

export type ZIndexLayer = keyof typeof Z_INDEX
