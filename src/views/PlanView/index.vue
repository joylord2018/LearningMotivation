<template>
    <div class="plan-container">
        <!-- 可爱的装饰元素 -->
        <div class="decorations">
            <!-- 静态星星装饰 -->
            <div v-for="i in 25" :key="'star-' + i" class="decoration star" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }"></div>
            
            <!-- 静态爱心装饰 -->
            <div v-for="i in 8" :key="'heart-' + i" class="decoration heart" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }"></div>
            
            <!-- 静态云朵装饰 -->
            <div v-for="i in 4" :key="'cloud-' + i" class="decoration cloud" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 50 + '%' }"></div>
        </div>

        <header class="plan-header">
            <div class="header-content">
                <h1>🎮 今日计划大挑战 🎮</h1>
                <div class="date-display">
                    <span class="date-icon">🗓️</span>
                    {{ currentDate }}
                </div>
            </div>
            <div class="logout-btn" @click="handleLogout">
                <span class="logout-icon">🚪</span> 退出冒险
            </div>
        </header>

        <!-- 使用可复用的导航组件 -->
        <NavigationTabs />

        <!-- 日历视图 -->
        <CalendarSection ref="calendarSection" />

        <div class="plan-content">
            <!-- 今日积分展示卡片 -->
            <TodayPointsSection />

            <!-- 计划列表 -->
            <PlanListSection 
                :selectedDate="selectedDate" 
                :currentDateStr="currentDateStr"
                @startTimer="startTimer"
                @quickComplete="quickComplete"
                @undoComplete="undoComplete"
            />

            <!-- 周计划模块 -->
            <WeeklyPlansSection 
                :weekStart="weekStart"
                @completeWeeklyPlan="completeWeeklyPlan"
                @undoCompleteWeeklyPlan="undoCompleteWeeklyPlan"
            />

            <!-- 额外奖励提示 -->
            <div class="reward-hint card">
                <div class="reward-icon">🎁</div>
                <div class="reward-text">
                    <strong>每日奖励：</strong>完成本日所有计划可能会随机掉落积分喔！
                </div>
            </div>
        </div>

        <!-- 计时弹窗 -->
        <TimerPopup 
            :visible="showTimerPopup" 
            :planName="currentTimerPlanName"
            @close="closeTimerPopup"
            @stop="stopTimer"
        />

        <!-- 游戏风格弹窗 -->
        <div v-if="showPopup" class="game-popup-overlay" @click="closePopup">
            <div class="game-popup-content" @click.stop>
                <div class="popup-animation">
                    <div class="popup-icon">{{ popupIcon }}</div>
                    <div class="popup-title">{{ popupMessage }}</div>
                    <div class="popup-points" v-if="popupPoints !== 0">
                        +{{ popupPoints }} 积分
                    </div>
                </div>
                <button class="popup-btn game-btn" @click="closePopup">
                    <span class="btn-icon">👍</span> 继续冒险
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'
import NavigationTabs from '../../components/NavigationTabs.vue'
import CalendarSection from './components/CalendarSection.vue'
import PlanListSection from './components/PlanListSection.vue'
import WeeklyPlansSection from './components/WeeklyPlansSection.vue'
import TodayPointsSection from './components/TodayPointsSection.vue'
import TimerPopup from './components/TimerPopup.vue'

const router = useRouter()
const store = useUserStore()

// 组件引用
const calendarSection = ref<InstanceType<typeof CalendarSection> | null>(null)

// 本地状态
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const currentDateStr = ref(new Date().toISOString().slice(0, 10))
const weekStart = ref(new Date())

// 计时相关
const showTimerPopup = ref(false)
const currentTimerPlanId = ref('')
const currentTimerPlanName = ref('')

// 弹窗状态
const showPopup = ref(false)
const popupMessage = ref('')
const popupIcon = ref('🎉')
const popupPoints = ref(0)

// 计算当前日期
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
})

// 加载本地存储的提醒设置
onMounted(() => {
    // 初始化今日计划
    store.initializeTodayPlans()
})

// 快速完成计划
function quickComplete(planId: string) {
  const plan = store.plans.find(p => p.id === planId)
  if (plan && !plan.completionLevel) {
    store.updatePlanCompletion(planId, true) // 标记为完成，获得积分
    const points = plan.points // 使用计划的points属性

    // 确保弹窗状态正确更新
    showPopup.value = false
    setTimeout(() => {
      popupMessage.value = '🎉 计划完成！'
      popupIcon.value = '🎊'
      popupPoints.value = points
      showPopup.value = true
      // 禁止背景页面滚动
      document.body.style.overflow = 'hidden'
    }, 50)

    // 检查是否完成了所有计划
    checkAllPlansCompleted()
  }
}

