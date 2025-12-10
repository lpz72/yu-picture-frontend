<template>
  <div class="image-cropper">
    <a-modal v-model:open="open"  title="编辑图片" :footer="null" @cancel="closeModal">
      <vue-cropper
        ref="cropperRef"
        :img="imageUrl"
        output-type="png"
        :info="true"
        :can-move="true"
        :can-move-box="true"
        :fixed-box="false"
        :auto-crop="true"
        :center-box="true"
      />
      <div style="margin-bottom: 16px"/>
      <div class="image-cropper-actions" style="text-align: center">
        <a-space>
          <a-button @click="changeScale(1)" >放大</a-button>
          <a-button @click="changeScale(-1)">缩小</a-button>
          <a-button @click="rotateLeft" >向左旋转</a-button>
          <a-button @click="rotateRight" >向右旋转</a-button>
          <a-button type="primary" :loading="loading" @click="handleConfirm" >确认</a-button>
        </a-space>

      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import { uploadPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

// 指定初始值
const props = defineProps<Props>()

const loading = ref(false)

// 编辑器组件的引用
const cropperRef = ref()
// 放大或缩小
const changeScale = (num: number) => {
  num = num || 1
  cropperRef.value.changeScale(num)
}

// 左旋
const rotateLeft = () => {
  cropperRef.value.rotateLeft();
}

// 右旋
const rotateRight = () => {
  cropperRef.value.rotateRight();
}


// 确认裁剪
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    // blob 为已裁剪的文件
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob],fileName,{type: blob.type})
    // 上传图片
    handleUpload({file})
  })

}

/**
 * 上传图片
 * @param file
 */
const handleUpload = async ({file}: any) => {

  loading.value = true
  const params:API.PictureUploadRequest = props.picture ? { id: props.picture.id} : {};
  params.spaceId = props.spaceId
  const res = await uploadPictureUsingPost(params,{},file)
  try {
    if (res.code === 0 && res.data) {
      message.success("图片上传成功")
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data)
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


.vue-cropper {
  height: 400px !important;
}
</style>
