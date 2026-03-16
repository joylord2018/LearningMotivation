<template>
  <div class="achievements-container">
    <!-- 装饰元素 -->
    <div class="decorations">
      <!-- 静态星星装饰 -->
      <div v-for="i in 25" :key="'star-' + i" class="decoration star" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }"></div>
      
      <!-- 静态爱心装饰 -->
      <div v-for="i in 8" :key="'heart-' + i" class="decoration heart" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }"></div>
      
      <!-- 静态云朵装饰 -->
      <div v-for="i in 4" :key="'cloud-' + i" class="decoration cloud" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 50 + '%' }"></div>
    </div>

    <!-- 页面头部 -->
    <div class="achievements-header">
      <div class="header-content">
        <h1 class="game-title">成就收藏馆 🌟</h1>
        <div class="header-actions">
          <button class="btn backpack-btn" @click="showBackpack">
            <span class="btn-icon">🎒</span>
            <span>背包</span>
          </button>
          <button class="btn logout-btn" @click="logout">
            <span class="btn-icon">🚪</span>
            <span>登出</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 导航标签 -->
    <NavigationTabs />

    <!-- 成就内容区 -->
    <div class="achievements-content">
      <!-- 成就统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <div class="stat-label">总成就数</div>
            <div class="stat-value">{{ totalAchievements }}</div>
          </div>
        </div>
        <div class="stat-card stat-card-secondary">
          <div class="stat-icon">🎉</div>
          <div class="stat-info">
            <div class="stat-label">已解锁</div>
            <div class="stat-value">{{ unlockedAchievements }}</div>
          </div>
        </div>
        <div class="stat-card stat-card-tertiary">
          <div class="stat-icon">💎</div>
          <div class="stat-info">
            <div class="stat-label">完成率</div>
            <div class="stat-value">{{ completionRate }}%</div>
          </div>
        </div>
      </div>

      <!-- 最近解锁的成就 -->
      <div class="recent-achievements-section">
        <div class="section-header">
          <h2 class="section-title">最近解锁的成就 ✨</h2>
          <div class="section-decoration"></div>
        </div>
        <div class="recent-achievements-grid">
          <div 
            v-for="(achievement, index) in recentUnlockedAchievements" 
            :key="achievement.id"
            :class="[
              'achievement-card', 
              'achievement-unlocked', 
              `rarity-${achievement.rarity}`,
              'bounce-in'
            ]"
            :style="{ animationDelay: index * 0.1 + 's' }"
            @click="showAchievementDetails(achievement)"
          >
            <div :class="[
              'achievement-icon', 
              'achievement-icon-glow',
              `rarity-icon-${achievement.rarity}`
            ]">
              {{ achievement.icon }}
            </div>
            <div class="achievement-info">
              <h3 class="achievement-name">{{ achievement.name }}</h3>
              <p class="achievement-date">{{ formatDate(achievement.unlockedDate) }}</p>
              <div class="achievement-rarity-badge" :class="`rarity-${achievement.rarity}`">
                {{ getRarityLabel(achievement.rarity) }}
              </div>
            </div>
            <div class="achievement-badge">
              <span class="badge-text">NEW</span>
            </div>
          </div>
          <div v-if="recentUnlockedAchievements.length === 0" class="no-achievements">
            <p class="no-achievements-text">还没有解锁任何成就哦~</p>
            <p class="no-achievements-hint">完成更多任务，获取新成就吧！</p>
          </div>
        </div>
      </div>

      <!-- 所有成就 -->
      <div class="all-achievements-section">
        <div class="section-header">
          <h2 class="section-title">所有成就 🏆</h2>
          <div class="section-decoration"></div>
        </div>
        <div class="achievements-grid">
          <div 
            v-for="(achievement, index) in achievements" 
            :key="achievement.id"
            :class="[
              'achievement-card',
              achievement.unlocked ? 'achievement-unlocked' : 'achievement-locked',
              achievement.unlocked ? `rarity-${achievement.rarity}` : '',
              'fade-in'
            ]"
            :style="{ animationDelay: index * 0.05 + 's' }"
            @click="showAchievementDetails(achievement)"
          >
            <div :class="[
              'achievement-icon',
              achievement.unlocked ? 'achievement-icon-glow' : 'achievement-icon-gray',
              achievement.unlocked ? `rarity-icon-${achievement.rarity}` : ''
            ]">
              {{ achievement.icon }}
            </div>
            <div class="achievement-info">
              <h3 class="achievement-name">{{ achievement.name }}</h3>
              <p class="achievement-description">{{ achievement.unlocked ? achievement.description : '???' }}</p>
              <div v-if="achievement.unlocked" class="achievement-rarity-badge" :class="`rarity-${achievement.rarity}`">
                {{ getRarityLabel(achievement.rarity) }}
              </div>
              <div v-if="achievement.progress !== undefined" class="achievement-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :class="achievement.unlocked ? `rarity-${achievement.rarity}` : ''"
                    :style="{ width: achievement.progress + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ achievement.progress }}%</span>
              </div>
            </div>
            <div v-if="achievement.unlocked" class="achievement-date-badge">
              {{ formatDate(achievement.unlockedDate) }}
            </div>
            <div v-else class="achievement-lock">🔒</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成就详情弹窗 -->
    <div v-if="showDetails" class="achievement-details-overlay" @click="closeAchievementDetails">
      <div class="achievement-details-content" @click.stop>
        <button class="close-btn" @click="closeAchievementDetails">✕</button>
        <div :class="[
          'achievement-detail-icon',
          selectedAchievement?.unlocked ? `rarity-icon-${selectedAchievement.rarity}` : ''
        ]">
          {{ selectedAchievement?.icon }}
        </div>
        <h2 class="achievement-detail-name">{{ selectedAchievement?.name }}</h2>
        <p class="achievement-detail-description">{{ selectedAchievement?.description }}</p>
        <div v-if="selectedAchievement?.unlocked" class="achievement-detail-rarity" :class="`rarity-${selectedAchievement.rarity}`">
          <span class="rarity-label">稀有度：</span>
          <span class="rarity-value">{{ getRarityLabel(selectedAchievement.rarity) }}</span>
        </div>
        <div v-if="selectedAchievement?.unlocked" class="achievement-detail-date">
          <span class="date-label">解锁日期：</span>
          <span class="date-value">{{ formatDate(selectedAchievement.unlockedAt) }}</span>
        </div>
        <div v-if="selectedAchievement?.points" class="achievement-detail-reward">
          <span class="reward-label">奖励积分：</span>
          <span class="reward-value">{{ selectedAchievement.points }} 🎯</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import NavigationTabs from '@/components/NavigationTabs.vue'

