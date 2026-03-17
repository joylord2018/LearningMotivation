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

      <!-- 九宫格抽奖 -->
      <div class="lottery-grid-container">
        <!-- 发光色块 -->
        <div v-if="isSpinning" class="glowing-block" :style="glowingBlockStyle"></div>
        
        <div v-for="index in 9" :key="index" class="lottery-grid-cell" :class="{ 'active': activeCell === index }">
            <!-- 纸覆盖层 -->
            <div class="cell-front" :class="{ 'teared': revealedCell === index }" @click="handleCellClick(index)">
                <div class="paper-text">🎁 点击抽奖</div>
            </div>
            <!-- 奖品内容层 -->
            <div class="cell-back">
                <div v-if="revealedCell === index" class="prize-content">
                    <div class="segment-icon">{{ getRarityIcon(gridItems[index - 1]!.rarity) }}</div>
                    {{ gridItems[index - 1]!.name }}
                    <div class="segment-probability">{{ gridItems[index - 1]!.probability }}%</div>
                </div>
                <div v-else class="placeholder-content">
                    <div class="segment-icon">🎁</div>
                    <div class="segment-name">神秘奖品</div>
                    <div class="segment-probability">???</div>
                </div>
            </div>
        </div>
      </div>

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

      <!-- 积分不足弹窗 -->
      <transition name="result-popup">
        <div v-if="showInsufficientPointsPopup" class="result-popup insufficient-points-popup">
          <div class="result-icon">💔</div>
          <h3 class="result-title">积分不足</h3>
          <p class="result-description">您的积分不够抽奖哦~ 快去完成任务赚积分吧！</p>
          <button class="result-btn" @click="handleCloseInsufficientPointsPopup">好的</button>
        </div>
      </transition>

      <!-- 抽奖历史 -->
      <div class="lottery-history">
        <h3>🎯 最近抽奖</h3>
        <div class="history-list">
          <template v-if="store.lotteryRecords.length > 0">
            <div v-for="(historyItem, index) in store.lotteryRecords.slice(0, 5)" :key="historyItem.id || index"
              class="history-item">
              <div class="history-icon">{{ getRarityIcon(historyItem.itemRarity) }}</div>
              <div class="history-name">{{ historyItem.itemName }}</div>
              <div class="history-rarity">{{ getRarityText(historyItem.itemRarity) }}</div>
            </div>
          </template>
          <div v-else class="no-history">
            还没有抽奖记录
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CSSProperties } from 'vue'
import { useUserStore, ItemRarity, type LotteryItem, type BackpackItem } from '../stores'

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
const resultItem = ref<BackpackItem | null>(null)
const revealedCell = ref<number | null>(null)
const showInsufficientPointsPopup = ref(false)
const activeCell = ref<number | null>(null)

// 抽奖消耗
const lotteryCost = 10

// 发光色块样式计算属性
const glowingBlockStyle = computed(() => {
    if (!activeCell.value) return { display: 'none' }
    
    const row = Math.ceil(activeCell.value / 3) - 1
    const col = (activeCell.value - 1) % 3
    
    return {
        top: `${row * 33.33}%`,
        left: `${col * 33.33}%`,
        transition: 'all 0.2s ease'
    }
})

// 计算属性已移除，使用九宫格样式
// 初始化九宫格奖品数据
const gridItems = ref<LotteryItem[]>([])

// 重置九宫格奖品数据
const resetGridItems = () => {
  gridItems.value = Array.from({ length: 9 }, (_, i): LotteryItem => {

    // 中心格子固定为超级大奖
    if (i === 4) {
      return {
        id: 'grid-center-prize',
        name: '超级大奖',
        rarity: ItemRarity.Legendary,
        probability: 1,
        description: '恭喜获得超级大奖！',
        effect: '+1000 学习积分',
        icon: '🏆'
      }
    }
    // 其他格子随机分配奖品
    const items = store.lotteryItems
    // 确保有奖品可以分配
    if (items.length === 0) {
      return {
        id: 'fallback-item',
        name: '安慰奖',
        rarity: ItemRarity.Common,
        probability: 100,
        description: '感谢参与！',
        effect: '+10 学习积分',
        icon: '🎁'
      }
    }
    const randomIndex = Math.floor(Math.random() * items.length)
    const selectedItem = items[randomIndex]
    // 确保selectedItem不是undefined
    if (!selectedItem) {
      return {
        id: 'fallback-item',
        name: '安慰奖',
        rarity: ItemRarity.Common,
        probability: 100,
        description: '感谢参与！',
        effect: '+10 学习积分',
        icon: '🎁'
      }
    }
    return selectedItem
  })
}

// 立即调用初始化九宫格奖品数据
resetGridItems()

