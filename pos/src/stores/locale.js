import { defineStore } from 'pinia'

// The app ships English and Bangla. English stays the default so nothing
// changes for existing users until they pick a language.
export const SUPPORTED_LOCALES = ['en', 'bn']

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    locale: 'en', // 'en' | 'bn'
  }),

  actions: {
    setLocale(locale) {
      if (SUPPORTED_LOCALES.includes(locale)) this.locale = locale
    },
    toggle() {
      this.locale = this.locale === 'en' ? 'bn' : 'en'
    },
  },

  persist: { key: 'locale', paths: ['locale'] },
})
