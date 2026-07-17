import { createRouter, createWebHistory } from 'vue-router'

import ProductShell from '@/layouts/ProductShell.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: ProductShell,
      children: [
        { path: '', redirect: '/ui' },
        { path: 'ui', name: 'ui', component: () => import('@/pages/DesignSystemPage.vue'), meta: { title: 'Astian UI' } },
        { path: 'astiango', name: 'astiango', component: () => import('@/pages/AstianGoPage.vue'), meta: { title: 'AstianGO' } },
        { path: 'cloud', name: 'cloud', component: () => import('@/pages/CloudPage.vue'), meta: { title: 'Astian Cloud' } },
        { path: 'calendar', name: 'calendar', component: () => import('@/pages/CalendarPage.vue'), meta: { title: 'Astian Calendar' } },
        { path: 'midori', name: 'midori', component: () => import('@/pages/MidoriPage.vue'), meta: { title: 'Midori' } }
      ]
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/pages/NotFoundPage.vue') }
  ],
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' })
})

router.afterEach((to) => { document.title = `${String(to.meta.title || 'Astian UI')} · Astian` })

export default router
