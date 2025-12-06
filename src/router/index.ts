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
import AddPictureBatchPage from '@/pages/AddPictureBatchPage.vue'
import SpaceManagerPage from '@/pages/admin/SpaceManagerPage.vue'
import AddSpacePage from '@/pages/AddSpacePage.vue'
import SpaceDetailPage from '@/pages/SpaceDetailPage.vue'
import MySpacePage from '@/pages/MySpacePage.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import SearchPicturePage from '@/pages/SearchPicturePage.vue'

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
      path: '/add_picture/batch',
      name: '批量创建图片',
      component: AddPictureBatchPage
    },
    {
      path: '/admin/pictureManager',
      name: '图片管理',
      component: PictureManagerPage
    },
    {
      path: '/add_space',
      name: '创建空间',
      component: AddSpacePage
    },
    {
      path: '/admin/spaceManager',
      name: '空间管理',
      component: SpaceManagerPage
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: PictureDetailPage,
      props: true
    },
    {
      path: '/space/:id',
      name: '空间详情',
      component: SpaceDetailPage,
      props: true
    },
    {
      path: '/my_space',
      name: '我的空间',
      component: MySpacePage,
    },
    {
      path: '/search_picture',
      name: '图片搜索',
      component: SearchPicturePage,
    },
  ],
})

export default router
