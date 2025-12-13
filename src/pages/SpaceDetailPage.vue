<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <a-flex justify="space-between" style="margin-bottom: 10px">
      <h2 style="margin-bottom: 16px">{{space?.spaceName}}（私有空间）</h2>
      <a-space>
        <a-button :icon=h(PlusOutlined) type="primary" :href="`/add_picture/?spaceId=${props.id}`" target="_blank">创建图片</a-button>
        <a-button :icon=h(BarChartOutlined) type="primary" ghost :href="`/space_analyze?spaceId=${props.id}`" target="_blank">空间分析</a-button>
        <a-button :icon=h(EditOutlined)  @click="doBatchEdit">批量编辑</a-button>

        <a-popover title="使用情况" trigger="hover">
          <template #content>
            {{formatSize(space?.totalSize)}} / {{formatSize(space?.maxSize)}}
          </template>
          <a-progress type="circle"
                      :percent="((space?.totalSize * 100) / space?.maxSize).toFixed(2)"
                      :size="50" />
        </a-popover>
      </a-space>
    </a-flex>

    <!-- 搜索选项 -->
    <PictureSearchForm  :onSearch="onSearch"/>
    <!-- 颜色选择器   -->
    <a-form-item label="按颜色搜索" style="margin-top: 16px">
      <color-picker format="hex" @pureColorChange="onColorChange"/>
    </a-form-item>


    <!-- 数据展示 -->
    <PictureList :dataList="dataList" :loading="loading" :showOp="true" :onReload="fetchData" />
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :show-total="() => `图片总数 ${total} / ${space.maxCount}`"
      @change="onPageChange"
    />

    <BatchEditPictureModal ref="batchEditPicture"
      :pictureList="dataList"
      :spaceId="id"
      :onSuccess="batchEditOnSuccess"
    />
  </div>
</template>

<script setup lang="ts">

import { computed, h, onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
  listPictureVoByPageWithCacheUsingPost, searchPictureByColorUsingPost
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import PictureList from '@/components/PictureList.vue'
import { EditOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons-vue'
import { formatSize } from '@/utils'
import { getSpaceByIdUsingGet, getSpaceVoByIdUsingGet } from '@/api/spaceController'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import Vue3ColorPicker, { ColorPicker } from 'vue3-colorpicker'
import "vue3-colorpicker/style.css";
import ShareModal from '@/components/ShareModal.vue'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'

const dataList = ref([])
const loading = ref(true)
const total = ref(0)
const space = ref<API.SpaceVO>({})

// 获取到动态的参数id
const props = defineProps<{
  id: string | number
}>()

//搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取空间图片数据
const fetchData = async () => {
  loading.value = true
  if (!props.id) {
    return
  }
  const res = await listPictureVoByPageWithCacheUsingPost({
    spaceId:props.id,
    ...searchParams.value
  })
  if (res.code === 0 && res) {
    dataList.value = res.data.records ?? []
    total.value = res.data.total ?? 0
  } else {
    message.error("获取数据失败，" + res.message)
  }
  loading.value = false
}


const onPageChange = (page,pageSize) => {
    searchParams.value.current = page;
    searchParams.value.pageSize = pageSize;
    fetchData()
}


// 获取空间详情
const fetchSpaceDetail = async () => {
  const res = await getSpaceVoByIdUsingGet({id:props.id})
  if (res.code === 0 && res.data) {
      space.value = res.data
    // console.log(space)
  } else {
    message.error("空间详情获取失败，",res.message)
  }
}

const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1
  }
  fetchData()
}

// 颜色搜索事件
const onColorChange = async (color: string) => {
  const res = await searchPictureByColorUsingPost({
    spaceId: props.id,
    picColor: color
  })
  if (res.code === 0 && res.data) {
    dataList.value = res.data
    total.value = res.data.length
  } else {
    message.error("颜色搜索失败，" + res.message)
  }
}

// 接受子组件暴露的函数
const batchEditPicture = ref()

// 点击批量编辑按钮，打开弹窗
const doBatchEdit = () => {
  if (batchEditPicture.value) {
    batchEditPicture.value.openModal()
  }
}

// 批量编辑成功后的回调函数
const batchEditOnSuccess = () => {
  // 重新获取数据
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchSpaceDetail()
})

</script>

<style scoped>

:deep(.ant-pagination) {
  margin-bottom: 16px;
}

</style>
