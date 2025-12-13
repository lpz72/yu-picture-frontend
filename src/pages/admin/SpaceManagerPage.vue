<template>
  <div id="spaceManagerPage">
    <a-flex justify="space-between">
      <h2 style="margin-bottom: 16px">空间管理</h2>
      <a-space>
        <a-button :icon=h(PlusOutlined) type="primary" :href="`/add_space`" target="_blank">创建空间</a-button>
        <a-button  type="primary" ghost :href="`/space_analyze?queryAll=1`" target="_blank">分析全空间</a-button>
        <a-button  type="primary" ghost :href="`/space_analyze?queryPublic=1`" target="_blank">分析公共空间</a-button>
      </a-space>
    </a-flex>

    <!--  搜索框  -->
    <div style="margin-bottom: 10px">
      <a-form  layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="空间名称">
          <a-input v-model:value="searchParams.spaceName" placeholder="请输入空间名称" allowClear/>
        </a-form-item>
        <a-form-item label="用户ID">
          <a-input v-model:value="searchParams.userId" placeholder="请输入用户ID" allowClear/>
        </a-form-item>
        <a-form-item label="空间级别">
          <a-select
            v-model:value="searchParams.spaceLevel"
            placeholder="请选择空间级别"
            :options="SPACE_LEVEL_OPTIONS"
            style="min-width: 180px"
            allowClear
          />
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
        <template v-else-if="column.dataIndex === 'spaceLevel'">
          <a-tag v-if="record.spaceLevel === 0" >{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
          <a-tag v-if="record.spaceLevel === 1" color="blue" >{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
          <a-tag v-if="record.spaceLevel === 2" color="orange">{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'spaceUseInfo'">
          <div>大小：{{formatSize(record.totalSize)}} / {{formatSize(record.maxSize)}}</div>
          <div>数量：{{record.totalCount}} / {{record.maxCount}}</div>

        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space :size="2" wrap>
            <a-button type="link" :href="`/space_analyze?spaceId=${record.id}`" target="_blank">分析</a-button>
            <a-button type="link" :href="`/add_space/?spaceId=${record.id}`" target="_blank">编辑</a-button>
            <a-popconfirm
              title="是否确认删除?"
              ok-text="是"
              cancel-text="否"
              @confirm="doDelete(record.id)"
            >
              <a-button type="link" danger >删除</a-button>
            </a-popconfirm>

          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue';
import { computed, h, onMounted, reactive, ref } from 'vue'
import { deletePictureUsingPost, doPictureReviewUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { listPictureByPageUsingPost } from '@/api/pictureController'
import { PIC_REVIEW_STATUS_ENUM, PIC_REVIEW_STATUS_MAP, PIC_REVIEW_STATUS_OPTIONS } from '@/constants/picture'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { deleteSpaceUsingPost, listSpaceByPageUsingPost } from '@/api/spaceController'
import { formatSize } from '@/utils'
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
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
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  console.log(searchParams)
  const res = await listSpaceByPageUsingPost({
    ...searchParams
  })
  if (res.data) {
    dataList.value = res.data.records ?? []
    // console.log(res.data.records)
    // console.log(dataList.value)
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

// 删除空间
const doDelete = async (id: string) => {
  // 传的是个对象，对id进行封装
  const res = await deleteSpaceUsingPost({id})
  if (res.code === 0) {
    message.success("删除成功")
    // 刷新数据
    await fetchData()
  } else {
    message.error("删除失败，" + res.message)
  }
}




</script>

