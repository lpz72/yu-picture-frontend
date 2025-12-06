<template>
  <div id="picture-search-form">
    <!--  搜索框  -->
    <div style="margin-bottom: 10px">
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="关键词">
          <a-input v-model:value="searchParams.searchText" placeholder="从名称或简介搜索" allowClear />
        </a-form-item>
        <a-form-item
          label="分类"
          name="category"
        >
          <a-auto-complete
            v-model:value="searchParams.category"
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
            v-model:value="searchParams.tags"
            mode="tags"
            placeholder="请输入标签"
            :options="tagsOptions"
            style="min-width: 120px"
            allowClear
          />
        </a-form-item>
        <a-form-item
        label="编辑时间"
        name="editTime"
        >
          <a-range-picker
            v-model:value="dateRange"
            style="width: 400px"
            show-time
            format="YYYY/MM/DD HH:mm:ss"
            :presets="rangePresets"
            @change="onRangeChange"
          />
        </a-form-item>
        <a-form-item label="名称">
          <a-input v-model:value="searchParams.name" placeholder="请输入名称" allowClear />
        </a-form-item>
        <a-form-item label="简介">
          <a-input
            v-model:value="searchParams.introduction"
            placeholder="请输入简介"
            allowClear />
        </a-form-item>
        <a-form-item label="宽度">
          <a-input-number
            v-model:value="searchParams.picWidth"
            placeholder="请输入宽度"
            style="min-width: 100px"
            allowClear />
        </a-form-item>
        <a-form-item label="高度">
          <a-input-number
            v-model:value="searchParams.picHeight"
            placeholder="请输入高度"
            style="min-width: 100px"
            allowClear />
        </a-form-item>
        <a-form-item label="格式">
          <a-select
            v-model:value="searchParams.picFormat"
            placeholder="请选择格式"
            :options="formatOptions"
            style="min-width: 120px"
            allowClear
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" style="width: 90px">搜索</a-button>
            <a-button html-type="reset" @click="doReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { PIC_REVIEW_STATUS_OPTIONS } from '@/constants/picture'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { RangeValue } from 'ant-design-vue/es/vc-picker/interface'

//搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}
const props = defineProps<Props>()


const categoryOptions = ref<string[]>([])

const tagsOptions = ref<string[]>([])

const formatOptions = [
  {
    value: "png",
    label: "png"
  },
  {
    value: "jpg",
    label: "jpg"
  },
  {
    value: "webp",
    label: "webp"
  },
  {
    // jpg、jpeg、png、gif、bmp、webp、tif、tiff、avif、heic、hei
    value: "jpeg",
    label: "jpeg"
  },
  {
    value: "gif",
    label: "gif"
  },
  {
    value: "bmp",
    label: "bmp"
  }
]

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


const dateRange = ref<[]>([])

const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
]);

/**
 * 日期范围更改时触发
 * @param dates
 * @param dateStrings
 */
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates.length < 2) {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  } else {
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  }
};



// 搜索
const doSearch =  () => {
  props.onSearch?.(searchParams)
}

// 重置
const doReset = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach(key => {
    searchParams[key] = undefined
  })
  dateRange.value = []
 props.onSearch?.(searchParams)
}

// 页面加载时请求一次
onMounted(() => {
  getTagsCategoryOptions()
})


</script>

<style scoped>
#picture-search-form .ant-form-item {
  margin-top: 16px;
}
</style>

