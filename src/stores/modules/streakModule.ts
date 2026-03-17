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
  // 状态
  const studyStreak = ref(0)
  const longestStreak = ref(0)
  const lastCompletionDate = ref<string | null>(null)

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
  }

  // 重置连续天数
  function resetStreak() {
    studyStreak.value = 0
    lastCompletionDate.value = null
  }

  // 更新最长连续天数
  function updateLongestStreak() {
    if (studyStreak.value > longestStreak.value) {
      longestStreak.value = studyStreak.value
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
