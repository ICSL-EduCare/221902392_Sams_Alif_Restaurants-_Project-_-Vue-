<template>
  <q-card flat class="auth-card glass-card">
    <div class="row items-center no-wrap q-mb-lg" style="gap: 8px">
      <q-btn flat round dense icon="sym_o_arrow_back" size="sm" class="ink" @click="$emit('back')" />
      <div>
        <div class="eyebrow">{{ t('auth.createAccountTitle') }}</div>
        <div class="page-title" style="font-size: 1.4rem">{{ t('auth.joinCounter') }}</div>
      </div>
    </div>

    <q-form class="column auth-form" @submit.prevent="onSubmit">
      <q-input v-model="name" filled class="auth-field" :label="t('auth.fullName')" :rules="[required(t('auth.nameRequired'))]" lazy-rules />
      <q-input
        v-model="email"
        filled
        class="auth-field"
        :label="t('auth.email')"
        type="email"
        :rules="[required(t('auth.emailRequired')), emailRule]"
        lazy-rules
      />
      <q-input
        v-model="phone"
        filled
        class="auth-field"
        :label="t('auth.phoneNumber')"
        :rules="[required(t('auth.phoneRequired')), phoneRule]"
        lazy-rules
      />
      <q-input
        v-model="password"
        filled
        :type="showPassword ? 'text' : 'password'"
        class="auth-field"
        :label="t('auth.password')"
        :rules="[required(t('auth.choosePassword')), minLength(6)]"
        lazy-rules
      >
        <template #append>
          <q-icon
            :name="showPassword ? 'sym_o_visibility_off' : 'sym_o_visibility'"
            class="cursor-pointer ink-faint"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>
      <q-input
        v-model="confirm"
        filled
        :type="showPassword ? 'text' : 'password'"
        class="auth-field"
        :label="t('auth.confirmPassword')"
        :rules="[required(t('auth.confirmPasswordRequired')), sameAs(() => password, t('auth.passwordMismatch'))]"
        lazy-rules
      />

      <div v-if="error" class="error-banner q-mt-sm">{{ error }}</div>

      <q-btn
        type="submit"
        unelevated
        color="primary"
        class="stamp q-mt-md"
        size="md"
        :loading="loading"
        :label="t('auth.createAccountTitle')"
      />
    </q-form>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { emailRule, minLength, phoneRule, required, sameAs } from '@/utils/validators'
import { useI18n } from '@/composables/useI18n'

const emit = defineEmits(['back'])

const auth = useAuthStore()
const { t } = useI18n()

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

function onSubmit() {
  error.value = ''
  loading.value = true
  const result = auth.register({ name: name.value, email: email.value, password: password.value, phone: phone.value })
  loading.value = false
  if (!result.ok) {
    error.value = t(`auth.error.${result.code}`)
    return
  }
  Notify.create({ type: 'positive', message: t('auth.accountCreated') })
  emit('back')
}
</script>

<style lang="scss" scoped>
.auth-card {
  width: 100%;
  max-width: 380px;
  padding: 34px 32px;
}
@media (max-width: 599px) {
  .auth-card {
    padding: 26px 22px;
    border-radius: 14px;
  }
}
.auth-form {
  gap: 18px;
}
.auth-field {
  border-radius: 8px;
}
.error-banner {
  background: var(--clay-tint);
  color: var(--clay);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.86rem;
}
</style>
