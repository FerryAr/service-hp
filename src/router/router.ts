import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../core/stores/auth";
import { Role } from "../core/types/user";

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'login-home',
        component: () => import('../Views/Auth/LoginPage.vue'),
        beforeEnter: (_to, _from, next) => {
            const authStore = useAuthStore();
            if(authStore.isAuthenticated) {
                if(authStore.user.role === Role.CS) {
                    next({ name: 'cs-dashboard' });
                } else if(authStore.user.role === Role.KEPALA_TEKNISI) {
                    next({ name: 'kepala-teknisi-dashboard' });
                } else if(authStore.user.role === Role.TEKNISI) {
                    next({ name: 'teknisi' });
                }
            } else {
                next();
            }
        },
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../Views/Auth/LoginPage.vue'),
        beforeEnter: (_to, _from, next) => {
            const authStore = useAuthStore();
            if(authStore.isAuthenticated) {
                if(authStore.user.role === Role.CS) {
                    next({ name: 'cs-dashboard' });
                } else if(authStore.user.role === Role.KEPALA_TEKNISI) {
                    next({ name: 'kepala-teknisi-dashboard' });
                } else if(authStore.user.role === Role.TEKNISI) {
                    next({ name: 'teknisi' });
                }
            } else {
                next();
            }
        },
    },
    {
        name: 'cs',
        path: '/cs',
        component: () => import('../Views/layouts/master.vue'),
        beforeEnter: (_to, _from, next) => {
            const authStore = useAuthStore();
            if(authStore.isAuthenticated && authStore.user.role === Role.CS) {
                next();
            } else {
                authStore.logout();
            }
        },
        children: [
            {
                name: 'cs-dashboard',
                path: 'dashboard',
                component: () => import('../Views/cs/dashboard/DashboardPage.vue'),
            },
            {
                name: 'cs-orders',
                path: 'orders',
                component: () => import('../Views/cs/orders/OrdersPage.vue'),
            }
        ],
    },
    {
        name: 'kepala-teknisi',
        path: '/kepala-teknisi',
        component: () => import('../Views/layouts/master.vue'),
        beforeEnter: (_to, _from, next) => {
            const authStore = useAuthStore();
            if(authStore.isAuthenticated && authStore.user.role === Role.KEPALA_TEKNISI) {
                next();
            } else {
                authStore.logout();
            }
        },
        children: [
            {
                name: 'kepala-teknisi-dashboard',
                path: 'dashboard',
                component: () => import('../Views/kepala-teknisi/dashboard/DashboardPage.vue'),
            },
            {
                name: 'kepala-teknisi-orders',
                path: 'orders',
                component: () => import('../Views/kepala-teknisi/orders/OrdersPage.vue'),
            }
        ],
    },
    {
        path: '/teknisi',
        name: 'teknisi',
        component: () => import('../Views/layouts/master.vue'),
        beforeEnter: (_to, _from, next) => {
            const authStore = useAuthStore();
            if(authStore.isAuthenticated && authStore.user.role === Role.TEKNISI) {
                next();
            } else {
                authStore.logout();
            }
        },
        children: [
            {
                name: 'teknisi-dashboard',
                path: 'dashboard',
                component: () => import('../Views/teknisi/dashboard/DashboardPage.vue'),
            },
            {
                name: 'teknisi-orders',
                path: 'orders',
                component: () => import('../Views/teknisi/orders/OrdersPage.vue'),
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;