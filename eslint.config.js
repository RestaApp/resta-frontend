import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Allowlist arbitrary `text-[N px]` — точечные исключения, где Tailwind‑токен
 * не подходит (decorative splash 52/36, iOS auto‑zoom 16, KPI 9px).
 * Любые другие arbitrary text values должны быть переведены на `text-{token}`.
 */
const TEXT_SIZE_ALLOWLIST_REGEX =
  /text-\[(?:9px|16px|36px|52px)\]/

/**
 * Allowlist для arbitrary `rounded-[...]`: 4px badge, 2rem decorative spinner.
 */
const ROUNDED_ALLOWLIST_REGEX = /rounded-\[(?:4px|2rem)\]/

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    plugins: {
      prettier,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      'prettier/prettier': 'error',
      // строгие deps хуков — защищает от stale closures.
      'react-hooks/exhaustive-deps': 'error',
      // External system sync через setState в effect — иногда необходимо
      // (Telegram WebApp init, navigation sync, localStorage flags).
      // Pragmatic: warn, не error — каждое место сознательное.
      'react-hooks/set-state-in-effect': 'warn',

      // a11y baseline (не "strict" — мобильные интерактивные div'ы есть legacy,
      // но базовые атрибуты ARIA / alt / role обязательны).
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',

      // запрет ad‑hoc токенов в className — поддержание дизайн‑системы.
      // allowlist — точечные decorative/utility исключения.
      'no-restricted-syntax': [
        'error',
        // text-[N px] вне allowlist
        {
          selector: `JSXAttribute[name.name='className'] Literal[value=/text-\\[\\d+(?:\\.\\d+)?(?:px|rem)\\]/]:not([value=/${TEXT_SIZE_ALLOWLIST_REGEX.source.replace(/\//g, '')}/])`,
          message:
            'Arbitrary text size запрещён. Используйте шкалу Tailwind: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, …',
        },
        // bg-[#hex]
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/bg-\\[#[0-9a-fA-F]+\\]/]",
          message:
            'Arbitrary hex bg запрещён. Используйте семантические цвета: bg-primary, bg-card, bg-success/N или CSS‑токен через bg-[image:var(--token)].',
        },
        // z-[N]
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/z-\\[\\d+\\]/]",
          message:
            'Arbitrary z-index запрещён. Используйте Z_INDEX ladder из @/shared/ui/zIndex (style={{ zIndex: Z_INDEX.x }}).',
        },
        // !important utilities в className (motion-reduce/* допустимы)
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(?:^|\\s)!(?!motion-reduce:)[a-z][a-z0-9-]+/]",
          message:
            '!important запрещён в Tailwind className. Расширьте API примитива (variant) вместо переопределения.',
        },
        // rounded-[N px] вне allowlist
        {
          selector: `JSXAttribute[name.name='className'] Literal[value=/rounded-\\[\\d+(?:\\.\\d+)?(?:px|rem)\\]/]:not([value=/${ROUNDED_ALLOWLIST_REGEX.source.replace(/\//g, '')}/])`,
          message:
            'Arbitrary rounded запрещён. Используйте rounded-md/-lg/-xl/-2xl (см. --radius scale).',
        },
      ],
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
