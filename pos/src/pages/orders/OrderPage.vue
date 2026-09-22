<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <div class="order-shell">
      <!-- Menu picker -->
      <div class="menu-side">
        <div class="eyebrow">{{ t('orders.eyebrow') }}</div>
        <div class="page-title q-mb-md">{{ t('orders.pickItems') }}</div>

        <div class="row q-mb-md items-center" style="gap: 10px">
          <q-input v-model="search" filled dense class="col search-input" :placeholder="t('orders.searchMenu')" clearable>
            <template #prepend><q-icon name="sym_o_search" /></template>
          </q-input>
          <q-select
            v-model="categoryFilter"
            filled
            dense
            emit-value
            map-options
            :options="filterOptions"
            style="min-width: 160px"
            class="col-auto"
          />
        </div>

        <div v-if="!menu.items.length" class="empty-state surface-card q-pa-xl text-center">
          <q-icon name="sym_o_restaurant_menu" size="36px" class="ink-faint q-mb-sm" />
          <div class="ink-soft">{{ t('orders.emptyMenu') }}</div>
          <q-btn flat no-caps color="primary" class="q-mt-sm" to="/app/items" :label="t('orders.goToItems')" />
        </div>

        <div v-else class="item-grid">
          <div
            v-for="it in filtered"
            :key="it.id"
            class="chit menu-chit"
            :class="toneClass(it.category)"
          >
            <div class="tone-chit-bar tone-bar" />
            <div class="q-pa-sm q-pl-md">
              <div class="font-display text-weight-bold ellipsis" style="font-size: 0.95rem">{{ it.name }}</div>
              <span class="tone-chip q-mt-xs">{{ it.category }}</span>
              <div class="row items-center justify-between q-mt-sm">
                <div class="font-mono" style="font-weight: 600">{{ formatMoney(it.price) }}</div>
                <div v-if="orders.qtyInCart(it.id)" class="row items-center no-wrap qty-stepper">
                  <q-btn flat dense round size="sm" icon="sym_o_remove" @click="orders.changeQty(it.id, -1)" />
                  <span class="font-mono q-mx-xs">{{ orders.qtyInCart(it.id) }}</span>
                  <q-btn flat dense round size="sm" icon="sym_o_add" @click="orders.changeQty(it.id, 1)" />
                </div>
                <q-btn v-else round dense unelevated color="primary" icon="sym_o_add" size="sm" @click="orders.addToCart(it)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ticket -->
      <div class="ticket-side">
        <div class="chit ticket q-pa-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="font-display text-weight-bold">{{ t('orders.ticket') }}</div>
            <q-badge v-if="orders.cartCount" class="count-badge" :label="t('orders.itemsCount', { n: orders.cartCount })" />
          </div>

          <div v-if="!orders.cart.length" class="ink-faint text-center q-py-lg" style="font-size: 0.88rem">
            {{ t('orders.tapToAdd') }}
          </div>

          <template v-else>
            <div v-for="line in orders.cart" :key="line.itemId" class="ticket-line">
              <div class="col">
                <div style="font-size: 0.9rem">{{ line.name }}</div>
                <div class="ink-faint font-mono" style="font-size: 0.78rem">
                  {{ line.qty }} &times; {{ formatMoney(line.price) }}
                </div>
              </div>
              <div class="font-mono" style="font-size: 0.9rem">{{ formatMoney(line.price * line.qty) }}</div>
              <q-btn flat round dense size="xs" icon="sym_o_close" class="ink-faint" @click="orders.removeLine(line.itemId)" />
            </div>

            <hr class="receipt-rule" />
            <div class="totals-row"><span>{{ t('orders.subtotal') }}</span><span class="font-mono">{{ formatMoney(orders.subtotal) }}</span></div>
            <div class="totals-row ink-soft" style="font-size: 0.86rem">
              <span>{{ t('orders.vat', { rate: Math.round(taxRate * 1000) / 10 }) }}</span><span class="font-mono">{{ formatMoney(orders.tax) }}</span>
            </div>
            <hr class="receipt-rule" />
            <div class="totals-row total-row"><span>{{ t('orders.total') }}</span><span class="font-mono">{{ formatMoney(orders.total) }}</span></div>

            <q-separator class="hairline q-my-md" />

            <q-form class="column" style="gap: 4px" @submit.prevent="onSubmit">
              <q-input v-model="customerName" filled dense :label="t('orders.customerName')" :rules="[required(t('orders.customerNameRequired'))]" lazy-rules />
              <q-input v-model="phone" filled dense :label="t('orders.phoneNumber')" :rules="[phoneRule]" lazy-rules />
              <div class="row" style="gap: 8px">
                <q-input v-model="table" filled dense class="col" :label="t('orders.tableNumber')" :rules="[required(t('orders.tableNumberRequired'))]" lazy-rules />
                <q-input v-model="seat" filled dense class="col" :label="t('orders.seatNumber')" />
              </div>
              <q-select
                v-if="branches.length > 1"
                v-model="branch"
                filled
                dense
                :options="branches"
                :label="t('orders.branch')"
              />

              <div v-if="error" class="error-banner q-mt-xs">{{ error }}</div>

              <q-btn
                type="submit"
                unelevated
                color="primary"
                class="stamp q-mt-sm"
                icon="sym_o_receipt_long"
                :label="t('orders.placeOrder')"
              />
            </q-form>
          </template>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useOrderStore } from '@/stores/orders'
