<template>
  <div id="globalHeader">
<!--    取消换行-->
    <a-row :wrap="false">
      <a-col flex="200px">
        <RouterLink to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" alt="logo" />
            <div class="title">智能云图库</div>
          </div>
        </RouterLink>
      </a-col>
      <a-col flex="auto">
        <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items"  @click="doMenuClick"/>
      </a-col>
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            {{loginUserStore.loginUser.userName ?? '无名'}}
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
import { h, ref } from 'vue'
import { HomeOutlined } from '@ant-design/icons-vue'
import { MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import Router from '@/router'
import { healthUsingGet } from '@/api/mainController'
import { useLoginUserStore } from '@/stores/user'

const loginUserStore = useLoginUserStore()

const routers = Router.getRoutes()
const items = ref<MenuProps['items']>([
  {
    key: routers[0].path,
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: routers[1].path,
    label: '关于',
    title: '关于',
  },
  {
    key: 'others',
    label: h('a', { href: 'https://github.com/', target: '_blank' }, 'github'),
    title: 'github',
  },
])


//路由跳转事件
const router = useRouter()
const doMenuClick = ({key} : {key:string}) => {
  router.push({
    path: key,
  })
}

//当前选中的菜单
const current = ref<string[]>([])
//监听路由变化，更新当前选中的菜单
router.afterEach((to,from,next) => {
  current.value = [to.path]
})

healthUsingGet().then(res => {
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
