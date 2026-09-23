// Single source for these fixed-value enums; mirrors the backend `src/core/enums.ts`.

/** Asset handover transaction type. */
export const HANDOVER_TRANSACTION_TYPES = ['assign', 'return'] as const
export type TransactionType = typeof HANDOVER_TRANSACTION_TYPES[number]

/** Asset handover approval status. */
export const HANDOVER_STATUSES = ['pending', 'approve', 'reject', 'cancel'] as const
export type HandoverStatus = typeof HANDOVER_STATUSES[number]

/** Suggested units of measure for an inventory item (free-text; powers the select). */
export const INVENTORY_UNITS = ['Pcs', 'Unit', 'Box', 'Pack', 'Set', 'Roll', 'Meter', 'Cm', 'Kg', 'Gram', 'Liter', 'Lusin', 'Rim'] as const
export type InventoryUnit = typeof INVENTORY_UNITS[number]
