<template>
  <div id="pictureManagerPage">
    <a-flex justify="space-between">
      <h2 style="margin-bottom: 16px">图片管理</h2>
      <a-button :icon=h(PlusOutlined) type="primary" :href="`/add_picture`">创建图片</a-button>
    </a-flex>

    <!--  搜索框  -->
    <div style="margin-bottom: 10px">
      <a-form  layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="关键词">
          <a-input v-model:value="searchParams.searchText" placeholder="从名称或简介搜索" allowClear/>
        </a-form-item>
        <a-form-item label="类型">
          <a-input v-model:value="searchParams.category" placeholder="请输入类型" allowClear/>
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            mode="tags"
            v-model:value="searchParams.tags"
            placeholder="请输入标签"
            style="min-width: 180px"
            allowClear/>
        </a-form-item>
        <a-form-item >
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-form-item>
      </a-form>
    </div>
    <!--  表格数据展示  -->
    <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="doTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src=record.url :width="120" />
        </template>
        <template v-if="column.dataIndex === 'introduction'">
          {{record.introduction ?? '暂无简介'}}
        </template>
        <template v-else-if="column.dataIndex === 'category'">
          {{record.category ?? '暂无分类'}}
        </template>
        <template v-else-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <div v-if="!record.tags">{{"暂无标签"}}</div>
            <a-tag v-else v-for="tag in JSON.parse(record.tags || '[]')" color="green" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>
        <template v-else-if="column.dataIndex === 'picInfo'">
          <div>格式：{{record.picFormat}}</div>
          <div>宽度：{{record.picWidth}}</div>
          <div>高度：{{record.picHeight}}</div>
          <div>宽高比：{{record.picScale}}</div>
          <div>大小：{{(record.picSize / 1024).toFixed(2)}}KB</div>

        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space :size="2">
            <a-button type="link" :href="`/add_picture/?id=${record.id}`" target="_blank">编辑</a-button>
            <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
          </a-space>

        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue';
import { computed, h, onMounted, reactive, ref } from 'vue'
import { deletePictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { listPictureByPageUsingPost } from '@/api/pictureController'
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    // 当单元格文本过长时用省略号显示
    ellipsis: true,
  },
  {
    title: '分类',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
];

// 数据
const dataList = ref([])
const total = ref(0)

//搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  console.log(searchParams)
  const res = await listPictureByPageUsingPost({
    ...searchParams
  })
  if (res.data) {
    dataList.value = res.data.records ?? []
    console.log(res.data.records)
    console.log(dataList.value)
    total.value = res.data.total ?? 0
  } else {
    message.error("数据获取失败，" + res.message)
  }
}

// 页面加载时请求一次
onMounted( () => {
  fetchData()
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 搜索
const doSearch = async () => {
  searchParams.current = 1
  await fetchData()
}

// 删除图片
const doDelete = async (id: string) => {
  // 传的是个对象，对id进行封装
  const res = await deletePictureUsingPost({id})
  if (res.code === 0) {
    message.success("删除成功")
    // 刷新数据
    await fetchData()
  } else {
    message.error("删除失败，" + res.message)
  }
}

</script>

