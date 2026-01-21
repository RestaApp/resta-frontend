import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, tagTypes, rtkQueryConfig } from '@/shared/api/rtkQuery'

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes,
  keepUnusedDataFor: rtkQueryConfig.keepUnusedDataFor,
  refetchOnMountOrArgChange: rtkQueryConfig.refetchOnMountOrArgChange,
  refetchOnFocus: rtkQueryConfig.refetchOnFocus,
  refetchOnReconnect: rtkQueryConfig.refetchOnReconnect,
  endpoints: () => ({}),
})