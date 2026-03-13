import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 定义计划类型
interface Plan {
  id: string
  subject: 'chinese' | 'math' | 'english'
  subjectName: string
  date: string
  type: 'daily' | 'weekly'
  dailyType?: 'specific' | 'everyday'
  weeklyType?: 'everyweek' | 'specific'
  selectedWeek?: string
  frequency: 'once' | 'daily' | 'weekly'
  targetCount: number
  completedCount: number
  timeRange: string
  completionLevel: boolean
  points: number
  description: string
  icon?: string
}

// 定义行为类型
interface Behavior {
  id: string
  name: string
  description: string
  icon: string
  frequency: 'daily' | 'weekly' | 'custom'
  targetCount: number
  points: number
  type: 'positive' | 'negative'
  currentCount: number
  completed: boolean
  lastRecordDate: string | null
}

// 定义抽奖记录类型
interface LotteryRecord {
  id: string
  date: string
  itemName: string
  itemRarity: ItemRarity
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
export interface LotteryItem {
  id: string
  name: string
  description: string
  rarity: ItemRarity
  probability: number // 概率（百分比）
  effect?: string // 特殊效果描述
  icon: string
}

// 定义背包物品类型，增加稀有度属性
export interface BackpackItem {
  id: string
  originalId: string
  name: string
  description: string
  acquiredDate: string
  rarity: ItemRarity
  effect?: string // 特殊效果描述
  icon: string
}

// 新增用户排行榜数据结构
interface LeaderboardUser {
  id: string
  nickname: string
  avatar: string
  points: number
  level: number
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 状态
    const isLoggedIn = ref(false)
    const currentPoints = ref(0)
    const plans = ref<Plan[]>([])
    const behaviors = ref<Behavior[]>([])
    const pointRecords = ref<PointRecord[]>([])
    const exchangeItems = ref<ExchangeItem[]>([
      { id: '1', name: '零食', points: 20, description: '美味零食一包' },
      { id: '2', name: '小玩具', points: 50, description: '精美小玩具一个' },
      { id: '3', name: '大玩具', points: 100, description: '超值大玩具一个' },
    ])
    // 添加抽奖记录状态
    const lotteryRecords = ref<LotteryRecord[]>([])
    // 最后完成日期（用于计算连续天数）
    // 用户信息
    const userInfo = ref<{
      username: string
      nickname: string
      bio: string
      email: string
      joinDate: string
      password: string
    }>({
      username: 'xumingxi',
      nickname: '',
      bio: '',
      email: '',
      joinDate: new Date().toISOString().split('T')[0] ?? '',
      password: '20160104', // 默认密码
    })

    // 最长连续学习天数
    const longestStreak = ref(0)

