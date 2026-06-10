export function groupByOrderedKeys<TItem, TKey extends string>(
  items: TItem[],
  getKey: (item: TItem) => TKey,
  order: readonly TKey[],
  labelMap: Record<TKey, string>
): { key: TKey; label: string; items: TItem[] }[] {
  const groups: Partial<Record<TKey, TItem[]>> = {}

  for (const item of items) {
    const key = getKey(item)
    if (!groups[key]) groups[key] = []
    groups[key]!.push(item)
  }

  return order
    .filter(key => groups[key]?.length)
    .map(key => ({
      key,
      label: labelMap[key],
      items: groups[key] ?? [],
    }))
}
