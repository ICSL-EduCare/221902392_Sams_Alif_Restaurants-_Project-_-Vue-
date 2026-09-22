<template>
  <q-page class="q-pa-md q-pa-lg-lg page-shell">
    <div class="row items-start justify-between q-mb-lg" style="gap: 12px">
      <div>
        <div class="eyebrow">{{ t('items.menu') }}</div>
        <div class="page-title">{{ t('items.allItems') }}</div>
        <div class="page-subtitle q-mt-xs">{{ t('items.itemsCount', { n: menu.items.length }) }}</div>
      </div>
      <q-btn unelevated color="primary" class="stamp" icon="sym_o_add" :label="t('items.addItem')" @click="openAdd" />
    </div>

    <div class="row q-mb-lg items-center" style="gap: 10px">
      <q-input
        v-model="search"
        filled
        dense
        class="col search-input"
        :placeholder="t('items.searchItems')"
        clearable
      >
        <template #prepend><q-icon name="sym_o_search" /></template>
      </q-input>
      <q-select
        v-model="categoryFilter"
        filled
        dense
        emit-value
        map-options
        :options="filterOptions"
        style="min-width: 170px"
        class="col-auto"
      />
    </div>

    <div v-if="!menu.items.length" class="empty-state surface-card q-pa-xl text-center">
      <q-icon name="sym_o_restaurant_menu" size="40px" class="ink-faint q-mb-sm" />
      <div class="font-display text-weight-bold" style="font-size: 1.1rem">{{ t('items.emptyTitle') }}</div>
      <div class="ink-soft q-mt-xs q-mb-md">{{ t('items.emptyBody') }}</div>
      <div class="row justify-center" style="gap: 8px">
        <q-btn unelevated color="primary" class="stamp" :label="t('items.addItem')" @click="openAdd" />
        <q-btn outline class="stamp" :label="t('items.loadSample')" @click="menu.addSamples()" />
      </div>
    </div>

    <div v-else-if="!filtered.length" class="ink-soft text-center q-mt-xl">{{ t('items.noMatch') }}</div>

    <div v-else class="item-grid">
      <div v-for="it in filtered" :key="it.id" class="chit item-chit" :class="toneClass(it.category)">
        <div class="tone-chit-bar tone-bar" />
        <div class="q-pa-md">
          <div class="row items-start justify-between no-wrap" style="gap: 6px">
            <div class="font-display text-weight-bold ellipsis col" style="font-size: 1.02rem">{{ it.name }}</div>
            <div class="row no-wrap" style="gap: 2px">
              <q-btn flat round dense icon="sym_o_edit" size="sm" class="ink-soft" @click="openEdit(it)" />
              <q-btn flat round dense icon="sym_o_delete_outline" size="sm" class="ink-soft" @click="confirmDelete(it)" />
            </div>
          </div>
          <span class="tone-chip q-mt-sm">{{ it.category }}</span>
          <div class="font-mono price q-mt-md">{{ formatMoney(it.price) }}</div>
        </div>
      </div>
    </div>

    <ItemFormDialog v-model="dialogOpen" :item="editingItem" @submit="onSubmit" />

    <q-dialog v-model="deleteOpen">
      <q-card class="surface-card" style="min-width: 280px">
        <q-card-section class="font-display text-weight-bold">{{ t('items.deleteTitle') }}</q-card-section>
        <q-card-section class="ink-soft q-pt-none">{{ t('items.deleteBody', { name: toDelete?.name }) }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" v-close-popup />
          <q-btn unelevated color="negative" class="stamp" :label="t('common.delete')" v-close-popup @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Notify } from 'quasar'
import { useMenuStore } from '@/stores/menu'
import { formatMoney } from '@/utils/money'
import { toneClass } from '@/utils/tone'
import { useI18n } from '@/composables/useI18n'
import ItemFormDialog from '@/components/items/ItemFormDialog.vue'

const menu = useMenuStore()
const { t } = useI18n()
const search = ref('')
const categoryFilter = ref('all')

const filterOptions = computed(() => [
  { label: t('orders.allCategories'), value: 'all' },
  ...menu.usedCategories.map((c) => ({ label: c, value: c })),
])

const filtered = computed(() => {
  const needle = search.value?.trim().toLowerCase() ?? ''
  return menu.items.filter((it) => {
    const matchesSearch = !needle || it.name.toLowerCase().includes(needle)
    const matchesCategory = categoryFilter.value === 'all' || it.category === categoryFilter.value
    return matchesSearch && matchesCategory
  })
})

const dialogOpen = ref(false)
const editingItem = ref(null)
const deleteOpen = ref(false)
const toDelete = ref(null)

function openAdd() {
  editingItem.value = null
  dialogOpen.value = true
}
function openEdit(it) {
  editingItem.value = it
  dialogOpen.value = true
}
function onSubmit(data) {
  if (editingItem.value) menu.update(editingItem.value.id, data)
  else menu.add(data)
  dialogOpen.value = false
  Notify.create({ type: 'positive', message: t('items.savedToast') })
}
function confirmDelete(it) {
  toDelete.value = it
  deleteOpen.value = true
}
function doDelete() {
  menu.remove(toDelete.value.id)
  Notify.create({ message: t('items.deletedToast') })
}
</script>

<style lang="scss" scoped>
.page-shell {
  max-width: 980px;
  margin: 0 auto;
}
.search-input {
  border-radius: 8px;
}
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
@media (max-width: 599px) {
  .item-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
}
.item-chit {
  padding-left: 5px;
}
.tone-chit-bar {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
}
.price {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ink);
}
.empty-state {
  max-width: 420px;
  margin: 40px auto;
}
</style>
