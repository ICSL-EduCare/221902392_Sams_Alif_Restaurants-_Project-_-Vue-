import { computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import en from '@/i18n/en'
import bn from '@/i18n/bn'

// A small, dependency-free translation layer (no vue-i18n install needed).
// Usage inside a component's <script setup>:
//   const { t, locale, setLocale, toggleLocale } = useI18n()
//   t('auth.signIn')                       -> 'Sign in' / 'সাইন ইন'
//   t('items.itemsCount', { n: 4 })        -> '4 item(s)' / 'মেনুতে ৪টি আইটেম'
const dictionaries = { en, bn }

/** Replaces {token} placeholders in a translated string with the given values. */
function interpolate(str, vars) {
  if (!vars) return str
  return Object.keys(vars).reduce((s, key) => s.replaceAll(`{${key}}`, String(vars[key])), str)
}

export function useI18n() {
  const localeStore = useLocaleStore()

  function t(key, vars) {
    const dict = dictionaries[localeStore.locale] || dictionaries.en
    const raw = dict[key] ?? dictionaries.en[key] ?? key
    return interpolate(raw, vars)
  }

  const locale = computed(() => localeStore.locale)

  return {
    t,
    locale,
    setLocale: localeStore.setLocale,
    toggleLocale: localeStore.toggle,
  }
}
