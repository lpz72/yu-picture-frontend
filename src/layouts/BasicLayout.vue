<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <a-layout-sider v-if="loginUserStore.loginUser.id">
          <GlobalSider class="sider"/>
        </a-layout-sider>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <a-layout-footer class="footer">
        <a href="https://github.com/" target="_blank">
          绘联云库 by lpz
        </a>
      </a-layout-footer>

    </a-layout>

  </div>

</template>

<script setup lang="ts">

import GlobalHeader from '@/layouts/GlobalHeader.vue'
import GlobalSider from '@/layouts/GlobalSider.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()

</script>

<style scoped>

#basicLayout .header {
  padding-inline: 20px;
  margin-bottom: 1px;
  color: unset;
  background: white;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 30px;
  padding: 28px;
}


#basicLayout .footer{
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}

#basicLayout .sider {
  background: #ffffff;
  padding-top: 20px;
  border-right: 0.5px solid #eee;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

:deep(.ant-layout-sider-children) {
  background: #fff;
}

</style>
