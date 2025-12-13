<template>
  <div id="spaceAnalyzePage">
    <h2>
      空间图库分析 -
      <span v-if="queryAll">全部空间</span>
      <span v-else-if="queryPublic">公共空间</span>
      <span v-else>
        <a :href="`/space/${spaceId}`" target="_blank">id: {{spaceId}}</a>
      </span>
    </h2>
    <a-row :gutter="[16,16]">
      <!-- 空间使用分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUsageAnalyze :queryAll="!!queryAll" :queryPublic="!!queryPublic" :spaceId="spaceId"/>
      </a-col>

      <!-- 空间分类分析 -->
      <a-col :xs="24" :md="12">
        <SpaceCategoryAnalyze :queryAll="!!queryAll" :queryPublic="!!queryPublic" :spaceId="spaceId"/>
      </a-col>

      <!-- 空间标签分析 -->
      <a-col :xs="24" :md="12">
        <SpaceTagAnalyze :queryAll="!!queryAll" :queryPublic="!!queryPublic" :spaceId="spaceId"/>
      </a-col>

      <!-- 空间图片大小分析 -->
      <a-col :xs="24" :md="12">
        <SpaceSizeAnalyze :queryAll="!!queryAll" :queryPublic="!!queryPublic" :spaceId="spaceId"/>
      </a-col>

      <!-- 空间用户分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUserAnalyze :queryAll="!!queryAll" :queryPublic="!!queryPublic" :spaceId="spaceId"/>
      </a-col>

      <!-- 空间使用排行 -->
      <a-col v-if="isAdmin" :xs="24" :md="12">
        <SpaceRankAnalyze />
      </a-col>
    </a-row>
  </div>

</template>

<script setup lang="ts">

import SpaceUsageAnalyze from '@/components/analyze/SpaceUsageAnalyze.vue'
import SpaceCategoryAnalyze from '@/components/analyze/SpaceCategoryAnalyze.vue'
import SpaceTagAnalyze from '@/components/analyze/SpaceTagAnalyze.vue'
import SpaceSizeAnalyze from '@/components/analyze/SpaceSizeAnalyze.vue'
import SpaceUserAnalyze from '@/components/analyze/SpaceUserAnalyze.vue'
import SpaceRankAnalyze from '@/components/analyze/SpaceRankAnalyze.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const route = useRoute()

// 是否查询所有空间
const queryAll = computed(() => {
  return route.query?.queryAll
})
// 是否查询公共空间
const queryPublic = computed(() => {
  return route.query?.queryPublic
})
// 空间id
const spaceId = computed(() => {
  return route.query?.spaceId
})

const loginUser = useLoginUserStore().loginUser

const isAdmin = computed(() => {
  return loginUser.userRole === 'admin';
})


</script>



<style scoped>

</style>
