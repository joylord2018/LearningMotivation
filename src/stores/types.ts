// 定义计划类型
export interface Plan {
  id: string
  subject: 'chinese' | 'math' | 'english' | 'general'
  subjectName: string
  date: string
  type: 'daily' | 'weekly'
  dailyType?: 'specific' | 'everyday' | 'dateRange'
  weeklyType?: 'everyweek' | 'specific'
  selectedWeek?: string
  startDate?: string
  endDate?: string
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
export interface Behavior {
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
export interface LotteryRecord {
  id: string
  date: string
  itemName: string
  itemRarity: ItemRarity
}

export interface Achievement {
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
export interface PointRecord {
  id: string
  date: string
  description: string
  points: number
  type: 'task' | 'exchange' | 'plan' | 'behavior'
}

// 定义兑换项类型
export interface ExchangeItem {
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

// 定义物品效果类型
export enum ItemEffectType {
  ADD_POINTS_5 = 'add_points_5', // 获得5点积分
  ADD_POINTS_10 = 'add_points_10', // 获得10点积分
  ADD_POINTS_20 = 'add_points_20', // 获得20点积分
  UNLOCK_ACHIEVEMENTS = 'unlock_achievements', // 解锁所有成就进度
  EXTRA_LOTTERY = 'extra_lottery', // 额外抽奖机会
  DOUBLE_POINTS = 'double_points', // 双倍积分
}

// 定义抽奖物品类型
export interface LotteryItem {
  id: string
  name: string
  description: string
  rarity: ItemRarity
  probability: number // 概率（百分比）
  effect?: string // 特殊效果描述
  effectType?: ItemEffectType // 物品效果类型
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
  effectType?: ItemEffectType // 物品效果类型
  icon: string
}

// 新增用户排行榜数据结构
export interface LeaderboardUser {
  id: string
  nickname: string
  avatar: string
  points: number
  level: number
}

// 用户信息类型
export interface UserInfo {
  username: string
  nickname: string
  bio: string
  email: string
  joinDate: string
  password: string
}