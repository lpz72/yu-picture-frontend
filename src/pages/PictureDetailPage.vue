<template>
  <div id="pictureDetailPage">
    <a-row :gutter="[16,16]">
      <!--  图片展示区    -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览">
          <a-image
            style="max-height: 600px; object-fit: contain"
            :src="picture?.url"
          />
        </a-card>

      </a-col>
      <!--  图片详情区    -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions  :column="1">
          <a-descriptions-item label="作者">
            <a-space>
              <a-avatar :size="24" :src=picture?.user?.userAvatar />
              <div>{{ picture?.user?.userName ?? '无名' }}</div>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="名称">{{picture?.name ?? '未命名'}}</a-descriptions-item>
          <a-descriptions-item label="简介">{{picture?.introduction ?? '-'}}</a-descriptions-item>
          <a-descriptions-item label="分类">{{picture?.category ?? '-'}}</a-descriptions-item>
          <a-descriptions-item label="标签">
            <div v-if="picture?.tags?.length === 0">{{'-'}}</div>
            <a-tag v-for="tag in picture?.tags">
              {{tag}}
            </a-tag>
          </a-descriptions-item>
            <a-descriptions-item label="格式">{{picture?.picFormat ?? '-'}}</a-descriptions-item>
            <a-descriptions-item label="高度">{{picture?.picHeight ?? '-'}}</a-descriptions-item>
            <a-descriptions-item label="宽度">{{picture?.picWidth ?? '-'}}</a-descriptions-item>
            <a-descriptions-item label="宽高比">{{picture?.picScale ?? '-'}}</a-descriptions-item>
            <a-descriptions-item label="大小">{{formatSize(picture?.picSize)}}</a-descriptions-item>
            <a-descriptions-item >
              <a-space wrap>
                <a-button type="primary" :icon="h(DownloadOutlined)" @click="doDownload">免费下载</a-button>
                <a-button :icon="h(EditOutlined)" v-if="canEdit" @click="doEdit">编辑</a-button>
                <a-popconfirm
                  title="是否确认删除?"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="doDelete"
                >
                  <a-button danger :icon="h(DeleteOutlined)" v-if="canEdit">删除</a-button>
                </a-popconfirm>
              </a-space>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">

import PictureUpload from '@/components/PictureUpload.vue'
import { computed, h, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { downloadImage, formatSize } from '@/utils'
import { EditOutlined,DeleteOutlined,DownloadOutlined} from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const picture = ref<API.PictureVO>()

// 获取到动态的参数id
const props = defineProps<{
  id: string | number
}>()

/**
 * 根据id获取到图片详情
 */
const fetchPictureDetail = async () => {

  try {
    const res = await getPictureVoByIdUsingGet({id: props.id})
    if (res.code === 0 && res) {
      picture.value = res.data
    } else {
      message.error("获取图片详情失败，" + res.message)
    }
  } catch (e: any) {
    message.error("获取图片详情失败，" + e.message)
  }
}

// 权限校验
const loginUserStore = useLoginUserStore()
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  // 未登录不可编辑
  if (!loginUser.id) {
    return false
  }

  // 仅本人或管理员可编辑
  return loginUser.id === picture.value?.userId || loginUser.userRole === "admin"
})

const router = useRouter()
// 编辑事件
const doEdit = () => {
  router.push("/add_picture?id=" + picture.value?.id)
}

// 删除事件
const doDelete = async () => {
  const id = picture.value?.id
  if (!id) {
    message.error("删除失败")
    return
  }
  const res = await deletePictureUsingPost({id: id})
  if (res && res.code === 0) {
    message.success("删除成功")
    router.push("/")
  } else {
    message.error("删除失败，" + res.message)
  }
}

// 下载事件
const doDownload = () => {
  downloadImage(picture.value?.url)
}

onMounted(() => {
  fetchPictureDetail()
})

</script>

<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}

</style>
