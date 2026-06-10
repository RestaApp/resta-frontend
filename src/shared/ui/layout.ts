/** Высота фиксированной нижней навигации (px) — единый источник для отступов и drawer. */
export const BOTTOM_NAV_HEIGHT_PX = 80

/** CSS-формула фактической высоты BottomNav: h-13 + pb-safe-nav. */
export const BOTTOM_NAV_HEIGHT_CSS =
  'calc(3.25rem + var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom)) + 12px)'