    // 最后完成日期（用于计算连续天数）
    const lastCompletionDate = ref<string | null>(null)
    // 新增成就相关状态
    const achievements = ref<Achievement[]>([
      // 初次登录类成就
      {
        id: 'achievement-1',
        name: '初次登录',
        description: '首次登录学习系统',
        icon: '👋',
        unlocked: false,
        condition: 'special',
        target: 1,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已登录{{current}}次',
      },
      {
        id: 'achievement-2',
        name: '早起鸟儿',
        description: '在早上9点前完成学习任务',
        icon: '🌅',
        unlocked: false,
        condition: 'special',
        target: 1,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已早起学习{{current}}次',
      },
      // 学习任务类成就
      {
        id: 'achievement-3',
        name: '学习新手',
        description: '完成第一个学习任务',
        icon: '📚',
        unlocked: false,
        condition: 'task',
        target: 1,
        current: 0,
        category: 'task',
        isNew: true,
        progressDescription: '已完成{{current}}个任务',
      },
      {
        id: 'achievement-4',
        name: '学习达人',
        description: '完成10个学习任务',
        icon: '🎓',
        unlocked: false,
        condition: 'task',
        target: 10,
        current: 0,
        category: 'task',
        isNew: true,
        progressDescription: '已完成{{current}}个任务',
      },
      {
        id: 'achievement-5',
        name: '学习大师',
        description: '完成50个学习任务',
        icon: '🏆',
        unlocked: false,
        condition: 'task',
        target: 50,
        current: 0,
        category: 'task',
        isNew: true,
        progressDescription: '已完成{{current}}个任务',
      },
      {
        id: 'achievement-6',
        name: '学习传奇',
        description: '完成100个学习任务',
        icon: '👑',
        unlocked: false,
        condition: 'task',
        target: 100,
        current: 0,
        category: 'task',
        isNew: true,
        progressDescription: '已完成{{current}}个任务',
      },
      // 积分类成就
      {
        id: 'achievement-7',
        name: '积分新手',
        description: '累计获得100积分',
        icon: '✨',
        unlocked: false,
        condition: 'points',
        target: 100,
        current: 0,
        category: 'points',
        isNew: true,
        progressDescription: '已获得{{current}}积分',
      },
      {
        id: 'achievement-8',
        name: '积分达人',
        description: '累计获得500积分',
        icon: '💎',
        unlocked: false,
        condition: 'points',
        target: 500,
        current: 0,
        category: 'points',
        isNew: true,
        progressDescription: '已获得{{current}}积分',
      },
      {
        id: 'achievement-9',
        name: '积分大师',
        description: '累计获得1000积分',
        icon: '🌟',
        unlocked: false,
        condition: 'points',
        target: 1000,
        current: 0,
        category: 'points',
        isNew: true,
        progressDescription: '已获得{{current}}积分',
      },
      {
        id: 'achievement-10',
        name: '积分富豪',
        description: '累计获得5000积分',
        icon: '💰',
        unlocked: false,
        condition: 'points',
        target: 5000,
        current: 0,
        category: 'points',
        isNew: true,
        progressDescription: '已获得{{current}}积分',
      },
      // 连续学习类成就
      {
        id: 'achievement-11',
        name: '连续学习',
        description: '连续学习3天',
        icon: '🏆',
        unlocked: false,
        condition: 'streak',
        target: 3,
        current: 0,
        category: 'streak',
        isNew: true,
        progressDescription: '已连续学习{{current}}天',
      },
      {
        id: 'achievement-12',
        name: '一周达人',
        description: '连续学习7天',
        icon: '🌟',
        unlocked: false,
        condition: 'streak',
        target: 7,
        current: 0,
        category: 'streak',
        isNew: true,
        progressDescription: '已连续学习{{current}}天',
      },
      {
        id: 'achievement-13',
        name: '坚持达人',
        description: '连续学习14天',
        icon: '🔥',
        unlocked: false,
        condition: 'streak',
        target: 14,
        current: 0,
        category: 'streak',
        isNew: true,
        progressDescription: '已连续学习{{current}}天',
      },
      {
        id: 'achievement-14',
        name: '学霸养成',
        description: '连续学习30天',
        icon: '🎖️',
        unlocked: false,
        condition: 'streak',
        target: 30,
        current: 0,
        category: 'streak',
        isNew: true,
        progressDescription: '已连续学习{{current}}天',
      },
      {
        id: 'achievement-15',
        name: '学习圣者',
        description: '连续学习60天',
        icon: '👼',
        unlocked: false,
        condition: 'streak',
        target: 60,
        current: 0,
        category: 'streak',
        isNew: true,
        progressDescription: '已连续学习{{current}}天',
      },
      // 特殊成就
      {
        id: 'achievement-16',
        name: '完美一周',
        description: '一周内完成所有学习任务',
        icon: '🌈',
        unlocked: false,
        condition: 'special',
        target: 7,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已完成{{current}}天任务',
      },
      {
        id: 'achievement-17',
        name: '多才多艺',
        description: '完成所有科目的学习任务',
        icon: '🎨',
        unlocked: false,
        condition: 'special',
        target: 3,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已完成{{current}}个科目',
      },
      {
        id: 'achievement-18',
        name: '抽奖幸运儿',
        description: '抽中5次稀有物品',
        icon: '🎰',
        unlocked: false,
        condition: 'lottery',
        target: 5,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已抽中{{current}}次稀有物品',
      },
      // 行为相关成就
      {
        id: 'achievement-19',
        name: '行为典范',
        description: '连续7天完成所有行为记录',
        icon: '🎯',
        unlocked: false,
        condition: 'behavior-streak',
        target: 7,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已连续{{current}}天完成行为记录',
      },
      {
        id: 'achievement-20',
        name: '行为新手',
        description: '完成第一个行为记录',
        icon: '🌟',
        unlocked: false,
        condition: 'behavior',
        target: 1,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已完成{{current}}个行为记录',
      },
      {
        id: 'achievement-21',
        name: '行为达人',
        description: '完成10个行为记录',
        icon: '✨',
        unlocked: false,
        condition: 'behavior',
        target: 10,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已完成{{current}}个行为记录',
      },
      {
        id: 'achievement-22',
        name: '行为大师',
        description: '完成50个行为记录',
        icon: '🏆',
        unlocked: false,
        condition: 'behavior',
        target: 50,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已完成{{current}}个行为记录',
      },
      {
        id: 'achievement-23',
        name: '习惯养成',
        description: '连续30天完成行为记录',
        icon: '🔥',
        unlocked: false,
        condition: 'behavior-streak',
        target: 30,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已连续{{current}}天完成行为记录',
      },
      {
        id: 'achievement-24',
        name: '学科专家',
        description: '在单个学科完成30个任务',
        icon: '🔬',
        unlocked: false,
        condition: 'special',
        target: 30,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已完成{{current}}个单一学科任务',
      },
    ])
    // 新增背包物品状态
    const backpackItems = ref<BackpackItem[]>([])
    // 添加缺失的状态定义
    const totalTaskCompletions = ref(0)
    const lastLoginDate = ref<string>('')
    const studyStreak = ref(0)

    // 新增排行榜相关状态
    const leaderboardUsers = ref<LeaderboardUser[]>([
        { id: 'user-1', nickname: '小草莓', avatar: '🍓', points: 1500, level: 12 },
        { id: 'user-2', nickname: '小樱花', avatar: '🌸', points: 1250, level: 10 },
        { id: 'user-3', nickname: '小云朵', avatar: '☁️', points: 1000, level: 8 },
        { id: 'user-4', nickname: '小彩虹', avatar: '🌈', points: 950, level: 7 },
        { id: 'user-5', nickname: '小月亮', avatar: '🌙', points: 880, level: 7 },
        { id: 'user-6', nickname: '小星星', avatar: '⭐', points: 820, level: 6 },
        { id: 'user-7', nickname: '小爱心', avatar: '❤️', points: 750, level: 6 },
        { id: 'user-8', nickname: '小太阳', avatar: '☀️', points: 680, level: 5 },
        { id: 'user-9', nickname: '小雪花', avatar: '❄️', points: 620, level: 5 },
        { id: 'user-10', nickname: '小薄荷', avatar: '🍃', points: 550, level: 4 },
    ])

