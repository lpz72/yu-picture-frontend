<template>
  <div id="userManagerPage">
<!--  搜索框  -->
    <div style="margin-bottom: 10px">
      <a-form  layout="inline" :model="searchParams" >
        <a-form-item label="账号">
          <a-input v-model:value="searchParams.userAccount" placeholder="输入账号"/>
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-model:value="searchParams.userName" placeholder="输入用户名"/>
        </a-form-item>
        <a-form-item >
          <a-button type="primary" @click="doSearch">搜索</a-button>
        </a-form-item>
      </a-form>
    </div>
<!--  表格数据展示  -->
    <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="doTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src=record.userAvatar :width="50" />
        </template>
        <template v-if="column.dataIndex === 'userProfile'">
          {{record.userProfile ?? '暂无简介'}}
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <a-tag v-if="record.userRole === 'user'" color="blue">普通用户</a-tag>
          <a-tag v-else color="green">管理员</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
        <template v-else-if="column.key === 'action'">
        <a-button danger @click="doDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>

</template>
<script lang="ts" setup>
import { SmileOutlined, DownOutlined } from '@ant-design/icons-vue';
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteUserUsingPost, listUserVoByPageUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
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
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
})

// 获取数据
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams
  })
  if (res.data) {
    dataList.value = res.data.records ?? []
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
    showTotal: (total) => `共${total}条`,
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

// 删除用户
const doDelete = async (id: string) => {
  // 传的是个对象，对id进行封装
  const res = await deleteUserUsingPost({id})
  if (res.code === 0) {
    message.success("删除成功")
    // 刷新数据
    await fetchData()
  } else {
    message.error("删除失败，" + res.message)
  }
}

</script>

