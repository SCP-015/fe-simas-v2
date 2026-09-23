export type TransferStatus = 'pending' | 'merged'

export interface Transfer {
  id: number
  name: string
  price: number | null
  /** Serial numbers provided at intake — may be fewer than `quantity` or empty. */
  code: string[]
  quantity: number
  purchaseDate: string | null
  /** Free-text identifier the external system sent at intake — no authenticated user on this route. */
  createdBy: string | null
  status: TransferStatus
  /** Populated once merged — one entry per Asset created from this row. */
  mergedAssets: { id: number, code: string, name: string }[]
  createdAt: string
  updatedAt: string
}
