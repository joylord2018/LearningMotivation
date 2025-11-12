import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // 添加缺少的导入

// 定义任务类型
interface Task {
  id: string
  subject: 'chinese' | 'math' | 'english'
  subjectName: string
  date: string
  completionLevel: 'low' | 'medium' | 'high' | null
  points: number
}

// 定义积分记录类型
interface PointRecord {
  id: string
  date: string
  description: string
  points: number
  type: 'task' | 'exchange'
}

// 定义兑换项类型
interface ExchangeItem {
  id: string
  name: string
  points: number
  description: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const isLoggedIn = ref(false)
  const currentPoints = ref(0)
  const tasks = ref<Task[]>([])
  const pointRecords = ref<PointRecord[]>([])
  const exchangeItems = ref<ExchangeItem[]>([
    { id: '1', name: '零食', points: 20, description: '美味零食一包' },
    { id: '2', name: '小玩具', points: 50, description: '精美小玩具一个' },
    { id: '3', name: '大玩具', points: 100, description: '超值大玩具一个' },
  ])

  // 计算属性
  const todayTasks = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return tasks.value.filter((task) => task.date === today)
  })

  const todayPoints = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return tasks.value
      .filter((task) => task.date === today && task.completionLevel !== null)
      .reduce((sum, task) => sum + task.points, 0)
  })

  // 方法
  // 登录
function login(username: string, password: string): boolean {
  if (username === 'xumingxi' && password === '20160104') {
    isLoggedIn.value = true
    localStorage.setItem('isLoggedIn', 'true') // 单独保存登录状态
    return true
  }
  return false
}

// 登出
function logout() {
  isLoggedIn.value = false
  localStorage.removeItem('isLoggedIn') // 移除登录状态
}

  // 初始化今日任务
  function initializeTodayTasks() {
    const today = new Date().toISOString().slice(0, 10)

    // 检查是否已经初始化了今日任务
    if (tasks.value.some((task) => task.date === today)) {
      return
    }

    // 添加今日的三个学科任务
    tasks.value.push(
      { id: `chinese-${today}`, subject: 'chinese', subjectName: '语文', date: today, completionLevel: null, points: 0 },
      { id: `math-${today}`, subject: 'math', subjectName: '数学', date: today, completionLevel: null, points: 0 },
      { id: `english-${today}`, subject: 'english', subjectName: '英语', date: today, completionLevel: null, points: 0 }
    )
  }

  // 更新任务完成度
  function updateTaskCompletion(taskId: string, level: 'low' | 'medium' | 'high') {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      // 移除之前的积分
      if (task.completionLevel !== null) {
        currentPoints.value -= task.points
      }

      // 更新任务完成度和积分
      task.completionLevel = level
      task.points = level === 'low' ? 1 : level === 'medium' ? 2 : 3

      // 添加新积分
      currentPoints.value += task.points

      // 记录积分变动
      const record: PointRecord = {
        id: `record-${Date.now()}`,
        date: new Date().toISOString(),
        description: `${task.subjectName}任务完成（${level === 'low' ? '低' : level === 'medium' ? '中' : '高'}）`,
        points: task.points,
        type: 'task',
      }
      pointRecords.value.push(record)
    }
  }
  
  // 取消任务完成度
  function cancelTaskCompletion(taskId: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task && task.completionLevel !== null) {
      // 记录要扣除的积分
      const pointsToDeduct = task.points
      
      // 移除之前的积分
      currentPoints.value -= pointsToDeduct

      // 更新任务完成度和积分
      task.completionLevel = null
      task.points = 0

      // 记录积分变动
      const record: PointRecord = {
        id: `record-${Date.now()}`,
        date: new Date().toISOString(),
        description: `${task.subjectName}任务取消完成`,
        points: -pointsToDeduct,
        type: 'task',
      }
      pointRecords.value.push(record)

      return pointsToDeduct
    }
    return 0
  }

  // 兑换物品
  function exchangeItem(itemId: string): boolean {
    const item = exchangeItems.value.find((i) => i.id === itemId)
    if (item && currentPoints.value >= item.points) {
      // 扣除积分
      currentPoints.value -= item.points

      // 记录兑换记录
      const record: PointRecord = {
        id: `record-${Date.now()}`,
        date: new Date().toISOString(),
        description: `兑换${item.name}`,
        points: -item.points,
        type: 'exchange',
      }
      pointRecords.value.push(record)

      return true
    }
    return false
  }

  // 调整积分（管理模块使用）
  function adjustPoints(amount: number) {
    currentPoints.value = Math.max(0, currentPoints.value + amount)

    const record: PointRecord = {
      id: `record-${Date.now()}`,
      date: new Date().toISOString(),
      description: `积分调整`,
      points: amount,
      type: 'exchange',
    }
    pointRecords.value.push(record)
  }

  // 更新兑换项（管理模块使用）
  function updateExchangeItem(itemId: string, name: string, points: number, description: string) {
    const item = exchangeItems.value.find((i) => i.id === itemId)
    if (item) {
      item.name = name
      item.points = points
      item.description = description
    }
  }

  // 添加兑换项（管理模块使用）
  function addExchangeItem(name: string, points: number, description: string) {
    const newItem: ExchangeItem = {
      id: `item-${Date.now()}`,
      name,
      points,
      description,
    }
    exchangeItems.value.push(newItem)
  }

  // 删除兑换项（管理模块使用）
  function removeExchangeItem(itemId: string) {
    exchangeItems.value = exchangeItems.value.filter((item) => item.id !== itemId)
  }

  // 初始化时检查登录状态
  const savedLoginStatus = localStorage.getItem('isLoggedIn')
  if (savedLoginStatus === 'true') {
    isLoggedIn.value = true
  }

  return {
    // 状态
    isLoggedIn,
    currentPoints,
    tasks,
    pointRecords,
    exchangeItems,
    // 计算属性
    todayTasks,
    todayPoints,
    // 方法
    login,
    logout,
    initializeTodayTasks,
    updateTaskCompletion,
    cancelTaskCompletion,
    exchangeItem,
    adjustPoints,
    updateExchangeItem,
    addExchangeItem,
    removeExchangeItem,
  }
}, {
  // 配置持久化
  persist: {
    key: 'userData',
    storage: localStorage,
    // 移除paths属性以避免类型错误
  }
})