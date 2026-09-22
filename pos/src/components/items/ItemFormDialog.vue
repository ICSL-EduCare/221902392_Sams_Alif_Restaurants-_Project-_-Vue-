<template>
  <q-dialog v-model="open" @hide="$emit('close')">
    <q-card class="surface-card form-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="page-title" style="font-size: 1.25rem">{{ editing ? t('items.editItemTitle') : t('items.addItemTitle') }}</div>
        <q-space />
        <q-btn flat round dense icon="sym_o_close" v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="column" style="gap: 4px" @submit.prevent="onSubmit">
          <q-input v-model="name" filled :label="t('items.itemName')" :rules="[required(t('items.itemNameRequired'))]" lazy-rules autofocus />

          <q-select
            v-model="category"
            filled
            use-input
            new-value-mode="add-unique"
            :label="t('items.category')"
            :options="categoryOptions"
            @filter="filterCategories"
            @new-value="onNewCategory"
            :rules="[required(t('items.categoryRequired'))]"
            lazy-rules
          />

          <q-input
            v-model.number="price"
            filled
            :label="t('items.price')"
            :prefix="currencySymbol"
            type="number"
            step="0.01"
            min="0"
            :rules="[positivePrice]"
            lazy-rules
          />

          <q-card-actions align="right" class="q-px-none q-pt-md">
            <q-btn flat :label="t('common.cancel')" v-close-popup />
            <q-btn type="submit" unelevated color="primary" class="stamp" :label="editing ? t('common.saveChanges') : t('items.addItem')" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { required, positivePrice } from '@/utils/validators'
import { useI18n } from '@/composables/useI18n'
import { CURRENCY_SYMBOL } from '@/config'

const props = defineProps({ modelValue: { type: Boolean, default: false }, item: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue', 'close', 'submit'])

const menu = useMenuStore()
const { t } = useI18n()
const currencySymbol = CURRENCY_SYMBOL

const open = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (open.value = v),
)
watch(open, (v) => emit('update:modelValue', v))

const editing = ref(false)
const name = ref('')
const category = ref('')
const price = ref(null)
const formRef = ref(null)
const categoryOptions = ref(menu.categories)

watch(
  () => props.item,
  (it) => {
    editing.value = Boolean(it)
    name.value = it?.name ?? ''
    category.value = it?.category ?? ''
    price.value = it?.price ?? null
  },
  { immediate: true },
)

function filterCategories(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    categoryOptions.value = menu.categories.filter((c) => c.toLowerCase().includes(needle))
  })
}
function onNewCategory(val, done) {
  const clean = val.trim()
  if (clean) done(clean, 'add-unique')
}

async function onSubmit() {
  const valid = await formRef.value.validate()
  if (!valid) return
  emit('submit', { name: name.value, category: category.value, price: price.value })
}
</script>

<style lang="scss" scoped>
.form-card {
  width: 100%;
  max-width: 400px;
}
</style>
