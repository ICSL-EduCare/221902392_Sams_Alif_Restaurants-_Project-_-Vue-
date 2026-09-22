<template>
  <q-page class="q-pa-md q-pa-lg-lg page-shell">
    <div class="q-mb-lg">
      <div class="eyebrow">{{ t('invoice.ledger') }}</div>
      <div class="page-title">{{ t('invoice.invoices') }}</div>
      <div class="page-subtitle q-mt-xs">{{ t('invoice.subtitle') }}</div>
    </div>

    <div class="row q-mb-md items-center" style="gap: 10px">
      <q-input v-model="search" filled dense class="col search-input" :placeholder="t('invoice.searchPlaceholder')" clearable>
        <template #prepend><q-icon name="sym_o_search" /></template>
      </q-input>
    </div>

    <q-tabs v-model="tab" class="ledger-tabs q-mb-sm" active-color="primary" indicator-color="primary" align="left" no-caps dense>
      <q-tab name="upcoming" :label="`${t('invoice.upcoming')} (${orders.upcoming.length})`" />
      <q-tab name="previous" :label="`${t('invoice.previous')} (${orders.previous.length})`" />
    </q-tabs>

    <div class="surface-card">
      <template v-if="!rows.length">
        <div class="ink-soft text-center q-pa-xl">
          {{ orders.orders.length ? t('invoice.noMatch') : t('invoice.noOrders') }}
        </div>
      </template>

      <div v-for="o in rows" :key="o.id" class="ledger-row clickable-row" @click="openOrder(o)">
        <div class="tone-dot-wrap"><span class="tone-dot" :class="o.status === 'upcoming' ? 'dot-upcoming' : 'dot-done'" /></div>
        <div class="col min-width-0">
          <div class="row items-center no-wrap" style="gap: 8px">
            <div class="font-mono ink-soft" style="font-size: 0.8rem">{{ o.invoiceNo }}</div>
            <div class="font-display text-weight-bold ellipsis">{{ o.customer.name }}</div>
          </div>
          <div class="ink-faint" style="font-size: 0.8rem">
            {{ formatDateTime(o.createdAt) }} &middot; {{ t('invoice.table') }} {{ o.table }}<span v-if="o.seat"> &middot; {{ t('invoice.seat') }} {{ o.seat }}</span>
          </div>
        </div>
        <div class="font-mono text-weight-bold amount">{{ formatMoney(o.total) }}</div>
        <q-icon name="sym_o_chevron_right" class="ink-faint" />
      </div>
    </div>

    <InvoiceDialog
      v-if="activeOrder"
      v-model="dialogOpen"
      :order="activeOrder"
      :restaurant="restaurantStore.forOrder(activeOrder)"
      @complete="onComplete"
      @reopen="onReopen"
      @close="onDialogClose"
    />
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orders'
import { useRestaurantStore } from '@/stores/restaurants'
import { formatDateTime } from '@/utils/dates'
import { formatMoney } from '@/utils/money'
import { useI18n } from '@/composables/useI18n'
import InvoiceDialog from '@/components/invoice/InvoiceDialog.vue'

const props = defineProps({ id: { type: String, default: '' } })
const route = useRoute()
const router = useRouter()
const orders = useOrderStore()
const restaurantStore = useRestaurantStore()
const { t } = useI18n()

const search = ref('')
const tab = ref('upcoming')

const matches = (o, needle) =>
  !needle ||
  o.invoiceNo.toLowerCase().includes(needle) ||
  o.customer.name.toLowerCase().includes(needle) ||
  String(o.table).toLowerCase().includes(needle)

const rows = computed(() => {
  const needle = search.value?.trim().toLowerCase() ?? ''
  const source = tab.value === 'upcoming' ? orders.upcoming : orders.previous
  return source.filter((o) => matches(o, needle))
})

const dialogOpen = ref(false)
const activeOrder = ref(null)

function openOrder(o) {
  activeOrder.value = o
  dialogOpen.value = true
  if (route.params.id !== o.id) router.replace(`/app/invoices/${o.id}`)
}
function onDialogClose() {
  if (route.params.id) router.replace('/app/invoices')
}
function onComplete(id) {
  orders.complete(id)
  dialogOpen.value = false
}
function onReopen(id) {
  orders.reopen(id)
  dialogOpen.value = false
}

watch(
  () => props.id,
  (id) => {
    if (!id) return
    const order = orders.byId(id)
    if (order) {
      activeOrder.value = order
      dialogOpen.value = true
      tab.value = order.status === 'upcoming' ? 'upcoming' : 'previous'
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.page-shell {
  max-width: 760px;
  margin: 0 auto;
}
.search-input {
  border-radius: 8px;
}
.ledger-tabs {
  border-bottom: 1px solid var(--line);
}
.ledger-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--line);
  &:last-child {
    border-bottom: none;
  }
}
@media (max-width: 480px) {
  .ledger-row {
    padding: 11px 12px;
    gap: 8px;
  }
}
.tone-dot-wrap {
  width: 8px;
}
.dot-upcoming {
  background: var(--saffron);
}
.dot-done {
  background: var(--basil);
}
.amount {
  font-size: 0.95rem;
}
@media (max-width: 360px) {
  .amount {
    font-size: 0.86rem;
  }
}
</style>