// 检查是否完成了所有计划
function checkAllPlansCompleted() {
  const todayPlans = store.plans.filter(plan => plan.date === currentDateStr.value && plan.type !== 'weekly')
  const allCompleted = todayPlans.length > 0 && todayPlans.every(plan => plan.completionLevel)
  
  if (allCompleted) {
    // 延迟显示奖励弹窗，让用户先看到计划完成的弹窗
    setTimeout(() => {
      // 随机掉落积分，概率随着积分的多少分配大小
      const randomPoints = getRandomPoints()
      if (randomPoints > 0) {
        store.adjustPoints(randomPoints, '完成所有计划随机掉落')
        showPopup.value = false
        setTimeout(() => {
          popupMessage.value = '🎁 恭喜！完成所有计划获得随机积分！'
          popupIcon.value = '💰'
          popupPoints.value = randomPoints
          showPopup.value = true
          // 禁止背景页面滚动
          document.body.style.overflow = 'hidden'
        }, 50)
      }
    }, 2000)
  }
}

// 获取随机积分，概率随着积分的多少分配大小
function getRandomPoints() {
  const random = Math.random() * 100
  if (random < 5) {
    return 8 // 5% 概率获得8积分
  } else if (random < 15) {
    return 7 // 10% 概率获得7积分
  } else if (random < 30) {
    return 6 // 15% 概率获得6积分
  } else if (random < 50) {
    return 5 // 20% 概率获得5积分
  } else if (random < 70) {
    return 4 // 20% 概率获得4积分
  } else if (random < 85) {
    return 3 // 15% 概率获得3积分
  } else if (random < 95) {
    return 2 // 10% 概率获得2积分
  } else if (random < 100) {
    return 1 // 5% 概率获得1积分
  } else {
    return 0 // 0% 概率获得0积分
  }
}

// 撤销完成
function undoComplete(planId: string) {
  store.undoPlanCompletion(planId)
  // 强制更新弹窗状态
  showPopup.value = false
  // 延迟显示撤销弹窗，确保响应式更新完成
  setTimeout(() => {
    popupMessage.value = '↩️ 已撤销完成状态'
    popupIcon.value = '🔄'
    popupPoints.value = 0
    showPopup.value = true
    // 禁止背景页面滚动
    document.body.style.overflow = 'hidden'
  }, 100)
}

// 开始计时
function startTimer(planId: string) {
  const plan = store.plans.find(p => p.id === planId)
  if (plan) {
    currentTimerPlanId.value = planId
    currentTimerPlanName.value = `${plan.subjectName} - ${getPlanNameBySubject(plan.subject)}`
    showTimerPopup.value = true
  }
}

// 停止计时并完成计划
function stopTimer() {
  if (currentTimerPlanId.value) {
    const plan = store.plans.find(p => p.id === currentTimerPlanId.value)
    if (plan && !plan.completionLevel) {
      store.updatePlanCompletion(currentTimerPlanId.value, true) // 标记为完成，获得积分
      const points = plan.points // 使用计划的points属性

      // 确保弹窗状态正确更新
      showPopup.value = false
      setTimeout(() => {
        popupMessage.value = '🎉 计划完成！'
        popupIcon.value = '🎊'
        popupPoints.value = points
        showPopup.value = true
        // 禁止背景页面滚动
        document.body.style.overflow = 'hidden'
      }, 50)

      // 检查是否完成了所有计划
      checkAllPlansCompleted()
    }
  }
  
  // 重置计时器
  currentTimerPlanId.value = ''
  currentTimerPlanName.value = ''
  showTimerPopup.value = false
}

// 关闭计时弹窗
function closeTimerPopup() {
  showTimerPopup.value = false
  // 恢复背景页面滚动
  document.body.style.overflow = 'auto'
  currentTimerPlanId.value = ''
  currentTimerPlanName.value = ''
}

// 关闭弹窗
function closePopup() {
  showPopup.value = false
  // 恢复背景页面滚动
  document.body.style.overflow = 'auto'
}

// 完成周计划
function completeWeeklyPlan(planId: string) {
  const plan = store.plans.find(p => p.id === planId)
  if (plan && !plan.completionLevel) {
    store.updatePlanCompletion(planId, true) // 标记为完成，获得积分
    const points = plan.points // 使用计划的points属性

    // 确保弹窗状态正确更新
    showPopup.value = false
    setTimeout(() => {
      popupMessage.value = '🎉 周计划完成！'
      popupIcon.value = '🎊'
      popupPoints.value = points
      showPopup.value = true
      // 禁止背景页面滚动
      document.body.style.overflow = 'hidden'
    }, 50)
  }
}