    // 功能开关状态
    const enableReminders = ref(false)
    const enableLottery = ref(false)

    // 新增抽奖池配置
    const lotteryItems = ref<LotteryItem[]>([
      // 普通物品 (70% 概率)
      {
        id: 'lucky-1',
        name: '幸运星',
        description: '带来好运的星星',
        rarity: ItemRarity.Common,
        probability: 30,
        icon: '✨'
      },
      {
        id: 'lucky-2',
        name: '学习笔记',
        description: '提高学习效率',
        rarity: ItemRarity.Common,
        probability: 25,
        icon: '📓'
      },
      {
        id: 'lucky-3',
        name: '能量饮料',
        description: '补充学习能量',
        rarity: ItemRarity.Common,
        probability: 15,
        icon: '🥤'
      },

      // 稀有物品 (20% 概率)
      {
        id: 'rare-1',
        name: '智慧结晶',
        description: '增加智慧的结晶',
        rarity: ItemRarity.Rare,
        probability: 10,
        effect: '使用后获得5点积分',
        icon: '💡'
      },
      {
        id: 'rare-2',
        name: '学习加速器',
        description: '加速学习进度',
        rarity: ItemRarity.Rare,
        probability: 10,
        effect: '使用后获得额外的任务完成度',
        icon: '🚀'
      },

      // 史诗物品 (8% 概率)
      {
        id: 'epic-1',
        name: '知识宝库',
        description: '蕴含丰富知识的宝库',
        rarity: ItemRarity.Epic,
        probability: 5,
        effect: '使用后获得10点积分',
        icon: '🏰'
      },
      {
        id: 'epic-2',
        name: '学习大师的祝福',
        description: '来自学习大师的祝福',
        rarity: ItemRarity.Epic,
        probability: 3,
        effect: '使用后所有任务获得双倍积分',
        icon: '🧙‍♂️'
      },

      // 传说物品 (2% 概率)
      {
        id: 'legendary-1',
        name: '学习之神的馈赠',
        description: '学习之神赐予的珍贵礼物',
        rarity: ItemRarity.Legendary,
        probability: 1,
        effect: '使用后获得20点积分和一次额外抽奖机会',
        icon: '🌟'
      },
      {
        id: 'legendary-2',
        name: '全能学霸徽章',
        description: '全能学霸的象征',
        rarity: ItemRarity.Legendary,
        probability: 1,
        effect: '使用后解锁所有成就进度+1',
        icon: '🏅'
      },
    ])

    // 抽奖消耗积分
    const lotteryCost = 10

    // 计算属性
    const todayPlans = computed(() => {
      const today = new Date().toISOString().slice(0, 10)
      return plans.value.filter((plan) => plan.date === today)
    })

    const todayPoints = computed(() => {
      const today = new Date().toISOString().slice(0, 10)
      return plans.value
        .filter((plan) => plan.date === today && plan.completionLevel)
        .reduce((sum, plan) => sum + plan.points, 0)
    })

