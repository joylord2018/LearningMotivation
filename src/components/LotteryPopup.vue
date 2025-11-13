<template>
  <div v-show="visible" class="lottery-popup-overlay" @click="handleClose">
    <div class="lottery-popup-content" @click.stop>
      <div class="popup-header">
        <h2>🎰 幸运抽奖</h2>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <!-- 抽奖消耗信息 -->
      <div class="lottery-cost">
        <span class="cost-icon">✨</span>
        每次抽奖消耗 <span class="cost-amount">{{ lotteryCost }}</span> 积分
      </div>

      <!-- 抽奖转盘 -->
      <div class="lottery-wheel-container">
        <div class="lottery-wheel" :style="wheelStyle">
          <div 
            v-for="(item, index) in store.lotteryItems" 
            :key="item.id" 
            class="lottery-segment"
            :class="getRarityClass(item.rarity)"
            :style="getSegmentStyle(index)"
          >
            <div class="segment-text-wrapper" :style="getTextWrapperStyle(index)">
              <div class="segment-icon">{{ getRarityIcon(item.rarity) }}</div>
              <div class="segment-name">{{ item.name }}</div>
              <div class="segment-probability">{{ item.probability }}%</div>
            </div>
          </div>
        </div>
        <div class="lottery-pointer"></div>
      </div>

      <!-- 抽奖按钮 -->
      <button class="draw-btn" @click="handleDraw" :disabled="isSpinning || store.currentPoints < lotteryCost">
        {{ isSpinning ? '抽奖中...' : (store.currentPoints < lotteryCost ? '积分不足' : '开始抽奖') }} </button>

      <!-- 抽奖结果展示 -->
      <transition name="result-popup">
        <div v-if="showResult" class="result-popup">
          <div class="result-icon">{{ resultIcon }}</div>
          <h3 class="result-title">{{ resultTitle }}</h3>
          <p class="result-description">{{ resultItem?.description }}</p>
          <div class="result-item" :class="getRarityClass(resultItem?.rarity)">
            <div class="rarity-badge">{{ getRarityText(resultItem?.rarity) }}</div>
            <div class="item-name">{{ resultItem?.name }}</div>
            <div v-if="resultItem?.effect" class="item-effect">{{ resultItem?.effect }}</div>
          </div>
          <button class="result-btn" @click="handleCloseResult">太棒了！</button>
        </div>
      </transition>

      <!-- 抽奖历史 -->
      <div class="lottery-history">
        <h3>🎯 最近抽奖</h3>
        <div class="history-list">
          <div v-for="(historyItem, index) in recentLotteryHistory" :key="index" class="history-item">
            <div class="history-icon">{{ getRarityIcon(historyItem.rarity) }}</div>
            <div class="history-info">
              <div class="history-name">{{ historyItem.name }}</div>
              <div class="history-rarity">{{ getRarityText(historyItem.rarity) }}</div>
            </div>
          </div>
          <div v-if="recentLotteryHistory.length === 0" class="no-history">
            还没有抽奖记录
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore, ItemRarity } from '../stores/userStore'

