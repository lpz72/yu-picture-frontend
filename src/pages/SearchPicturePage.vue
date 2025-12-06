<template>
  <div id="searchPicturePage">
    <h2 style="margin-bottom: 16px">以图搜图</h2>
    <h3 style="margin: 16px 0">原图</h3>
    <a-card hoverable style="width: 200px">
      <template #cover>
        <img
          style="height: 220px;object-fit: cover"
          :src="picture?.thumbnailUrl ?? picture?.url" />
      </template>
    </a-card>
    <h3  style="margin: 16px 0">识图结果</h3>
    <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
            :data-source="dataList"
            :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card hoverable >
            <template #cover>
              <img
                style="height: 220px;object-fit: cover"
                :src="item.thumbUrl" />
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">

import { computed, h, onMounted, reactive, ref } from 'vue'
import {
  getPictureVoByIdUsingGet,
 searchPictureByPictureUsingPost
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'


const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref(true)

const picture = ref<API.PictureVO>()
const pictureId = ref()


// 获取相似图片数据
const fetchData = async () => {
  loading.value = true

  const res = await searchPictureByPictureUsingPost({
    pictureId: pictureId.value
  })
  if (res.code === 0 && res) {
    dataList.value = res.data ?? []
  } else {
    message.error("获取数据失败，" + res.message)
  }
  loading.value = false
}


const route = useRoute()
// 获取原图片
const getOriginalPicture = async () => {
  pictureId.value = route.query?.id
  const res = await getPictureVoByIdUsingGet({id:pictureId.value})
  if (res.code === 0 && res.data) {
      picture.value = res.data
    // console.log(space)
  } else {
    message.error("原图片获取失败，",res.message)
  }
}


onMounted(() => {
  getOriginalPicture()
  fetchData()
})

</script>
