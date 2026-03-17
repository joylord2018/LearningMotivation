<template>
  <div v-if="visible" class="game-popup-overlay" @click="closeTimerPopup">
    <div class="game-popup-content" @click.stop>
      <div class="timer-popup">
        <div class="timer-header">
          <h3>⏱️ 计时中</h3>
          <div class="timer-plan-name">{{ currentTimerPlanName }}</div>
        </div>
        <div class="timer-display">{{ timerTime }}</div>
        <div class="timer-actions">
          <button @click="pauseTimer" class="game-btn">
            <span class="btn-icon">{{ isTimerPaused ? '▶️' : '⏸️' }}</span> {{ isTimerPaused ? '继续' : '暂停' }}
          </button>
          <button @click="stopTimer" class="game-btn">
            <span class="btn-icon">⏹️</span> 结束
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

// Props
const props = defineProps<{
  visible: boolean
  planName: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'stop'): void
}>()

// 计时相关
const currentTimerPlanName = ref(props.planName)
const timerSeconds = ref(0)
const isTimerPaused = ref(false)
const timerInterval = ref<number | null>(null)

// 计算计时器显示时间
const timerTime = computed(() => {
  const hours = Math.floor(timerSeconds.value / 3600)
  const minutes = Math.floor((timerSeconds.value % 3600) / 60)
  const seconds = timerSeconds.value % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 启动计时器
function startTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  timerInterval.value = window.setInterval(() => {
    if (!isTimerPaused.value) {
      timerSeconds.value++
    }
  }, 1000)
}

// 暂停/继续计时
function pauseTimer() {
  isTimerPaused.value = !isTimerPaused.value
}

// 停止计时并完成计划
function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  
  emit('stop')
  closeTimerPopup()
}

// 关闭计时弹窗
function closeTimerPopup() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  
  // 重置计时器
  timerSeconds.value = 0
  isTimerPaused.value = false
  
  emit('close')
  // 恢复背景页面滚动
  document.body.style.overflow = 'auto'
}

// 组件挂载时启动计时器
if (props.visible) {
  startTimer()
  // 禁止背景页面滚动
  document.body.style.overflow = 'hidden'
}

// 组件卸载时清理计时器
onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  // 恢复背景页面滚动
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
/* 计时弹窗 */
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

/* 弹窗装饰 */
.game-popup-content::before,
.game-popup-content::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
}

.game-popup-content::before {
    top: -50px;
    right: -50px;
}

.game-popup-content::after {
    bottom: -50px;
    left: -50px;
}

/* 弹窗内部装饰 */
.timer-popup {
    position: relative;
    z-index: 1;
}

.timer-header {
    margin-bottom: 20px;
}

.timer-header h3 {
    color: #ff6b8b;
    font-size: 1.3rem;
    margin: 0 0 10px 0;
    font-weight: 700;
}

.timer-plan-name {
    color: #ff8fab;
    font-size: 1rem;
    font-weight: 500;
}

.timer-display {
    font-size: 3rem;
    font-weight: 800;
    color: #ff6b8b;
    margin: 30px 0;
    text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.2);
    font-family: 'Courier New', monospace;
}

.timer-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 30px;
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

@keyframes shimmer {
    0% {
        transform: translateX(-100%) rotate(45deg);
    }
    100% {
        transform: translateX(100%) rotate(45deg);
    }
}
</style>