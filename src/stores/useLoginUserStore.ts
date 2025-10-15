import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUserUsingGet } from '@/api/userController'

export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  async function fetchLoginUser() {
    const res = await getLoginUserUsingGet();
    if (res.code === 0 && res.data) {
      loginUser.value = res.data;
    }
    // 测试用户登录，3 秒后登录
    // setTimeout(() => {
    //   loginUser.value = {userName: '测试用户',id: 1}
    // },3000)
  }

  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }



  return { loginUser, fetchLoginUser, setLoginUser }
})