const router = useRouter()
const store = useUserStore()

// 成就类型定义
interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  condition: string
  target: number
  current: number
  category: string
  isNew: boolean
  progressDescription: string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
}

// 从store获取成就数据
const achievements = computed(() => {
  return store.achievements.map(achievement => ({
    ...achievement,
    unlockedDate: achievement.unlockedAt,
    progress: Math.round((achievement.current / achievement.target) * 100),
    rarity: getAchievementRarity(achievement),
    points: getAchievementPoints(achievement)
  }))
})

// 根据成就难度和目标获取稀有度
function getAchievementRarity(achievement: { target: number }): 'common' | 'rare' | 'epic' | 'legendary' {
  if (achievement.target >= 100) return 'legendary'
  if (achievement.target >= 50) return 'epic'
  if (achievement.target >= 10) return 'rare'
  return 'common'
}

// 根据稀有度获取奖励积分
function getAchievementPoints(achievement: { target: number }): number {
  const rarity = getAchievementRarity(achievement)
  const pointsMap = {
    common: 10,
    rare: 50,
    epic: 150,
    legendary: 300
  }
  return pointsMap[rarity]
}

const showDetails = ref(false)
const selectedAchievement = ref<Achievement | null>(null)

// 计算属性
const totalAchievements = computed(() => achievements.value.length)
const unlockedAchievements = computed(() => achievements.value.filter(a => a.unlocked).length)
const completionRate = computed(() => 
  Math.round((unlockedAchievements.value / totalAchievements.value) * 100)
)
const recentUnlockedAchievements = computed(() => 
  achievements.value
    .filter(a => a.unlocked)
    .sort((a, b) => new Date(b.unlockedDate || '').getTime() - new Date(a.unlockedDate || '').getTime())
    .slice(0, 3)
)

