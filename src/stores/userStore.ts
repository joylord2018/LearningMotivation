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
  description: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  condition: string // 成就条件类型
  target: number // 目标值
  current: number // 当前进度
  category: string // 分类：task, points, streak, special
  isNew: boolean // 是否新解锁
  progressDescription: string // 进度描述
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

// 将普通枚举声明修改为导出枚举
export enum ItemRarity {
  Common = 'common', // 普通
  Rare = 'rare', // 稀有
  Epic = 'epic', // 史诗
  Legendary = 'legendary', // 传说
}

// 定义抽奖物品类型
interface LotteryItem {
  id: string
  name: string
  description: string
  rarity: ItemRarity
  probability: number // 概率（百分比）
  effect?: string // 特殊效果描述
}

// 定义背包物品类型，增加稀有度属性
interface BackpackItem {
  id: string
  originalId: string
  name: string
  description: string
  acquiredDate: string
  rarity: ItemRarity
  effect?: string // 特殊效果描述
}

export const useUserStore = defineStore(
  'user',
  () => {
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

    // 新增成就相关状态
    const achievements = ref<Achievement[]>([
      {
        id: 'first-task',
        name: '初次尝试',
        description: '完成你的第一个学习任务',
        icon: '🎯',
        unlocked: false,
        condition: 'task-completion',
        target: 1,
        current: 0,
        category: 'task',
        isNew: false,
        progressDescription: '完成1个任务解锁',
      },
      {
        id: 'task-master',
        name: '任务达人',
        description: '累计完成10个学习任务',
        icon: '🏆',
        unlocked: false,
        condition: 'total-task-completion',
        target: 10,
        current: 0,
        category: 'task',
        isNew: false,
        progressDescription: '完成10个任务解锁',
      },
      {
        id: 'point-collector',
        name: '积分收集者',
        description: '累计获得100积分',
        icon: '💰',
        unlocked: false,
        condition: 'total-points',
        target: 100,
        current: 0,
        category: 'points',
        isNew: false,
        progressDescription: '获得100积分解锁',
      },
      {
        id: 'streak-3',
        name: '三天坚持',
        description: '连续3天完成学习任务',
        icon: '🔥',
        unlocked: false,
        condition: 'streak',
        target: 3,
        current: 0,
        category: 'streak',
        isNew: false,
        progressDescription: '连续学习3天解锁',
      },
      {
        id: 'special-one',
        name: '神秘成就',
        description: '解锁这个神秘成就，展示你的学习热情！',
        icon: '🎁',
        unlocked: false,
        condition: 'special',
        target: 1,
        current: 0,
        category: 'special',
        isNew: false,
        progressDescription: '完成特殊条件解锁',
      },
    ])
    // 新增背包物品状态
    const backpackItems = ref<BackpackItem[]>([])
    // 添加缺失的状态定义
    const totalTaskCompletions = ref(0)
    const lastLoginDate = ref<string>('')
    const studyStreak = ref(0)

    // 新增抽奖池配置
    const lotteryItems = ref<LotteryItem[]>([
      // 普通物品 (70% 概率)
      {
        id: 'lucky-1',
        name: '幸运星',
        description: '带来好运的星星',
        rarity: ItemRarity.Common,
        probability: 30,
      },
      {
        id: 'lucky-2',
        name: '学习笔记',
        description: '提高学习效率',
        rarity: ItemRarity.Common,
        probability: 25,
      },
      {
        id: 'lucky-3',
        name: '能量饮料',
        description: '补充学习能量',
        rarity: ItemRarity.Common,
        probability: 15,
      },

      // 稀有物品 (20% 概率)
      {
        id: 'rare-1',
        name: '智慧结晶',
        description: '增加智慧的结晶',
        rarity: ItemRarity.Rare,
        probability: 10,
        effect: '使用后获得5点积分',
      },
      {
        id: 'rare-2',
        name: '学习加速器',
        description: '加速学习进度',
        rarity: ItemRarity.Rare,
        probability: 10,
        effect: '使用后获得额外的任务完成度',
      },

      // 史诗物品 (8% 概率)
      {
        id: 'epic-1',
        name: '知识宝库',
        description: '蕴含丰富知识的宝库',
        rarity: ItemRarity.Epic,
        probability: 5,
        effect: '使用后获得10点积分',
      },
      {
        id: 'epic-2',
        name: '学习大师的祝福',
        description: '来自学习大师的祝福',
        rarity: ItemRarity.Epic,
        probability: 3,
        effect: '使用后所有任务获得双倍积分',
      },

      // 传说物品 (2% 概率)
      {
        id: 'legendary-1',
        name: '学习之神的馈赠',
        description: '学习之神赐予的珍贵礼物',
        rarity: ItemRarity.Legendary,
        probability: 1,
        effect: '使用后获得20点积分和一次额外抽奖机会',
      },
      {
        id: 'legendary-2',
        name: '全能学霸徽章',
        description: '全能学霸的象征',
        rarity: ItemRarity.Legendary,
        probability: 1,
        effect: '使用后解锁所有成就进度+1',
      },
    ])

    // 抽奖消耗积分
    const lotteryCost = 10

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

    // 添加缺失的计算属性
    const unlockedAchievements = computed(() => {
      return achievements.value.filter((achievement) => achievement.unlocked)
    })

    const lockedAchievements = computed(() => {
      return achievements.value.filter((achievement) => !achievement.unlocked)
    })

    // 按稀有度排序的背包物品
    const sortedBackpackItems = computed(() => {
      const rarityOrder = {
        [ItemRarity.Legendary]: 4,
        [ItemRarity.Epic]: 3,
        [ItemRarity.Rare]: 2,
        [ItemRarity.Common]: 1,
      }

      return [...backpackItems.value].sort((a, b) => {
        // 先按稀有度排序
        if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
          return rarityOrder[b.rarity] - rarityOrder[a.rarity]
        }
        // 稀有度相同时按获得时间排序（新的在前）
        return new Date(b.acquiredDate).getTime() - new Date(a.acquiredDate).getTime()
      })
    })

    // 更新checkAchievements方法，添加游戏化反馈
    const checkAchievements = () => {
      let newlyUnlocked = false

      achievements.value.forEach((achievement) => {
        if (!achievement.unlocked) {
          let shouldUnlock = false

          switch (achievement.condition) {
            case 'task-completion':
              achievement.current = tasks.value.filter(
                (task) => task.completionLevel !== null,
              ).length
              shouldUnlock = achievement.current >= achievement.target
              break
            case 'total-task-completion':
              achievement.current = totalTaskCompletions.value
              shouldUnlock = achievement.current >= achievement.target
              break
            case 'total-points':
              achievement.current = currentPoints.value
              shouldUnlock = achievement.current >= achievement.target
              break
            case 'streak':
              achievement.current = studyStreak.value
              shouldUnlock = achievement.current >= achievement.target
              break
            // 可以添加更多条件类型
          }

          if (shouldUnlock) {
            achievement.unlocked = true
            achievement.unlockedAt = new Date().toISOString()
            achievement.isNew = true
            newlyUnlocked = true

            // 解锁成就时奖励积分
            adjustPoints(10, `解锁成就: ${achievement.name}`)

            // 这里可以触发动画或通知
            console.log(`🎉 恭喜解锁成就: ${achievement.name}!`)
          }
        }
      })

      // 如果有新解锁的成就，可以显示通知
      if (newlyUnlocked) {
        // 可以在这里添加全局通知逻辑
      }
    }

    // 方法
    // 登录
    function login(username: string, password: string): boolean {
      if (username === 'xumingxi' && password === '20160104') {
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

    // 初始化今日任务
    function initializeTodayTasks() {
      const today = new Date().toISOString().slice(0, 10)

      // 检查是否已经初始化了今日任务
      if (tasks.value.some((task) => task.date === today)) {
        return
      }

      // 添加今日的三个学科任务，包含默认描述
      tasks.value.push(
        {
          id: `chinese-${today}`,
          subject: 'chinese',
          subjectName: '语文',
          date: today,
          completionLevel: null,
          points: 0,
          description: '今日语文任务',
        },
        {
          id: `math-${today}`,
          subject: 'math',
          subjectName: '数学',
          date: today,
          completionLevel: null,
          points: 0,
          description: '今日数学任务',
        },
        {
          id: `english-${today}`,
          subject: 'english',
          subjectName: '英语',
          date: today,
          completionLevel: null,
          points: 0,
          description: '今日英语任务',
        },
      )
    }

    // 修改任务描述
    function updateTaskDescription(taskId: string, description: string) {
      const task = tasks.value.find((t) => t.id === taskId)
      if (task) {
        task.description = description
      }
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

        // 增加总任务完成数
        if (task.completionLevel === null) {
          totalTaskCompletions.value++
        }

        // 记录积分变动
        const record: PointRecord = {
          id: `record-${Date.now()}`,
          date: new Date().toISOString(),
          description: `${task.subjectName}任务完成（${level === 'low' ? '低' : level === 'medium' ? '中' : '高'}）`,
          points: task.points,
          type: 'task',
        }
        pointRecords.value.push(record)

        // 检查成就
        checkAchievements()
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

    // 兑换物品（修改以支持背包）
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

        // 添加到背包，默认普通稀有度
        const backpackItem: BackpackItem = {
          id: `backpack-${Date.now()}`,
          originalId: item.id,
          name: item.name,
          description: item.description,
          acquiredDate: new Date().toISOString(),
          rarity: ItemRarity.Common,
        }
        backpackItems.value.push(backpackItem)

        return true
      }
      return false
    }

    // 使用背包物品
    function useItemFromBackpack(itemId: string): boolean {
      const index = backpackItems.value.findIndex((item) => item.id === itemId)
      if (index !== -1) {
        // 使用非空断言操作符或重新获取item以避免类型错误
        const item = backpackItems.value[index]
        if (!item) return false // 额外的安全检查

        // 执行物品效果
        if (item.effect) {
          // 根据物品效果执行不同的操作
          if (item.effect.includes('获得5点积分') && item.rarity === ItemRarity.Rare) {
            adjustPoints(5, `使用稀有物品${item.name}`)
          } else if (item.effect.includes('获得10点积分') && item.rarity === ItemRarity.Epic) {
            adjustPoints(10, `使用史诗物品${item.name}`)
          } else if (item.effect.includes('获得20点积分') && item.rarity === ItemRarity.Legendary) {
            adjustPoints(20, `使用传说物品${item.name}`)
            // 可以在这里添加额外抽奖机会的逻辑
          } else if (
            item.effect.includes('解锁所有成就进度') &&
            item.rarity === ItemRarity.Legendary
          ) {
            // 增加所有成就的进度
            achievements.value.forEach((achievement) => {
              if (!achievement.unlocked) {
                achievement.current = Math.min(achievement.current + 1, achievement.target)
              }
            })
            checkAchievements() // 检查是否有新解锁的成就
          }
        }

        // 从背包移除物品
        backpackItems.value.splice(index, 1)

        // 记录使用记录
        const record: PointRecord = {
          id: `record-${Date.now()}`,
          date: new Date().toISOString(),
          description: `使用物品${item.name}`,
          points: 0,
          type: 'exchange',
        }
        pointRecords.value.push(record)

        return true
      }
      return false
    }

    // 新增抽奖方法
    function drawLottery(): LotteryItem | null {
      // 检查积分是否足够
      if (currentPoints.value < lotteryCost) {
        return null
      }

      // 扣除积分
      currentPoints.value -= lotteryCost

      // 记录抽奖记录
      const record: PointRecord = {
        id: `record-${Date.now()}`,
        date: new Date().toISOString(),
        description: '参与抽奖',
        points: -lotteryCost,
        type: 'exchange',
      }
      pointRecords.value.push(record)

      // 根据概率进行抽奖
      const random = Math.random() * 100
      let cumulativeProbability = 0

      for (const item of lotteryItems.value) {
        cumulativeProbability += item.probability
        if (random < cumulativeProbability) {
          // 将抽到的物品添加到背包
          const backpackItem: BackpackItem = {
            id: `backpack-${Date.now()}`,
            originalId: item.id,
            name: item.name,
            description: item.description,
            acquiredDate: new Date().toISOString(),
            rarity: item.rarity,
            effect: item.effect,
          }
          backpackItems.value.push(backpackItem)

          return item
        }
      }

      // 默认返回第一个物品（理论上不会执行到这里）
      // 添加安全检查，确保不会返回undefined
      if (lotteryItems.value.length > 0) {
        const defaultItem = lotteryItems.value[0]
        if (defaultItem) {
          // 将默认物品添加到背包
          const backpackItem: BackpackItem = {
            id: `backpack-${Date.now()}`,
            originalId: defaultItem.id,
            name: defaultItem.name,
            description: defaultItem.description,
            acquiredDate: new Date().toISOString(),
            rarity: defaultItem.rarity,
            effect: defaultItem.effect,
          }
          backpackItems.value.push(backpackItem)
          return defaultItem
        }
      }
      return null // 如果抽奖池为空或有问题，返回null
    }

    // 调整积分（管理模块使用） - 修正参数
    function adjustPoints(amount: number, description: string = '积分调整') {
      currentPoints.value = Math.max(0, currentPoints.value + amount)

      const record: PointRecord = {
        id: `record-${Date.now()}`,
        date: new Date().toISOString(),
        description: description,
        points: amount,
        type: 'exchange',
      }
      pointRecords.value.push(record)

      // 检查成就
      checkAchievements()
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
      backpackItems,
      achievements,
      totalTaskCompletions,
      lastLoginDate,
      studyStreak,
      lotteryItems,
      lotteryCost,
      // 计算属性
      todayTasks,
      todayPoints,
      unlockedAchievements,
      lockedAchievements,
      sortedBackpackItems,
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
      updateTaskDescription,
      useItemFromBackpack,
      checkAchievements,
      drawLottery,
      ItemRarity,
    }
  },
  {
    // 配置持久化 - 使用pinia-plugin-persistedstate的正确格式
    persist: {
      key: 'user-store',
      storage: localStorage,
    },
  },
)
