<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{route.query?.id ? "修改图片" : "创建图片"}}
    </h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{spaceId}}</a>
    </a-typography-paragraph>
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="本地上传图片">
        <PictureUpload :picture="picture"  :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL上传图片">
        <UrlPictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
    </a-tabs>

    <div v-if="picture" class="edit-bar">
      <a-space>
        <a-button :icon="h(EditOutlined)" @click="doEditPicture">编辑图片</a-button>
        <a-button :icon="h(EditOutlined)" @click="doOutPaintingPicture">AI扩图</a-button>

      </a-space>
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onCropSuccess"
      />
      <ImageOutPainting
        ref="imageOutPaintingRef"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onOutPaintingSuccess"
      />
    </div>

    <a-form
      v-if="picture || route.query?.id"
      layout="vertical"
      :model="pictureForm"
      name="basic"
      @finish="handleSubmit"
    >
      <a-form-item
        label="名称"
        name="name"
      >
        <a-input
          v-model:value="pictureForm.name"
          placeholder="请输入名称"
          allowClear
        />
      </a-form-item>

      <a-form-item
        label="简介"
        name="introduction"
      >
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :rows="2"
          autoSize
          allowClear
        />
      </a-form-item>
      <a-form-item
        label="分类"
        name="category"
      >
        <a-auto-complete
          v-model:value="pictureForm.category"
          mode="tags"
          placeholder="请输入分类"
          :options="categoryOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item
        label="标签"
        name="tags"
      >
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagsOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item >
        <a-button type="primary" html-type="submit" style="width: 100%">创建</a-button>
      </a-form-item>

    </a-form>

  </div>
</template>

<script setup lang="ts">

import PictureUpload from '@/components/PictureUpload.vue'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { editPictureUsingPost, getPictureVoByIdUsingGet, listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import { EditOutlined } from '@ant-design/icons-vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'

const picture = ref<API.PictureVO>()
const pictureForm = reactive<API.PictureEditRequest>({})

const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture;
  pictureForm.name = newPicture.name;

}

const uploadType = ref<'file' | 'url'>('file')

const router = useRouter()
const route = useRoute()

// 从url中获取空间id
const spaceId = computed(() => {
  return route.query?.spaceId
})

/**
 * 提交表单
 */
const handleSubmit = async (values: any) => {

  const pictureId = picture.value.id;
  if (!pictureId) {
    return;
  }

  const res = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...values
  })
  if (res.code === 0 && res) {
    message.success("创建成功")
    // 跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`
    })
  } else {
    message.error("创建失败，" + res.message)
  }

}

const categoryOptions = ref<string[]>([])

const tagsOptions = ref<string[]>([])

// 获取标签和分类选项
const getTagsCategoryOptions = async () => {
    const res = await listPictureTagCategoryUsingGet()
  if (res.code === 0 && res) {
    // 转换成下拉选项支持的格式
    categoryOptions.value = (res.data.category ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    tagsOptions.value = (res.data.tags ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error("加载选项失败，" + res.message)
  }
}


/**
 * 根据id查询到要修改的图片
 */
const getOldPicture = async () => {
  console.log(route)
  const pictureId = route.query?.id
  console.log(pictureId)
  if (pictureId) {
    const res = await getPictureVoByIdUsingGet({id: pictureId})
    if (res.code === 0 && res) {
      const data = res.data
      console.log(data)
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }

  }

}

// 编辑弹窗组件引用
const imageCropperRef = ref()
// 点击后打开弹窗
const doEditPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}

// 编辑图片成功后的回调函数
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// AI扩图弹窗组件引用
const imageOutPaintingRef = ref()
// 点击后打开弹窗
const doOutPaintingPicture = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value.openModal()
  }
}
// 图片扩图成功后的回调函数
const onOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}



onMounted(() => {
  getOldPicture()
  getTagsCategoryOptions()
})




</script>

<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}

#addPicturePage .edit-bar {
  text-align: center;
  margin: 16px 0;
}

</style>
