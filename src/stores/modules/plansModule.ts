import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { Plan } from '../types'

interface PlansModule {
  plans: Ref<Plan[]>
  todayPlans: ComputedRef<Plan[]>
  todayPoints: ComputedRef<number>
  totalTaskCompletions: Ref<number>
  studyStreak: Ref<number>
  lastCompletionDate: Ref<string | null>
  longestStreak: Ref<number>
  initializeTodayPlans: () => void
  updatePlanDescription: (planId: string, description: string) => void
  calculateConsecutiveDays: () => void
  updatePlanCompletion: (planId: string, completed: boolean) => number
  cancelPlanCompletion: (planId: string) => number
  undoPlanCompletion: (planId: string) => number
  addPlan: (plan: Plan) => void
  updatePlan: (updatedPlan: Plan) => void
  removePlan: (planId: string) => void
  clearTodayPlansFlag: () => void
  resetPlans: () => void
}

export function createPlansModule(): PlansModule {
  // 从本地存储加载数据
  const loadFromLocalStorage = () => {
    try {
      const storedPlans = localStorage.getItem('plans')
      const storedTaskCompletions = localStorage.getItem('totalTaskCompletions')
      const storedStudyStreak = localStorage.getItem('studyStreak')
      const storedLastCompletionDate = localStorage.getItem('lastCompletionDate')
      const storedLongestStreak = localStorage.getItem('longestStreak')
      
      return {
        plans: storedPlans ? JSON.parse(storedPlans) : [],
        totalTaskCompletions: storedTaskCompletions ? parseInt(storedTaskCompletions) : 0,
        studyStreak: storedStudyStreak ? parseInt(storedStudyStreak) : 0,
        lastCompletionDate: storedLastCompletionDate,
        longestStreak: storedLongestStreak ? parseInt(storedLongestStreak) : 0
      }
    } catch (error) {
      console.error('加载本地存储数据失败:', error)
      return {
        plans: [],
        totalTaskCompletions: 0,
        studyStreak: 0,
        lastCompletionDate: null,
        longestStreak: 0
      }
    }
  }
  
  // 保存数据到本地存储
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('plans', JSON.stringify(plans.value))
      localStorage.setItem('totalTaskCompletions', totalTaskCompletions.value.toString())
      localStorage.setItem('studyStreak', studyStreak.value.toString())
      localStorage.setItem('lastCompletionDate', lastCompletionDate.value || '')
      localStorage.setItem('longestStreak', longestStreak.value.toString())
    } catch (error) {
      console.error('保存本地存储数据失败:', error)
    }
  }

  // 状态
  const storedData = loadFromLocalStorage()
  const plans = ref<Plan[]>(storedData.plans)
  const totalTaskCompletions = ref(storedData.totalTaskCompletions)
  const studyStreak = ref(storedData.studyStreak)
  const lastCompletionDate = ref<string | null>(storedData.lastCompletionDate || null)
  const longestStreak = ref(storedData.longestStreak)

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

  // 初始化今日计划
  function initializeTodayPlans() {
    const today = new Date().toISOString().slice(0, 10)

    // 检查是否已经初始化了今日计划
    const todayPlans = plans.value.filter((plan) => plan.date === today)
    if (todayPlans.length > 0) {
      return
    }

    // 检查是否存在今日计划的标记，避免在用户删除后重新添加
    // 但如果当天确实没有计划，应该允许重新初始化
    const todayPlanFlag = localStorage.getItem(`todayPlansInitialized-${today}`)
    if (todayPlanFlag && todayPlans.length > 0) {
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

  // 修改计划描述
  function updatePlanDescription(planId: string, description: string) {
    const plan = plans.value.find((p) => p.id === planId)
    if (plan) {
      plan.description = description
      saveToLocalStorage()
    }
  }

  // 计算连续完成天数
  function calculateConsecutiveDays() {
    const today = new Date().toISOString().split('T')[0]
    if (lastCompletionDate.value) {
      const lastDate = new Date(lastCompletionDate.value)
      const todayDate = new Date(today || new Date())
      const diffTime = todayDate.getTime() - lastDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // 连续一天，增加计数
        studyStreak.value++
        // 更新最长连续天数
        if (studyStreak.value > longestStreak.value) {
          longestStreak.value = studyStreak.value
        }
      } else if (diffDays > 1) {
        // 重置计数
        studyStreak.value = 1
      }
      // 如果diffDays === 0，同一天，不更新
    } else {
      // 第一次完成任务
      studyStreak.value = 1
    }
    lastCompletionDate.value = today || null
  }

  // 更新任务完成度
  function updatePlanCompletion(planId: string, completed: boolean): number {
    let pointsChanged = 0
    const plan = plans.value.find((p) => p.id === planId)
    if (plan) {
      // 保存之前的完成状态
      const wasCompleted = plan.completionLevel
      
      // 移除之前的积分
      if (wasCompleted) {
        pointsChanged -= plan.points
      }

      // 更新计划完成度和积分
      if (plan.type === 'weekly') {
        // 检查当前日期是否在周计划的日期范围内
        const today = new Date()
        let isDateInRange = true
        
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
              
              // 比较日期
              isDateInRange = today >= startDate && today <= endDate
            }
          } catch (error) {
            // 如果解析出错，默认认为日期在范围内
            console.error('解析周计划日期范围失败:', error)
          }
        }
        
        // 只有在日期范围内才能完成周计划
        if (isDateInRange) {
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
        } else if (completed) {
          // 如果不在日期范围内，不允许完成
          console.log('当前日期不在周计划的日期范围内，无法完成计划')
          return 0
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
        pointsChanged += plan.points
      }

      // 增加或减少总计划完成数
      if (completed && !wasCompleted) {
        totalTaskCompletions.value++
      } else if (!completed && wasCompleted) {
        totalTaskCompletions.value = Math.max(0, totalTaskCompletions.value - 1)
      }

      // 计算连续完成天数
      calculateConsecutiveDays()
      
      // 保存到本地存储
      saveToLocalStorage()
    }
    return pointsChanged
  }

  // 取消计划完成度
  function cancelPlanCompletion(planId: string): number {
    const plan = plans.value.find((p) => p.id === planId)
    if (plan && plan.completionLevel) {
      // 记录要扣除的积分
      const pointsToDeduct = plan.points

      // 移除之前的积分
      // 这里需要通过回调函数来更新积分

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
      // 这里需要通过回调函数来记录积分变动

      // 检查当天是否还有其他已完成的计划
      const today = new Date().toISOString().split('T')[0]
      const hasCompletedPlansToday = plans.value.some(
        (p) => p.date === today && p.completionLevel,
      )

      // 如果当天没有已完成的计划，更新最后完成日期
      // 但不直接重置连续天数，而是在下次完成任务时重新计算
      if (!hasCompletedPlansToday) {
        // 检查是否有其他天的已完成计划
        const hasAnyCompletedPlans = plans.value.some(
          (p) => p.completionLevel,
        )
        if (!hasAnyCompletedPlans) {
          // 如果没有任何已完成计划，重置连续天数
          studyStreak.value = 0
          lastCompletionDate.value = null
        } else {
          // 否则，只清除当天的完成记录，保持连续天数
          // 连续天数会在下次完成任务时重新计算
          lastCompletionDate.value = null
        }
      }
      
      // 保存到本地存储
      saveToLocalStorage()

      return pointsToDeduct
    }
    return 0
  }

  // 撤销计划完成
  function undoPlanCompletion(planId: string): number {
    return cancelPlanCompletion(planId)
  }

  // 计划管理方法
  function addPlan(plan: Plan) {
    plans.value.push(plan)
    saveToLocalStorage()
  }

  function updatePlan(updatedPlan: Plan) {
    const index = plans.value.findIndex(p => p.id === updatedPlan.id)
    if (index !== -1) {
      plans.value[index] = updatedPlan
      saveToLocalStorage()
    }
  }

  function removePlan(planId: string) {
    plans.value = plans.value.filter(p => p.id !== planId)
    saveToLocalStorage()
  }

  // 清除今日计划初始化标记
  function clearTodayPlansFlag() {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.removeItem(`todayPlansInitialized-${today}`)
  }

  // 重置计划数据
  function resetPlans() {
    plans.value = []
    totalTaskCompletions.value = 0
    studyStreak.value = 0
    lastCompletionDate.value = null
    longestStreak.value = 0
    
    // 清除所有今日计划初始化标记
    const today = new Date().toISOString().slice(0, 10)
    localStorage.removeItem(`todayPlansInitialized-${today}`)
    
    // 清除本地存储
    localStorage.removeItem('plans')
    localStorage.removeItem('totalTaskCompletions')
    localStorage.removeItem('studyStreak')
    localStorage.removeItem('lastCompletionDate')
    localStorage.removeItem('longestStreak')
  }

  return {
    plans,
    todayPlans,
    todayPoints,
    totalTaskCompletions,
    studyStreak,
    lastCompletionDate,
    longestStreak,
    initializeTodayPlans,
    updatePlanDescription,
    calculateConsecutiveDays,
    updatePlanCompletion,
    cancelPlanCompletion,
    undoPlanCompletion,
    addPlan,
    updatePlan,
    removePlan,
    clearTodayPlansFlag,
    resetPlans
  }
}