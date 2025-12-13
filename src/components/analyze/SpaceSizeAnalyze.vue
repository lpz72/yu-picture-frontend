<template>
  <div class="space-Size-analyze">
    <a-card title="空间图片大小分析" >
      <v-chart :option="options" style="height: 320px; max-width: 100%" :loading="loading" />
    </a-card>
  </div>
</template>

<script setup lang="ts">

import { computed, ref, watchEffect } from 'vue'
import { getSpaceSizeAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import { message } from 'ant-design-vue'
import VChart from "vue-echarts";
import "echarts";

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

// 图表数据
const dataList = ref<API.SpaceSizeAnalyzeResponse[]>([])
const loading = ref<boolean>(false)

// 获取数据
const fetchData = async () => {
  loading.value = true
  const res = await getSpaceSizeAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId
  })
  if (res.code === 0 && res) {
    dataList.value = res.data ?? []
  } else {
    message.error("获取数据失败，" + res.message)
  }
  loading.value = false
}

// 图表选项
const options = computed(() => {
  const pieData = dataList.value.map((item) => ({
    name: item.sizeRange,
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      top: 'bottom',
    },
    series: [
      {
        name: '图片大小',
        type: 'pie',
        radius: '50%',
        data: pieData,
      },
    ],
  }
})

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  fetchData()
})

</script>

<style scoped>

</style>