    const todayBehaviors = computed(() => {
      const today = new Date().toISOString().slice(0, 10)
      return behaviors.value.filter((behavior) => {
        if (behavior.frequency === 'daily') {
          return true
        }
        // 可以根据需要添加其他频率的逻辑
        return false
      })
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
            case 'task':
              achievement.current = totalTaskCompletions.value
              shouldUnlock = achievement.current >= achievement.target
              break
            case 'points':
              achievement.current = currentPoints.value
              shouldUnlock = achievement.current >= achievement.target
              break
            case 'streak':
              achievement.current = studyStreak.value
              shouldUnlock = achievement.current >= achievement.target
              break
            case 'special':
              // 特殊成就的逻辑可以根据需要添加
              break
            case 'lottery':
              // 抽奖相关成就逻辑
              achievement.current = lotteryRecords.value.filter(record => 
                record.itemRarity === ItemRarity.Rare || 
                record.itemRarity === ItemRarity.Epic || 
                record.itemRarity === ItemRarity.Legendary
              ).length
              shouldUnlock = achievement.current >= achievement.target
              break
            case 'behavior':
              // 行为相关成就逻辑 - 计算已完成的行为数量
              achievement.current = behaviors.value.filter(behavior => behavior?.completed === true).length
              shouldUnlock = achievement.current >= achievement.target
              break
            case 'behavior-streak':
              // 行为连续记录成就逻辑 - 这里需要实现连续天数的计算
              // 简化实现：使用学习连续天数作为行为连续天数
              achievement.current = studyStreak.value
              shouldUnlock = achievement.current >= achievement.target
              break
          }

          if (shouldUnlock) {
            achievement.unlocked = true
            achievement.unlockedAt = new Date().toISOString()
            achievement.isNew = true
            newlyUnlocked = true

            // 根据稀有度奖励不同积分
            const rarity = achievement.target >= 100 ? 'legendary' : 
                          achievement.target >= 50 ? 'epic' : 
                          achievement.target >= 10 ? 'rare' : 'common'
            
            const pointsMap = {
              common: 10,
              rare: 50,
              epic: 150,
              legendary: 300
            }
            
            adjustPoints(pointsMap[rarity], `解锁成就: ${achievement.name}`)

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
      if (username === userInfo.value.username && password === userInfo.value.password) {
        isLoggedIn.value = true
        localStorage.setItem('isLoggedIn', 'true')
        // 记录登录日期，用于计算连续登录
        lastLoginDate.value = new Date().toISOString().slice(0, 10)
        
        // 检查并解锁初次登录成就
        const firstLoginAchievement = achievements.value.find(a => a.id === 'achievement-1')
        if (firstLoginAchievement && !firstLoginAchievement.unlocked) {
          firstLoginAchievement.current = 1
          firstLoginAchievement.unlocked = true
          firstLoginAchievement.unlockedAt = new Date().toISOString()
          firstLoginAchievement.isNew = true
          
          // 奖励积分
          adjustPoints(10, '解锁成就: 初次登录')
          console.log('🎉 恭喜解锁成就: 初次登录!')
        }
        
        // 检查早起鸟儿成就（如果当前时间早于9点）
        const now = new Date()
        if (now.getHours() < 9) {
          const earlyBirdAchievement = achievements.value.find(a => a.id === 'achievement-2')
          if (earlyBirdAchievement && !earlyBirdAchievement.unlocked) {
            earlyBirdAchievement.current = 1
            earlyBirdAchievement.unlocked = true
            earlyBirdAchievement.unlockedAt = new Date().toISOString()
            earlyBirdAchievement.isNew = true
            
            // 奖励积分
            adjustPoints(20, '解锁成就: 早起鸟儿')
            console.log('🎉 恭喜解锁成就: 早起鸟儿!')
          }
        }
        
        return true
      }
      return false
    }

    // 登出
    function logout() {
      isLoggedIn.value = false
      localStorage.removeItem('isLoggedIn')
    }

    // 初始化今日计划
    function initializeTodayPlans() {
      const today = new Date().toISOString().slice(0, 10)

      // 检查是否已经初始化了今日计划
      if (plans.value.some((plan) => plan.date === today)) {
        return
      }

      // 检查是否存在今日计划的标记，避免在用户删除后重新添加
      const todayPlanFlag = localStorage.getItem(`todayPlansInitialized-${today}`)
      if (todayPlanFlag) {
        return
      }

      // 添加今日的三个学科计划，包含默认描述和新增的字段
      plans.value.push(
        {
          id: `chinese-${today}`,
          subject: 'chinese',
          subjectName: '语文',
          date: today,
          type: 'daily',
          dailyType: 'specific',
          weeklyType: 'everyweek',
          selectedWeek: '',
          frequency: 'once',
          targetCount: 1,
          completedCount: 0,
          timeRange: '',
          completionLevel: false,
          points: 0,
          description: '今日语文计划',
        },
        {
          id: `math-${today}`,
          subject: 'math',
          subjectName: '数学',
          date: today,
          type: 'daily',
          dailyType: 'specific',
          weeklyType: 'everyweek',
          selectedWeek: '',
          frequency: 'once',
          targetCount: 1,
          completedCount: 0,
          timeRange: '',
          completionLevel: false,
          points: 0,
          description: '今日数学计划',
        },
        {
          id: `english-${today}`,
          subject: 'english',
          subjectName: '英语',
          date: today,
          type: 'daily',
          dailyType: 'specific',
          weeklyType: 'everyweek',
          selectedWeek: '',
          frequency: 'once',
          targetCount: 1,
          completedCount: 0,
          timeRange: '',
          completionLevel: false,
          points: 0,
          description: '今日英语计划',
        },
      )

      // 添加本周的计划作为默认数据
      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + 1) // 调整到周一
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6) // 周日
      const weekRange = `${weekStart.toISOString().slice(0, 10)}-${weekEnd.toISOString().slice(0, 10)}`

      plans.value.push(
        {
          id: `weekly-${today}`,
          subject: 'chinese',
          subjectName: '本周阅读计划',
          date: weekStart.toISOString().slice(0, 10), // 使用周一开始日期
          type: 'weekly',
          dailyType: 'specific',
          weeklyType: 'everyweek',
          selectedWeek: weekRange,
          frequency: 'weekly',
          targetCount: 3,
          completedCount: 0,
          timeRange: '',
          completionLevel: false,
          points: 0,
          description: '本周完成3次阅读任务',
        }
      )

      // 标记今日计划已初始化
      localStorage.setItem(`todayPlansInitialized-${today}`, 'true')
    }

