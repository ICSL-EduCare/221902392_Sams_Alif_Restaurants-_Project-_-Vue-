<template>
  <q-page class="q-pa-md q-pa-lg-lg page-shell">
    <div class="row items-start justify-between q-mb-lg" style="gap: 12px">
      <div>
        <div class="eyebrow">{{ t('restaurant.step1') }}</div>
        <div class="page-title">{{ t('restaurant.yourRestaurant') }}</div>
        <div class="page-subtitle q-mt-xs">
          {{ t('restaurant.subtitle') }}
        </div>
      </div>
      <q-btn unelevated color="primary" class="stamp" icon="sym_o_add" :label="t('restaurant.addRestaurant')" @click="openAdd" />
    </div>

    <!-- Quick nav — same shortcuts as the sidebar, placed here per the setup-page spec -->
    <div class="row q-mb-lg" style="gap: 10px" v-if="restaurants.length">
      <q-btn
        v-for="n in quickNav"
        :key="n.to"
        outline
        no-caps
        class="stamp nav-chip"
        :icon="n.icon"
        :label="t(n.labelKey)"
        :to="n.to"
      />
    </div>

    <div v-if="!restaurants.length" class="empty-state surface-card q-pa-xl text-center">
      <q-icon name="sym_o_storefront" size="40px" class="ink-faint q-mb-sm" />
      <div class="font-display text-weight-bold" style="font-size: 1.1rem">{{ t('restaurant.emptyTitle') }}</div>
      <div class="ink-soft q-mt-xs q-mb-md">{{ t('restaurant.emptyBody') }}</div>
      <q-btn unelevated color="primary" class="stamp" :label="t('restaurant.addYourRestaurant')" @click="openAdd" />
    </div>

    <div v-else class="restaurant-grid">
      <div
        v-for="r in restaurants"
        :key="r.id"
        class="chit q-pa-md"
        :class="{ 'is-active': r.id === store.activeId }"
      >
        <div class="row items-start no-wrap q-mt-sm" style="gap: 12px">
          <q-avatar size="52px" square class="logo-preview">
            <img v-if="r.logo" :src="r.logo" />
            <q-icon v-else name="sym_o_storefront" size="24px" class="ink-faint" />
          </q-avatar>

          <div class="col min-width-0">
            <div class="row items-center no-wrap" style="gap: 8px">
              <div class="font-display text-weight-bold ellipsis" style="font-size: 1.05rem">
                {{ r.name }}
              </div>
              <q-badge v-if="r.id === store.activeId" class="active-badge" :label="t('restaurant.active')" />
            </div>
            <div class="ink-soft q-mt-xs" style="font-size: 0.86rem">{{ r.address }}</div>
            <div class="ink-soft font-mono" style="font-size: 0.82rem">{{ r.phone }}</div>

            <div class="row q-mt-sm" style="gap: 6px; flex-wrap: wrap">
              <span v-for="b in r.branches" :key="b" class="tone-chip tone-4">{{ b }}</span>
              <span v-if="!r.branches.length" class="ink-faint" style="font-size: 0.8rem">{{ t('restaurant.noBranches') }}</span>
            </div>
          </div>
        </div>

        <q-separator class="hairline q-my-sm" />

        <div class="row justify-end" style="gap: 4px">
          <q-btn
            v-if="r.id !== store.activeId"
            flat
            dense
            no-caps
            size="sm"
            :label="t('restaurant.setActive')"
            class="ink-soft"
            @click="store.setActive(r.id)"
          />
          <q-btn flat round dense icon="sym_o_edit" size="sm" class="ink-soft" @click="openEdit(r)" />
          <q-btn flat round dense icon="sym_o_delete_outline" size="sm" class="ink-soft" @click="confirmDelete(r)" />
        </div>
      </div>
    </div>

    <RestaurantFormDialog v-model="dialogOpen" :restaurant="editingRestaurant" @submit="onSubmit" />

    <q-dialog v-model="deleteOpen">
      <q-card class="surface-card" style="min-width: 280px">
        <q-card-section class="font-display text-weight-bold">{{ t('restaurant.deleteTitle') }}</q-card-section>
        <q-card-section class="ink-soft q-pt-none">
          {{ t('restaurant.deleteBody', { name: toDelete?.name }) }}
        </q-card-section>
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
import { useRestaurantStore } from '@/stores/restaurants'
import { useI18n } from '@/composables/useI18n'
import RestaurantFormDialog from '@/components/restaurant/RestaurantFormDialog.vue'

const store = useRestaurantStore()
const { t } = useI18n()
const restaurants = computed(() => store.list)

const dialogOpen = ref(false)
const editingRestaurant = ref(null)
const deleteOpen = ref(false)
const toDelete = ref(null)

const quickNav = [
  { to: '/app/items', icon: 'sym_o_restaurant_menu', labelKey: 'nav.allItems' },
  { to: '/app/orders', icon: 'sym_o_point_of_sale', labelKey: 'restaurant.navOrders' },
  { to: '/app/invoices', icon: 'sym_o_receipt_long', labelKey: 'nav.invoices' },
]

function openAdd() {
  editingRestaurant.value = null
  dialogOpen.value = true
}
function openEdit(r) {
  editingRestaurant.value = r
  dialogOpen.value = true
}
function onSubmit(data) {
  if (editingRestaurant.value) store.update(editingRestaurant.value.id, data)
  else store.add(data)
  dialogOpen.value = false
  Notify.create({ type: 'positive', message: t('restaurant.savedToast') })
}
function confirmDelete(r) {
  toDelete.value = r
  deleteOpen.value = true
}
function doDelete() {
  store.remove(toDelete.value.id)
  Notify.create({ message: t('restaurant.deletedToast') })
}
</script>

<style lang="scss" scoped>
.page-shell {
  max-width: 980px;
  margin: 0 auto;
}
.nav-chip {
  color: var(--ink-soft);
  border-color: var(--line-strong);
}
.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
@media (max-width: 599px) {
  .restaurant-grid {
    grid-template-columns: 1fr;
  }
}
.chit.is-active {
  border-color: var(--paprika);
}
.logo-preview {
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-sunken);
}
.active-badge {
  background: var(--basil-tint);
  color: var(--basil);
  font-weight: 600;
  font-size: 0.68rem;
  border-radius: 5px;
}
.empty-state {
  max-width: 420px;
  margin: 40px auto;
}
</style>
