/** Высота фиксированной нижней навигации (px) — единый источник для отступов и drawer. */
export const BOTTOM_NAV_HEIGHT_PX = 88

/** CSS-формула фактической высоты BottomNav: h-15 + pb-safe-nav. */
export const BOTTOM_NAV_HEIGHT_CSS =
  'calc(3.75rem + var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom)) + 12px)'
