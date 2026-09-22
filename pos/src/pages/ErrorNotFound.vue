<template>
  <q-page class="flex flex-center column q-pa-xl" style="min-height: 100vh">
    <div class="font-display text-weight-bold ink-faint" style="font-size: 5rem; line-height: 1">404</div>
    <div class="page-title q-mt-sm">{{ t('notFound.title') }}</div>
    <div class="page-subtitle q-mt-xs q-mb-lg">{{ t('notFound.subtitle') }}</div>
    <q-btn unelevated color="primary" class="stamp" :to="landing" :label="t('notFound.back')" />
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'

const auth = useAuthStore()
const { t } = useI18n()
const landing = computed(() => (auth.isLoggedIn ? '/app' : '/'))
</script>
