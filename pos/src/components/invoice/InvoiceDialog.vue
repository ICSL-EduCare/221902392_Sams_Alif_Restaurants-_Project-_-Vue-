<template>
  <q-dialog v-model="open" @hide="$emit('close')">
    <q-card class="surface-card slip-card">
      <q-card-section class="row items-center q-pb-none no-print">
        <div class="row items-center" style="gap: 8px">
          <q-badge :class="order.status === 'upcoming' ? 'badge-upcoming' : 'badge-done'" :label="order.status === 'upcoming' ? t('invoice.statusUpcoming') : t('invoice.statusCompleted')" />
          <div class="ink-faint font-mono" style="font-size: 0.8rem">{{ order.invoiceNo }}</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="sym_o_close" v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <InvoiceSlip :order="order" :restaurant="restaurant" />
      </q-card-section>

      <q-card-actions class="q-px-md q-pb-md no-print action-row" align="center">
        <q-btn outline class="stamp col" icon="sym_o_print" :label="t('invoice.print')" @click="onPrint" />
        <q-btn outline class="stamp col" icon="sym_o_download" :label="t('invoice.text')" @click="onDownloadText" />
        <q-btn unelevated color="primary" class="stamp col" icon="sym_o_picture_as_pdf" :label="t('invoice.pdf')" :loading="pdfLoading" @click="onDownloadPdf" />
      </q-card-actions>

      <q-card-actions class="q-px-md q-pb-md no-print" align="center">
        <q-btn
          v-if="order.status === 'upcoming'"
          flat
          no-caps
          color="secondary"
          icon="sym_o_task_alt"
          :label="t('invoice.markCompleted')"
          @click="$emit('complete', order.id)"
        />
        <q-btn v-else flat no-caps color="secondary" icon="sym_o_undo" :label="t('invoice.moveToUpcoming')" @click="$emit('reopen', order.id)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Notify } from 'quasar'
import InvoiceSlip from '@/components/invoice/InvoiceSlip.vue'
import { downloadInvoicePdf, downloadInvoiceText, printInvoice } from '@/utils/invoice'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  order: { type: Object, required: true },
  restaurant: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'close', 'complete', 'reopen'])
const { t } = useI18n()

const open = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (open.value = v),
)
watch(open, (v) => emit('update:modelValue', v))

const pdfLoading = ref(false)

function onPrint() {
  try {
    printInvoice(props.order, props.restaurant)
  } catch {
    Notify.create({ type: 'negative', message: t('invoice.printBlocked') })
  }
}
function onDownloadText() {
  try {
    downloadInvoiceText(props.order, props.restaurant)
  } catch {
    Notify.create({ type: 'negative', message: t('invoice.downloadBlocked') })
  }
}
async function onDownloadPdf() {
  pdfLoading.value = true
  try {
    await downloadInvoicePdf(props.order, props.restaurant)
  } catch {
    Notify.create({ type: 'negative', message: t('invoice.pdfFailed') })
  } finally {
    pdfLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.slip-card {
  width: 100%;
  max-width: 400px;
}
.badge-upcoming {
  background: var(--saffron-tint);
  color: var(--saffron);
  border-radius: 6px;
  font-weight: 600;
}
.badge-done {
  background: var(--basil-tint);
  color: var(--basil);
  border-radius: 6px;
  font-weight: 600;
}
@media (max-width: 360px) {
  .action-row {
    flex-wrap: wrap;
  }
}
</style>
