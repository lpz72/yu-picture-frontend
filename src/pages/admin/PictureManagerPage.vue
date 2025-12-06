<template>
  <div id="pictureManagerPage">
    <a-flex justify="space-between">
      <h2 style="margin-bottom: 16px">图片管理</h2>
      <a-space>
        <a-button :icon=h(PlusOutlined) type="primary" :href="`/add_picture`" target="_blank">创建图片</a-button>
        <a-button :icon=h(PlusOutlined) type="primary" ghost :href="`/add_picture/batch`" target="_blank">批量创建图片</a-button>
      </a-space>

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
        <a-form-item label="审核状态">
          <a-select
            v-model:value="searchParams.reviewStatus"
            placeholder="请选择审核状态"
            :options="PIC_REVIEW_STATUS_OPTIONS"
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
        <template v-else-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：{{PIC_REVIEW_STATUS_MAP[record.reviewStatus]}}</div>
          <div>审核信息：{{record.reviewMessage}}</div>
          <div>审核人：{{record.reviewerId}}</div>

        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space :size="2" wrap>
            <a-button v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                      type="link"
                      @click="showModal(record,PIC_REVIEW_STATUS_ENUM.PASS)">
              通过
            </a-button>
            <a-button v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                      type="link"
                      danger
                      @click="showModal(record,PIC_REVIEW_STATUS_ENUM.REJECT)">
              拒绝
            </a-button>
            <a-button type="link" :href="`/add_picture/?id=${record.id}`" target="_blank">编辑</a-button>
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
    <a-modal v-model:open="open" title="通过或拒绝理由" @ok="handleReview">
      <a-textarea v-model:value="currentPicture.reviewMessage" placeholder="请输入理由" />
    </a-modal>
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
    title: '审核信息',
    dataIndex: 'reviewMessage'
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
    ...searchParams,
    nullSpaceId: true
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


const open = ref(false)
const currentPicture = ref<API.Picture>()
const updateStatus = ref()

const showModal = (record: API.Picture,status: number) => {
  open.value = true
  currentPicture.value = record
  updateStatus.value = status
}

// 审核图片
const handleReview = async () => {

  const params = ({
    id: currentPicture.value?.id,
    reviewStatus: updateStatus.value,
    reviewMessage: currentPicture.value?.reviewMessage
  })
  const res = await doPictureReviewUsingPost(params)
  if (res && res.code === 0) {
    message.success("审核操作成功")
    fetchData()
  } else {
    message.error("审核操作失败，" + res.message)
  }

  open.value = false
}

</script>