    // 初始化默认行为
    function initializeDefaultBehaviors() {
      // 检查是否已经初始化了行为
      if (behaviors.value.length > 0) {
        return
      }

      // 添加默认行为
      const defaultBehaviors: Behavior[] = [
        {
          id: 'behavior-1',
          name: '整理房间',
          description: '保持房间整洁',
          icon: '🏠',
          frequency: 'daily',
          targetCount: 1,
          points: 1,
          type: 'positive',
          currentCount: 0,
          completed: false,
          lastRecordDate: null
        },
        {
          id: 'behavior-2',
          name: '早睡',
          description: '晚上10点前睡觉',
          icon: '🌙',
          frequency: 'daily',
          targetCount: 1,
          points: 2,
          type: 'positive',
          currentCount: 0,
          completed: false,
          lastRecordDate: null
        },
        {
          id: 'behavior-3',
          name: '多喝水',
          description: '一天喝够8杯水',
          icon: '💧',
          frequency: 'daily',
          targetCount: 3,
          points: 0.5,
          type: 'positive',
          currentCount: 0,
          completed: false,
          lastRecordDate: null
        },
        {
          id: 'behavior-4',
          name: '阅读学习',
          description: '阅读30分钟',
          icon: '📚',
          frequency: 'daily',
          targetCount: 1,
          points: 1,
          type: 'positive',
          currentCount: 0,
          completed: false,
          lastRecordDate: null
        },
        {
          id: 'behavior-5',
          name: '9点前完成作业',
          description: '晚上9点前完成所有作业',
          icon: '✏️',
          frequency: 'daily',
          targetCount: 1,
          points: 3,
          type: 'positive',
          currentCount: 0,
          completed: false,
          lastRecordDate: null
        },
        {
          id: 'behavior-6',
          name: '作业不认真扣分',
          description: '作业乱做、漏做、错很多',
          icon: '❌',
          frequency: 'daily',
          targetCount: 1,
          points: -3,
          type: 'negative',
          currentCount: 0,
          completed: false,
          lastRecordDate: null
        },
        {
          id: 'behavior-7',
          name: '迟到扣分',
          description: '上学或上课迟到',
          icon: '⏰',
          frequency: 'daily',
          targetCount: 1,
          points: -2,
          type: 'negative',
          currentCount: 0,
          completed: false,
          lastRecordDate: null
        },
        {
          id: 'behavior-8',
          name: '挑食扣分',
          description: '吃饭挑食、浪费食物',
          icon: '🥗',
          frequency: 'daily',
          targetCount: 1,
          points: -1,
          type: 'negative',
          currentCount: 0,
          completed: false,
          lastRecordDate: null
        }
      ]

      behaviors.value = defaultBehaviors
    }

    // 记录行为
    function recordBehavior(behaviorId: string) {
      const behavior = behaviors.value.find((b) => b.id === behaviorId)
      if (behavior) {
        const today = new Date().toISOString().slice(0, 10)
        
        // 检查是否已经记录过今天的行为
        if (behavior.lastRecordDate === today && behavior.completed) {
          return false
        }

        // 增加当前计数
        behavior.currentCount++
        behavior.lastRecordDate = today

        // 检查是否完成目标
        if (behavior.currentCount >= behavior.targetCount) {
          behavior.completed = true
          // 添加积分
          currentPoints.value += behavior.points

          // 记录积分变动
          const record: PointRecord = {
            id: `record-${Date.now()}`,
            date: new Date().toISOString(),
            description: `${behavior.name}${behavior.type === 'positive' ? '完成' : '发生'}`,
            points: behavior.points,
            type: 'task'
          }
          pointRecords.value.push(record)
        }

        return true
      }
      return false
    }

    // 取消行为记录
    function cancelBehaviorRecord(behaviorId: string) {
      const behavior = behaviors.value.find((b) => b.id === behaviorId)
      if (behavior && behavior.lastRecordDate === new Date().toISOString().slice(0, 10)) {
        // 减少当前计数
        behavior.currentCount = Math.max(0, behavior.currentCount - 1)
        
        // 如果之前已完成，现在取消后不再完成
        if (behavior.completed) {
          behavior.completed = false
          // 扣除积分
          currentPoints.value = Math.max(0, currentPoints.value - behavior.points)

          // 记录积分变动
          const record: PointRecord = {
            id: `record-${Date.now()}`,
            date: new Date().toISOString(),
            description: `取消${behavior.name}${behavior.type === 'positive' ? '完成' : '发生'}`,
            points: -behavior.points,
            type: 'task'
          }
          pointRecords.value.push(record)
        }

        return true
      }
      return false
    }

    // 添加行为
    function addBehavior(behavior: Omit<Behavior, 'id' | 'currentCount' | 'completed' | 'lastRecordDate'>) {
      const newBehavior: Behavior = {
        ...behavior,
        id: `behavior-${Date.now()}`,
        currentCount: 0,
        completed: false,
        lastRecordDate: null
      }
      behaviors.value.push(newBehavior)
      return newBehavior
    }

    // 更新行为
    function updateBehavior(behaviorId: string, updates: Partial<Omit<Behavior, 'id' | 'currentCount' | 'completed' | 'lastRecordDate'>>) {
      const behavior = behaviors.value.find((b) => b.id === behaviorId)
      if (behavior) {
        Object.assign(behavior, updates)
        return true
      }
      return false
    }

    // 删除行为
    function removeBehavior(behaviorId: string) {
      const index = behaviors.value.findIndex((b) => b.id === behaviorId)
      if (index !== -1) {
        behaviors.value.splice(index, 1)
        return true
      }
      return false
    }

    // 重置每日行为状态
    function resetDailyBehaviors() {
      const today = new Date().toISOString().slice(0, 10)
      behaviors.value.forEach((behavior) => {
        if (behavior.frequency === 'daily' && behavior.lastRecordDate !== today) {
          behavior.currentCount = 0
          behavior.completed = false
        }
      })
    }