// 撤销完成周计划
function undoCompleteWeeklyPlan(planId: string) {
  const plan = store.plans.find(p => p.id === planId)
  if (plan && plan.type === 'weekly' && plan.completedCount > 0) {
    const currentCount = plan.completedCount
    // 对于周计划，调用 updatePlanCompletion 并传入 false 来减少一次完成次数
    store.updatePlanCompletion(planId, false)
    // 强制更新弹窗状态
    showPopup.value = false
    // 延迟显示撤销弹窗，确保响应式更新完成
    setTimeout(() => {
      popupMessage.value = `↩️ 已撤销第${currentCount}次完成`
      popupIcon.value = '🔄'
      popupPoints.value = 0
      showPopup.value = true
      // 禁止背景页面滚动
      document.body.style.overflow = 'hidden'
    }, 100)
  }
}

// 处理登出
function handleLogout() {
  store.logout()
  localStorage.removeItem('isLoggedIn')
  router.push('/')
}

// 获取计划名称
function getPlanNameBySubject(subject: string): string {
  const names: { [key: string]: string } = {
    'chinese': '语文计划',
    'math': '数学计划',
    'english': '英语计划'
  }
  return names[subject] || '学习计划'
}
</script>

<style scoped>
/* 主容器样式 */
.plan-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #fff0f5 0%, #ffe6ed 100%);
    background-image:
        radial-gradient(#ffd6e0 1px, transparent 1px),
        radial-gradient(#ffd6e0 1px, transparent 1px);
    background-size: 30px 30px;
    background-position: 0 0, 15px 15px;
    padding: 20px;
    position: relative;
    overflow: hidden;
}

/* 装饰元素 */
.decorations {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: -1;
}

.decoration {
    position: absolute;
    pointer-events: none;
}

/* 星星装饰 */
.star {
    width: 15px;
    height: 15px;
    background-color: #ffda6a;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    box-shadow: 0 0 8px #ffda6a;
}

/* 爱心装饰 */
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

/* 云朵装饰 */
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
.plan-header {
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

.plan-header::before {
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

.plan-header h1 {
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

/* 计划内容区域 */
.plan-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
}

/* 通用卡片样式 */
.card {
    background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffd6e0;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 139, 0.15);
}

.card::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 100px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
}

/* 奖励提示 */
.reward-hint {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 20px;
    background: linear-gradient(135deg, #fff0f5 0%, #ffedf2 100%);
}

.reward-icon {
    font-size: 2rem;
    animation: bounce 2s ease-in-out infinite;
}

.reward-text {
    color: #ff6b8b;
    font-size: 1rem;
    font-weight: 500;
    position: relative;
    z-index: 1;
}

/* 游戏风格弹窗 */
.game-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 138, 171, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.game-popup-content {
    background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
    padding: 30px;
    border-radius: 25px;
    box-shadow: 0 15px 35px rgba(255, 107, 139, 0.3);
    text-align: center;
    max-width: 400px;
    width: 90%;
    border: 3px solid #ffd6e0;
    animation: slideIn 0.3s ease;
    position: relative;
    overflow: hidden;
}

/* 弹窗内部装饰 */
.popup-animation {
    position: relative;
    z-index: 1;
    margin-bottom: 20px;
}

.popup-icon {
    font-size: 5rem;
    margin-bottom: 15px;
    animation: bounce 0.6s ease-in-out infinite;
}

.popup-title {
    font-size: 1.5rem;
    color: #ff6b8b;
    font-weight: 800;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.2);
}

.popup-message {
    font-size: 1.2rem;
    color: #ff8fab;
    margin-bottom: 15px;
    font-weight: 600;
}

.popup-points {
    font-size: 2rem;
    color: #ff6b8b;
    font-weight: 800;
    margin-bottom: 10px;
    animation: pointsGain 0.5s ease;
    text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.2);
}

@keyframes pointsGain {
    0% {
        transform: scale(0);
        opacity: 0;
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.popup-btn {
    margin-top: 10px;
    position: relative;
    z-index: 1;
}

/* 新增游戏按钮样式 */
.game-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    font-weight: 700;
    box-shadow: 0 6px 15px rgba(255, 138, 171, 0.4);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
}

.game-btn::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transform: rotate(45deg);
    animation: shimmer 3s infinite;
}

.game-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(255, 107, 139, 0.5);
    background: linear-gradient(135deg, #ff6b8b 0%, #ff4757 100%);
}

.game-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(255, 107, 139, 0.4);
}

.btn-icon {
    font-size: 1.2rem;
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
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .plan-container {
        padding: 15px;
    }
    
    .plan-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    .header-content h1 {
        font-size: 1.5rem;
    }
}
</style>