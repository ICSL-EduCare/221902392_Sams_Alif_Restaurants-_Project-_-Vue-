<template>
  <div class="lang-switch font-mono" role="group" :aria-label="t('layout.language')">
    <button
      type="button"
      class="lang-btn"
      :class="{ 'lang-btn--active': locale === 'en' }"
      :aria-pressed="locale === 'en'"
      @click="setLocale('en')"
    >
      EN
    </button>
    <span class="lang-sep">|</span>
    <button
      type="button"
      class="lang-btn"
      :class="{ 'lang-btn--active': locale === 'bn' }"
      :aria-pressed="locale === 'bn'"
      @click="setLocale('bn')"
    >
      বাংলা
    </button>
  </div>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'

const { t, locale, setLocale } = useI18n()
</script>

<style lang="scss" scoped>
.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
}
.lang-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 7px;
  border-radius: 6px;
  color: var(--ink-faint);
  font-weight: 600;
  font-family: inherit;
  line-height: 1.2;
  transition: color 0.15s ease, background-color 0.15s ease;
  &:hover {
    color: var(--ink-soft);
  }
}
.lang-btn--active {
  color: var(--paprika);
  background: var(--surface-sunken);
  &:hover {
    color: var(--paprika);
  }
}
.lang-sep {
  color: var(--ink-faint);
  font-size: 0.72rem;
}
</style>
