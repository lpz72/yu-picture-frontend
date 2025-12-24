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
        :items="menuItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watchEffect } from 'vue'
import { PictureOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import Router from '@/router'
import { healthUsingGet } from '@/api/mainController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'
import { SPACE_TYPE_ENUM } from '@/constants/space'
import { listMySpaceTeamUsingPost } from '@/api/spaceUserController'

const loginUserStore = useLoginUserStore()

const routers = Router.getRoutes()
// 固定的菜单列表
const fixedMenuItems = [
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
  {
    key: "/add_space?type=" + SPACE_TYPE_ENUM.TEAM,
    icon: () => h(TeamOutlined),
    label: '创建团队',
    title: '创建团队',
  },
]


const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  // 没有团队空间
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  // 展示团队空间分组
  const tamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: "/space/" + spaceUser.spaceId,
      label: space?.spaceName
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    key: 'teamSpace',
    children: tamSpaceSubMenus,
  }
  return [
    ...fixedMenuItems,
    teamSpaceMenuGroup
  ]
})

//路由跳转事件
const router = useRouter()
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

//当前选中的菜单
const current = ref<string[]>([])
//监听路由变化，更新当前选中的菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

// 加载团队空间列表
const fetchData = async () => {
  const res = await listMySpaceTeamUsingPost()
  if (res.code === 0 && res.data) {
    teamSpaceList.value = res.data ?? []
  } else {
    message.error("加载团队空间失败，" + res.message)
  }
}

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  // 登录时才加载
  if (loginUserStore.loginUser.id) {
    fetchData()
  }
})

</script>

<style scoped>

</style>
