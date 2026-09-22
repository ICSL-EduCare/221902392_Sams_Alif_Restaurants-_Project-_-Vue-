<template>
  <div class="slip">
    <img v-if="restaurant?.logo" :src="restaurant.logo" class="slip-logo" />
    <div class="text-center font-display text-weight-bold" style="font-size: 1.05rem">
      {{ restaurant?.name || 'Resto POS' }}
    </div>
    <div v-if="restaurant?.address" class="text-center ink-soft" style="font-size: 0.8rem">{{ restaurant.address }}</div>
    <div v-if="restaurant?.phone" class="text-center ink-soft font-mono" style="font-size: 0.78rem">Tel: {{ restaurant.phone }}</div>
    <div v-if="order.branch" class="text-center ink-soft" style="font-size: 0.78rem">{{ t('slip.branch') }}: {{ order.branch }}</div>

    <hr class="receipt-rule" />

    <div class="kv"><span>{{ t('slip.invoice') }}</span><span class="font-mono">{{ order.invoiceNo }}</span></div>
    <div class="kv"><span>{{ t('slip.date') }}</span><span class="font-mono">{{ formatDateTime(order.createdAt) }}</span></div>
    <div class="kv"><span>{{ t('slip.customer') }}</span><span>{{ order.customer.name }}</span></div>
    <div v-if="order.customer.phone" class="kv"><span>{{ t('slip.phone') }}</span><span class="font-mono">{{ order.customer.phone }}</span></div>
    <div v-if="seating" class="kv"><span>{{ t('slip.seating') }}</span><span>{{ seating }}</span></div>
    <!-- Task 4: surface the existing completedAt timestamp on completed orders (data already
         stored by stores/orders.js `complete()`; it just wasn't shown anywhere before). -->
    <div v-if="order.status === 'completed' && order.completedAt" class="kv">
      <span>{{ t('invoice.completedAt') }}</span><span class="font-mono">{{ formatDateTime(order.completedAt) }}</span>
    </div>

    <hr class="receipt-rule" />

    <div v-for="l in order.lines" :key="l.itemId" class="slip-line">
      <div class="col">
        <div>{{ l.name }}</div>
        <div class="ink-faint font-mono" style="font-size: 0.78rem">{{ l.qty }} &times; {{ formatMoney(l.price) }}</div>
      </div>
      <div class="font-mono">{{ formatMoney(l.amount) }}</div>
    </div>

    <hr class="receipt-rule" />
    <div class="kv"><span>{{ t('slip.subtotal') }}</span><span class="font-mono">{{ formatMoney(order.subtotal) }}</span></div>
    <div class="kv ink-soft" style="font-size: 0.85rem">
      <span>{{ t('orders.vat', { rate: Math.round(order.taxRate * 1000) / 10 }) }}</span><span class="font-mono">{{ formatMoney(order.tax) }}</span>
    </div>
    <hr class="receipt-rule" />
    <div class="kv total"><span>{{ t('slip.total') }}</span><span class="font-mono">{{ formatMoney(order.total) }}</span></div>
    <hr class="receipt-rule" />
    <div class="text-center ink-faint" style="font-size: 0.78rem">{{ t('slip.thankYou') }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateTime } from '@/utils/dates'
import { formatMoney } from '@/utils/money'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({ order: { type: Object, required: true }, restaurant: { type: Object, default: null } })
const { t } = useI18n()

const seating = computed(() =>
  [props.order.table && `${t('invoice.table')} ${props.order.table}`, props.order.seat && `${t('invoice.seat')} ${props.order.seat}`]
    .filter(Boolean)
    .join(', '),
)
</script>

<style lang="scss" scoped>
.slip {
  max-width: 320px;
  margin: 0 auto;
}
.slip-logo {
  display: block;
  max-width: 64px;
  max-height: 64px;
  margin: 0 auto 8px;
  border-radius: 6px;
}
.kv {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.86rem;
  padding: 2px 0;
}
.kv.total {
  font-weight: 700;
  font-size: 1.05rem;
}
.slip-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 0;
  font-size: 0.88rem;
}
</style>
