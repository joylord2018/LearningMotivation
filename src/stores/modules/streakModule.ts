import { ref, type Ref } from 'vue'

interface StreakModule {
  studyStreak: Ref<number>
  longestStreak: Ref<number>
  lastCompletionDate: Ref<string | null>
  calculateConsecutiveDays: (today: string) => void
  resetStreak: () => void
  updateLongestStreak: () => void
}

export function createStreakModule(): StreakModule {
  // 从本地存储加载数据
  const loadFromLocalStorage = () => {
    try {
      const storedStudyStreak = localStorage.getItem('studyStreak')
      const storedLongestStreak = localStorage.getItem('longestStreak')
      const storedLastCompletionDate = localStorage.getItem('lastCompletionDate')
      return {
        studyStreak: storedStudyStreak ? parseInt(storedStudyStreak) : 0,
        longestStreak: storedLongestStreak ? parseInt(storedLongestStreak) : 0,
        lastCompletionDate: storedLastCompletionDate || null
      }
    } catch (error) {
      console.error('加载连续天数数据失败:', error)
      return {
        studyStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null
      }
    }
  }
  
  // 保存数据到本地存储
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('studyStreak', studyStreak.value.toString())
      localStorage.setItem('longestStreak', longestStreak.value.toString())
      localStorage.setItem('lastCompletionDate', lastCompletionDate.value || '')
    } catch (error) {
      console.error('保存连续天数数据失败:', error)
    }
  }

  // 状态
  const storedData = loadFromLocalStorage()
  const studyStreak = ref(storedData.studyStreak)
  const longestStreak = ref(storedData.longestStreak)
  const lastCompletionDate = ref<string | null>(storedData.lastCompletionDate)

  // 计算连续完成天数
  function calculateConsecutiveDays(today: string) {
    if (lastCompletionDate.value) {
      const lastDate = new Date(lastCompletionDate.value)
      const todayDate = new Date(today || new Date())
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
    lastCompletionDate.value = today || null
    
    // 更新最长连续天数
    updateLongestStreak()
    saveToLocalStorage()
  }

  // 重置连续天数
  function resetStreak() {
    studyStreak.value = 0
    lastCompletionDate.value = null
    saveToLocalStorage()
  }

  // 更新最长连续天数
  function updateLongestStreak() {
    if (studyStreak.value > longestStreak.value) {
      longestStreak.value = studyStreak.value
      saveToLocalStorage()
    }
  }

  return {
    studyStreak,
    longestStreak,
    lastCompletionDate,
    calculateConsecutiveDays,
    resetStreak,
    updateLongestStreak
  }
}
