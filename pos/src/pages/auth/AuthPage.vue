<template>
  <q-page class="auth-page">
    <div class="auth-shell">
      <!-- Hero: a chalkboard-style specials board. Decorative, but built from real menu-style content. -->
      <div class="hero">
        <div class="hero-inner">
          <div class="row items-center no-wrap" style="gap: 10px">
            <div class="brand-mark font-display">RP</div>
            <div class="font-display text-weight-bold text-white" style="font-size: 1.15rem">
              Resto POS
            </div>
          </div>

          <div class="q-mt-xl">
            <div class="hero-eyebrow">{{ t('auth.heroEyebrow') }}</div>
            <div class="hero-title font-display">{{ t('auth.heroTitle') }}</div>
          </div>

          <div class="specials q-mt-xl">
            <div v-for="s in specials" :key="s.name" class="specials-row font-mono">
              <span>{{ s.name }}</span>
              <span class="specials-dots" />
              <span>{{ s.price }}</span>
            </div>
          </div>

          <div class="hero-foot ink-faint-on-dark">{{ t('auth.heroFoot') }}</div>
        </div>
      </div>

      <!-- Card: login or register, swapped in place -->
      <div class="card-side">
        <div class="lang-row no-print">
          <LanguageSwitcher />
        </div>
        <transition name="flip" mode="out-in">
          <LoginForm v-if="mode === 'login'" key="login" @register="mode = 'register'" />
          <RegisterCard v-else key="register" @back="mode = 'login'" />
        </transition>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterCard from '@/components/auth/RegisterCard.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const mode = ref('login')

const specials = [
  { name: 'Chicken Biryani', price: '350' },
  { name: 'Beef Burger', price: '380' },
  { name: 'Cold Coffee', price: '180' },
  { name: 'Firni', price: '120' },
]
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: stretch;
}
.auth-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  width: 100%;
  min-height: 100vh;
}
@media (max-width: 899px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }
}

.hero {
  background: #1b2420;
  color: #ede8dc;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 48px;
}
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(237, 232, 220, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(237, 232, 220, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}
@media (max-width: 899px) {
  .hero {
    padding: 32px 24px;
    min-height: 280px;
  }
}
.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 420px;
}
.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  background: #e0855a;
  color: #1b2420;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
}
.hero-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: #e0855a;
  margin-bottom: 6px;
}
.hero-title {
  font-size: 2.3rem;
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: #f4f1e8;
  white-space: pre-line;
}
.specials {
  border-top: 1.5px dashed rgba(237, 232, 220, 0.28);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.specials-row {
  display: flex;
  align-items: baseline;
  color: rgba(237, 232, 220, 0.86);
  font-size: 0.86rem;
}
.specials-dots {
  flex: 1;
  border-bottom: 1px dotted rgba(237, 232, 220, 0.3);
  margin: 0 8px 3px;
}
.hero-foot {
  margin-top: 40px;
  font-size: 0.78rem;
  color: rgba(237, 232, 220, 0.45);
}
@media (max-width: 899px) {
  .hero-foot {
    display: none;
  }
}

.card-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  position: relative;
}
.lang-row {
  position: absolute;
  top: 14px;
  right: 18px;
}
@media (max-width: 599px) {
  .lang-row {
    position: static;
    align-self: flex-end;
    margin-bottom: 10px;
  }
}

.flip-enter-active,
.flip-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.flip-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.flip-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