import { useRestaurantStore } from '@/stores/restaurants'
import { formatMoney } from '@/utils/money'
import { toneClass } from '@/utils/tone'
import { required, phoneRule } from '@/utils/validators'
import { useI18n } from '@/composables/useI18n'
import { TAX_RATE } from '@/config'

const router = useRouter()
const menu = useMenuStore()
const orders = useOrderStore()
const restaurantStore = useRestaurantStore()
const { t } = useI18n()

const taxRate = TAX_RATE
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

const branches = computed(() => restaurantStore.active?.branches ?? [])
const branch = ref('')

const customerName = ref('')
const phone = ref('')
const table = ref('')
const seat = ref('')
const error = ref('')

function onSubmit() {
  error.value = ''
  if (!orders.cart.length) {
    error.value = t('orders.errorAddItem')
    return
  }
  const result = orders.placeOrder({
    customerName: customerName.value,
    phone: phone.value,
    table: table.value,
    seat: seat.value,
    branch: branch.value || branches.value[0] || '',
    restaurant: restaurantStore.activeSnapshot,
  })

  if (!result.ok) {
    if (result.code === 'conflict') {
      error.value = result.seat
        ? t('booking.conflictWithSeat', { table: result.table, seat: result.seat })
        : t('booking.conflictNoSeat', { table: result.table })
    } else {
      error.value = t('orders.errorAddItem')
    }
    return
  }

  router.push(`/app/invoices/${result.order.id}`)
}
</script>

<style lang="scss" scoped>
.order-shell {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 22px;
  align-items: start;
  max-width: 1180px;
  margin: 0 auto;
}
@media (max-width: 1023px) {
  .order-shell {
    grid-template-columns: 1fr;
  }
}
.search-input {
  border-radius: 8px;
}
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
@media (max-width: 599px) {
  .item-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
}
.menu-chit {
  padding-left: 5px;
}
.tone-chit-bar {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
}
.qty-stepper {
  background: var(--surface-sunken);
  border-radius: 20px;
}
.ticket-side {
  position: sticky;
  top: 16px;
}
@media (max-width: 1023px) {
  .ticket-side {
    position: static;
  }
}
.ticket {
  min-height: 200px;
}
.count-badge {
  background: var(--saffron-tint);
  color: var(--saffron);
  font-weight: 600;
  border-radius: 6px;
}
.ticket-line {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  border-bottom: 1px solid var(--line);
  &:last-of-type {
    border-bottom: none;
  }
}
.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
}
.total-row {
  font-weight: 700;
  font-size: 1.05rem;
}
.error-banner {
  background: var(--clay-tint);
  color: var(--clay);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.86rem;
}
.empty-state {
  max-width: 420px;
}
</style>
