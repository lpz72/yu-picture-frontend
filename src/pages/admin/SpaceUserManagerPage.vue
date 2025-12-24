<template>
  <div id="spaceUserManagerPage">
    <a-flex justify="space-between">
      <h2 style="margin-bottom: 16px">空间成员管理</h2>
    </a-flex>

    <!--  添加框  -->
    <div style="margin-bottom: 10px">
      <a-form  layout="inline" :model="formData" @finish="handleSubmit">
        <a-form-item label="用户 id">
          <a-input v-model:value="formData.userId" placeholder="请输入用户 id" allowClear/>
        </a-form-item>
        <a-form-item >
          <a-button type="primary" html-type="submit">添加用户</a-button>
        </a-form-item>
      </a-form>
    </div>
    <!--  表格数据展示  -->
    <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="doTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userInfo'">
          <a-avatar :src=record.user?.userAvatar />
          {{record.user?.userName}}
        </template>
        <template v-else-if="column.dataIndex === 'spaceRole'">
          <a-select
            v-model:value="record.spaceRole"
            :options="SPACE_ROLE_OPTIONS"
            @change="(value) => editSpaceRole(value,record)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
        <template v-else-if="column.key === 'action'">
            <a-popconfirm
              title="是否确认删除?"
              ok-text="是"
              cancel-text="否"
              @confirm="doDelete(record.id)"
            >
              <a-button type="link" danger >删除</a-button>
            </a-popconfirm>
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
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS, SPACE_ROLE_OPTIONS } from '@/constants/space'
import { deleteSpaceUsingPost, listSpaceByPageUsingPost } from '@/api/spaceController'
import { formatSize } from '@/utils'
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost, editSpaceUserUsingPost,
  editSpaceUsingPost1,
  listSpaceUserVoUsingPost
} from '@/api/spaceUserController'

interface Props {
  id: string
}

const props = defineProps<Props>()

const columns = [
  {
    title: '用户',
    dataIndex: 'userInfo',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
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

//表单
const formData = ref<API.addSpaceUserUsingPOSTParams>({})

// 数据
const dataList = ref<API.SpaceUserVO[]>([])

// 获取数据
const fetchData = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const res = await listSpaceUserVoUsingPost({
    spaceId: spaceId
  })
  if (res.data) {
    dataList.value = res.data ?? []
  } else {
    message.error("数据获取失败，" + res.message)
  }
}

// 添加成员，数据库默认为浏览者
const handleSubmit = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const res = await addSpaceUserUsingPost({
    spaceId,
    ...formData.value
  })
  if (res.code === 0 && res.data) {
    message.success("添加成功")
    await fetchData()
  } else {
    message.error("添加失败，" + res.message)
  }
}

// 修改成员权限
const editSpaceRole = async (value,spaceUser) => {
  const res = await editSpaceUserUsingPost({
    id: spaceUser.id,
    spaceRole: value
  })
  if (res.code === 0 && res.data) {
    message.success("修改成功")
    fetchData()
  } else {
    message.error("修改失败，" + res.message)
  }
}

// 页面加载时请求一次
onMounted( () => {
  fetchData()
})


// 删除成员
const doDelete = async (id: string) => {
  // 传的是个对象，对id进行封装
  const res = await deleteSpaceUserUsingPost({id})
  if (res.code === 0) {
    message.success("删除成功")
    // 刷新数据
    await fetchData()
  } else {
    message.error("删除失败，" + res.message)
  }
}

</script>