// 组件挂载时初始化九宫格奖品数据
onMounted(() => {
  resetGridItems()
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
  // 移除旋转状态的限制，允许随时关闭
  emit('close')
}



function handleCloseResult() {
  showResult.value = false
  resultItem.value = null
}

function handleCloseInsufficientPointsPopup() {
  showInsufficientPointsPopup.value = false
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





// 格子点击事件处理
async function handleCellClick(cellIndex: number) {
    if (isSpinning.value || store.currentPoints < lotteryCost) {
        if (store.currentPoints < lotteryCost) {
            showInsufficientPointsPopup.value = true;
        }
        return;
    }

    // 设置抽奖状态
    isSpinning.value = true;
    activeCell.value = 1;

    // 生成随机的移动路径
    const path = generateRandomPath();
    
    // 执行发光色块移动动画
    await animateGlowingBlock(path);

    // 随机选择一个格子作为中奖格子
    const winningCell = path[path.length - 1] || 1;
    revealedCell.value = winningCell;

    // 等待纸撕开动画完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 获取中奖格子对应的奖品
    const selectedGridItem = gridItems.value[winningCell - 1]
    // 执行抽奖并保存记录
    const drawnItem = store.drawLottery(selectedGridItem)
    if (drawnItem) {
        // 设置抽奖结果并显示弹窗
        resultItem.value = drawnItem;
        showResult.value = true;
    }

    // 3秒后重置抽奖状态并重新初始化奖品
    setTimeout(() => {
        revealedCell.value = null;
        isSpinning.value = false;
        activeCell.value = null;
        showResult.value = false;
        resetGridItems() // 每次抽奖后重新生成奖品
    }, 3000);
}

// 生成随机移动路径
function generateRandomPath(): number[] {
    const path: number[] = [];
    const cells = [1, 2, 3, 6, 9, 8, 7, 4]; // 顺时针路径
    
    // 随机移动3-5圈
    const circles = Math.floor(Math.random() * 3) + 3;
    // 随机停止位置
    const stopIndex = Math.floor(Math.random() * cells.length);
    
    for (let i = 0; i < circles * cells.length + stopIndex; i++) {
        const cell = cells[i % cells.length];
        if (cell !== undefined) {
            path.push(cell);
        }
    }
    
    return path;
}

// 执行发光色块移动动画
async function animateGlowingBlock(path: number[]) {
    for (const cell of path) {
        activeCell.value = cell;
        // 逐渐增加延迟，模拟减速效果
        const delay = Math.min(100 + path.indexOf(cell) * 10, 300);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}
</script>

<style scoped>
.lottery-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.lottery-popup-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
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

.lottery-grid-container {
  position: relative;
  width: calc(100% - 40px);
  max-width: 380px;
  height: auto;
  aspect-ratio: 1/1;
  margin: 0 auto 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
}

/* 发光色块 */
.glowing-block {
  position: absolute;
  width: calc(33.33% - 8px);
  height: calc(33.33% - 8px);
  border-radius: 20px;
  background: linear-gradient(45deg, #fffb00, #ff00ff);
  box-shadow: 0 0 20px rgba(255, 251, 0, 0.8);
  z-index: 5;
  animation: glowing 1s ease-in-out infinite alternate;
  pointer-events: none;
}

/* 发光动画 */
@keyframes glowing {
  from {
    box-shadow: 0 0 20px rgba(255, 251, 0, 0.8);
  }
  to {
    box-shadow: 0 0 30px rgba(255, 0, 255, 0.8);
  }
}

/* 激活的格子 */
.lottery-grid-cell.active {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.lottery-grid-cell {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 格子后面内容层 */
.cell-back {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  border: 2px solid white;
  box-sizing: border-box;
}

/* 格子前面纸覆盖层 */
.cell-front {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  transition: all 0.6s ease;
  transform-origin: top left;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 0;
  box-sizing: border-box;
  border-radius: 20px;
  border: 2px solid white;
}

/* 纸撕开效果 */
.cell-front.teared {
  transform: rotateY(90deg) scale(0.5);
  opacity: 0;
}

.paper-text {
  text-align: center;
  padding: 10px 4px;
  font-size: 14px;
  line-height: 1.5;
  white-space: normal;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  word-break: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
  max-height: 100%;
  overflow: visible;
  margin: 0;
}

.segment-text {
  color: #333;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.8);
}

.segment-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.segment-name {
  font-size: 16px;
  margin-bottom: 4px;
  text-align: center;
  font-weight: bold;
}

.segment-probability {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.prize-content,
.placeholder-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
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

.insufficient-points-popup {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
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

/* 稀有度样式 */
.rarity-common {
  background-color: #f8f9fa;
  color: #333;
}

.rarity-rare {
  background-color: #e7f3ff;
  color: #0066cc;
}

.rarity-epic {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.rarity-legendary {
  background-color: #fff3e0;
  color: #ff6f00;
}

/* 中奖内容 */
.prize-content {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
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

@keyframes rotateWheel {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotation-wheel {
  animation: rotateWheel 0.5s linear infinite;
  transform-origin: center center;
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
    font-size: 12px;
  }

  .segment-icon {
    font-size: 20px;
  }
}
</style>