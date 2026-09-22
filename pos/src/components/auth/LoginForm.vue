<template>
  <q-card flat class="auth-card glass-card">
    <div class="eyebrow q-mb-xs">{{ t('auth.staffSignIn') }}</div>
    <div class="page-title q-mb-lg">{{ t('auth.welcomeBack') }}</div>

    <q-form class="column auth-form" @submit.prevent="onSubmit">
      <q-input
        v-model="email"
        filled
        :label="t('auth.email')"
        type="email"
        class="auth-field"
        :rules="[required(t('auth.emailRequired')), emailRule]"
        lazy-rules
        autocomplete="username"
      />
      <q-input
        v-model="password"
        filled
        :type="showPassword ? 'text' : 'password'"
        :label="t('auth.password')"
        class="auth-field"
        :rules="[required(t('auth.passwordRequired'))]"
        lazy-rules
        autocomplete="current-password"
      >
        <template #append>
          <q-icon
            :name="showPassword ? 'sym_o_visibility_off' : 'sym_o_visibility'"
            class="cursor-pointer ink-faint"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <div v-if="error" class="error-banner q-mt-sm">{{ error }}</div>

      <q-btn
        type="submit"
        unelevated
        color="primary"
        class="stamp q-mt-md"
        size="md"
        :loading="loading"
        :label="t('auth.signIn')"
      />
    </q-form>

    <div class="row items-center q-my-lg">
      <q-separator class="col hairline" />
    </div>

    <div class="text-center ink-soft" style="font-size: 0.9rem">
      {{ t('auth.newHere') }}
      <a href="#" class="link" @click.prevent="$emit('register')">{{ t('auth.createAccount') }}</a>
    </div>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { emailRule, required } from '@/utils/validators'
import { useI18n } from '@/composables/useI18n'

defineEmits(['register'])

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

function onSubmit() {
  error.value = ''
  loading.value = true
  const result = auth.login(email.value, password.value)
  loading.value = false
  if (!result.ok) {
    error.value = t(`auth.error.${result.code}`)
    return
  }
  router.replace('/app')
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
// Clear, even rhythm between fields so filled inputs never visually merge.
.auth-form {
  gap: 18px;
}
.auth-field {
  // Filled inputs already carry their own bottom border; a touch of separation
  // on top keeps each field reading as its own control rather than a stack.
  border-radius: 8px;
}
.error-banner {
  background: var(--clay-tint);
  color: var(--clay);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.86rem;
}
.link {
  color: var(--paprika);
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>
