export type DetailOverlay =
  | { type: 'shift'; id: number }
  | { type: 'vacancy'; id: number }
  | { type: 'user'; id: number }

const DETAIL_PATTERNS: Array<{ type: DetailOverlay['type']; regex: RegExp }> = [
  { type: 'shift', regex: /^\/shift\/(\d+)$/ },
  { type: 'vacancy', regex: /^\/vacancy\/(\d+)$/ },
  { type: 'user', regex: /^\/user\/(\d+)$/ },
]

export function parseDetailPath(pathname: string): DetailOverlay | null {
  const clean = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  for (const { type, regex } of DETAIL_PATTERNS) {
    const match = clean.match(regex)
    if (match) return { type, id: Number(match[1]) }
  }
  return null
}

export function buildDetailPath(overlay: DetailOverlay): string {
  return `/${overlay.type}/${overlay.id}`
}