// Props
interface Props {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

// Emits
interface Emits {
  close: []
}

const emit = defineEmits<Emits>()

// Store
const store = useUserStore()

// 状态
const isSpinning = ref(false)
const showResult = ref(false)
const resultItem = ref<any>(null)
const wheelRotation = ref(0)
const recentLotteryHistory = ref<any[]>([])

// 抽奖消耗
const lotteryCost = 10

// 计算属性
const wheelStyle = computed(() => {
  return {
    transform: `rotate(${wheelRotation.value}deg)`
  }
})

const resultIcon = computed(() => {
  if (!resultItem.value) return '🎉'

  switch (resultItem.value.rarity) {
    case ItemRarity.Common:
      return '✨'
    case ItemRarity.Rare:
      return '🌟'
    case ItemRarity.Epic:
      return '💎'
    case ItemRarity.Legendary:
      return '👑'
    default:
      return '🎉'
  }
})

const resultTitle = computed(() => {
  if (!resultItem.value) return ''

  switch (resultItem.value.rarity) {
    case ItemRarity.Common:
      return '恭喜获得普通物品！'
    case ItemRarity.Rare:
      return '太棒了！获得稀有物品！'
    case ItemRarity.Epic:
      return '太厉害了！获得史诗物品！'
    case ItemRarity.Legendary:
      return '传说级幸运！获得传说物品！'
    default:
      return '恭喜获得物品！'
  }
})

// 方法
function handleClose() {
  emit('close')
}

function handleDraw() {
  if (isSpinning.value || store.currentPoints < lotteryCost) {
    return
  }

  isSpinning.value = true

  // 执行抽奖动画
  const segmentsCount = store.lotteryItems.length
  const baseRotation = 360 * 5 // 基础旋转5圈
  const randomSegment = Math.floor(Math.random() * segmentsCount)
  const segmentRotation = (360 / segmentsCount) * randomSegment

  // 动画持续时间
  const animationDuration = 3000 // 3秒
  const frameDuration = 16 // 约60fps
  const totalFrames = animationDuration / frameDuration
  let currentFrame = 0

  // 动画函数 - 使用缓动函数
  const animateWheel = () => {
    currentFrame++
    const progress = currentFrame / totalFrames
    // 使用easeOut缓动函数
    const easeOutProgress = 1 - Math.pow(1 - progress, 3)

    wheelRotation.value = baseRotation * easeOutProgress + segmentRotation

    if (currentFrame < totalFrames) {
      requestAnimationFrame(animateWheel)
    } else {
      // 动画结束，执行抽奖逻辑
      setTimeout(() => {
        performLottery()
      }, 500)
    }
  }

  // 开始动画
  requestAnimationFrame(animateWheel)
}

function performLottery() {
  // 调用store中的抽奖方法
  const result = store.drawLottery()

  if (result) {
    resultItem.value = result

    // 添加到历史记录
    recentLotteryHistory.value.unshift({
      name: result.name,
      rarity: result.rarity
    })

    // 限制历史记录数量
    if (recentLotteryHistory.value.length > 5) {
      recentLotteryHistory.value.pop()
    }

    // 显示结果
    showResult.value = true
  }

  isSpinning.value = false
}

function handleCloseResult() {
  showResult.value = false
  resultItem.value = null
}

// 获取稀有度样式类
function getRarityClass(rarity?: ItemRarity) {
  if (!rarity) return ''

  return `rarity-${rarity}`
}

// 获取稀有度图标
function getRarityIcon(rarity?: ItemRarity) {
  if (!rarity) return '✨'

  switch (rarity) {
    case ItemRarity.Common:
      return '✨'
    case ItemRarity.Rare:
      return '🌟'
    case ItemRarity.Epic:
      return '💎'
    case ItemRarity.Legendary:
      return '👑'
    default:
      return '✨'
  }
}

// 获取稀有度文本
function getRarityText(rarity?: ItemRarity) {
  if (!rarity) return '普通'

  switch (rarity) {
    case ItemRarity.Common:
      return '普通'
    case ItemRarity.Rare:
      return '稀有'
    case ItemRarity.Epic:
      return '史诗'
    case ItemRarity.Legendary:
      return '传说'
    default:
      return '普通'
  }
}

// 计算每个扇形的样式 - 使用简单可靠的旋转方法
function getSegmentStyle(index: number) {
  const segmentsCount = store.lotteryItems.length;
  const anglePerSegment = 360 / segmentsCount;
  const startAngle = index * anglePerSegment;
  
  return {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    transformOrigin: 'center center',
    transform: `rotate(${startAngle}deg)`,
    overflow: 'hidden'
  };
}

// 计算文本包装器的样式，确保文字朝向外侧
function getTextWrapperStyle(index: number) {
  const segmentsCount = store.lotteryItems.length;
  const anglePerSegment = 360 / segmentsCount;
  const startAngle = index * anglePerSegment;
  
  // 文本需要旋转的角度，确保文字朝向外侧
  // 90deg是初始偏移，使第一个扇形的文字水平向右
  const textRotation = startAngle + 90 + anglePerSegment / 2;
  
  return {
    position: 'absolute' as const,
    width: '50%',
    height: '100%',
    transformOrigin: 'left center',
    left: '50%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    transform: `rotate(${textRotation}deg)`,
    paddingLeft: '20px'
  };
}

// 监听弹窗显示状态，重置动画
watch(() => props.visible, (newVal) => {
  if (newVal) {
    wheelRotation.value = 0
    isSpinning.value = false
    showResult.value = false
    resultItem.value = null
  } else {
    // 当弹窗被关闭时，确保所有状态重置
    isSpinning.value = false
    showResult.value = false
  }
})
</script>

<style scoped>
.lottery-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.lottery-popup-content {
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: slideIn 0.3s ease-out;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.popup-header h2 {
  margin: 0;
  color: #ff6b81;
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
  padding: 5px;
}

.close-btn:hover {
  color: #ff6b81;
}

.lottery-cost {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
  color: #555;
}

.cost-icon {
  margin-right: 5px;
  font-size: 20px;
}

.cost-amount {
  color: #ff6b81;
  font-weight: bold;
  font-size: 20px;
}

.lottery-wheel-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto 20px;
}

.lottery-wheel {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  background-color: #f8f9fa;
  transition: transform 3s cubic-bezier(0.1, 0.7, 0.1, 1);
  overflow: hidden;
  border: 8px solid #ff6b81;
}

.lottery-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 使用伪元素创建扇形背景 */
.lottery-segment::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: currentColor;
  transform-origin: center center;
  transform: rotate(var(--segment-angle)) skewY(var(--skew-angle));
}

