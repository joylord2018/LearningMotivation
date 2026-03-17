import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { createPlansModule } from './modules/plansModule'
import { createBehaviorsModule } from './modules/behaviorsModule'
import { createPointsModule } from './modules/pointsModule'
import { createAchievementsModule } from './modules/achievementsModule'
import { createUserModule } from './modules/userModule'
import { createStreakModule } from './modules/streakModule'
import { createLeaderboardModule } from './modules/leaderboardModule'
import type { Plan, Behavior, Achievement, PointRecord, ExchangeItem, BackpackItem, LotteryItem, LotteryRecord } from './types'
import { ItemRarity, ItemEffectType } from './types'

// 导出必要的类型和枚举
export { ItemRarity, ItemEffectType }
export type { Plan, Behavior, Achievement, PointRecord, ExchangeItem, BackpackItem, LotteryItem, LotteryRecord }

export const useUserStore = defineStore(
  'user',
  () => {
    // 初始化各个模块
    const plansModule = createPlansModule()
    const behaviorsModule = createBehaviorsModule()
    const pointsModule = createPointsModule()
    const achievementsModule = createAchievementsModule()
    const userModule = createUserModule()
    const streakModule = createStreakModule()
    const leaderboardModule = createLeaderboardModule()

    // 兼容性处理函数
    function handleCompatibility() {
      // 处理积分记录类型的兼容性
      pointsModule.pointRecords.value.forEach(record => {
        if (record.type === 'task') {
          // 根据描述判断是计划还是行为
          if (record.description.includes('计划')) {
            record.type = 'plan'
          } else if (record.description.includes('行为')) {
            record.type = 'behavior'
          }
        }
      })

      // 处理计划数据的兼容性
      // 确保所有计划都有subject字段
      plansModule.plans.value.forEach(plan => {
        if (!plan.subject) {
          // 根据subjectName推断subject
          if (plan.subjectName === '语文') {
            plan.subject = 'chinese'
          } else if (plan.subjectName === '数学') {
            plan.subject = 'math'
          } else if (plan.subjectName === '英语') {
            plan.subject = 'english'
          } else {
            plan.subject = 'general'
          }
        }
        
        // 确保计划有必要的字段
        if (plan.points === undefined) {
          plan.points = 0
        }
        if (plan.completionLevel === undefined) {
          plan.completionLevel = false
        }
        if (plan.completedCount === undefined) {
          plan.completedCount = 0
        }
        if (plan.targetCount === undefined) {
          plan.targetCount = 1
        }
      })

      // 处理行为频率类型的兼容性
      behaviorsModule.behaviors.value.forEach(behavior => {
        if (!behavior.frequency) {
          behavior.frequency = 'daily'
        }
        if (behavior.currentCount === undefined) {
          behavior.currentCount = 0
        }
        if (behavior.completed === undefined) {
          behavior.completed = false
        }
      })

      // 处理背包物品的兼容性
      pointsModule.backpackItems.value.forEach(item => {
        if (!item.rarity) {
          item.rarity = ItemRarity.Common
        }
        if (!item.icon) {
          item.icon = '🎁'
        }
        if (!item.acquiredDate) {
          item.acquiredDate = new Date().toISOString()
        }
      })

      // 处理抽奖物品的兼容性
      pointsModule.lotteryItems.value.forEach(item => {
        if (!item.probability) {
          item.probability = 10
        }
        if (!item.icon) {
          item.icon = '🎁'
        }
      })

      console.log('数据兼容性处理完成')
    }

    // 执行兼容性处理
    handleCompatibility()

    // 状态
    const totalTaskCompletions = ref(0)
    const enableReminders = ref(false)
    const enableLottery = ref(false)
    const quickSetupTemplates = ref<Plan[]>([])

    // 计算属性
    const todayPlans = computed(() => {
      const today = new Date().toISOString().slice(0, 10)
      return plansModule.plans.value.filter((plan) => plan.date === today)
    })

    const todayPoints = computed(() => {
      const today = new Date().toISOString().slice(0, 10)
      return plansModule.plans.value
        .filter((plan) => {
          if (plan.type === 'weekly') {
            // 对于周计划，检查当前日期是否在周计划的日期范围内
            if (plan.selectedWeek) {
              try {
                // 解析周计划的日期范围（格式：YYYY-MM-DD-YYYY-MM-DD）
                const parts = plan.selectedWeek.split('-')
                if (parts.length === 6) {
                  // 格式：YYYY-MM-DD-YYYY-MM-DD
                  const weekStart = `${parts[0]}-${parts[1]}-${parts[2]}`
                  const weekEnd = `${parts[3]}-${parts[4]}-${parts[5]}`
                  
                  // 将日期字符串转换为日期对象进行比较
                  const startDate = new Date(weekStart)
                  const endDate = new Date(weekEnd)
                  const currentDate = new Date(today)
                  
                  // 比较日期
                  return currentDate >= startDate && currentDate <= endDate && plan.completionLevel
                }
              } catch (error) {
                // 如果解析出错，默认认为日期在范围内
                console.error('解析周计划日期范围失败:', error)
                return plan.completionLevel
              }
            }
            return false
          }
          // 对于日计划，直接检查日期
          return plan.date === today && plan.completionLevel
        })
        .reduce((sum, plan) => sum + plan.points, 0)
    })

    const todayBehaviors = computed(() => {
      const today = new Date().toISOString().slice(0, 10)
      return behaviorsModule.behaviors.value.filter((behavior) => {
        if (behavior.frequency === 'daily') {
          return true
        }
        return false
      })
    })

    // 按稀有度排序的背包物品
    const sortedBackpackItems = computed(() => {
      const rarityOrder = {
        'legendary': 4,
        'epic': 3,
        'rare': 2,
        'common': 1,
      }

      return [...pointsModule.backpackItems.value].sort((a, b) => {
        // 先按稀有度排序
        if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
          return rarityOrder[b.rarity] - rarityOrder[a.rarity]
        }
        // 稀有度相同时按获得时间排序（新的在前）
        return new Date(b.acquiredDate).getTime() - new Date(a.acquiredDate).getTime()
      })
    })

    // 方法
    // 登录
    function login(username: string, password: string): boolean {
      const success = userModule.login(username, password)
      if (success) {
        // 检查并解锁初次登录成就
        const firstLoginAchievement = achievementsModule.achievements.value.find(a => a.id === 'achievement-1')
        if (firstLoginAchievement && !firstLoginAchievement.unlocked) {
          firstLoginAchievement.current = 1
          firstLoginAchievement.unlocked = true
          firstLoginAchievement.unlockedAt = new Date().toISOString()
          firstLoginAchievement.isNew = true
          console.log('🎉 恭喜解锁成就: 初次登录!')
        }
        
        // 检查早起鸟儿成就（如果当前时间早于9点）
        const now = new Date()
        if (now.getHours() < 9) {
          const earlyBirdAchievement = achievementsModule.achievements.value.find(a => a.id === 'achievement-2')
          if (earlyBirdAchievement && !earlyBirdAchievement.unlocked) {
            earlyBirdAchievement.current = 1
            earlyBirdAchievement.unlocked = true
            earlyBirdAchievement.unlockedAt = new Date().toISOString()
            earlyBirdAchievement.isNew = true
            console.log('🎉 恭喜解锁成就: 早起鸟儿!')
          }
        }
      }
      return success
    }

    // 登出
    function logout() {
      userModule.logout()
    }

    // 初始化今日计划
    function initializeTodayPlans() {
      plansModule.initializeTodayPlans()
    }

    // 初始化默认行为
    function initializeDefaultBehaviors() {
      behaviorsModule.initializeDefaultBehaviors()
    }

    // 记录行为
    function recordBehavior(behaviorId: string) {
      const success = behaviorsModule.recordBehavior(behaviorId, pointsModule.currentPoints, pointsModule.pointRecords)
      if (success) {
        // 检查成就
        checkAchievements()
      }
      return success
    }

    // 取消行为记录
    function cancelBehaviorRecord(behaviorId: string) {
      const success = behaviorsModule.cancelBehaviorRecord(behaviorId, pointsModule.currentPoints, pointsModule.pointRecords)
      if (success) {
        // 检查成就
        checkAchievements()
      }
      return success
    }

    // 添加行为
    function addBehavior(behavior: Omit<Behavior, 'id' | 'currentCount' | 'completed' | 'lastRecordDate'>) {
      return behaviorsModule.addBehavior(behavior)
    }

    // 更新行为
    function updateBehavior(behaviorId: string, updates: Partial<Omit<Behavior, 'id' | 'currentCount' | 'completed' | 'lastRecordDate'>>) {
      return behaviorsModule.updateBehavior(behaviorId, updates)
    }

    // 删除行为
    function removeBehavior(behaviorId: string) {
      return behaviorsModule.removeBehavior(behaviorId)
    }

    // 重置每日行为状态
    function resetDailyBehaviors() {
      behaviorsModule.resetDailyBehaviors()
    }

    // 修改计划描述
    function updatePlanDescription(planId: string, description: string) {
      plansModule.updatePlanDescription(planId, description)
    }

    // 更新任务完成度
    function updatePlanCompletion(planId: string, completed: boolean) {
      const wasCompleted = plansModule.plans.value.find(p => p.id === planId)?.completionLevel || false
      const pointsChanged = plansModule.updatePlanCompletion(planId, completed)
      
      if (pointsChanged !== 0) {
        // 更新积分
        if (completed && !wasCompleted) {
          pointsModule.currentPoints.value += pointsChanged
        } else if (!completed && wasCompleted) {
          pointsModule.currentPoints.value = Math.max(0, pointsModule.currentPoints.value + pointsChanged)
        }

        // 记录积分变动
        const plan = plansModule.plans.value.find(p => p.id === planId)
        if (plan) {
          const record: PointRecord = {
            id: `record-${Date.now()}`,
            date: new Date().toISOString(),
            description: `${plan.subjectName}计划${completed ? '完成' : '取消完成'}`,
            points: completed ? plan.points : -plan.points,
            type: 'plan',
          }
          pointsModule.pointRecords.value.push(record)
        }

        // 增加或减少总计划完成数
        if (completed && !wasCompleted) {
          totalTaskCompletions.value++
        } else if (!completed && wasCompleted) {
          totalTaskCompletions.value = Math.max(0, totalTaskCompletions.value - 1)
        }

        // 计算连续完成天数
        const today = new Date().toISOString().split('T')[0] || ''
        streakModule.calculateConsecutiveDays(today)

        // 检查成就
        checkAchievements()
      }
    }

    // 取消计划完成度
    function cancelPlanCompletion(planId: string) {
      const pointsToDeduct = plansModule.cancelPlanCompletion(planId)
      
      if (pointsToDeduct > 0) {
        // 扣除积分
        pointsModule.currentPoints.value = Math.max(0, pointsModule.currentPoints.value - pointsToDeduct)

        // 减少总计划完成数
        totalTaskCompletions.value = Math.max(0, totalTaskCompletions.value - 1)

        // 记录积分变动
        const plan = plansModule.plans.value.find(p => p.id === planId)
        if (plan) {
          const record: PointRecord = {
            id: `record-${Date.now()}`,
            date: new Date().toISOString(),
            description: `${plan.subjectName}计划取消完成`,
            points: -pointsToDeduct,
            type: 'plan',
          }
          pointsModule.pointRecords.value.push(record)
        }

        // 检查当天是否还有其他已完成的计划
        const today = new Date().toISOString().split('T')[0]
        const hasCompletedPlansToday = plansModule.plans.value.some(
          (p) => p.date === today && p.completionLevel,
        )

        // 如果当天没有已完成的计划，更新最后完成日期
        if (!hasCompletedPlansToday) {
          // 检查是否有其他天的已完成计划
          const hasAnyCompletedPlans = plansModule.plans.value.some(
            (p) => p.completionLevel,
          )
          if (!hasAnyCompletedPlans) {
            // 如果没有任何已完成计划，重置连续天数
            streakModule.resetStreak()
          } else {
            // 否则，只清除当天的完成记录，保持连续天数
            streakModule.lastCompletionDate.value = null
          }
        }
      }

      return pointsToDeduct
    }



    // 计划管理方法
    function addPlan(plan: Plan) {
      plansModule.addPlan(plan)
    }

    function updatePlan(updatedPlan: Plan) {
      plansModule.updatePlan(updatedPlan)
    }

    function removePlan(planId: string) {
      plansModule.removePlan(planId)
    }

    // 检查成就
    function checkAchievements() {
      achievementsModule.checkAchievements(
        totalTaskCompletions.value,
        streakModule.studyStreak.value,
        pointsModule.currentPoints.value,
        pointsModule.lotteryRecords.value
      )
    }

    // 兑换物品
    function exchangeItem(itemId: string): boolean {
      return pointsModule.exchangeItem(itemId)
    }

    // 使用背包物品
    function useItemFromBackpack(itemId: string): boolean {
      const success = pointsModule.useItemFromBackpack(itemId)
      if (success) {
        // 检查成就
        checkAchievements()
      }
      return success
    }

    // 抽奖
    function drawLottery(item?: LotteryItem): BackpackItem | null {
      const result = pointsModule.drawLottery(item)
      if (result) {
        // 检查成就
        checkAchievements()
      }
      return result
    }

    // 调整积分
    function adjustPoints(amount: number, description: string = '积分调整') {
      pointsModule.adjustPoints(amount, description)
      // 检查成就
      checkAchievements()
    }

    // 更新兑换项
    function updateExchangeItem(itemId: string, name: string, points: number, description: string) {
      pointsModule.updateExchangeItem(itemId, name, points, description)
    }

    // 添加兑换项
    function addExchangeItem(name: string, points: number, description: string) {
      pointsModule.addExchangeItem(name, points, description)
    }

    // 删除兑换项
    function removeExchangeItem(itemId: string) {
      pointsModule.removeExchangeItem(itemId)
    }

    // 抽奖物品管理方法
    function addLotteryItem(name: string, description: string, rarity: string, probability: number, effect: string) {
      pointsModule.addLotteryItem(name, description, rarity as any, probability, effect)
    }

    function updateLotteryItem(itemId: string, name: string, description: string, rarity: string, probability: number, effect: string) {
      pointsModule.updateLotteryItem(itemId, name, description, rarity as any, probability, effect)
    }

    function removeLotteryItem(itemId: string) {
      pointsModule.removeLotteryItem(itemId)
    }

    // 设置抽奖消耗积分
    function setLotteryCost(cost: number) {
      pointsModule.setLotteryCost(cost)
    }

    // 更新用户信息
    function updateUserInfo(updates: Partial<typeof userModule.userInfo.value>) {
      userModule.updateUserInfo(updates)
    }

    // 更新密码
    function updatePassword(newPassword: string) {
      userModule.updatePassword(newPassword)
    }

    // 快速设置模板方法
    function updateQuickSetupTemplate(templateId: string, updates: Partial<Plan>) {
      const index = quickSetupTemplates.value.findIndex(t => t.id === templateId)
      if (index !== -1) {
        const existingTemplate = quickSetupTemplates.value[index]
        if (existingTemplate) {
          quickSetupTemplates.value[index] = { ...existingTemplate, ...updates, id: existingTemplate.id } as Plan
        }
      }
    }

    function addQuickSetupTemplate(template: Plan) {
      quickSetupTemplates.value.push(template)
    }

    function removeQuickSetupTemplate(templateId: string) {
      quickSetupTemplates.value = quickSetupTemplates.value.filter(t => t.id !== templateId)
    }

    // 重置所有数据
    function resetAllData() {
      // 重置各个模块
      plansModule.resetPlans()
      behaviorsModule.resetBehaviors()
      pointsModule.currentPoints.value = 0
      pointsModule.pointRecords.value = []
      pointsModule.backpackItems.value = []
      pointsModule.lotteryRecords.value = []
      achievementsModule.resetAchievements()
      userModule.resetUserInfo()
      streakModule.resetStreak()
      leaderboardModule.resetLeaderboard()
      totalTaskCompletions.value = 0
      enableReminders.value = false
      enableLottery.value = false
      quickSetupTemplates.value = []

      // 清除本地存储
      localStorage.clear()
    }

    return {
      // 用户模块
      isLoggedIn: userModule.isLoggedIn,
      userInfo: userModule.userInfo,
      lastLoginDate: userModule.lastLoginDate,
      login,
      logout,
      updateUserInfo,
      updatePassword,

      // 计划模块
      plans: plansModule.plans,
      todayPlans,
      todayPoints,
      initializeTodayPlans,
      updatePlanDescription,
      updatePlanCompletion,
      cancelPlanCompletion,
      addPlan,
      updatePlan,
      removePlan,

      // 行为模块
      behaviors: behaviorsModule.behaviors,
      todayBehaviors,
      initializeDefaultBehaviors,
      recordBehavior,
      cancelBehaviorRecord,
      addBehavior,
      updateBehavior,
      removeBehavior,
      resetDailyBehaviors,

      // 积分模块
      currentPoints: pointsModule.currentPoints,
      pointRecords: pointsModule.pointRecords,
      exchangeItems: pointsModule.exchangeItems,
      backpackItems: pointsModule.backpackItems,
      lotteryItems: pointsModule.lotteryItems,
      lotteryRecords: pointsModule.lotteryRecords,
      lotteryCost: pointsModule.lotteryCost,
      sortedBackpackItems,
      exchangeItem,
      useItemFromBackpack,
      drawLottery,
      adjustPoints,
      updateExchangeItem,
      addExchangeItem,
      removeExchangeItem,
      addLotteryItem,
      updateLotteryItem,
      removeLotteryItem,
      setLotteryCost,

      // 成就模块
      achievements: achievementsModule.achievements,
      unlockedAchievements: achievementsModule.unlockedAchievements,
      lockedAchievements: achievementsModule.lockedAchievements,
      checkAchievements,

      // 连续天数模块
      studyStreak: streakModule.studyStreak,
      longestStreak: streakModule.longestStreak,
      lastCompletionDate: streakModule.lastCompletionDate,

      // 排行榜模块
      leaderboardUsers: leaderboardModule.leaderboardUsers,

      // 快速设置模板方法
      updateQuickSetupTemplate,
      addQuickSetupTemplate,
      removeQuickSetupTemplate,

      // 其他
      totalTaskCompletions,
      enableReminders,
      enableLottery,
      quickSetupTemplates,
      resetAllData
    }
  },
  {
    persist: {
      key: 'learning-motivation',
      storage: localStorage
    }
  }
)
