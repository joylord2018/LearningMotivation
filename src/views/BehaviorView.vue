<template>
  <div class="behavior-container">
    <!-- 装饰元素 -->
    <div class="decorations">
      <div class="decoration heart"></div>
      <div class="decoration star"></div>
      <div class="decoration cloud"></div>
      <div class="decoration circle"></div>
      <div class="decoration rainbow"></div>
    </div>

    <!-- 头部 -->
    <header class="behavior-header">
      <div class="header-content">
        <h1>🎯 我的行为习惯</h1>
        <div class="date-display">
          <span class="date-icon">🗓️</span>
          {{ currentDate }}
        </div>
      </div>
      <div class="logout-btn" @click="handleLogout">
        <span class="logout-icon">🚪</span> 退出冒险
      </div>
    </header>

    <!-- 导航标签 -->
    <NavigationTabs />

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索习惯名称或描述..."
        class="search-input"
      />
    </div>

    <!-- 行为卡片网格 -->
    <div class="behaviors-grid">
      <div 
        v-for="behavior in filteredBehaviors" 
        :key="behavior.id"
        :class="['behavior-card', { 'completed': behavior.completed, 'negative': behavior.type === 'negative' }]"
      >
        <!-- 行为头部 -->
        <div class="behavior-header-card">
          <div class="behavior-icon">{{ behavior.icon }}</div>
          <div class="behavior-info">
            <h3 class="behavior-name">{{ behavior.name }}</h3>
            <p class="behavior-description">{{ behavior.description }}</p>
          </div>
          <div class="behavior-status" v-if="behavior.type === 'negative'">
            <span class="status-indicator"></span>
          </div>
        </div>

        <!-- 行为详情 -->
        <div class="behavior-details">
          <div class="behavior-meta">
            <span class="behavior-frequency">
              {{ behavior.frequency === 'daily' ? '每日' : behavior.frequency === 'weekly' ? '每周' : '自定义' }}
              {{ behavior.targetCount }}次
            </span>
            <span class="behavior-points" :class="{ 'negative': behavior.type === 'negative' }">
              {{ behavior.points > 0 ? '+' : '' }}{{ behavior.points }}分
            </span>
          </div>

          <!-- 进度条 (仅用于需要多次打卡的行为) -->
          <div v-if="behavior.targetCount > 1" class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${(behavior.currentCount / behavior.targetCount) * 100}%` }"
                :class="{ 'negative': behavior.type === 'negative' }"
              ></div>
            </div>
            <span class="progress-text">
              进度: {{ behavior.currentCount }}/{{ behavior.targetCount }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="behavior-actions">
            <button 
              v-if="!behavior.completed" 
              class="action-btn checkin-btn" 
              @click="handleRecordBehavior(behavior.id)"
            >
              <span class="btn-icon">+</span> 
              {{ behavior.type === 'positive' ? '打卡' : '记录' }}
              <span v-if="behavior.currentCount > 0" class="checkin-count">({{ behavior.currentCount }})</span>
            </button>
            <button 
              v-else 
              class="action-btn completed-btn"
            >
              <span class="btn-icon">✓</span> 已完成
            </button>
            <button 
              v-if="behavior.currentCount > 0 && !behavior.completed" 
              class="action-btn cancel-btn" 
              @click="handleCancelBehavior(behavior.id)"
            >
              <span class="btn-icon">✕</span> 取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知弹窗 -->
    <div v-if="showNotification" class="notification-overlay">
      <div class="notification-content" :class="notificationType">
        <span class="notification-icon">{{ notificationIcon }}</span>
        <p class="notification-message">{{ notificationMessage }}</p>
        <button class="close-notification-btn" @click="closeNotification">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import NavigationTabs from '../components/NavigationTabs.vue'

const router = useRouter()
const store = useUserStore()

// 搜索查询
const searchQuery = ref('')

// 通知相关
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success') // success, error, info
const notificationIcon = ref('')

// 计算当前日期
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
})

// 过滤行为
const filteredBehaviors = computed(() => {
  if (!searchQuery.value) {
    return store.behaviors
  }
  const query = searchQuery.value.toLowerCase()
  return store.behaviors.filter(behavior => 
    behavior.name.toLowerCase().includes(query) || 
    behavior.description.toLowerCase().includes(query)
  )
})

// 记录行为
function handleRecordBehavior(behaviorId: string) {
  const success = store.recordBehavior(behaviorId)
  if (success) {
    showNotificationMessage('行为记录成功！', 'success', '✅')
  } else {
    showNotificationMessage('今日该行为已完成！', 'info', 'ℹ️')
  }
}

// 取消行为记录
function handleCancelBehavior(behaviorId: string) {
  const success = store.cancelBehaviorRecord(behaviorId)
  if (success) {
    showNotificationMessage('行为记录已取消！', 'success', '✅')
  } else {
    showNotificationMessage('没有可取消的记录！', 'info', 'ℹ️')
  }
}

// 处理登出
function handleLogout() {
  store.logout()
  localStorage.removeItem('isLoggedIn')
  router.push('/')
}

// 显示通知
function showNotificationMessage(message: string, type: string, icon: string) {
  notificationMessage.value = message
  notificationType.value = type
  notificationIcon.value = icon
  showNotification.value = true

  setTimeout(() => {
    closeNotification()
  }, 3000)
}

// 关闭通知
function closeNotification() {
  showNotification.value = false
}

// 组件挂载时初始化
onMounted(() => {
  // 初始化默认行为
  store.initializeDefaultBehaviors()
  // 重置每日行为状态
  store.resetDailyBehaviors()
})
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 主容器 */
.behavior-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe6ed 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
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
  opacity: 0.6;
  animation: float 10s ease-in-out infinite;
}

.heart {
  top: 10%;
  right: 15%;
  width: 120px;
  height: 120px;
  background-color: #ffb6c1;
  transform: rotate(45deg);
  animation-delay: 0s;
}

.heart:before,
.heart:after {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  background-color: #ffb6c1;
  border-radius: 50%;
}

.heart:before {
  top: -60px;
  left: 0;
}

.heart:after {
  top: 0;
  left: -60px;
}

.star {
  bottom: 15%;
  left: 10%;
  width: 80px;
  height: 80px;
  background-color: #ffda6a;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation-delay: 2s;
  box-shadow: 0 0 20px #ffda6a;
}

.cloud {
  top: 25%;
  left: 20%;
  width: 150px;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 40px;
  animation-delay: 1s;
}

.cloud:before,
.cloud:after {
  content: '';
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.cloud:before {
  width: 70px;
  height: 70px;
  top: -30px;
  left: 20px;
}

.cloud:after {
  width: 90px;
  height: 90px;
  top: -40px;
  right: 20px;
}

.circle {
  bottom: 25%;
  right: 15%;
  width: 100px;
  height: 100px;
  background-color: #b5ead7;
  border-radius: 50%;
  animation-delay: 3s;
}

.rainbow {
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 100px;
  border-radius: 100px 100px 0 0;
  background: linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
  opacity: 0.3;
  animation-delay: 1.5s;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* 头部 */
.behavior-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(255, 107, 139, 0.1);
  border: 3px solid #ffd6e0;
  position: relative;
  overflow: hidden;
}

.behavior-header::before {
  content: '';
  position: absolute;
  top: -10px;
  right: -10px;
  width: 80px;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
  z-index: 1;
}

.behavior-header h1 {
  color: #ff6b8b;
  font-size: 1.8rem;
  margin: 0;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.2);
}

.date-display {
  font-size: 1rem;
  color: #ff8fab;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.date-icon {
  font-size: 1.1rem;
}

/* 登出按钮 */
.logout-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 138, 171, 0.3);
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.logout-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 139, 0.4);
  background: linear-gradient(135deg, #ff6b8b 0%, #ff4757 100%);
}

.logout-icon {
  font-size: 1.1rem;
}

/* 搜索栏 */
.search-bar {
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 15px 20px;
  border: 3px solid #ffb6c1;
  border-radius: 25px;
  font-size: 16px;
  background-color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(255, 182, 193, 0.2);
}

.search-input:focus {
  outline: none;
  border-color: #ff6b8b;
  box-shadow: 0 0 0 5px rgba(255, 107, 139, 0.1), 0 6px 15px rgba(255, 107, 139, 0.3);
  background-color: #fff0f5;
  transform: translateY(-2px);
}

.search-input::placeholder {
  color: #ffb6c1;
}

/* 行为卡片网格 */
.behaviors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

/* 行为卡片 */
.behavior-card {
  background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
  border-radius: 25px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(255, 138, 171, 0.2);
  border: 3px solid #ffd6e0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.behavior-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(255, 138, 171, 0.3);
}

.behavior-card.completed {
  border-color: #98fb98;
  background: linear-gradient(135deg, #ffffff 0%, #f0fff4 100%);
  box-shadow: 0 10px 25px rgba(152, 251, 152, 0.2);
}

.behavior-card.negative {
  border-color: #ffb6c1;
  background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
}

/* 行为卡片头部 */
.behavior-header-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
}

.behavior-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b8b 0%, #ff8fab 100%);
  border-radius: 15px;
  color: white;
  flex-shrink: 0;
}

.behavior-info {
  flex: 1;
}

.behavior-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.behavior-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.behavior-status {
  flex-shrink: 0;
}

.status-indicator {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff6b8b;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

/* 行为详情 */
.behavior-details {
  margin-top: 15px;
}

.behavior-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.behavior-frequency {
  color: #666;
  font-weight: 500;
}

.behavior-points {
  font-weight: bold;
  color: #4caf50;
}

.behavior-points.negative {
  color: #f44336;
}

/* 进度条 */
.progress-container {
  margin-bottom: 15px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-fill.negative {
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
  text-align: right;
}

/* 操作按钮 */
.behavior-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.action-btn {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.checkin-btn {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.checkin-btn:hover {
  background: linear-gradient(135deg, #45a049 0%, #4caf50 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(76, 175, 80, 0.4);
}

.completed-btn {
  background: linear-gradient(135deg, #98fb98 0%, #90ee90 100%);
  color: #333;
  box-shadow: 0 4px 10px rgba(152, 251, 152, 0.3);
  cursor: not-allowed;
}

.cancel-btn {
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(244, 67, 54, 0.3);
  flex: 0 0 auto;
  padding: 10px;
  min-width: 80px;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(244, 67, 54, 0.4);
}

.btn-icon {
  font-size: 16px;
}

.checkin-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 通知弹窗 */
.notification-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 25px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
  max-width: 400px;
}

.notification-content.success {
  background: linear-gradient(45deg, #66bb6a, #43a047);
  color: white;
}

.notification-content.error {
  background: linear-gradient(45deg, #ef5350, #e53935);
  color: white;
}

.notification-content.info {
  background: linear-gradient(45deg, #42a5f5, #1e88e5);
  color: white;
}

.notification-icon {
  font-size: 1.5rem;
}

.notification-message {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.close-notification-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-notification-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 动画效果 */
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
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .behavior-container {
    padding: 15px;
  }

  .behavior-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .behaviors-grid {
    grid-template-columns: 1fr;
  }

  .behavior-card {
    padding: 15px;
  }

  .behavior-icon {
    font-size: 28px;
    width: 50px;
    height: 50px;
  }

  .behavior-name {
    font-size: 1.1rem;
  }

  .behavior-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>