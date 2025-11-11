import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      // @ts-ignore: suppress missing .vue module type error; add a shims-vue.d.ts in src for a permanent fix
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/tasks',
      name: 'tasks',
      // @ts-ignore: suppress missing .vue module type error; add a shims-vue.d.ts in src for a permanent fix

      component: () => import('../views/TaskView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/points',
      name: 'points',
      // @ts-ignore: suppress missing .vue module type error; add a shims-vue.d.ts in src for a permanent fix

      component: () => import('../views/PointsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      // @ts-ignore: suppress missing .vue module type error; add a shims-vue.d.ts in src for a permanent fix

      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // 检查用户是否已登录（这里简化处理，实际应该从store中获取）
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (isLoggedIn) {
      next()
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
