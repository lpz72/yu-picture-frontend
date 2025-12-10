<template>
  <div class="image-out-painting">
    <a-modal v-model:open="open"  title="AI 扩图" :footer="null" @cancel="closeModal">
      <a-row gutter="16">
        <a-col span="12">
          <h4>原始图片</h4>
          <img :src="picture?.url" :alt="picture?.name" style="max-width: 100%" />
        </a-col>
        <a-col span="12">
          <h4>扩图结果</h4>
          <img
            v-if="resultImageUrl"
            :src="resultImageUrl"
            :alt="picture?.name"
            style="max-width: 100%" />
        </a-col>
      </a-row>
      <div style="margin-bottom: 16px"/>
      <a-typography-paragraph type="secondary">
          * 图像格式：JPG、JPEG、PNG、HEIF、WEBP。<br>
          * 图像大小：不超过10MB。<br>
          * 图像分辨率：不低于512×512像素且不超过4096×4096像素。<br>
          * 图像单边长度范围：[512, 4096]，单位像素。<br>
      </a-typography-paragraph>
      <div style="margin-bottom: 16px"/>
        <a-flex gap="16" justify="center">
          <a-button type="primary" ghost :loading="!!taskId" @click="createTask">生成结果</a-button>
          <a-button v-if="resultImageUrl" type="primary" :loading="loading" @click="handleUpload" >应用结果</a-button>
        </a-flex>
    </a-modal>
  </div>
</template>

<script setup lang="ts">

import { onUnmounted, ref } from 'vue'
import {
  createPictureOutPaintingTaskUsingPost, getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
  uploadPictureUsingPost
} from '@/api/pictureController'
import { message } from 'ant-design-vue'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

// 指定初始值
const props = defineProps<Props>()

const loading = ref(false)

const resultImageUrl = ref<string>()
// 任务id
const taskId = ref<string>()

/**
 * 创建任务
 */
const createTask = async () => {

  if (!props.picture?.id) {
    return
  }

  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    // 根据需要设置扩图参数
    parameters: {
      xScale: 2.0,
      yScale: 2.0
    }
  })

  if (res.code === 0 && res.data) {
    message.success("创建任务成功，请耐心等待，不要退出界面")
    taskId.value = res.data.output.taskId
    // 开启轮询
    startPolling()
  } else {
    message.error("任务创建失败，" + res.message)
  }

}

// 轮询定时器
let pollingTimer: NodeJS.Timeout = null

// 清理轮询定时器
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = null
  }
}

// 开始轮询
const startPolling = () => {
  if (!taskId.value) {
    return
  }

  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value
      })
      if (res.code === 0 && res.data) {
        const output = res.data.output
        if (output.taskStatus === 'SUCCEEDED') {
          resultImageUrl.value = output.outputImageUrl
          message.success("扩图任务成功")
          clearPolling()
        }
        if (output.taskStatus === 'FAILED') {
          console.log("输出：" + output)
          message.error("扩图任务失败，图片太大或太小")
          clearPolling()
        }
      } else {
        message.error("扩图任务失败，" + res.message + "，请稍后重试")
        clearPolling()
      }
    } catch (e) {
      message.error("检测任务状态失败，请稍后重试")
      clearPolling()
    }
  },3000) // 每隔3秒轮询一次

}

// 清理定时器，避免内存泄露
onUnmounted(() => {
  clearPolling()
})

/**
 * 上传图片
 */
const handleUpload = async () => {

  loading.value = true
  const params: API.PictureUploadRequest = {fileUrl: resultImageUrl.value}
  if (props.picture) {
    params.id = props.picture.id
  }
  params.spaceId = props.spaceId
  const res = await uploadPictureByUrlUsingPost(params)
  try {
    if (res.code === 0 && res.data) {
      message.success("图片上传成功")
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error("图片上传失败，" + res.message)
    }
  } catch (error) {
    message.error("图片上传失败")
  } finally {
    loading.value = false
  }
}


const open = ref(false)

const openModal = () => {
  open.value = true
}

const closeModal = () => {
  open.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal
})


</script>

<style scoped>

.image-out-painting {
  text-align: center;
}

</style>
