import { cn } from '@/shared/utils/cn'

/** Единая форма аватара во всём приложении (скруглённый квадрат). */
export const AVATAR_SHAPE_CLASS = 'rounded-md'

/** Компактный аватар для карточек смен, откликов, поставщиков (36px). */
export const AVATAR_SM_CLASS = cn('h-9 w-9', AVATAR_SHAPE_CLASS)

/** Средний аватар для заголовков drawer (44px). */
export const AVATAR_MD_CLASS = cn('h-11 w-11', AVATAR_SHAPE_CLASS)

/** Крупный аватар для профиля (96px). */
export const AVATAR_LG_CLASS = cn('h-24 w-24', AVATAR_SHAPE_CLASS)

/** Стандартный fallback для фото-профиля. */
export const AVATAR_FALLBACK_CLASS =
  'rounded-md bg-primary text-sm font-extrabold leading-none text-primary-foreground'
