<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px">
      {{route.query?.spaceId ? "修改" : "创建"}} {{ SPACE_TYPE_MAP[spaceType]}}
    </h2>

    <a-form
      layout="vertical"
      :model="spaceForm"
      name="basic"
      @finish="handleSubmit"
    >
      <a-form-item
        label="空间名称"
        name="spaceName"
      >
        <a-input
          v-model:value="spaceForm.spaceName"
          placeholder="请输入空间名称"
          allowClear
        />
      </a-form-item>

      <a-form-item
        label="空间级别"
        name="spaceLevel"
      >
        <a-select
          v-model:value="spaceForm.spaceLevel"
          placeholder="请输入空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allowClear
        />
      </a-form-item>
      <a-form-item >
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">提交</a-button>
      </a-form-item>
    </a-form>

    <!-- 展示空间级别信息 -->
    <a-card title="空间级别介绍" style="width: 100%">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系管理员
        <a href="https://mail.qq.com/" target="_blank">3072303289@qq.com</a>
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{spaceLevel.text}}: 大小 {{formatSize(spaceLevel.maxSize)}}，数量 {{spaceLevel.maxCount}}
      </a-typography-paragraph>
    </a-card>

  </div>
</template>

<script setup lang="ts">

import { computed, onMounted, reactive, ref } from 'vue'
import {
  editSpaceUsingPost, getSpaceByIdUsingGet,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet, updateSpaceUsingPost,
  uploadSpaceUsingPost
} from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/space'
import { formatSize } from '@/utils'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const space = ref<API.SpaceVO>()
const spaceForm = reactive<API.uploadSpaceUsingPOSTParams | API.SpaceUpdateRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})

const loading = ref(false)
const loginUser = useLoginUserStore().loginUser


const router = useRouter()
/**
 * 提交表单
 */
const handleSubmit = async (values: any) => {
  loading.value = true

  let spaceId = space.value?.id;
  let res;
  if (!spaceId) {
    // 创建
    res = await uploadSpaceUsingPost({
      ...spaceForm,
      spaceType: spaceType.value
    })
  } else {
    // 更新
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...spaceForm
    })
  }
  if (res.code === 0 && res) {
    message.success("操作成功")
    spaceId = spaceId ?? res.data
    // 判断是否是管理员，普通用户则跳转到空间详情页
    if (loginUser.userRole === "admin") {
      router.push({
        path: '/admin/spaceManager'
      })
    } else {
      router.push({
        path: `/space/${spaceId}`
      })
    }

  } else {
    message.error("操作失败，" + res.message)
  }
  loading.value = false

}



const route = useRoute()

/**
 * 根据id查询到要修改的空间
 */
const getOldSpace = async () => {
  const spaceId = route.query?.spaceId

  if (spaceId) {
    let res
    if (loginUser.userRole === "admin") {
      res = await getSpaceByIdUsingGet({id: spaceId})
    } else {
      res = await getSpaceVoByIdUsingGet({id: spaceId})
    }
    if (res.code === 0 && res.data) {
      const data = res.data
      space.value = data
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }

  }
}

/**
 * 获取空间级别信息
 */
const spaceLevelList = ref<API.SpaceLevel[]>([])
const getSpaceLevel = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.code === 0 && res.data) {
    console.log(res.data)
    spaceLevelList.value = res.data
  } else {
    message.error("加载空间级别失败，+",res.message)
  }
}

// 空间类别
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query?.type)
  }
  return SPACE_TYPE_ENUM.PRIVATE
})

onMounted(() => {
  getOldSpace()
  getSpaceLevel()
})

</script>

<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
}

</style>
