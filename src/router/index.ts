import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import HomePage from '@/pages/HomePage.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagerPage from '@/pages/admin/UserManagerPage.vue'
import AddPicturePage from '@/pages/AddPicturePage.vue'
import PictureManagerPage from '@/pages/admin/PictureManagerPage.vue'
import PictureDetailPage from '@/pages/PictureDetailPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '主页',
      component: HomePage,
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage
    },
    {
      path: '/admin/userManager',
      name: '用户管理',
      component: UserManagerPage
    },
    {
      path: '/add_picture',
      name: '创建图片',
      component: AddPicturePage
    },
    {
      path: '/admin/pictureManager',
      name: '图片管理',
      component: PictureManagerPage
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: PictureDetailPage,
      props: true
    },
  ],
})

export default router
