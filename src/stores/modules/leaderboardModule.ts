import { ref, type Ref } from 'vue'

interface LeaderboardUser {
  id: string
  nickname: string
  avatar: string
  points: number
  level: number
}

interface LeaderboardModule {
  leaderboardUsers: Ref<LeaderboardUser[]>
  updateUserPoints: (userId: string, points: number) => void
  addLeaderboardUser: (user: Omit<LeaderboardUser, 'id'>) => void
  resetLeaderboard: () => void
}

export function createLeaderboardModule(): LeaderboardModule {
  // 从本地存储加载数据
  const loadFromLocalStorage = () => {
    try {
      const storedLeaderboard = localStorage.getItem('leaderboardUsers')
      return storedLeaderboard ? JSON.parse(storedLeaderboard) : [
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
      ]
    } catch (error) {
      console.error('加载排行榜数据失败:', error)
      return [
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
      ]
    }
  }
  
  // 保存数据到本地存储
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('leaderboardUsers', JSON.stringify(leaderboardUsers.value))
    } catch (error) {
      console.error('保存排行榜数据失败:', error)
    }
  }

  // 状态
  const leaderboardUsers = ref<LeaderboardUser[]>(loadFromLocalStorage())

  // 更新用户积分
  function updateUserPoints(userId: string, points: number) {
    const user = leaderboardUsers.value.find(u => u.id === userId)
    if (user) {
      user.points = points
      // 根据积分更新等级
      user.level = Math.floor(points / 100) + 1
      // 重新排序排行榜
      leaderboardUsers.value.sort((a, b) => b.points - a.points)
      saveToLocalStorage()
    }
  }

  // 添加排行榜用户
  function addLeaderboardUser(user: Omit<LeaderboardUser, 'id'>) {
    const newUser: LeaderboardUser = {
      ...user,
      id: `user-${Date.now()}`
    }
    leaderboardUsers.value.push(newUser)
    // 重新排序排行榜
    leaderboardUsers.value.sort((a, b) => b.points - a.points)
    saveToLocalStorage()
  }

  // 重置排行榜
  function resetLeaderboard() {
    leaderboardUsers.value = [
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
    ]
    saveToLocalStorage()
  }

  return {
    leaderboardUsers,
    updateUserPoints,
    addLeaderboardUser,
    resetLeaderboard
  }
}
