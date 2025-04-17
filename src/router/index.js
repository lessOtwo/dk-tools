import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '@/components/MainPage.vue';
import MyOverview from '@/components/MyOverview.vue';
import GptToFormatedDocx from '@/components/word/GptToFormatedDocx.vue';

const routes = [
    {
        path: '/',
        name: 'MainPage',
        component: MainPage,
        redirect: '/MyOverview',
        children: [
            {
                path: 'MyOverview',
                name: 'MyOverview',
                component: MyOverview
            },
            {
                path: 'GptToFormatedDocx',
                name: 'GptToFormatedDocx',
                component: GptToFormatedDocx
            }
        ]
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
