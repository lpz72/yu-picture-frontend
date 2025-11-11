<template>
  <div id="addPictureBatchPage">
    <h2 style="margin-bottom: 16px">
      批量创建图片
    </h2>

    <a-form
      layout="vertical"
      :model="formData"
      name="basic"
      @finish="handleSubmit"
    >
      <a-form-item
        label="关键词"
        name="searchText"
      >
        <a-input
          v-model:value="formData.searchText"
          placeholder="请输入关键词"
          allowClear
        />
      </a-form-item>

      <a-form-item
        label="抓取数量"
        name="count"
      >
        <a-input-number
          style="width: 180px"
          v-model:value="formData.count"
          placeholder="请输入数量"
          min="1"
          max="30"
          autoSize
          allowClear
        />
      </a-form-item>
      <a-form-item
        label="名称前缀"
        name="category"
      >
        <a-input
          v-model:value="formData.namePrefix"
          placeholder="请输入图片名称前缀，会自动补充序号"
          allowClear
        />
      </a-form-item>
      <a-form-item >
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">执行任务</a-button>
      </a-form-item>

    </a-form>

  </div>
</template>

<script setup lang="ts">

import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, reactive, ref } from 'vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
  uploadPictureByBatchUsingPost
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

const formData = reactive<API.uploadPictureByBatchUsingPOSTParams>({
  count: 10
})


const router = useRouter()
const loading = ref(false)

/**
 * 提交表单
 */
const handleSubmit = async (values: any) => {

  loading.value = true
  const res = await uploadPictureByBatchUsingPost({
    ...formData
  })
  if (res.code === 0 && res) {
    message.success(`创建成功,共${res.data}条`)
    // 跳转到首页
    router.push({
      path: '/'
    })
  } else {
    message.error("创建失败，" + res.message)
  }

  loading.value = false
}


</script>

<style scoped>
#addPictureBatchPage {
  max-width: 720px;
  margin: 0 auto;
}

</style>
