<template>
  <div id="globalHeader">
    <!--    取消换行-->
    <a-row :wrap="false">
      <a-col flex="200px">
        <RouterLink to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" alt="logo" />
            <div class="title">绘联云库</div>
          </div>
        </RouterLink>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space>
                <a-avatar :src=loginUserStore.loginUser.userAvatar />
                {{ loginUserStore.loginUser.userName ?? '无名' }}
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <router-link to="my_space"/>
                      <UserOutlined/>
                      我的空间
                  </a-menu-item>
                  <a-menu-item>
                    <a @click="doLogout">
                      <LogoutOutlined/>
                      退出登录
                    </a>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { HomeOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import Router from '@/router'
import { healthUsingGet } from '@/api/mainController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'

const loginUserStore = useLoginUserStore()

const routers = Router.getRoutes()
const originItems = [
  {
    key: "/",
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: "/admin/userManager",
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: "/add_picture",
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: "/admin/pictureManager",
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: "/admin/spaceManager",
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: 'others',
    label: h('a', { href: 'https://github.com/', target: '_blank' }, 'github'),
    title: 'github',
  },
]

// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (menu?.key?.toString().startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => filterMenus(originItems))


//路由跳转事件
const router = useRouter()
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

//当前选中的菜单
const current = ref<string[]>([])
//监听路由变化，更新当前选中的菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

/**
 * 用户注销
 */
const doLogout = async () => {
  const res = await userLogoutUsingPost(loginUserStore.loginUser.id)
  if (res.code === 0 && res.data) {
    message.success("退出登录成功")
    // 修改全局状态
    loginUserStore.setLoginUser({
      userName: '未登录'
    })
    await router.push({
      path: '/user/login',
      replace: true
    })
  } else {
    message.error("退出登录失败，" + res.message)
  }
}

healthUsingGet().then((res) => {
  console.log(res.data)
})
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  height: 48px;
}
</style>
