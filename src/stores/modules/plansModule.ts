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

  updatePlanCompletion: (planId: string, completed: boolean) => number
  cancelPlanCompletion: (planId: string) => number
  addPlan: (plan: Plan) => void
  updatePlan: (updatedPlan: Plan) => void
  removePlan: (planId: string) => void
  resetPlans: () => void
}

export function createPlansModule(): PlansModule {
  // 状态
  const plans = ref<Plan[]>([])
  const totalTaskCompletions = ref(0)
  const studyStreak = ref(0)
  const lastCompletionDate = ref<string | null>(null)
  const longestStreak = ref(0)

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

  // 检查是否已经初始化了默认数据
  let hasInitializedDefaultData = false

  // 初始化今日计划
  function initializeTodayPlans() {
    const today = new Date().toISOString().slice(0, 10)

    // 检查是否已经初始化了今日计划
    const todayPlans = plans.value.filter((plan) => plan.date === today)
    if (todayPlans.length > 0) {
      return
    }

    // 检查是否已经初始化了默认数据
    if (hasInitializedDefaultData) {
      return
    }

    // 标记已初始化默认数据
    hasInitializedDefaultData = true

    // 添加今日的四个学科计划，包含默认描述和新增的字段
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
      {
        id: `general-${today}`,
        subject: 'general',
        subjectName: '全科',
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
        description: '今日全科计划',
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
        date: today, // 使用当前日期
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
  }

  // 修改计划描述
  function updatePlanDescription(planId: string, description: string) {
    const plan = plans.value.find((p) => p.id === planId)
    if (plan) {
      plan.description = description
      // 触发响应式更新
      plans.value = [...plans.value]
    }
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
      if (plan.type === 'weekly' || plan.targetCount > 1) {
        // 对于周计划或目标次数大于1的日计划，使用完成次数逻辑
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
          if (!isDateInRange && completed) {
            // 如果不在日期范围内，不允许完成
            console.log('当前日期不在周计划的日期范围内，无法完成计划')
            return 0
          }
        }
        
        // 更新完成次数
        if (completed && plan.completedCount < plan.targetCount) {
          plan.completedCount++
          // 检查是否达到目标次数
          plan.completionLevel = plan.completedCount >= plan.targetCount
          // 保持计划的原始积分值，只在未设置时使用默认值
          if (plan.points === 0 && plan.completionLevel) {
            plan.points = 3
          }
        } else if (!completed && plan.completedCount > 0) {
          plan.completedCount--
          plan.completionLevel = plan.completedCount >= plan.targetCount
          // 保持计划的原始积分值，只在未设置时使用默认值
          if (plan.points === 0 && plan.completionLevel) {
            plan.points = 3
          }
        }
      } else {
        // 对于目标次数为1的日计划，直接设置完成状态
        plan.completionLevel = completed
        // 保持计划的原始积分值，只在未设置时使用默认值
        if (plan.points === 0 && completed) {
          plan.points = 3
        }
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

      // 更新计划完成度
      if (plan.type === 'weekly') {
        // 对于周计划，减少完成次数
        if (plan.completedCount > 0) {
          plan.completedCount--
          plan.completionLevel = plan.completedCount >= plan.targetCount
          // 保持计划的原始积分值，只在未设置时使用默认值
          if (plan.points === 0 && plan.completionLevel) {
            plan.points = 3
          }
        }
      } else {
        // 对于日计划，直接设置完成状态为 false
        plan.completionLevel = false
        // 保持计划的原始积分值，不设置为 0
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

      return pointsToDeduct
    }
    return 0
  }



  // 计划管理方法
  function addPlan(plan: Plan) {
    plans.value.push(plan)
    // 触发响应式更新
    plans.value = [...plans.value]
  }

  function updatePlan(updatedPlan: Plan) {
    const index = plans.value.findIndex(p => p.id === updatedPlan.id)
    if (index !== -1) {
      plans.value[index] = updatedPlan
      // 触发响应式更新
      plans.value = [...plans.value]
    }
  }

  function removePlan(planId: string) {
    plans.value = plans.value.filter(p => p.id !== planId)
  }



  // 重置计划数据
  function resetPlans() {
    plans.value = []
    totalTaskCompletions.value = 0
    studyStreak.value = 0
    lastCompletionDate.value = null
    longestStreak.value = 0
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
    updatePlanCompletion,
    cancelPlanCompletion,
    addPlan,
    updatePlan,
    removePlan,
    resetPlans
  }
}