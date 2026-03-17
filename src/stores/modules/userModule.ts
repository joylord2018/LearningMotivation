import { ref, type Ref } from 'vue'

interface UserInfo {
  username: string
  nickname: string
  bio: string
  email: string
  joinDate: string
  password: string
}

interface UserModule {
  isLoggedIn: Ref<boolean>
  userInfo: Ref<UserInfo>
  lastLoginDate: Ref<string>
  login: (username: string, password: string) => boolean
  logout: () => void
  updateUserInfo: (updates: Partial<Omit<UserInfo, 'username' | 'password' | 'joinDate'>>) => void
  updatePassword: (newPassword: string) => void
  resetUserInfo: () => void
}

export function createUserModule(): UserModule {
  // 从本地存储加载数据
  const loadFromLocalStorage = () => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo')
      const storedLastLoginDate = localStorage.getItem('lastLoginDate')
      
      return {
        userInfo: storedUserInfo ? JSON.parse(storedUserInfo) : {
          username: 'xumingxi',
          nickname: '',
          bio: '',
          email: '',
          joinDate: new Date().toISOString().split('T')[0] ?? '',
          password: '20160104', // 默认密码
        },
        lastLoginDate: storedLastLoginDate || ''
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
      return {
        userInfo: {
          username: 'xumingxi',
          nickname: '',
          bio: '',
          email: '',
          joinDate: new Date().toISOString().split('T')[0] ?? '',
          password: '20160104',
        },
        lastLoginDate: ''
      }
    }
  }
  


  // 状态
  const isLoggedIn = ref(false)
  const storedData = loadFromLocalStorage()
  const lastLoginDate = ref<string>(storedData.lastLoginDate)
  const userInfo = ref<UserInfo>(storedData.userInfo)

  // 登录
  function login(username: string, password: string): boolean {
    if (username === userInfo.value.username && password === userInfo.value.password) {
      isLoggedIn.value = true
      localStorage.setItem('isLoggedIn', 'true')
      // 记录登录日期，用于计算连续登录
      lastLoginDate.value = new Date().toISOString().slice(0, 10)
      return true
    }
    return false
  }

  // 登出
  function logout() {
    isLoggedIn.value = false
    localStorage.removeItem('isLoggedIn')
  }

  // 更新用户信息
  function updateUserInfo(updates: Partial<Omit<UserInfo, 'username' | 'password' | 'joinDate'>>) {
    userInfo.value = {
      ...userInfo.value,
      ...updates
    }
  }

  // 更新密码
  function updatePassword(newPassword: string) {
    userInfo.value.password = newPassword
  }

  // 重置用户信息
  function resetUserInfo() {
    userInfo.value = {
      username: 'xumingxi',
      nickname: '',
      bio: '',
      email: '',
      joinDate: new Date().toISOString().split('T')[0] ?? '',
      password: '20160104',
    }
    isLoggedIn.value = false
    lastLoginDate.value = ''
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('lastLoginDate')
  }

  return {
    isLoggedIn,
    userInfo,
    lastLoginDate,
    login,
    logout,
    updateUserInfo,
    updatePassword,
    resetUserInfo
  }
}
