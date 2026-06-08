/**
 * Утилиты разбиения длинных строк навыков для аккуратной типографики.
 *
 * SRP: только текстовый split, никаких React/JSX зависимостей.
 */
const SKILL_SPLIT_LIMIT = 44

const splitLongSkill = (skill: string): string[] => {
  const normalized = skill.trim()
  if (normalized.length <= SKILL_SPLIT_LIMIT) return [normalized]

  const chunks: string[] = []
  let rest = normalized

  while (rest.length > SKILL_SPLIT_LIMIT) {
    const leftPart = rest.slice(0, SKILL_SPLIT_LIMIT + 1)
    const splitAt = leftPart.lastIndexOf(' ')
    const safeSplitAt = splitAt > 0 ? splitAt : SKILL_SPLIT_LIMIT
    const chunk = rest.slice(0, safeSplitAt).trim()
    if (!chunk) break
    chunks.push(chunks.length === 0 ? chunk : `... ${chunk}`)
    rest = rest.slice(safeSplitAt).trim()
  }

  if (rest) {
    chunks.push(chunks.length === 0 ? rest : `... ${rest}`)
  }

  return chunks.length > 0 ? chunks : [normalized]
}

export const splitSkillByDots = (skill: string): string[] => {
  const normalized = skill.trim()
  if (!normalized) return []
  const dotParts = normalized
    .split('.')
    .map(part => part.trim())
    .filter(Boolean)
  if (dotParts.length <= 1) return splitLongSkill(normalized)
  return dotParts.flatMap(splitLongSkill)
}
