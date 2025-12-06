<template>
  <div class="url-picture-upload">
    <a-input-group compact style="margin-bottom: 16px">
      <a-input v-model:value="fileUrl" style="width: calc(100% - 120px)" placeholder="请输入图片URL"/>
      <a-button type="primary"  :loading="loading" style="width: 120px" @click="handleChange">提交</a-button>
    </a-input-group>
    <div style="margin-bottom: 10px;text-align: center">
      <img v-if="picture?.url" :src=picture?.url alt="avatar" />
    </div>

  </div>
</template>

<script setup lang="ts">

// 定义属性
import { message, type UploadProps } from 'ant-design-vue'
import { ref } from 'vue'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { uploadPictureByUrlUsingPost, uploadPictureUsingPost } from '@/api/pictureController'

interface Props {
  picture: API.PictureVO,
  spaceId: number,
  onSuccess: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()


const loading = ref<boolean>(false)
const fileUrl = ref()

/**
 * 上传图片
 */
const handleChange = async () => {

  loading.value = true
  const params: API.PictureUploadRequest = {fileUrl: fileUrl.value}
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
    } else {
      message.error("图片上传失败，" + res.message)
    }
  } catch (error) {
    message.error("图片上传失败")
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>

</style>
