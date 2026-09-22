<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="app-header">
      <q-toolbar class="q-px-md">
        <q-btn
          v-if="$q.screen.lt.md"
          flat
          dense
          round
          icon="sym_o_menu"
          class="q-mr-sm ink"
          @click="drawer = !drawer"
        />
        <div class="row items-center no-wrap" style="gap: 10px">
          <q-avatar v-if="restaurant?.logo" size="30px" square class="logo-avatar">
            <img :src="restaurant.logo" />
          </q-avatar>
          <q-avatar v-else size="30px" square class="logo-avatar bg-tone text-white">
            <span class="font-display text-weight-bold">{{ initials }}</span>
          </q-avatar>
          <div>
            <div class="font-display text-weight-bold ellipsis header-name" style="font-size: 1rem; line-height: 1.1">
              {{ restaurant?.name || t('layout.setupPrompt') }}
            </div>
            <div v-if="branches.length" class="eyebrow">{{ activeBranch }}</div>
          </div>
        </div>

        <q-space />

        <q-select
          v-if="branches.length > 1"
          v-model="activeBranch"
          :options="branches"
          dense
          filled
          class="branch-select q-mr-sm gt-xs"
          style="min-width: 150px"
        />

        <LanguageSwitcher class="q-mr-sm gt-xs" />

        <q-btn
          flat
          round
          dense
          :icon="theme.isDark ? 'sym_o_light_mode' : 'sym_o_dark_mode'"
          class="ink q-mr-xs"
          @click="theme.toggle()"
        >
          <q-tooltip>{{ theme.isDark ? t('layout.switchToLight') : t('layout.switchToDark') }}</q-tooltip>
        </q-btn>

        <q-btn flat round dense icon="sym_o_logout" class="ink" @click="confirmLogout = true">
          <q-tooltip>{{ t('layout.logout') }}</q-tooltip>
        </q-btn>
      </q-toolbar>

      <div class="lang-row-mobile lt-sm">
        <LanguageSwitcher />
      </div>
    </q-header>

    <q-drawer
      v-model="drawer"
      :breakpoint="1005"
      :width="220"
      class="app-rail"
      :show-if-above="$q.screen.gt.sm"
    >
      <q-list class="q-pa-sm">
        <q-item
          v-for="link in links"
          :key="link.to"
          clickable
          :to="link.to"
          exact
          active-class="rail-active"
          class="rail-item q-mb-xs"
        >
          <q-item-section avatar style="min-width: 34px">
            <q-icon :name="link.icon" size="20px" />
          </q-item-section>
          <q-item-section>{{ t(link.labelKey) }}</q-item-section>
        </q-item>
      </q-list>

      <q-space />

      <div class="q-pa-md ink-faint eyebrow">Resto POS</div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="$q.screen.lt.md" bordered class="bottom-tabs no-print">
      <q-tabs active-color="primary" indicator-color="transparent" dense>
        <q-route-tab v-for="link in links" :key="link.to" :to="link.to" :icon="link.icon" :label="t(link.shortLabelKey)" />
      </q-tabs>
    </q-footer>

    <q-dialog v-model="confirmLogout">
      <q-card class="surface-card" style="min-width: 280px">
        <q-card-section class="font-display text-weight-bold">{{ t('layout.logoutConfirmTitle') }}</q-card-section>
        <q-card-section class="ink-soft q-pt-none">{{ t('layout.logoutConfirmBody') }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" v-close-popup />
          <q-btn unelevated color="primary" class="stamp" :label="t('layout.logout')" v-close-popup @click="doLogout" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRestaurantStore } from '@/stores/restaurants'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from '@/composables/useI18n'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

const router = useRouter()
const auth = useAuthStore()
const restaurantStore = useRestaurantStore()
const theme = useThemeStore()
const { t } = useI18n()

const drawer = ref(false)
const confirmLogout = ref(false)

const restaurant = computed(() => restaurantStore.active)
const branches = computed(() => restaurant.value?.branches ?? [])
const activeBranch = computed({
  get: () => branches.value[0] ?? '',
  set: () => {},
})
const initials = computed(() =>
  (restaurant.value?.name || 'RP')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const links = [
  { to: '/app/restaurant', icon: 'sym_o_storefront', labelKey: 'nav.restaurantSetup', shortLabelKey: 'nav.setup' },
  { to: '/app/items', icon: 'sym_o_restaurant_menu', labelKey: 'nav.allItems', shortLabelKey: 'nav.items' },
  { to: '/app/orders', icon: 'sym_o_point_of_sale', labelKey: 'nav.newOrder', shortLabelKey: 'nav.order' },
  { to: '/app/invoices', icon: 'sym_o_receipt_long', labelKey: 'nav.invoices', shortLabelKey: 'nav.invoices' },
]

function doLogout() {
  auth.logout()
  router.replace('/')
}
</script>

<style lang="scss" scoped>
.app-header {
  background: var(--surface);
  color: var(--ink);
  border-bottom: 1px solid var(--line);
}
.app-rail {
  background: var(--bg);
  border-right: 1px solid var(--line);
}
.rail-item {
  border-radius: 8px;
  color: var(--ink-soft);
  &:hover {
    background: var(--surface-sunken);
  }
}
.rail-active {
  background: var(--surface-sunken);
  color: var(--paprika);
  font-weight: 600;
}
.logo-avatar {
  border-radius: 7px;
  overflow: hidden;
  background: var(--paprika);
}
.header-name {
  max-width: 46vw;
}
.bottom-tabs {
  background: var(--surface);
  border-top: 1px solid var(--line);
}
.branch-select {
  border-radius: 8px;
}
.lang-row-mobile {
  display: flex;
  justify-content: flex-end;
  padding: 4px 12px 8px;
  border-top: 1px solid var(--line);
}
</style>
