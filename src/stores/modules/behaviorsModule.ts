import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { Behavior } from '../types'

interface BehaviorsModule {
  behaviors: Ref<Behavior[]>
  todayBehaviors: ComputedRef<Behavior[]>
  initializeDefaultBehaviors: () => void
  recordBehavior: (behaviorId: string, currentPoints: any, pointRecords: any) => boolean
  cancelBehaviorRecord: (behaviorId: string, currentPoints: any, pointRecords: any) => boolean
  addBehavior: (behavior: Omit<Behavior, 'id' | 'currentCount' | 'completed' | 'lastRecordDate'>) => Behavior
  updateBehavior: (behaviorId: string, updates: Partial<Omit<Behavior, 'id' | 'currentCount' | 'completed' | 'lastRecordDate'>>) => boolean
  removeBehavior: (behaviorId: string) => boolean
  resetDailyBehaviors: () => void
  resetBehaviors: () => void
}

export function createBehaviorsModule(): BehaviorsModule {
  // 从本地存储加载数据
  const loadFromLocalStorage = () => {
    try {
      const storedBehaviors = localStorage.getItem('behaviors')
      return storedBehaviors ? JSON.parse(storedBehaviors) : []
    } catch (error) {
      console.error('加载行为数据失败:', error)
      return []
    }
  }
  
  // 保存数据到本地存储
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('behaviors', JSON.stringify(behaviors.value))
    } catch (error) {
      console.error('保存行为数据失败:', error)
    }
  }

  // 状态
  const behaviors = ref<Behavior[]>(loadFromLocalStorage())

  // 计算属性
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
    saveToLocalStorage()
  }

  // 记录行为
  function recordBehavior(behaviorId: string, currentPoints: any, pointRecords: any): boolean {
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
        if (currentPoints && typeof currentPoints.value === 'number') {
          currentPoints.value += behavior.points
        }

        // 记录积分变动
        if (pointRecords && Array.isArray(pointRecords.value)) {
          pointRecords.value.push({
            id: `record-${Date.now()}`,
            date: new Date().toISOString(),
            description: `完成行为记录: ${behavior.name}`,
            points: behavior.points,
            type: 'task'
          })
        }
      }

      return true
    }
    return false
  }

  // 取消行为记录
  function cancelBehaviorRecord(behaviorId: string, currentPoints: any, pointRecords: any): boolean {
    const behavior = behaviors.value.find((b) => b.id === behaviorId)
    if (behavior && behavior.lastRecordDate === new Date().toISOString().slice(0, 10)) {
      // 减少当前计数
      behavior.currentCount = Math.max(0, behavior.currentCount - 1)
      
      // 如果之前已完成，现在取消后不再完成
      if (behavior.completed) {
        behavior.completed = false
        // 扣除积分
        if (currentPoints && typeof currentPoints.value === 'number') {
          currentPoints.value = Math.max(0, currentPoints.value - behavior.points)
        }

        // 记录积分变动
        if (pointRecords && Array.isArray(pointRecords.value)) {
          pointRecords.value.push({
            id: `record-${Date.now()}`,
            date: new Date().toISOString(),
            description: `取消行为记录: ${behavior.name}`,
            points: -behavior.points,
            type: 'task'
          })
        }
      }
      
      // 如果计数为0，清除最后记录日期
      if (behavior.currentCount === 0) {
        behavior.lastRecordDate = null
      }

      // 检查成就
      // 这里需要通过回调函数来检查成就

      return true
    }
    return false
  }

  // 添加行为
  function addBehavior(behavior: Omit<Behavior, 'id' | 'currentCount' | 'completed' | 'lastRecordDate'>): Behavior {
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
  function updateBehavior(behaviorId: string, updates: Partial<Omit<Behavior, 'id' | 'currentCount' | 'completed' | 'lastRecordDate'>>): boolean {
    const behavior = behaviors.value.find((b) => b.id === behaviorId)
    if (behavior) {
      Object.assign(behavior, updates)
      return true
    }
    return false
  }

  // 删除行为
  function removeBehavior(behaviorId: string): boolean {
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

  // 重置行为数据
  function resetBehaviors() {
    behaviors.value = []
  }

  return {
    behaviors,
    todayBehaviors,
    initializeDefaultBehaviors,
    recordBehavior,
    cancelBehaviorRecord,
    addBehavior,
    updateBehavior,
    removeBehavior,
    resetDailyBehaviors,
    resetBehaviors
  }
}