// Small Quasar-style rules: each returns true when valid, or an error message.
import { useI18n } from '@/composables/useI18n'

const blank = (v) => v === null || v === undefined || String(v).trim() === ''

// Fallback-safe translation: rules can run before/without an active Pinia
// instance in rare edge cases, so a hardcoded English string is always the backstop.
function tr(key, vars, fallback) {
  try {
    return useI18n().t(key, vars)
  } catch {
    return fallback
  }
}

export const required =
  (message = 'This field is required') =>
  (v) =>
    !blank(v) || message

export const emailRule = (v) =>
  blank(v) ||
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ||
  tr('validation.email', null, 'Enter a valid email address')

export const phoneRule = (v) =>
  blank(v) ||
  /^\+?[0-9][0-9\s-]{6,17}$/.test(String(v).trim()) ||
  tr('validation.phone', null, 'Enter a valid phone number')

export const minLength = (n) => (v) =>
  blank(v) || String(v).length >= n || tr('validation.minLength', { n }, `Use at least ${n} characters`)

export const sameAs = (getOther, message) => (v) => v === getOther() || message

export const positivePrice = (v) =>
  Number(v) > 0 || tr('validation.positivePrice', null, 'Enter a price greater than 0')

export const positiveWhole = (label) => (v) =>
  blank(v) ||
  (Number.isInteger(Number(v)) && Number(v) > 0) ||
  tr('validation.positiveWhole', { label }, `${label} must be a whole number`)
