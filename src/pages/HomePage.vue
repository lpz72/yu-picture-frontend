<template>
  <div id="homePage">
    <!-- 搜索框  -->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类和标签展示 -->
    <div>
      <a-tabs v-model:activeKey="currentCategory" @change="doSearch">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="tab in categoryList" :key="tab" :tab="tab" />
      </a-tabs>
      <div class="tags-bar">
        <span style="margin-right: 8px">标签:</span>
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag
            v-for="(tag, index) in tagsList"
            :key="tag"
            v-model:checked="currentTags[index]"
            @change="doSearch"
          >
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>

    <!-- 数据展示 -->
    <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
            :data-source="dataList"
            :pagination="pagination"
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
                :src="item.url" />
            </template>
            <a-card-meta :title="item.name" style="height: 80px">
              <template #description>
                <a-flex wrap="wrap" :gap="3">
                  <a-tag color="blue">
                    {{item.category ?? '默认'}}
                  </a-tag>
                  <a-tag v-for="tag in item.tags" color="green" >{{tag}}</a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>

  </div>
</template>

<script setup lang="ts">

import { computed, onMounted, reactive, ref } from 'vue'
import { listPictureTagCategoryUsingGet, listPictureVoByPageUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const dataList = ref([])
const loading = ref(true)
const total = ref(0)

// 分类和标签获取
const categoryList = ref([])
const currentCategory = ref("all")
const tagsList = ref([])
const currentTags = ref([])

//搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true

  const tags = [] as string[]
  currentTags.value.forEach((useTag,index) => {
    if (useTag) {
      tags.push(tagsList.value[index])
    }
  })

  const res = await listPictureVoByPageUsingPost({
    category: currentCategory.value === "all" ? null : currentCategory.value,
    tags: tags.length === 0 ? null : tags,
    ...searchParams
  })
  if (res.code === 0 && res) {
    dataList.value = res.data.records ?? []
    total.value = res.data.total ?? 0
  } else {
    message.error("获取数据失败，" + res.message)
  }
  loading.value = false
}

// 分页参数,面对用户，不用展示实际总共多少条图片
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    // 切换页号或页面大小时，会修改搜索参数
    onChange: (page,pageSize) => {
      searchParams.current = page;
      searchParams.pageSize = pageSize;
      fetchData()
    }
  }
})

// 搜索
const doSearch = async () => {
  // 重置搜索页面
  searchParams.current = 1
  await fetchData()
}

// 测试点击卡片跳转事件
// const router = useRouter()
// const doChange = async (id: Number) => {
//   //使用 query 而不是把 ?id= 拼接到 path，否则 Vue Router 无法正确识别查询参数
//   router.push({
//     path: '/add_picture',
//     query: {id: String(id)}
//   })
// }

// 跳转到图片详情页
const router = useRouter()
const toDetail = (id: number) => {
  router.push({
    path: `/picture/${id}`
  })
}



// 获取标签和分类选项
const getTagsCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.code === 0 && res) {
    // 转换成下拉选项支持的格式
    categoryList.value = res.data.category ?? []
    tagsList.value = res.data.tags ?? []
  } else {
    message.error("加载选项失败，" + res.message)
  }
}

onMounted(() => {
  fetchData()
  getTagsCategoryOptions()
})

</script>

<style scoped>

#homePage .search-bar{
  max-width: 480px;
  margin: 0 auto 16px;
}
#homePage .tags-bar {
  margin-bottom: 16px;
  font-size: 15px;
}


</style>
