<template>
  <q-dialog v-model="open" @hide="$emit('close')">
    <q-card class="surface-card form-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="page-title" style="font-size: 1.25rem">
          {{ editing ? t('restaurant.editRestaurantTitle') : t('restaurant.addRestaurantTitle') }}
        </div>
        <q-space />
        <q-btn flat round dense icon="sym_o_close" v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="column" style="gap: 4px" @submit.prevent="onSubmit">
          <div class="row items-center q-mb-sm" style="gap: 14px">
            <q-avatar size="64px" square class="logo-preview">
              <img v-if="logo" :src="logo" />
              <q-icon v-else name="sym_o_storefront" size="28px" class="ink-faint" />
            </q-avatar>
            <div>
              <q-btn
                outline
                no-caps
                size="sm"
                class="stamp"
                icon="sym_o_upload"
                :label="t('restaurant.uploadLogo')"
                @click="fileInput?.click()"
              />
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="onLogoChange"
              />
              <div class="ink-faint q-mt-xs" style="font-size: 0.74rem">{{ t('restaurant.logoHint', { n: logoMaxMb }) }}</div>
            </div>
          </div>

          <q-input v-model="name" filled :label="t('restaurant.name')" :rules="[required(t('restaurant.nameRequired'))]" lazy-rules />
          <q-input
            v-model="address"
            filled
            type="textarea"
            autogrow
            :label="t('restaurant.address')"
            :rules="[required(t('restaurant.addressRequired'))]"
            lazy-rules
          />
          <q-input v-model="phone" filled :label="t('auth.phoneNumber')" :rules="[required(t('restaurant.phoneRequired')), phoneRule]" lazy-rules />

          <q-select
            v-model="branches"
            filled
            multiple
            use-input
            use-chips
            new-value-mode="add-unique"
            :label="t('restaurant.branches')"
            :hint="t('restaurant.branchesHint')"
            @new-value="onNewBranch"
          />

          <div v-if="error" class="error-banner q-mt-sm">{{ error }}</div>

          <q-card-actions align="right" class="q-px-none q-pt-md">
            <q-btn flat :label="t('common.cancel')" v-close-popup />
            <q-btn type="submit" unelevated color="primary" class="stamp" :label="editing ? t('common.saveChanges') : t('restaurant.addRestaurant')" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Notify } from 'quasar'
import { fileToLogoDataUrl } from '@/utils/image'
import { required, phoneRule } from '@/utils/validators'
import { useI18n } from '@/composables/useI18n'
import { LOGO_MAX_FILE_MB } from '@/config'

const props = defineProps({ modelValue: { type: Boolean, default: false }, restaurant: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue', 'close', 'submit'])
const { t } = useI18n()
const logoMaxMb = LOGO_MAX_FILE_MB

const open = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (open.value = v),
)
watch(open, (v) => emit('update:modelValue', v))

const editing = ref(false)
const name = ref('')
const address = ref('')
const phone = ref('')
const branches = ref([])
const logo = ref('')
const error = ref('')
const fileInput = ref(null)
const formRef = ref(null)

watch(
  () => props.restaurant,
  (r) => {
    editing.value = Boolean(r)
    name.value = r?.name ?? ''
    address.value = r?.address ?? ''
    phone.value = r?.phone ?? ''
    branches.value = r?.branches ? [...r.branches] : []
    logo.value = r?.logo ?? ''
    error.value = ''
  },
  { immediate: true },
)

function onNewBranch(val, done) {
  const clean = val.trim()
  if (clean) done(clean, 'add-unique')
}

async function onLogoChange(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (file.size > LOGO_MAX_FILE_MB * 1024 * 1024) {
    Notify.create({ type: 'negative', message: t('restaurant.logoTooBig', { n: LOGO_MAX_FILE_MB }) })
    return
  }
  try {
    logo.value = await fileToLogoDataUrl(file)
  } catch {
    Notify.create({ type: 'negative', message: t('restaurant.logoInvalid') })
  }
}

async function onSubmit() {
  error.value = ''
  const valid = await formRef.value.validate()
  if (!valid) return
  emit('submit', { name: name.value, address: address.value, phone: phone.value, branches: branches.value, logo: logo.value })
}
</script>

<style lang="scss" scoped>
.form-card {
  width: 100%;
  max-width: 460px;
}
.logo-preview {
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-sunken);
}
.hidden-input {
  display: none;
}
.error-banner {
  background: var(--clay-tint);
  color: var(--clay);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.86rem;
}
</style>
