<template>
  <div class="batch-edit-picture-modal">
    <a-modal v-model:open="open"  title="批量编辑图片" :footer="false"  @cancel="closeModal">
      <a-typography-paragraph type="secondary">
        * 仅对当前页面的图片生效
      </a-typography-paragraph>
      <a-form layout="vertical" :model="formData" @finish="handleSubmit">

        <a-form-item
          label="分类"
          name="category"
        >
          <a-auto-complete
            v-model:value="formData.category"
            mode="tags"
            placeholder="请输入分类"
            :options="categoryOptions"
            style="min-width: 100px"
            allowClear
          />
        </a-form-item>
        <a-form-item
          label="标签"
          name="tags"
        >
          <a-select
            v-model:value="formData.tags"
            mode="tags"
            placeholder="请输入标签"
            :options="tagsOptions"
            style="min-width: 120px"
            allowClear
          />
        </a-form-item>
        <a-form-item
          label="命名规则"
          name="nameRule"
        >
          <a-input
            v-model:value="formData.nameRule"
            placeholder="请输入命名规则，示例：图片名称{序号}"
            style="min-width: 120px"
            allowClear
          />
        </a-form-item>
        <a-form-item style=" text-align: center">
          <a-button type="primary" html-type="submit" style="width: 120px;">提交</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">

import { onMounted, reactive, ref } from 'vue'
import { listPictureTagCategoryUsingGet, pictureEditByBatchUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'


const categoryOptions = ref<string[]>([])

const tagsOptions = ref<string[]>([])

const formData = reactive<API.PictureEditByBatchRequest>({})

const open = ref(false)

// 定义组件属性
interface Props {
  pictureList: API.PictureVO[],
  spaceId: number,
  onSuccess: () => void
}

// 给组件指定初始值
const props = withDefaults(defineProps<Props>(),{})

// 打开弹窗
const openModal = () => {
  open.value = true
}

// 关闭弹窗
const closeModal = () => {
  open.value = false
}


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

// 提交表单时处理
const handleSubmit = async () => {
  const res = await pictureEditByBatchUsingPost({
    pictureIdList: props.pictureList.map((picture) => picture.id),
    spaceId: props.spaceId,
    ...formData
  })

  if(res.code === 0 && res.data) {
    message.success("操作成功")
    closeModal()
    // 成功后调用回到函数，即调用父组件与之绑定的函数
    props.onSuccess?.()
  } else {
    message.error("操作失败，" + res.message)
  }
}

// 暴露函数给父组件
defineExpose({
  openModal
})

onMounted(() => {
  getTagsCategoryOptions()
})

</script>
