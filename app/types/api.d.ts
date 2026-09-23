export interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  from: number
  to: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode?: number
  message?: string
  data: T
  meta?: PaginationMeta
}

export type FilterValue = string | number | boolean | string[] | number[] | { key: string, value: string }[] | undefined
export type FilterBag = Record<string, FilterValue>
