import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

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
      loadFromLocalStorage()
      return true
    }
    return false
  }

  // 登出
  function logout() {
    isLoggedIn.value = false
    saveToLocalStorage()
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
      {
        id: `chinese-${today}`,
        subject: 'chinese',
        subjectName: '语文',
        date: today,
        completionLevel: null,
        points: 0,
      },
      {
        id: `math-${today}`,
        subject: 'math',
        subjectName: '数学',
        date: today,
        completionLevel: null,
        points: 0,
      },
      {
        id: `english-${today}`,
        subject: 'english',
        subjectName: '英语',
        date: today,
        completionLevel: null,
        points: 0,
      },
    )

    saveToLocalStorage()
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

      saveToLocalStorage()
    }
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

      saveToLocalStorage()
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

    saveToLocalStorage()
  }

  // 更新兑换项（管理模块使用）
  function updateExchangeItem(itemId: string, name: string, points: number, description: string) {
    const item = exchangeItems.value.find((i) => i.id === itemId)
    if (item) {
      item.name = name
      item.points = points
      item.description = description
      saveToLocalStorage()
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
    saveToLocalStorage()
  }

  // 删除兑换项（管理模块使用）
  function removeExchangeItem(itemId: string) {
    exchangeItems.value = exchangeItems.value.filter((item) => item.id !== itemId)
    saveToLocalStorage()
  }

  // 保存到localStorage
  function saveToLocalStorage() {
    const data = {
      currentPoints: currentPoints.value,
      tasks: tasks.value,
      pointRecords: pointRecords.value,
      exchangeItems: exchangeItems.value,
    }
    localStorage.setItem('userData', JSON.stringify(data))
  }

  // 从localStorage加载
  function loadFromLocalStorage() {
    const data = localStorage.getItem('userData')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        currentPoints.value = parsed.currentPoints || 0
        tasks.value = parsed.tasks || []
        pointRecords.value = parsed.pointRecords || []
        exchangeItems.value = parsed.exchangeItems || exchangeItems.value
      } catch (error) {
        console.error('Failed to load data from localStorage:', error)
      }
    }
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
    exchangeItem,
    adjustPoints,
    updateExchangeItem,
    addExchangeItem,
    removeExchangeItem,
  }
})
