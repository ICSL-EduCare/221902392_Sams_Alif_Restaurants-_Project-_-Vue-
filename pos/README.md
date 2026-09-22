# Resto POS

A restaurant management + retail POS hands-on test, built with **Vue 3 + Quasar**. No backend —
everything (accounts, restaurants, menu, orders, invoices) is kept in the browser's **Local
Storage** through a small Pinia persistence plugin.

Visual concept: **light mode reads like a printed order ticket, dark mode reads like a kitchen
chalkboard.** Menu categories get a stable colour ("tone") used consistently across item cards,
the order screen, and invoices.

---

## 1. Setup

```bash
npm install
npm run dev      # local dev server with hot reload
npm run build    # production build -> dist/spa
```

Requires Node 22.12+ (or 24 / 26) — same as any current Quasar CLI (Vite) project.

There is no seed data and no backend. On first run:

1. Open the app → you land on **Login**.
2. Click **"Create an account"** → fill the registration card (this swaps in place, no route
   change) → submit.
3. Sign in with the account you just created.
4. You'll land on **Restaurant setup** — add a restaurant (name, logo, address, phone, branches).
5. Go to **All items** → click **"Load sample menu"** for a quick 14-item starter menu, or add
   your own.
6. Go to **New order** → pick items → fill customer/table/seat → place the order → you're taken
   straight to that order's invoice.

Everything above is stored under `localStorage` keys prefixed `restopos:` (see
`src/utils/storage.js` / `src/config.js`).

---

## 2. Submitting

The task instructions ask for the finished project pushed to a new repo named after you. This
folder is not yet a git repo — from inside it:

```bash
git init
git add .
git commit -m "Restaurant POS — Vue 3 + Quasar hands-on test"
git branch -M main
git remote add origin <your-new-repo-url>
git push -u origin main
```

`node_modules`, `dist`, and `.quasar` are already git-ignored, so the push stays small.

---

## 3. Project structure

```
src/
  boot/            fonts.js (self-hosted webfonts), theme.js (applies saved dark/light mode)
  components/
    auth/          LoginForm, RegisterCard  (the two "faces" swapped on the login page)
    restaurant/    RestaurantFormDialog     (add/edit, incl. logo upload + resize)
    items/         ItemFormDialog
    invoice/       InvoiceSlip (shared visual, reused by the on-screen dialog),
                    InvoiceDialog (view / print / download actions)
  layouts/
    AuthLayout.vue just hosts the login route
    AppLayout.vue  left nav rail (desktop) / bottom tab bar (mobile), header, theme + logout
  pages/           one page per route — restaurant setup, items, orders, invoices, 404
  router/          routes.js + a beforeEach guard (requiresAuth / requiresGuest)
  stores/          auth, restaurants, menu, orders, theme — all Pinia
  stores/persist.js  a tiny Pinia plugin: any store that declares `persist: {...}`
                      is mirrored to Local Storage and kept in sync across tabs
  utils/           validators, money/date formatting, id generation, a dependency-free
                    SHA-256 (so passwords aren't kept as plain text in Local Storage),
                    image resizing for logo uploads, and invoice.js (text / PDF / print builders)
  css/             app.scss — the whole design-token system (light + dark), ticket/chit motifs
```

**State management:** every store is plain Pinia; `persist.js` is the only "framework" bit — it
reads saved state on store creation, writes back on every mutation, and listens for the
`storage` event so two open tabs stay in sync.

**Why jsPDF:** the brief allows a plain-text invoice download, but a PDF is called out as the
nicer option — it's loaded on demand (dynamic `import()`), so it doesn't cost anything until
someone actually clicks "PDF".

**A note on "Vue CLI":** the brief's step 1 says *"Must use Vue CLI + Quasar Framework"*. Vue CLI
itself was deprecated by the Vue team in 2023, and Quasar's own scaffolding tool (`npm init
quasar`, i.e. **Quasar CLI with Vite**) is what the Quasar team recommends for new projects — so
that's what this was built with. Functionally it's the same ask: a Vue 3 + Quasar SPA in .vue
SFCs, built with Vite instead of the (now unmaintained) Vue CLI/webpack pipeline.

---

## 4. Requirement checklist

| Brief | Where |
|---|---|
| Vue 3 + Quasar, SFC-only, no backend, Local Storage | Whole app; see `stores/persist.js` |
| **Step 1 — Auth:** login (email+password, only registered users), register card, name/email/password/confirm/phone, **register opens as a card in the same view, not a route change** | `pages/auth/AuthPage.vue` (a `mode` ref toggles `LoginForm` / `RegisterCard` — verified no router navigation fires when switching) |
| **Step 2 — Restaurant setup:** name, logo upload, address, phone, branch(es); add/edit/delete; nav to Items/Orders/Invoice | `pages/restaurant/RestaurantSetupPage.vue`, `components/restaurant/RestaurantFormDialog.vue` |
| **Step 3 — All items:** card view, name/price/edit/delete, add item (name, category, price), stored in LS | `pages/items/ItemsPage.vue`, `components/items/ItemFormDialog.vue` |
| **Step 4 — Order page:** select items, customer name/phone/table/seat, save to LS + redirect to invoice | `pages/orders/OrderPage.vue` (live receipt-style ticket panel) |
| **Step 5 — Invoice page:** all orders from LS, Upcoming (latest first) / Previous (older) sections, view/download(PDF or text)/print per order | `pages/invoice/InvoicePage.vue`, `components/invoice/InvoiceDialog.vue`, `utils/invoice.js` |
| Theme switcher (light/dark) | `stores/theme.js`, toggle in the header |
| Search & filter (items/orders) | Search + category filter on **Items** and **Orders**; search + Upcoming/Previous tabs on **Invoices** |
| Responsive (mobile + desktop) | Left nav rail → bottom tab bar (`q-footer`) under `md` breakpoint; single-column grids on narrow screens |
| Pinia + LS state management | `stores/*.js` |
| Clean, POS-like, original design | Custom "order ticket / chalkboard" design system in `css/app.scss` — no starter-kit theme |

Passwords are hashed (SHA-256, salted with the email) before being written to Local Storage —
not because Local Storage is a secure vault (it isn't), but so a plain password never sits there
in the clear.
