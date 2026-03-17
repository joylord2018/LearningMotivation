import { ref, type Ref } from 'vue'
import type { Achievement } from '../types'

interface AchievementsModule {
  achievements: Ref<Achievement[]>
  unlockedAchievements: Ref<Achievement[]>
  lockedAchievements: Ref<Achievement[]>
  checkAchievements: (totalTaskCompletions: number, studyStreak: number, currentPoints: number, lotteryRecords: any[]) => boolean
  unlockAchievement: (achievementId: string) => void
  resetAchievements: () => void
}

export function createAchievementsModule(): AchievementsModule {
  // 默认成就数据
  const defaultAchievements = [
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

  // 从本地存储加载数据
  const loadFromLocalStorage = () => {
    try {
      const storedAchievements = localStorage.getItem('achievements')
      return storedAchievements ? JSON.parse(storedAchievements) : defaultAchievements
    } catch (error) {
      console.error('加载成就数据失败:', error)
      return defaultAchievements
    }
  }
  
  // 保存数据到本地存储
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('achievements', JSON.stringify(achievements.value))
    } catch (error) {
      console.error('保存成就数据失败:', error)
    }
  }

  // 状态
  const achievements = ref<Achievement[]>(loadFromLocalStorage())

  // 计算属性
  const unlockedAchievements = ref<Achievement[]>([])
  const lockedAchievements = ref<Achievement[]>([])

  // 检查成就
  function checkAchievements(totalTaskCompletions: number, studyStreak: number, currentPoints: number, lotteryRecords: any[]): boolean {
    let newlyUnlocked = false

    achievements.value.forEach((achievement) => {
      if (!achievement.unlocked) {
        let shouldUnlock = false

        switch (achievement.condition) {
          case 'task':
            achievement.current = totalTaskCompletions
            shouldUnlock = achievement.current >= achievement.target
            break
          case 'points':
            achievement.current = currentPoints
            shouldUnlock = achievement.current >= achievement.target
            break
          case 'streak':
            achievement.current = studyStreak
            shouldUnlock = achievement.current >= achievement.target
            break
          case 'lottery':
            // 抽奖相关成就逻辑
            achievement.current = lotteryRecords.filter(record => 
              record.itemRarity === 'rare' || 
              record.itemRarity === 'epic' || 
              record.itemRarity === 'legendary'
            ).length
            shouldUnlock = achievement.current >= achievement.target
            break
          case 'behavior':
            // 行为相关成就逻辑 - 计算已完成的行为数量
            // 这里需要从外部传入行为完成数量
            break
          case 'behavior-streak':
            // 行为连续记录成就逻辑 - 这里需要实现连续天数的计算
            // 简化实现：使用学习连续天数作为行为连续天数
            achievement.current = studyStreak
            shouldUnlock = achievement.current >= achievement.target
            break
        }

        if (shouldUnlock) {
          achievement.unlocked = true
          achievement.unlockedAt = new Date().toISOString()
          achievement.isNew = true
          newlyUnlocked = true

          console.log(`🎉 恭喜解锁成就: ${achievement.name}!`)
        }
      }
    })

    // 更新计算属性
    updateAchievementLists()
    saveToLocalStorage()

    return newlyUnlocked
  }

  // 解锁成就
  function unlockAchievement(achievementId: string) {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockedAt = new Date().toISOString()
      achievement.isNew = true
      updateAchievementLists()
      saveToLocalStorage()
    }
  }

  // 重置成就
  function resetAchievements() {
    achievements.value.forEach(achievement => {
      achievement.unlocked = false
      achievement.unlockedAt = undefined
      achievement.current = 0
      achievement.isNew = true
    })
    updateAchievementLists()
    saveToLocalStorage()
  }

  // 更新成就列表
  function updateAchievementLists() {
    unlockedAchievements.value = achievements.value.filter(a => a.unlocked)
    lockedAchievements.value = achievements.value.filter(a => !a.unlocked)
  }

  // 初始化成就列表
  updateAchievementLists()

  return {
    achievements,
    unlockedAchievements,
    lockedAchievements,
    checkAchievements,
    unlockAchievement,
    resetAchievements
  }
}