// 方法
const showAchievementDetails = (achievement: Achievement) => {
  selectedAchievement.value = achievement
  showDetails.value = true
  // 禁止背景页面滚动
  document.body.style.overflow = 'hidden'
}

const closeAchievementDetails = () => {
  showDetails.value = false
  selectedAchievement.value = null
  // 恢复背景页面滚动
  document.body.style.overflow = 'auto'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
}

const showBackpack = () => {
  router.push('/points')
}

const logout = () => {
  // 实际应用中这里会清除用户登录状态
  store.logout()
  localStorage.removeItem('isLoggedIn')
  router.push('/')
}

// 获取稀有度标签
const getRarityLabel = (rarity?: string): string => {
  const rarityLabels = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return rarityLabels[rarity as keyof typeof rarityLabels] || '普通'
}
</script>

<style scoped>
/* 基础样式 */
.achievements-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%);
  position: relative;
  padding: 20px;
  overflow-x: hidden;
}

/* 装饰元素 */
.decorations {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration {
  position: absolute;
  pointer-events: none;
}

/* 静态星星装饰 */
.star {
  width: 15px;
  height: 15px;
  background-color: #ffda6a;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  box-shadow: 0 0 8px #ffda6a;
}

/* 静态爱心装饰 */
.heart {
  width: 30px;
  height: 30px;
  background-color: #ff6b8b;
  transform: rotate(45deg);
}

.heart:before,
.heart:after {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: #ff6b8b;
  border-radius: 50%;
}

.heart:before {
  top: -15px;
  left: 0;
}

.heart:after {
  top: 0;
  left: -15px;
}

/* 静态云朵装饰 */
.cloud {
  width: 80px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
}

.cloud:before,
.cloud:after {
  content: '';
  position: absolute;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.cloud:before {
  width: 30px;
  height: 30px;
  top: -12px;
  left: 8px;
}

.cloud:after {
  width: 40px;
  height: 40px;
  top: -16px;
  right: 8px;
}

/* 页面头部 */
.achievements-header {
  position: relative;
  z-index: 2;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(255, 107, 139, 0.2);
  border: 2px solid #ffd1dc;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.game-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ff6b8b;
  margin: 0;
  text-shadow: 3px 3px 0px #ffd1dc, 5px 5px 10px rgba(255, 107, 139, 0.3);
}

.header-actions {
  display: flex;
  gap: 15px;
}

/* 按钮样式 */
.btn {
  background: linear-gradient(45deg, #ff6b8b, #ff8fa3);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(255, 107, 139, 0.3);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: all 0.6s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 139, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
}

/* 成就内容区 */
.achievements-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 250px;
  box-shadow: 0 8px 30px rgba(255, 107, 139, 0.2);
  border: 2px solid #ffd1dc;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
}

.stat-card-primary::after {
  background: #ff6b8b;
}

.stat-card-secondary::after {
  background: #ff8fa3;
}

.stat-card-tertiary::after {
  background: #ffb3c1;
}

.stat-icon {
  font-size: 3rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #ff6b8b;
}

/* 区域标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  position: relative;
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ff6b8b;
  margin: 0;
  text-shadow: 2px 2px 0px #ffd1dc;
}

.section-decoration {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, #ff6b8b, transparent);
  border-radius: 3px;
}

/* 最近解锁成就网格 */
.recent-achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

/* 所有成就网格 */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 成就卡片 */
.achievement-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid #ffd1dc;
  position: relative;
  overflow: hidden;
  transform-origin: center;
}

.achievement-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 107, 139, 0.1), transparent);
  transition: all 0.6s ease;
}

.achievement-card:hover::before {
  left: 100%;
}

.achievement-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 30px rgba(255, 107, 139, 0.3);
}

.achievement-card:active {
  transform: translateY(-2px) scale(0.98);
  transition: all 0.1s ease;
}

