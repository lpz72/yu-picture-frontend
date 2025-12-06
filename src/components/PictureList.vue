<template>
  <div id="picture-list">
    <!-- 数据展示 -->
    <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
            :data-source="dataList"
            :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
<!--          <a-card hoverable @click="doChange(item.id)">-->
          <a-card hoverable @click="toDetail(item.id)">
            <template #cover>
              <img
                style="height: 220px;object-fit: cover"
                :alt="item.name"
                :src="item.thumbnailUrl ?? item.url" />
            </template>
            <a-card-meta :title="item.name" style="height: 60px">
              <template #description>
                <a-flex wrap="wrap" :gap="3">
                  <a-tag color="blue">
                    {{item.category ?? '默认'}}
                  </a-tag>
                  <a-tag v-for="tag in item.tags" color="green" >{{tag}}</a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template v-if="showOp" #actions>

              <a-space @click="e => doSearch(item,e)">
                <a-popover trigger="hover">
                  <template #content>
                    {{"以图搜图"}}
                  </template>
                  <search-outlined/>
                  搜索
                </a-popover>
              </a-space>

              <a-space @click="e => doEdit(item,e)">
                <edit-outlined/>
                编辑
              </a-space>

              <a-space @click="e => showDelete(e)">
                <a-popconfirm
                  title="是否确认删除?"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="doDelete(item.id)"
                >
                <delete-outlined/>
                  删除
                </a-popconfirm>
              </a-space>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'
import { EditOutlined,DeleteOutlined, SearchOutlined} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { deletePictureUsingPost } from '@/api/pictureController'
import { formatSize } from '@/utils'

interface Props {
  dataList: API.PictureVO[],
  loading: boolean,
  showOp: boolean,
  onReload: () => void
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false
})

// 跳转到图片详情页
const router = useRouter()
const toDetail = (id: number) => {
  router.push({
    path: `/picture/${id}`
  })
}

// 跳转到以图搜图页面
const doSearch = (picture,e) => {
  // 阻止事件传播，防止将点击事件定义为点击卡片
  e.stopPropagation()
  // 打开一个新页面
  window.open(`/search_picture?id=${picture.id}`)
  // router.push({
  //   path: '/search_picture',
  //   query: {
  //     id: picture.id,
  //   }
  // })
}

// 跳转到编辑
const doEdit = (picture,e) => {
  // 阻止事件传播，防止将点击事件定义为点击卡片
  e.stopPropagation()
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId
    }
  })
}

// 删除图片
const doDelete = async (id: number) => {
  const res = await deletePictureUsingPost({id: id})
  if (res.code === 0 && res.data) {
    message.success("删除成功")
    props.onReload()
  } else {
    message.error("删除失败，",res.message)
  }
}

const showDelete = (e) => {
  e.stopPropagation()
}

</script>

