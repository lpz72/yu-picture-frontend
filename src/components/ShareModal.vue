<template>
  <div class="share-modal">
    <a-modal v-model:open="open"  title="分享图片" :footer="null" @cancel="closeModal">
      <h4>复制分享链接</h4>
      <a-typography-link copyable>
        {{link}}
      </a-typography-link>
      <h4 style="margin-top: 16px">手机扫码查看</h4>
      <a-qrcode :value="link" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

interface Props {
  title: string,
  link: string
}

// 指定初始值
const props = withDefaults(defineProps<Props>(), {
  title: () => '分享',
  link: () => 'http://agent.project-learn.site/'
})


const open = ref(false)

const openModal = () => {
  open.value = true
}

const closeModal = () => {
  open.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal
})


</script>