/* 成就解锁动画 */
@keyframes achievement-unlock {
  0% {
    transform: scale(0.8);
    opacity: 0;
    box-shadow: 0 0 0 rgba(255, 210, 220, 0);
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
    box-shadow: 0 0 20px rgba(255, 107, 139, 0.6);
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 8px 25px rgba(255, 107, 139, 0.2);
  }
}

.achievement-unlocked {
  background: linear-gradient(135deg, #fff 0%, #ffe6ea 100%);
  box-shadow: 0 8px 25px rgba(255, 107, 139, 0.2);
  animation: achievement-unlock 0.6s ease-out;
}

/* 稀有度解锁动画增强 */
.rarity-rare.achievement-unlocked {
  animation: achievement-unlock 0.7s ease-out, glow-pulse-rare 1.5s ease-in-out 0.6s infinite;
}

.rarity-epic.achievement-unlocked {
  animation: achievement-unlock 0.8s ease-out, glow-pulse-epic 1.5s ease-in-out 0.8s infinite;
}

.rarity-legendary.achievement-unlocked {
  animation: achievement-unlock 0.9s ease-out, glow-pulse-legendary 1.5s ease-in-out 0.9s infinite;
}

/* 发光脉冲动画 */
@keyframes glow-pulse-rare {
  0%, 100% {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow: 0 8px 35px rgba(59, 130, 246, 0.4);
  }
}

@keyframes glow-pulse-epic {
  0%, 100% {
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
  }
  50% {
    box-shadow: 0 8px 35px rgba(139, 92, 246, 0.4);
  }
}

@keyframes glow-pulse-legendary {
  0%, 100% {
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow: 0 8px 35px rgba(245, 158, 11, 0.4);
  }
}

.achievement-locked {
  background: rgba(240, 240, 240, 0.8);
  border-color: #ddd;
}

.achievement-icon {
  font-size: 3rem;
  flex-shrink: 0;
  position: relative;
}

.achievement-icon-glow {
  animation: glow 2s ease-in-out infinite;
}

.achievement-icon-gray {
  filter: grayscale(100%);
  opacity: 0.6;
}

/* 稀有度样式 */
/* 普通 */
.rarity-common {
  border-color: #9ca3af;
}

.rarity-common::after {
  background: #9ca3af;
}

.rarity-icon-common {
  text-shadow: 0 0 10px rgba(156, 163, 175, 0.8);
  animation: glow-common 2s ease-in-out infinite;
}

/* 稀有 */
.rarity-rare {
  border-color: #3b82f6;
}

.rarity-rare::after {
  background: #3b82f6;
}

.rarity-icon-rare {
  text-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
  animation: glow-rare 2s ease-in-out infinite;
}

/* 史诗 */
.rarity-epic {
  border-color: #8b5cf6;
}

.rarity-epic::after {
  background: #8b5cf6;
}

.rarity-icon-epic {
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.8);
  animation: glow-epic 2s ease-in-out infinite;
}

/* 传说 */
.rarity-legendary {
  border-color: #f59e0b;
}

.rarity-legendary::after {
  background: #f59e0b;
}

.rarity-icon-legendary {
  text-shadow: 0 0 25px rgba(245, 158, 11, 0.8);
  animation: glow-legendary 2s ease-in-out infinite;
}

/* 稀有度徽章 */
.achievement-rarity-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 5px;
  align-self: flex-start;
}

.rarity-common .achievement-rarity-badge {
  background: rgba(156, 163, 175, 0.2);
  color: #6b7280;
}

