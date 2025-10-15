<template>
  <a-config-provider :getPopupContainer="getPopupContainer">
    <app />
  </a-config-provider>
</template>

<script lang="ts">
import App from '@/App.vue'

export default {
  components: { App },
  methods: {
    getPopupContainer(el, dialogContext) {
      if (dialogContext) {
        return dialogContext.getDialogWrap()
      } else {
        return document.body
      }
    },
  },
}
</script>
