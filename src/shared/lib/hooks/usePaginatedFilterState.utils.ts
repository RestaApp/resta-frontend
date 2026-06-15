export const resolveResetFilters = <TFilters>(
  defaultFilters: TFilters,
  createResetFilters?: (defaultFilters: TFilters) => TFilters
) => {
  return createResetFilters ? createResetFilters(defaultFilters) : defaultFilters
}
