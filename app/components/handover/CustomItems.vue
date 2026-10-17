<template>
  <div
    v-if="transactionType === 'return'"
    class="space-y-4"
  >
    <div class="flex items-center justify-between border-b border-muted pb-2">
      <h3 class="text-md font-semibold text-highlighted flex items-center gap-1.5">
        <UIcon
          name="i-lucide-clipboard-plus"
          class="text-primary w-5 h-5"
        />
        Custom Items
      </h3>
      <UButton
        type="button"
        color="primary"
        variant="soft"
        icon="i-lucide-plus"
        size="sm"
        @click="open = true"
      >
        Add Item
      </UButton>
    </div>

    <div
      v-if="rows.length === 0"
      class="flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-default rounded-lg"
    >
      <UIcon
        name="i-lucide-clipboard-plus"
        class="w-10 h-10 text-dimmed mb-3"
      />
      <span class="text-sm text-muted mb-3">No custom items</span>
      <UButton
        type="button"
        label="Add Custom Item"
        icon="i-lucide-plus"
        color="neutral"
        variant="outline"
        size="sm"
        @click="open = true"
      />
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="(item, index) in rows"
        :key="index"
        class="p-4 rounded-lg border border-muted bg-muted/50 space-y-3"
      >
        <div class="flex items-center justify-between border-b border-muted pb-2">
          <span class="text-xs font-semibold text-muted uppercase tracking-wider">Item {{ index + 1 }}</span>
          <UButton
            type="button"
            color="error"
            variant="soft"
            icon="i-lucide-trash"
            size="sm"
            square
            @click="rows.splice(index, 1)"
          />
        </div>
        <div class="flex items-start gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <UIcon
              name="i-lucide-clipboard-plus"
              class="w-5 h-5 text-primary"
            />
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-sm font-semibold text-highlighted block truncate">{{ item.name }}</span>
            <span class="text-xs text-muted block truncate">
              {{ item.code || 'No code' }} · {{ item.quantity }} {{ item.unit || 'pcs' }}
            </span>
          </div>
        </div>
        <div
          v-if="item.note"
          class="text-sm text-toned"
        >
          {{ item.note }}
        </div>
      </div>
    </div>

    <UModal
      v-model:open="open"
      title="Add Custom Item"
      description="Record an unregistered item returned by the employee."
      :ui="{ content: 'sm:max-w-lg', footer: 'justify-end' }"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Item name" required>
            <UInput
              v-model="draft.name"
              placeholder="Example: ID Card"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Code / number">
              <UInput
                v-model="draft.code"
                placeholder="Optional"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Quantity" required>
              <UInput
                v-model.number="draft.quantity"
                type="number"
                min="1"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="Unit">
            <UInput
              v-model="draft.unit"
              placeholder="Example: pcs"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Note">
            <UTextarea
              v-model="draft.note"
              placeholder="Condition or additional information"
              class="w-full"
              :rows="3"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          @click="open = false"
        />
        <UButton
          label="Add"
          color="primary"
          :disabled="!canAdd"
          @click="addItem"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
export interface HandoverCustomRow {
  name: string
  code: string
  quantity: number
  unit: string
  note: string
}

defineProps<{ transactionType: 'assign' | 'return' }>()
const rows = defineModel<HandoverCustomRow[]>('rows', { default: () => [] })

const open = ref(false)
const draft = reactive<HandoverCustomRow>({ name: '', code: '', quantity: 1, unit: 'pcs', note: '' })
const canAdd = computed(() => draft.name.trim().length > 0 && Number(draft.quantity) >= 1)

const resetDraft = () => Object.assign(draft, { name: '', code: '', quantity: 1, unit: 'pcs', note: '' })
const addItem = () => {
  if (!canAdd.value) return
  rows.value = [...rows.value, {
    name: draft.name.trim(),
    code: draft.code.trim(),
    quantity: Number(draft.quantity),
    unit: draft.unit.trim(),
    note: draft.note.trim()
  }]
  resetDraft()
  open.value = false
}
</script>
