<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :before-upload="beforeUpload"
      :custom-request="handleChange"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传图片</div>
      </div>
    </a-upload>
  </div>
</template>

<script setup lang="ts">

// 定义属性
import { message, type UploadProps } from 'ant-design-vue'
import { ref } from 'vue'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'

interface Props {
  picture: API.PictureVO,
  spaceId: number,
  onSuccess: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()


/**
 * 上传前进行校验
 * @param file
 */
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片，推荐jpg或png!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('不能上传超过2MB的图片')
  }
  return isJpgOrPng && isLt2M
}

const loading = ref<boolean>(false)
/**
 * 上传图片
 * @param file
 */
const handleChange = async ({file}: any) => {

  loading.value = true
  const params:API.PictureUploadRequest = props.picture ? { id: props.picture.id} : {};
  params.spaceId = props.spaceId
  const res = await uploadPictureUsingPost(params,{},file)
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
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

</style>
