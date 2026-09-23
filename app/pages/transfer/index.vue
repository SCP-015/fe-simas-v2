<template>
  <div class="space-y-6">
    <Header
      :title="$t('pages.transfer.title')"
      :description="$t('pages.transfer.description')"
    />

    <DataTable
      v-model:search="search"
      v-model:page="page"
      v-model:per-page="perPage"
      :data="data"
      :columns="columns"
      :loading="isLoading"
      :from="meta.from"
      :to="meta.to"
      :total="meta.total"
    >
      <template #filters>
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          class="w-full sm:w-48"
        />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { transferService } from '~/services/transfer-service'
import type { Transfer } from '~/types/transfer'

const { t } = useI18n()

definePageMeta({
  layout: 'dashboard'
})

const { hasPermission } = useAuth()

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

const data = ref<Transfer[]>([])
const isLoading = ref(false)
const statusFilter = ref('pending')

const {
  search,
  page,
  perPage,
  sortBy,
  order,
  sortHeader
} = useTableQuery(() => fetchTransfers())

watch(statusFilter, () => {
  page.value = 1
  fetchTransfers()
})

const statusOptions = computed(() => [
  { label: t('pages.transfer.statusAll'), value: 'all' },
  { label: t('pages.transfer.statusPending'), value: 'pending' },
  { label: t('pages.transfer.statusMerged'), value: 'merged' }
])

const meta = reactive({
  total: 0,
  from: 0,
  to: 0
})

const fetchTransfers = async () => {
  isLoading.value = true
  try {
    const status = statusFilter.value === 'all' ? '' : statusFilter.value
    const response = await transferService.getAll(page.value, perPage.value, search.value, status, sortBy.value, order.value)
    if (response.success) {
      data.value = response.data
      if (response.meta) {
        meta.total = response.meta.total
        meta.from = response.meta.from
        meta.to = response.meta.to
      }
    }
  } finally {
    isLoading.value = false
  }
}

const baseColumns: TableColumn<Transfer>[] = [
  {
    accessorKey: 'name',
    header: sortHeader(t('pages.transfer.columnName'), 'name'),
    cell: ({ row }) => h('span', { class: 'font-medium text-highlighted' }, row.original.name)
  },
  {
    id: 'code',
    header: t('pages.transfer.columnCode'),
    cell: ({ row }) => {
      const { code, quantity } = row.original
      if (code.length === 0) {
        return h('span', { class: 'text-dimmed text-xs' }, t('pages.transfer.noSerialWithQuantity', { quantity }))
      }
      const text = code.length < quantity
        ? t('pages.transfer.codeWithMore', { codes: code.join(', '), more: quantity - code.length })
        : code.join(', ')
      return h('span', { class: 'text-toned font-mono text-xs' }, text)
    }
  },
  {
    accessorKey: 'price',
    header: sortHeader(t('pages.transfer.columnPrice'), 'price'),
    cell: ({ row }) => h('span', { class: 'text-toned' }, row.original.price != null ? formatCurrency(row.original.price) : '-')
  },
  {
    accessorKey: 'purchaseDate',
    header: sortHeader(t('pages.transfer.columnPurchaseDate'), 'purchaseDate'),
    cell: ({ row }) => h('span', { class: 'text-toned' }, row.original.purchaseDate ? formatDateOnly(row.original.purchaseDate) : '-')
  },
  {
    accessorKey: 'status',
    header: sortHeader(t('pages.transfer.columnStatus'), 'status'),
    cell: ({ row }) => {
      const isMerged = row.original.status === 'merged'
      return h(
        UBadge,
        { color: isMerged ? 'success' : 'warning', variant: 'subtle' },
        () => (isMerged ? t('pages.transfer.statusMerged') : t('pages.transfer.statusPending'))
      )
    }
  },
  {
    accessorKey: 'createdBy',
    header: t('pages.transfer.columnCreatedBy'),
    cell: ({ row }) => h('span', { class: 'text-toned' }, row.original.createdBy || t('pages.transfer.createdBySystem'))
  },
  {
    accessorKey: 'createdAt',
    header: sortHeader(t('pages.transfer.columnCreatedAt'), 'createdAt'),
    cell: ({ row }) => h('span', { class: 'text-toned' }, formatDate(row.original.createdAt))
  }
]

const columns = computed(() => {
  const list = [...baseColumns]
  if (hasPermission('transfer:merge')) {
    list.push({
      id: 'actions',
      header: t('pages.transfer.columnAction'),
      meta: {
        class: { td: 'text-right', th: 'text-right' }
      },
      cell: ({ row }) => {
        if (row.original.status === 'merged') return h('span', { class: 'text-dimmed text-xs' }, '-')
        return h(UButton, {
          label: t('pages.transfer.mergeToAsset'),
          icon: 'i-lucide-merge',
          color: 'neutral',
          variant: 'outline',
          size: 'xs',
          onClick: () => navigateTo(`/transfer/${row.original.id}/merge`)
        })
      }
    })
  }
  return list
})

onMounted(() => {
  fetchTransfers()
})
</script>