    // 修改计划描述
    function updatePlanDescription(planId: string, description: string) {
      const plan = plans.value.find((p) => p.id === planId)
      if (plan) {
        plan.description = description
      }
    }

    // 更新任务完成度
    // 计算连续完成天数
    function calculateConsecutiveDays() {
      const today = new Date().toISOString().split('T')[0]
      if (lastCompletionDate.value) {
        const lastDate = new Date(lastCompletionDate.value)
        const todayDate = new Date(today ?? '')
        const diffTime = todayDate.getTime() - lastDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          // 连续一天，增加计数
          studyStreak.value++
        } else if (diffDays > 1) {
          // 重置计数
          studyStreak.value = 1
        }
        // 如果diffDays === 0，同一天，不更新
      } else {
        // 第一次完成任务
        studyStreak.value = 1
      }
      lastCompletionDate.value = today ?? null
    }

    function updatePlanCompletion(planId: string, completed: boolean) {
      const plan = plans.value.find((p) => p.id === planId)
      if (plan) {
        // 保存之前的完成状态
        const wasCompleted = plan.completionLevel
        
        // 移除之前的积分
        if (wasCompleted) {
          currentPoints.value -= plan.points
        }

        // 更新计划完成度和积分
        if (plan.type === 'weekly') {
          // 对于周计划，更新完成次数
          if (completed && plan.completedCount < plan.targetCount) {
            plan.completedCount++
            // 检查是否达到目标次数
            plan.completionLevel = plan.completedCount >= plan.targetCount
            plan.points = plan.completionLevel ? 3 : 0
          } else if (!completed && plan.completedCount > 0) {
            plan.completedCount--
            plan.completionLevel = plan.completedCount >= plan.targetCount
            plan.points = plan.completionLevel ? 3 : 0
          }
        } else {
          // 对于日计划，直接设置完成状态
          plan.completionLevel = completed
          plan.points = completed ? 3 : 0
        }

        // 触发响应式更新
        plans.value = [...plans.value]

        // 添加新积分
        if (completed && !wasCompleted) {
          currentPoints.value += plan.points
        }

        // 增加总计划完成数
        if (completed && !wasCompleted) {
          totalTaskCompletions.value++
        }

        // 记录积分变动
        const record: PointRecord = {
          id: `record-${Date.now()}`,
          date: new Date().toISOString(),
          description: `${plan.subjectName}计划${completed ? '完成' : '取消完成'}`,
          points: completed ? plan.points : -plan.points,
          type: 'task',
        }
        pointRecords.value.push(record)

        // 检查成就
        checkAchievements()
        // 计算连续完成天数
        calculateConsecutiveDays()
      }
    }

    // 取消计划完成度
    function cancelPlanCompletion(planId: string) {
      const plan = plans.value.find((p) => p.id === planId)
      if (plan && plan.completionLevel) {
        // 记录要扣除的积分
        const pointsToDeduct = plan.points

        // 移除之前的积分
        currentPoints.value -= pointsToDeduct

        // 更新计划完成度和积分
        if (plan.type === 'weekly') {
          // 对于周计划，减少完成次数
          if (plan.completedCount > 0) {
            plan.completedCount--
            plan.completionLevel = plan.completedCount >= plan.targetCount
            plan.points = plan.completionLevel ? 3 : 0
          }
        } else {
          // 对于日计划，直接设置完成状态为 false
          plan.completionLevel = false
          plan.points = 0
        }

        // 减少总计划完成数
        totalTaskCompletions.value = Math.max(0, totalTaskCompletions.value - 1)

        // 触发响应式更新
        plans.value = [...plans.value]

        // 记录积分变动
        const record: PointRecord = {
          id: `record-${Date.now()}`,
          date: new Date().toISOString(),
          description: `${plan.subjectName}计划取消完成`,
          points: -pointsToDeduct,
          type: 'task',
        }
        pointRecords.value.push(record)

        // 检查当天是否还有其他已完成的计划
        const today = new Date().toISOString().split('T')[0]
        const hasCompletedPlansToday = plans.value.some(
          (p) => p.date === today && p.completionLevel,
        )

        // 如果当天没有已完成的计划，重置连续完成天数和最后完成日期
        if (!hasCompletedPlansToday) {
          studyStreak.value = 0
          lastCompletionDate.value = null
        }

        return pointsToDeduct
      }
      return 0
    }

    // 撤销计划完成
    function undoPlanCompletion(planId: string) {
      return cancelPlanCompletion(planId)
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
          icon: '🎁'
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
    function drawLottery(item?: LotteryItem): BackpackItem | null {
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
        type: 'exchange'
      }
      pointRecords.value.push(record)

      // 使用提供的物品或根据概率进行抽奖
      const selectedItem = item || (() => {
        // 根据概率进行抽奖
        const random = Math.random() * 100
        let cumulativeProbability = 0

        for (const lotteryItem of lotteryItems.value) {
          cumulativeProbability += lotteryItem.probability
          if (random < cumulativeProbability) {
            return lotteryItem
          }
        }

        // 如果没有找到（理论上不会发生），返回安慰奖
        return {
          id: 'fallback-item',
          name: '安慰奖',
          description: '感谢参与！',
          rarity: ItemRarity.Common,
          probability: 100,
          effect: '+10 学习积分',
          icon: '🎁'
        } as LotteryItem
      })()

      // 将抽到的物品添加到背包
      const backpackItem: BackpackItem = {
        id: `backpack-${Date.now()}`,
        originalId: selectedItem.id,
        name: selectedItem.name,
        description: selectedItem.description,
        acquiredDate: new Date().toISOString(),
        rarity: selectedItem.rarity,
        effect: selectedItem.effect,
        icon: selectedItem.icon
      }
      backpackItems.value.push(backpackItem)

      // 添加抽奖记录到lotteryRecords
      const lotteryRecord: LotteryRecord = {
        id: `lottery-${Date.now()}`,
        date: new Date().toISOString(),
        itemName: selectedItem.name,
        itemRarity: selectedItem.rarity
      }
      lotteryRecords.value.unshift(lotteryRecord)

      return backpackItem
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

    // 更新用户信息
    function updateUserInfo(info: Partial<typeof userInfo.value>) {
      userInfo.value = { ...userInfo.value, ...info }
    }

    // 更新密码
    function updatePassword(newPassword: string) {
      userInfo.value.password = newPassword
    }

    // 清除今日计划初始化标记
    function clearTodayPlansFlag() {
      const today = new Date().toISOString().slice(0, 10)
      localStorage.removeItem(`todayPlansInitialized-${today}`)
    }

    // 重置所有数据
    function resetAllData() {
      // 重置状态
      currentPoints.value = 0
      plans.value = []
      behaviors.value = []
      pointRecords.value = []
      backpackItems.value = []
      lotteryRecords.value = []
      totalTaskCompletions.value = 0
      studyStreak.value = 0
      lastCompletionDate.value = null
      lastLoginDate.value = ''
      
      // 重置成就数据
      achievements.value = [
        // 初次登录类成就
        {
          id: 'achievement-1',
          name: '初次登录',
          description: '首次登录学习系统',
          icon: '👋',
          unlocked: false,
          condition: 'special',
          target: 1,
          current: 0,
          category: 'special',
          isNew: true,
          progressDescription: '已登录{{current}}次',
        },
        {
          id: 'achievement-2',
          name: '早起鸟儿',
          description: '在早上9点前完成学习任务',
          icon: '🌅',
          unlocked: false,
          condition: 'special',
          target: 1,
          current: 0,
          category: 'special',
          isNew: true,
          progressDescription: '已早起学习{{current}}次',
        },
        // 学习任务类成就
        {
          id: 'achievement-3',
          name: '学习新手',
          description: '完成第一个学习任务',
          icon: '📚',
          unlocked: false,
          condition: 'task',
          target: 1,
          current: 0,
          category: 'task',
          isNew: true,
          progressDescription: '已完成{{current}}个任务',
        },
        {
          id: 'achievement-4',
          name: '学习达人',
          description: '完成10个学习任务',
          icon: '🎓',
          unlocked: false,
          condition: 'task',
          target: 10,
          current: 0,
          category: 'task',
          isNew: true,
          progressDescription: '已完成{{current}}个任务',
        },
        {
          id: 'achievement-5',
          name: '学习大师',
          description: '完成50个学习任务',
          icon: '🏆',
          unlocked: false,
          condition: 'task',
          target: 50,
          current: 0,
          category: 'task',
          isNew: true,
          progressDescription: '已完成{{current}}个任务',
        },
        {
          id: 'achievement-6',
          name: '学习传奇',
          description: '完成100个学习任务',
          icon: '👑',
          unlocked: false,
          condition: 'task',
          target: 100,
          current: 0,
          category: 'task',
          isNew: true,
          progressDescription: '已完成{{current}}个任务',
        },
        // 积分类成就
        {
          id: 'achievement-7',
          name: '积分新手',
          description: '累计获得100积分',
          icon: '✨',
          unlocked: false,
          condition: 'points',
          target: 100,
          current: 0,
          category: 'points',
          isNew: true,
          progressDescription: '已获得{{current}}积分',
        },
        {
          id: 'achievement-8',
          name: '积分达人',
          description: '累计获得500积分',
          icon: '💎',
          unlocked: false,
          condition: 'points',
          target: 500,
          current: 0,
          category: 'points',
          isNew: true,
          progressDescription: '已获得{{current}}积分',
        },
        {
          id: 'achievement-9',
          name: '积分大师',
          description: '累计获得1000积分',
          icon: '🌟',
          unlocked: false,
          condition: 'points',
          target: 1000,
          current: 0,
          category: 'points',
          isNew: true,
          progressDescription: '已获得{{current}}积分',
        },
        {
          id: 'achievement-10',
          name: '积分富豪',
          description: '累计获得5000积分',
          icon: '💰',
          unlocked: false,
          condition: 'points',
          target: 5000,
          current: 0,
          category: 'points',
          isNew: true,
          progressDescription: '已获得{{current}}积分',
        },
        // 连续学习类成就
        {
          id: 'achievement-11',
          name: '连续学习',
          description: '连续学习3天',
          icon: '🏆',
          unlocked: false,
          condition: 'streak',
          target: 3,
          current: 0,
          category: 'streak',
          isNew: true,
          progressDescription: '已连续学习{{current}}天',
        },
        {
          id: 'achievement-12',
          name: '一周达人',
          description: '连续学习7天',
          icon: '🌟',
          unlocked: false,
          condition: 'streak',
          target: 7,
          current: 0,
          category: 'streak',
          isNew: true,
          progressDescription: '已连续学习{{current}}天',
        },
        {
          id: 'achievement-13',
          name: '坚持达人',
          description: '连续学习14天',
          icon: '🔥',
          unlocked: false,
          condition: 'streak',
          target: 14,
          current: 0,
          category: 'streak',
          isNew: true,
          progressDescription: '已连续学习{{current}}天',
        },
        {
          id: 'achievement-14',
          name: '学霸养成',
          description: '连续学习30天',
          icon: '🎖️',
          unlocked: false,
          condition: 'streak',
          target: 30,
          current: 0,
          category: 'streak',
          isNew: true,
          progressDescription: '已连续学习{{current}}天',
        },
        {
          id: 'achievement-15',
          name: '学习圣者',
          description: '连续学习60天',
          icon: '👼',
          unlocked: false,
          condition: 'streak',
          target: 60,
          current: 0,
          category: 'streak',
          isNew: true,
          progressDescription: '已连续学习{{current}}天',
        },
        // 特殊成就
      {
        id: 'achievement-16',
        name: '完美一周',
        description: '一周内完成所有学习任务',
        icon: '🌈',
        unlocked: false,
        condition: 'special',
        target: 7,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已完成{{current}}天任务',
      },
      {
        id: 'achievement-17',
        name: '多才多艺',
        description: '完成所有科目的学习任务',
        icon: '🎨',
        unlocked: false,
        condition: 'special',
        target: 3,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已完成{{current}}个科目',
      },
      {
        id: 'achievement-18',
        name: '抽奖幸运儿',
        description: '抽中5次稀有物品',
        icon: '🎰',
        unlocked: false,
        condition: 'lottery',
        target: 5,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已抽中{{current}}次稀有物品',
      },
      // 行为相关成就
      {
        id: 'achievement-19',
        name: '行为典范',
        description: '连续7天完成所有行为记录',
        icon: '🎯',
        unlocked: false,
        condition: 'behavior-streak',
        target: 7,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已连续{{current}}天完成行为记录',
      },
      {
        id: 'achievement-20',
        name: '行为新手',
        description: '完成第一个行为记录',
        icon: '🌟',
        unlocked: false,
        condition: 'behavior',
        target: 1,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已完成{{current}}个行为记录',
      },
      {
        id: 'achievement-21',
        name: '行为达人',
        description: '完成10个行为记录',
        icon: '✨',
        unlocked: false,
        condition: 'behavior',
        target: 10,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已完成{{current}}个行为记录',
      },
      {
        id: 'achievement-22',
        name: '行为大师',
        description: '完成50个行为记录',
        icon: '🏆',
        unlocked: false,
        condition: 'behavior',
        target: 50,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已完成{{current}}个行为记录',
      },
      {
        id: 'achievement-23',
        name: '习惯养成',
        description: '连续30天完成行为记录',
        icon: '🔥',
        unlocked: false,
        condition: 'behavior-streak',
        target: 30,
        current: 0,
        category: 'behavior',
        isNew: true,
        progressDescription: '已连续{{current}}天完成行为记录',
      },
      {
        id: 'achievement-24',
        name: '学科专家',
        description: '在单个学科完成30个任务',
        icon: '🔬',
        unlocked: false,
        condition: 'special',
        target: 30,
        current: 0,
        category: 'special',
        isNew: true,
        progressDescription: '已完成{{current}}个单一学科任务',
      },
      ]
      
      // 清除本地存储
      localStorage.clear()
      sessionStorage.clear()
    }

    // 新增获取排行榜数据的方法
    function getLeaderboardData() {
      // 排序用户数据
      return [...leaderboardUsers.value].sort((a, b) => b.points - a.points)
    }

    // 初始化时检查登录状态
    const savedLoginStatus = localStorage.getItem('isLoggedIn')
    if (savedLoginStatus === 'true') {
      isLoggedIn.value = true
      calculateConsecutiveDays() // 应用启动时计算连续天数
    }

    return {
      // 状态
      isLoggedIn,
      currentPoints,
      plans,
      behaviors,
      pointRecords,
      exchangeItems,
      backpackItems,
      achievements,
      totalTaskCompletions,
      lastLoginDate,
      studyStreak,
      longestStreak,
      lastCompletionDate,
      lotteryItems,
      lotteryCost,
      userInfo,
      enableReminders,
      enableLottery,
      // 计算属性
      todayPlans,
      todayPoints,
      todayBehaviors,
      unlockedAchievements,
      lockedAchievements,
      sortedBackpackItems,
      lotteryRecords,
      // 方法
      login,
      logout,
      initializeTodayPlans,
      initializeDefaultBehaviors,
      recordBehavior,
      cancelBehaviorRecord,
      addBehavior,
      updateBehavior,
      removeBehavior,
      resetDailyBehaviors,
      updatePlanCompletion,
      cancelPlanCompletion,
      undoPlanCompletion,
      exchangeItem,
      adjustPoints,
      updateExchangeItem,
      addExchangeItem,
      removeExchangeItem,
      updatePlanDescription,
      useItemFromBackpack,
      checkAchievements,
      drawLottery,
      updateUserInfo,
      updatePassword,
      clearTodayPlansFlag,
      resetAllData,
      getLeaderboardData,
      leaderboardUsers,
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