.rarity-rare .achievement-rarity-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.rarity-epic .achievement-rarity-badge {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

.rarity-legendary .achievement-rarity-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

/* 稀有度进度条 */
.progress-fill.rarity-common {
  background: linear-gradient(90deg, #9ca3af, #d1d5db);
}

.progress-fill.rarity-rare {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.progress-fill.rarity-epic {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}

.progress-fill.rarity-legendary {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.achievement-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ff6b8b;
  margin: 0;
}

.achievement-description {
  font-size: 1rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.achievement-date {
  font-size: 0.9rem;
  color: #ff6b8b;
  font-weight: 500;
}

.achievement-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff6b8b;
  color: white;
  border-radius: 15px;
  padding: 5px 12px;
  font-size: 0.8rem;
  font-weight: bold;
  animation: bounce 1.5s ease-in-out infinite;
}

.achievement-date-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 107, 139, 0.2);
  color: #ff6b8b;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 0.8rem;
  font-weight: 500;
}

.achievement-lock {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.2rem;
  opacity: 0.5;
}

/* 进度条 */
.achievement-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b8b, #ff8fa3);
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  transform-origin: left;
  animation: progress-grow 1.2s ease-out;
}

@keyframes progress-grow {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: bold;
  color: #ff6b8b;
  min-width: 45px;
}

/* 无成就状态 */
.no-achievements {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 2px dashed #ffb3c1;
}

.no-achievements-text {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 10px;
}

.no-achievements-hint {
  font-size: 1rem;
  color: #999;
  margin: 0;
}

/* 成就详情弹窗 */
.achievement-details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.achievement-details-content {
  background: white;
  border-radius: 25px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 3px solid #ffd1dc;
  position: relative;
  animation: bounceIn 0.4s ease;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff6b8b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #ff8fa3;
  transform: scale(1.1);
}

.achievement-detail-icon {
  font-size: 6rem;
  text-align: center;
  margin-bottom: 20px;
  animation: glow 2s ease-in-out infinite;
}

.achievement-detail-name {
  font-size: 2rem;
  font-weight: bold;
  color: #ff6b8b;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 2px 2px 0px #ffd1dc;
}

.achievement-detail-description {
  font-size: 1.1rem;
  color: #666;
  text-align: center;
  margin-bottom: 25px;
  line-height: 1.6;
}

.achievement-detail-rarity,
.achievement-detail-date,
.achievement-detail-reward {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.achievement-detail-rarity {
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
}

.achievement-detail-rarity.rarity-common {
  background: rgba(156, 163, 175, 0.2);
  color: #6b7280;
}

.achievement-detail-rarity.rarity-rare {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.achievement-detail-rarity.rarity-epic {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

.achievement-detail-rarity.rarity-legendary {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.date-label,
.reward-label {
  color: #666;
}

.date-value {
  color: #ff6b8b;
  font-weight: bold;
}

.reward-value {
  color: #ff6b8b;
  font-weight: bold;
  font-size: 1.2rem;
}

/* 动画效果 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(255, 107, 139, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(255, 107, 139, 0.8), 0 0 30px rgba(255, 107, 139, 0.5);
  }
}

/* 稀有度动画 */
@keyframes glow-common {
  0%, 100% {
    text-shadow: 0 0 10px rgba(156, 163, 175, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(156, 163, 175, 0.8), 0 0 30px rgba(156, 163, 175, 0.5);
  }
}

@keyframes glow-rare {
  0%, 100% {
    text-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  }
  50% {
    text-shadow: 0 0 25px rgba(59, 130, 246, 0.8), 0 0 35px rgba(59, 130, 246, 0.5);
  }
}

@keyframes glow-epic {
  0%, 100% {
    text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  }
  50% {
    text-shadow: 0 0 30px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.5);
  }
}

@keyframes glow-legendary {
  0%, 100% {
    text-shadow: 0 0 25px rgba(245, 158, 11, 0.5);
  }
  50% {
    text-shadow: 0 0 35px rgba(245, 158, 11, 0.8), 0 0 45px rgba(245, 158, 11, 0.5);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .achievements-container {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .game-title {
    font-size: 2rem;
  }

  .stats-cards {
    flex-direction: column;
  }

  .stat-card {
    min-width: auto;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .recent-achievements-grid,
  .achievements-grid {
    grid-template-columns: 1fr;
  }

  .achievement-card {
    padding: 15px;
  }

  .achievement-icon {
    font-size: 2.5rem;
  }

  .achievement-details-content {
    padding: 30px 20px;
    margin: 20px;
  }

  .achievement-detail-icon {
    font-size: 5rem;
  }

  .achievement-detail-name {
    font-size: 1.8rem;
  }
}
</style>