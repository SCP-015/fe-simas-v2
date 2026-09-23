<template>
  <div class="space-y-6">
    <Header
      :title="$t('pages.transfer.mergeTitle')"
      :description="$t('pages.transfer.mergeDescription')"
    />

    <UCard class="w-full">
      <div class="w-full mb-4">
        <UButton
          :label="$t('common.back')"
          to="/transfer"
          color="neutral"
          icon="i-lucide-arrow-left"
          variant="link"
        />
      </div>
      <UForm
        id="merge-transfer-form"
        :schema="schema"
        :state="form"
        @submit="handleSubmit"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <!-- ═══ Column 1: Identity ═══ -->
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1.5">
                <label class="text-sm font-medium text-default">{{ $t('pages.asset.create.assetImage') }}</label>
                <UButton
                  icon="i-lucide-camera"
                  color="primary"
                  variant="soft"
                  size="xs"
                  @click="() => { showCamera = true }"
                >
                  {{ $t('pages.asset.create.takePhoto') }}
                </UButton>
              </div>

              <div
                v-if="previewUrl"
                class="relative inline-block w-full aspect-square"
              >
                <NuxtImg
                  :src="previewUrl"
                  class="w-full h-full rounded-lg object-cover border border-default"
                />
                <UButton
                  icon="i-lucide-x"
                  color="error"
                  variant="solid"
                  size="xs"
                  class="absolute top-1 right-1 rounded-full"
                  @click="removeImage(form)"
                />
              </div>
              <div
                v-else
                class="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-default rounded-lg cursor-pointer hover:border-primary transition-colors"
                @click="triggerFileInput"
              >
                <UIcon
                  name="i-lucide-upload"
                  class="w-8 h-8 text-dimmed mb-2"
                />
                <span class="text-sm text-muted">{{ $t('pages.asset.create.dropImage') }}</span>
                <span class="text-xs text-dimmed mt-1">{{ $t('pages.asset.create.imageHint') }}</span>
              </div>
              <div
                v-if="isUploading"
                class="mt-2 flex items-center gap-2 text-sm text-muted"
              >
                <UIcon
                  name="i-lucide-loader-2"
                  class="w-4 h-4 animate-spin"
                /> {{ $t('pages.asset.create.uploading') }}
              </div>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept="image/*"
                @change="onFileChange($event, form)"
              >
              <CameraModal
                v-model="showCamera"
                @captured="(file: File) => handleUploadImageFile(file, form)"
              />
            </div>

            <AttachmentManager
              v-model="uploadedAssetAttachments"
              @change="onAssetAttachmentsChanged"
            />
          </div>

          <!-- ═══ Column 2: Details ═══ -->
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-default mb-1.5 block">{{ $t('pages.asset.create.codeLabel') }} <span class="text-red-500">*</span></label>
              <div class="space-y-3">
                <div
                  v-for="(entry, index) in codes"
                  :key="index"
                  class="p-3 border border-default rounded-lg space-y-2"
                >
                  <div class="relative w-full">
                    <UInput
                      v-model="entry.code"
                      :placeholder="$t('pages.asset.create.codePlaceholder')"
                      class="w-full"
                    />
                    <div
                      v-if="codeStatuses[index] || isDuplicateCode(index)"
                      class="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <UIcon
                        v-if="isDuplicateCode(index)"
                        name="i-lucide-circle-x"
                        class="w-4 h-4 text-red-500"
                      />
                      <UIcon
                        v-else-if="codeStatuses[index] === 'checking'"
                        name="i-lucide-loader-2"
                        class="w-4 h-4 text-dimmed animate-spin"
                      />
                      <UIcon
                        v-else-if="codeStatuses[index] === 'available'"
                        name="i-lucide-circle-check"
                        class="w-4 h-4 text-green-500"
                      />
                      <UIcon
                        v-else-if="codeStatuses[index] === 'exists'"
                        name="i-lucide-circle-x"
                        class="w-4 h-4 text-red-500"
                      />
                    </div>
                  </div>
                  <p
                    v-if="isDuplicateCode(index)"
                    class="text-xs text-red-500"
                  >
                    {{ $t('pages.asset.create.duplicateCode') }}
                  </p>
                  <p
                    v-else-if="codeStatuses[index] === 'exists'"
                    class="text-xs text-red-500"
                  >
                    {{ $t('pages.asset.create.codeExists', { code: entry.code }) }}
                  </p>
                  <p
                    v-else-if="codeStatuses[index] === 'available'"
                    class="text-xs text-green-500"
                  >
                    {{ $t('pages.asset.create.codeAvailable') }}
                  </p>
                  <UInput
                    :model-value="entry.bleTagMac"
                    placeholder="AA:BB:CC:DD:EE:FF"
                    class="w-full"
                    maxlength="17"
                    @update:model-value="(v: string) => entry.bleTagMac = formatMacAddress(v)"
                  >
                    <template #leading>
                      <UIcon
                        name="i-lucide-bluetooth"
                        class="w-4 h-4"
                      />
                    </template>
                  </UInput>
                </div>
              </div>
            </div>

            <UFormField
              :label="$t('pages.asset.create.nameLabel')"
              name="name"
              required
            >
              <UInput
                v-model="form.name"
                :placeholder="$t('pages.asset.create.namePlaceholder')"
                class="w-full"
              />
            </UFormField>

            <UFormField
              :label="$t('pages.asset.create.categoryLabel')"
              name="categoryId"
              required
            >
              <div class="flex items-center gap-2">
                <USelectMenu
                  v-model="selectedCategory"
                  :items="categoryOptions"
                  searchable
                  :searchable-placeholder="$t('common.search')"
                  :placeholder="$t('pages.asset.create.selectCategory')"
                  class="w-full"
                />
                <UButton
                  icon="i-lucide-plus"
                  color="primary"
                  variant="soft"
                  size="sm"
                  square
                  @click="() => { showAddCategory = true }"
                />
              </div>
            </UFormField>

            <UFormField
              :label="$t('pages.asset.create.subCategoryLabel')"
              name="subCategoryId"
              required
            >
              <div class="flex items-center gap-2">
                <USelectMenu
                  v-model="selectedSubCategory"
                  :items="subCategoryOptions"
                  searchable
                  :searchable-placeholder="$t('common.search')"
                  :placeholder="$t('pages.asset.create.selectSubCategory')"
                  :disabled="!selectedCategoryId || isLoadingSubCategories"
                  class="w-full"
                />
                <UButton
                  icon="i-lucide-plus"
                  color="primary"
                  variant="soft"
                  size="sm"
                  square
                  @click="() => { showAddSubCategory = true }"
                />
              </div>
            </UFormField>

            <UFormField
              :label="$t('pages.asset.create.descriptionLabel')"
              name="description"
            >
              <UTextarea
                v-model="form.description"
                :placeholder="$t('pages.asset.create.descriptionPlaceholder')"
                class="w-full"
                :rows="3"
              />
            </UFormField>
          </div>

          <!-- ═══ Column 3: Classification ═══ -->
          <div class="space-y-4">
            <UFormField
              :label="$t('pages.asset.create.brandLabel')"
              name="brand"
            >
              <UInput
                v-model="form.brand"
                :placeholder="$t('pages.asset.create.brandPlaceholder')"
                class="w-full"
              />
            </UFormField>

            <UFormField
              :label="$t('pages.asset.create.modelLabel')"
              name="model"
            >
              <UInput
                v-model="form.model"
                :placeholder="$t('pages.asset.create.modelPlaceholder')"
                class="w-full"
              />
            </UFormField>

            <UFormField
              :label="$t('pages.asset.create.purchaseDateLabel')"
              name="purchaseDate"
            >
              <UInputDate
                v-model="purchaseDateVal"
                class="w-full"
              >
                <template #trailing>
                  <UPopover>
                    <UButton
                      icon="i-lucide-calendar"
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      square
                    />
                    <template #content>
                      <UCalendar v-model="purchaseDateVal" />
                    </template>
                  </UPopover>
                </template>
              </UInputDate>
            </UFormField>

            <UFormField
              :label="$t('pages.asset.create.priceLabel')"
              name="price"
            >
              <UInput
                v-model="priceDisplay"
                placeholder="0"
                class="w-full"
              >
                <template #leading>
                  <span class="text-muted text-sm">Rp</span>
                </template>
              </UInput>
            </UFormField>

            <div class="grid grid-cols-2 gap-3">
              <UFormField
                :label="$t('pages.asset.create.usefulLifeLabel')"
                name="usefulLife"
              >
                <UInput
                  v-model.number="form.usefulLife"
                  type="number"
                  min="1"
                  :placeholder="$t('pages.asset.create.usefulLifePlaceholder')"
                  class="w-full"
                >
                  <template #trailing>
                    <span class="text-dimmed text-xs">{{ $t('pages.asset.create.usefulLifeUnit') }}</span>
                  </template>
                </UInput>
              </UFormField>
              <UFormField
                :label="$t('pages.asset.create.monthlyDepreciationLabel')"
                name="monthlyDepreciation"
              >
                <UInput
                  :model-value="monthlyDepreciationDisplay"
                  readonly
                  class="w-full bg-muted"
                >
                  <template #leading>
                    <span class="text-muted text-sm">Rp</span>
                  </template>
                </UInput>
              </UFormField>
            </div>
            <p class="text-xs text-dimmed -mt-2 flex items-start gap-1">
              <UIcon
                name="i-lucide-info"
                class="w-3.5 h-3.5 shrink-0 mt-0.5"
              />
              <span>{{ $t('pages.asset.create.depreciationHint') }}</span>
            </p>

            <UFormField
              :label="$t('pages.asset.create.statusLabel')"
              name="status"
              required
            >
              <USelect
                v-model="form.status"
                :items="statusOptions"
                :placeholder="$t('pages.asset.create.selectStatus')"
                class="w-full"
              />
            </UFormField>

            <!-- Labels -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-sm font-medium text-default">{{ $t('pages.asset.create.labelsLabel') }}</label>
                <UButton
                  icon="i-lucide-plus"
                  color="primary"
                  variant="soft"
                  size="xs"
                  @click="addLabel"
                >
                  {{ $t('common.add') }}
                </UButton>
              </div>
              <div
                v-if="labels.length === 0"
                class="text-sm text-dimmed py-3 text-center border border-dashed border-default rounded-lg"
              >
                {{ $t('pages.asset.create.noLabels') }}
              </div>
              <div
                v-else
                class="space-y-2"
              >
                <div
                  v-for="(label, index) in labels"
                  :key="index"
                >
                  <div class="flex items-center gap-2">
                    <UInputMenu
                      v-model="label.key"
                      :items="availableLabelKeys"
                      autocomplete
                      placeholder="Key"
                      class="w-full"
                    />
                    <UInput
                      v-model="label.value"
                      placeholder="Value"
                      class="w-full"
                    />
                    <UButton
                      icon="i-lucide-trash"
                      color="error"
                      variant="soft"
                      size="sm"
                      square
                      @click="removeLabel(index)"
                    />
                  </div>
                  <p
                    v-if="isDuplicateLabelKey(index)"
                    class="text-xs text-red-500 mt-1"
                  >
                    {{ $t('pages.asset.create.duplicateKey', { key: label.key }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Settings -->
        <div class="mt-8 pt-6 border-t border-muted col-span-full">
          <h3 class="text-md font-semibold text-highlighted mb-4 flex items-center gap-2">
            <UIcon
              name="i-lucide-toggle-left"
              class="w-5 h-5 text-primary-500"
            />
            {{ $t('pages.asset.create.assetFeatures') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-4 rounded-lg border border-muted bg-muted/50 flex items-center justify-between">
              <div>
                <span class="font-medium text-sm text-highlighted block">{{ $t('pages.asset.create.featureHolder') }}</span>
                <p class="text-xs text-muted">
                  {{ $t('pages.asset.create.featureHolderDesc') }}
                </p>
              </div>
              <USwitch v-model="form.hasHolder" />
            </div>

            <div class="p-4 rounded-lg border border-muted bg-muted/50 flex items-center justify-between">
              <div>
                <span class="font-medium text-sm text-highlighted block">{{ $t('pages.asset.create.featureLocation') }}</span>
                <p class="text-xs text-muted">
                  {{ $t('pages.asset.create.featureLocationDesc') }}
                </p>
              </div>
              <USwitch v-model="form.hasLocation" />
            </div>

            <div class="p-4 rounded-lg border border-muted bg-muted/50 flex items-center justify-between">
              <div>
                <span class="font-medium text-sm text-highlighted block">{{ $t('pages.asset.create.featureMaintenance') }}</span>
                <p class="text-xs text-muted">
                  {{ $t('pages.asset.create.featureMaintenanceDesc') }}
                </p>
              </div>
              <USwitch v-model="form.hasMaintenance" />
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end gap-2 pt-4 mt-6 border-t border-muted">
          <UButton
            :label="$t('common.cancel')"
            color="neutral"
            variant="outline"
            :disabled="isSubmitting"
            to="/transfer"
          />
          <UButton
            :label="$t('pages.transfer.mergeSubmit')"
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="isUploading || isSubmitting || hasInvalidCodes || hasDuplicateLabelKeys"
          />
        </div>
      </UForm>
    </UCard>

    <CategoryAddModal
      v-model="showAddCategory"
      @created="onCategoryCreated"
    />
    <SubCategoryAddModal
      v-model="showAddSubCategory"
      @created="() => onSubCategoryCreated(form)"
    />
  </div>
</template>

<script setup lang="ts">
import { assetService } from '~/services/asset-service'
import { transferService } from '~/services/transfer-service'
import { assetSchema } from '~/composables/useAssetForm'
import type { AssetPayload } from '~/types/asset'
import type { Attachment } from '~/types/attachment'

const { t } = useI18n()
const route = useRoute()
const toastGlobal = useToast()

definePageMeta({ layout: 'dashboard' })

const UInputMenu = resolveComponent('UInputMenu')

const transferId = computed(() => Number(route.params.id))

const showCamera = ref(false)

const statusOptions = getStatusOptions()

const {
  toast, isUploading, previewUrl,
  labels, addLabel, removeLabel, getFilteredLabels,
  isDuplicateLabelKey, hasDuplicateLabelKeys,
  availableLabelKeys, fetchLabelKeys,
  selectedCategoryId, categoryOptions, subCategoryOptions, isLoadingSubCategories,
  showAddCategory, showAddSubCategory,
  fetchCategories, fetchSubCategories, onCategoryCreated, onSubCategoryCreated,
  fileInput, triggerFileInput, onFileChange, handleUploadImageFile, removeImage,
  makePurchaseDateComputed, makePriceDisplayComputed, formatMacAddress
} = useAssetForm()

const isSubmitting = ref(false)
const uploadedAssetAttachments = ref<Attachment[]>([])

const schema = assetSchema.pick({ categoryId: true, name: true, subCategoryId: true, brand: true, model: true, price: true, purchaseDate: true, description: true })

const form = reactive<Omit<AssetPayload, 'code' | 'bleTagMac'> & { categoryId: number } & {
  attachmentIds?: number[] | null
  hasHolder: boolean
  hasMaintenance: boolean
  hasLocation: boolean
  status?: string
  statusNote?: string
}>({
  categoryId: undefined as unknown as number,
  name: '',
  description: '',
  price: undefined,
  purchaseDate: '',
  brand: '',
  model: '',
  image: null,
  subCategoryId: undefined as unknown as number,
  attachmentIds: [],
  hasHolder: true,
  hasMaintenance: true,
  hasLocation: true,
  usefulLife: undefined,
  status: 'active',
  statusNote: undefined
})

const onAssetAttachmentsChanged = (ids: number[]) => {
  form.attachmentIds = ids
}

const purchaseDateVal = makePurchaseDateComputed(form)
const priceDisplay = makePriceDisplayComputed(form)

const monthlyDepreciationDisplay = computed(() => {
  const price = form.price
  const life = form.usefulLife
  if (!price || !life || life <= 0) return '-'
  return (Math.round(price / (life * 12) * 100) / 100).toLocaleString('id-ID', { maximumFractionDigits: 2 })
})

const selectedCategory = computed({
  get: () => categoryOptions.value.find(c => c.value === selectedCategoryId.value),
  set: (val) => {
    selectedCategoryId.value = val?.value
    form.categoryId = val?.value as unknown as number
  }
})

const selectedSubCategory = computed({
  get: () => subCategoryOptions.value.find(s => s.value === form.subCategoryId),
  set: (val) => { form.subCategoryId = val?.value as unknown as number }
})

watch(selectedCategoryId, async (newVal) => {
  if (!newVal) {
    subCategoryOptions.value = []
    form.subCategoryId = undefined as unknown as number
    return
  }
  await fetchSubCategories(Number(newVal))
  if (form.subCategoryId && !subCategoryOptions.value.some(s => s.value === form.subCategoryId)) {
    form.subCategoryId = undefined as unknown as number
  }
})

// This form is where the user picks category/sub category etc. — the transfer
// row itself is never completed inline. Once the asset(s) are created, we
// link them back to it.
const loadTransfer = async () => {
  const res = await transferService.getById(transferId.value)
  if (!res.success || !res.data) {
    toastGlobal.add({ title: t('pages.transfer.mergeNotFound'), color: 'error', icon: 'i-lucide-circle-alert' })
    navigateTo('/transfer')
    return
  }
  if (res.data.status === 'merged') {
    toastGlobal.add({ title: t('pages.transfer.mergeAlreadyDone'), color: 'error', icon: 'i-lucide-circle-alert' })
    navigateTo('/transfer')
    return
  }

  form.name = res.data.name
  if (res.data.price != null) form.price = res.data.price
  if (res.data.purchaseDate) form.purchaseDate = res.data.purchaseDate

  // One fixed code entry per unit — filled ones from the transfer's own code(s),
  // the rest left blank for the user to complete before submitting.
  const slots = Math.max(res.data.quantity, res.data.code.length)
  codes.value = Array.from({ length: slots }, (_, i) => ({ code: res.data.code[i] || '', bleTagMac: '' }))
}

type CodeStatus = 'checking' | 'available' | 'exists' | null
interface CodeEntry { code: string, bleTagMac: string }
const codes = ref<CodeEntry[]>([{ code: '', bleTagMac: '' }])
const codeStatuses = ref<Record<number, CodeStatus>>({})
const codeTimers: Record<number, ReturnType<typeof setTimeout>> = {}
const prevCodes = ref<string[]>([''])

const validateCode = (index: number, code: string) => {
  if (codeTimers[index]) clearTimeout(codeTimers[index])
  const trimmed = code?.trim()
  if (!trimmed) { codeStatuses.value[index] = null; return }
  codeStatuses.value[index] = 'checking'
  codeTimers[index] = setTimeout(async () => {
    const res = await assetService.checkCode(trimmed)
    if (codes.value[index]?.code?.trim() === trimmed && res.success) {
      codeStatuses.value[index] = res.data.exists ? 'exists' : 'available'
    }
  }, 500)
}

watch(codes, (newCodes) => {
  newCodes.forEach((entry, index) => {
    if (entry.code !== prevCodes.value[index]) validateCode(index, entry.code)
  })
  prevCodes.value = newCodes.map(c => c.code)
}, { deep: true })

const isDuplicateCode = (index: number) => {
  const code = codes.value[index]?.code?.trim()
  if (!code) return false
  return codes.value.some((c, i) => i !== index && c.code.trim() === code)
}

const hasInvalidCodes = computed(() => {
  const trimmed = codes.value.map(c => c.code.trim()).filter(c => c.length > 0)
  return new Set(trimmed).size !== trimmed.length || Object.values(codeStatuses.value).some(s => s === 'exists')
})

const handleSubmit = async () => {
  const validEntries = codes.value.filter(c => c.code.trim().length > 0)
  if (validEntries.length === 0) {
    toast.add({ title: t('pages.asset.create.codeRequired'), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  const codeValues = validEntries.map(c => c.code.trim())
  if (new Set(codeValues).size !== codeValues.length) {
    toast.add({ title: t('pages.asset.create.duplicateCodesError'), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }

  isSubmitting.value = true
  let successCount = 0
  const createdAssetIds: number[] = []
  const failedCodes: string[] = []
  const filteredLabels = getFilteredLabels()

  try {
    for (const entry of validEntries) {
      const payload: AssetPayload = {
        code: entry.code.trim(),
        name: form.name, description: form.description, price: form.price,
        purchaseDate: form.purchaseDate, brand: form.brand, model: form.model,
        image: form.image, subCategoryId: form.subCategoryId, labels: filteredLabels,
        bleTagMac: entry.bleTagMac?.trim() || null,
        hasHolder: form.hasHolder,
        hasMaintenance: form.hasMaintenance,
        hasLocation: form.hasLocation,
        usefulLife: form.usefulLife || undefined,
        attachmentIds: form.attachmentIds || null,
        status: form.status || null,
        statusNote: form.statusNote || null
      }
      const response = await assetService.create(payload)
      if (response.success) {
        successCount++
        createdAssetIds.push(response.data.id)
      } else {
        failedCodes.push(entry.code.trim())
      }
    }
    if (successCount > 0) {
      toast.add({ title: t('pages.asset.create.successCount', { count: successCount }), color: 'success', icon: 'i-lucide-circle-check' })
    }
    if (failedCodes.length > 0) {
      toast.add({ title: t('pages.asset.create.failedCreate', { codes: failedCodes.join(', ') }), description: t('pages.asset.create.codeExistsHint'), color: 'error', icon: 'i-lucide-circle-alert' })
    }
    if (failedCodes.length === 0 && createdAssetIds.length > 0) {
      await transferService.merge(transferId.value, createdAssetIds)
      navigateTo(createdAssetIds.length === 1 ? `/asset/${createdAssetIds[0]}` : '/asset')
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchLabelKeys()
  loadTransfer()
})
</script>
