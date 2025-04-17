import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '@/components/MainPage.vue';
import MatchV3 from '@/components/MatchV3.vue';
import MatchBook from '@/components/MatchBook.vue';

const routes = [
    {
        path: '/',
        name: 'MainPage',
        component: MainPage,
    },
    {
        path: '/matchv3',
        name: 'MatchV3',
        component: MatchV3,
        beforeEnter: (to, from, next) => {
            // 检查 localStorage 中是否存在 token
            const token = localStorage.getItem('token');
            if (!token) {
                // 如果 token 不存在，重定向到首页
                next('/');
            } else {
                // 如果 token 存在，继续导航
                next();
            }
        }
    },
    {
        path: '/MatchBook',
        name: 'MatchBook',
        component: MatchBook,
        beforeEnter: (to, from, next) => {
            // 检查 localStorage 中是否存在 token
            const token = localStorage.getItem('token');
            if (!token) {
                // 如果 token 不存在，重定向到首页
                next('/');
            } else {
                // 如果 token 存在，继续导航
                next();
            }
        }
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
