<template>
  <div id="mySpacePage">
    <p>正在跳转中，请稍候......</p>
  </div>
</template>

<script setup lang="ts">

import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController'

const loginUserStore = useLoginUserStore()

const router = useRouter()
const checkUserSpace = async () => {
  // 用户未登录，则跳转到登录页
  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    message.warn("请先登录")
    router.push("/user/login")
    return
  }
  // 用户已登录，获取其空间列表，暂且假设有一个私人空间
  const res = await listSpaceVoByPageUsingPost({
    userId: loginUser.id,
    current: 1,
    pageSize: 1
  })
  if (res.code === 0 && res.data) {
    if (res.data.records?.length > 0) {
      const space = res.data.records[0]
      await router.push(`/space/${space.id}`)
    } else {
      router.replace("/add_space")
      message.error("请先创建空间")
    }
  } else {
    message.error("加载我的空间失败，" + res.message)
  }
}


// 页面加载时检查用户空间
onMounted(() => {
  checkUserSpace()
})

</script>

<style scoped>


</style>
