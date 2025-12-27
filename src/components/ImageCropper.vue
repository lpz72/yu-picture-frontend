<template>
  <div class="image-cropper">
    <a-modal v-model:open="open"  title="编辑图片" :footer="null" @cancel="closeModal">
      <vue-cropper
        ref="cropperRef"
        :img="imageUrl"
        output-type="png"
        :info="true"
        :can-move="true"
        :can-move-box="true"
        :fixed-box="false"
        :auto-crop="true"
        :center-box="true"
      />
      <div style="margin-bottom: 16px"/>
      <!-- 协同操作按钮 -->
      <div v-if="isTeamSpace" class="image-edit-actions" style="text-align: center">
        <a-space>
          <a-button v-if="editingUser" disabled >{{editingUser.userName}} 正在编辑</a-button>
          <a-button v-if="canEnterEdit" type="primary" ghost @click="enterEdit">进入编辑</a-button>
          <a-button v-if="canExitEdit" type="primary" ghost danger @click="exitEdit" >退出编辑</a-button>
         </a-space>
      </div>
      <div style="margin-bottom: 16px"/>
      <div class="image-cropper-actions" style="text-align: center">
        <a-space>
          <a-button :disabled="!canEdit" @click="changeScale(1)" >放大</a-button>
          <a-button :disabled="!canEdit" @click="changeScale(-1)">缩小</a-button>
          <a-button :disabled="!canEdit" @click="rotateLeft" >向左旋转</a-button>
          <a-button :disabled="!canEdit" @click="rotateRight" >向右旋转</a-button>
          <a-button :disabled="!canEdit" type="primary" :loading="loading" @click="handleConfirm" >确认</a-button>
        </a-space>

      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">

import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import { uploadPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import PictureEditWebSocket from '@/utils/PictureEditWebSocket'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constants/picture'
import { SPACE_TYPE_ENUM } from '@/constants/space'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: number
  space?: API.SpaceVO
  onSuccess?: (newPicture: API.PictureVO) => void
}

// 指定初始值
const props = defineProps<Props>()

const loading = ref(false)

// 编辑器组件的引用
const cropperRef = ref()
// 放大或缩小
const changeScale = (num: number) => {
  num = num || 1
  cropperRef.value.changeScale(num)
  if (num > 0) {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  } else {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  }
}

// 左旋
const rotateLeft = () => {
  cropperRef.value.rotateLeft();
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}

// 右旋
const rotateRight = () => {
  cropperRef.value.rotateRight();
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}


// 确认裁剪
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    // blob 为已裁剪的文件
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob],fileName,{type: blob.type})
    // 上传图片
    handleUpload({file})
  })

}

/**
 * 上传图片
 * @param file
 */
const handleUpload = async ({file}: any) => {

  loading.value = true
  const params:API.PictureUploadRequest = props.picture ? { id: props.picture.id} : {};
  params.spaceId = props.spaceId
  const res = await uploadPictureUsingPost(params,{},file)
  try {
    if (res.code === 0 && res.data) {
      message.success("图片上传成功")
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data)
      closeModal()
    } else {
      message.error("图片上传失败，" + res.message)
    }
  } catch (error) {
    message.error("图片上传失败")
  } finally {
    loading.value = false
  }
}

const open = ref(false)

const openModal = () => {
  open.value = true
}



// ------ 实时编辑 ------
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser
// 正在编辑的用户
const editingUser = ref<API.UserVO>()
// 没有用户编辑，则可进入编辑
const canEnterEdit = computed(() => {
  return !editingUser.value
})

// 正在编辑的是本人，才可退出编辑
const canExitEdit = computed(() => {
  return editingUser.value?.id === loginUser.id
})

// 可以编辑
const canEdit = computed(() => {
  // 不是团队空间，默认可编辑
  if (!isTeamSpace.value) {
    return true
  }
  return editingUser.value?.id === loginUser.id
})


let webSocket: PictureEditWebSocket | null
// 初始化 WebSocket 连接，绑定事件
const initWebSocket = () => {
  const pictureId = props.picture?.id
  // 仅打开弹窗时才初始化
  if (!pictureId || !open.value) {
    return
  }
  // 防止之间的连接未释放
  if (webSocket) {
    webSocket.disconnect()
  }

  // 创建WebSocket 实例
  webSocket = new PictureEditWebSocket(pictureId)
  // 建立连接
  webSocket.connect()

  // 监听通知消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO,(msg) => {
    console.log('收到通知消息:', msg)
    message.info(msg.message)
  })

  // 监听错误消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR,(msg) => {
    console.log('收到错误消息:', msg)
    message.error(msg.message)
  })

  // 监听进入编辑状态消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,(msg) => {
    console.log('收到进入编辑状态消息:', msg)
    message.info(msg.message)
    editingUser.value = msg.user
  })

  // 监听编辑操作信息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,(msg) => {
    console.log('收到编辑操作信息:', msg)
    message.info(msg.message)
    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        cropperRef.value.changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        cropperRef.value.changeScale(-1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        rotateLeft()
        // cropperRef.value.rotateLeft();
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        cropperRef.value.rotateRight();
        break
    }
  })

  // 监听退出编辑状态消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,(msg) => {
    console.log('收到退出编辑状态消息:', msg)
    message.info(msg.message)
    editingUser.value = undefined
  })
}

// 是否为团队空间
const isTeamSpace = computed(() => {
  return props.space?.spaceType === SPACE_TYPE_ENUM.TEAM
})

// 监听变量，触发初始化
watchEffect(() => {
  // 仅团队空间才需要初始化WebSocket连接
  if (isTeamSpace.value) {
    initWebSocket()
  }

})

onUnmounted(() => {
  // 断开连接
  if (webSocket) {
    webSocket.disconnect()
  }

  editingUser.value = undefined

})

// 关闭弹出，同时释放 WebSocket 连接
const closeModal = () => {
  open.value = false
  if (webSocket) {
    webSocket.disconnect()
  }

  editingUser.value = undefined
}

// 进入编辑状态
const enterEdit = () => {
  if (webSocket) {
    // 向后端发送消息
    webSocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}

// 退出编辑状态
const exitEdit = () => {
  if (webSocket) {
    // 向后端发送消息
    webSocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

// 编辑图片操作
const editAction = (action: string) => {
  if (webSocket) {
    // 向后端发送消息
    webSocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action,
    })
  }
}

// 暴露函数给父组件
defineExpose({
  openModal
})

</script>

<style scoped>


.vue-cropper {
  height: 400px !important;
}
</style>
