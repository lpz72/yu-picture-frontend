<template>
  <div id="globalSider">
    <a-layout-sider
      class="sider"
      width="200"
      breakpoint="lg"
      collapsed-width="0"
    >
      <a-menu
        v-model:selectedKeys="current"
        mode="inline"
        :items="items"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import Router from '@/router'
import { healthUsingGet } from '@/api/mainController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'

const loginUserStore = useLoginUserStore()

const routers = Router.getRoutes()
// 菜单列表
const items = [
  {
    key: "/",
    icon: () => h(PictureOutlined),
    label: '公共图库',
    title: '公共图库',
  },
  {
    key: "/my_space",
    icon: () => h(UserOutlined),
    label: '我的空间',
    title: '我的空间',
  },
]



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

</script>

<style scoped>

</style>