/* 为每个扇形设置正确的角度 - 使用CSS变量 */
.lottery-segment {
  --segment-angle: calc(360deg / var(--segments-count) / 2);
  --skew-angle: calc(90deg - 360deg / var(--segments-count));
}

.segment-text-wrapper {
  position: absolute;
  width: 50%;
  height: 100%;
  left: 50%;
  transform-origin: left center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
}

/* 稀有度样式 */
.rarity-common {
  color: #e9ecef;
}

.rarity-rare {
  color: #d1ecf1;
}

.rarity-epic {
  color: #ddd6fe;
}

.rarity-legendary {
  color: #fed7aa;
}

.segment-icon {
  font-size: 18px;
  margin-bottom: 3px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.segment-name {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 2px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.segment-probability {
  font-size: 10px;
  opacity: 0.8;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.lottery-pointer {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 25px solid #ff6b81;
  z-index: 10;
}

.draw-btn {
  display: block;
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, #ff6b81, #ff8fab);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.draw-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 129, 0.4);
}

.draw-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.result-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1010;
  min-width: 300px;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 15px;
  animation: bounceIn 0.5s ease-out;
}

.result-title {
  color: #ff6b81;
  margin-bottom: 10px;
  font-size: 22px;
}

.result-description {
  color: #666;
  margin-bottom: 20px;
}

.result-item {
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  position: relative;
  animation: itemAppear 0.5s ease-out;
}

.rarity-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ff6b81;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.item-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.item-effect {
  font-size: 14px;
  color: #666;
  font-style: italic;
}

.result-btn {
  padding: 10px 30px;
  background: linear-gradient(45deg, #ff6b81, #ff8fab);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 129, 0.4);
}

.lottery-history {
  margin-top: 20px;
}

.lottery-history h3 {
  text-align: center;
  color: #555;
  margin-bottom: 15px;
  font-size: 18px;
}

.history-list {
  max-height: 150px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background-color: #f8f9fa;
  margin-bottom: 10px;
}

.history-icon {
  font-size: 20px;
  margin-right: 10px;
}

.history-name {
  font-weight: bold;
  flex: 1;
}

.history-rarity {
  font-size: 12px;
  color: #666;
}

.no-history {
  text-align: center;
  color: #999;
  padding: 20px;
}

/* 动画 */
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
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes itemAppear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes legendaryGlow {
  0% {
    box-shadow: 0 0 5px rgba(255, 111, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 111, 0, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 111, 0, 0.5);
  }
}

/* 抽奖结果弹窗动画 */
.result-popup-enter-active,
.result-popup-leave-active {
  transition: all 0.3s ease;
}

.result-popup-enter-from,
.result-popup-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .lottery-popup-content {
    padding: 20px;
    width: 95%;
  }

  .lottery-wheel-container {
    width: 250px;
    height: 250px;
  }

  .segment-name {
    font-size: 10px;
    max-width: 80px;
  }

  .segment-icon {
    font-size: 16px;
  }
}
</style>