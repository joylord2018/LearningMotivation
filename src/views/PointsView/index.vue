<template>
    <div class="points-container">
        <!-- 装饰元素 -->
        <div class="decorations">
            <!-- 静态星星装饰 -->
            <div v-for="i in 25" :key="'star-' + i" class="decoration star" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }"></div>
            
            <!-- 静态爱心装饰 -->
            <div v-for="i in 8" :key="'heart-' + i" class="decoration heart" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }"></div>
            
            <!-- 静态云朵装饰 -->
            <div v-for="i in 4" :key="'cloud-' + i" class="decoration cloud" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 50 + '%' }"></div>
        </div>

        <!-- 游戏化头部 -->
        <HeaderSection @openLottery="openLotteryPopup" @openBackpack="openBackpackPopup" />

        <NavigationTabs />

        <!-- 游戏化进度展示 -->
        <LevelProgressSection />

        <div class="points-content">
            <!-- 积分兑换 -->
            <ExchangeSection @exchange="handleExchange" @openRecords="openRecordsPopup" />
        </div>

        <!-- 积分记录弹窗 -->
        <RecordsPopup :visible="showRecordsPopup" @close="closeRecordsPopup" />

        <!-- 兑换成功弹窗 -->
        <ExchangePopup 
            :visible="showExchangePopup" 
            :icon="exchangePopupIcon"
            :message="exchangePopupMessage"
            :showPointChange="showPointChange"
            :pointChangeText="pointChangeText"
            @close="closeExchangePopup" 
        />

        <!-- 背包弹窗 -->
        <BackpackPopup :visible="showBackpackPopup" @close="closeBackpackPopup" @useItem="handleUseItem" />

        <!-- 抽奖弹窗 -->
        <LotteryPopup v-if="store.enableLottery" :visible="showLotteryPopup" @close="closeLotteryPopup" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../stores'
import NavigationTabs from '../../components/NavigationTabs.vue'
import LotteryPopup from '../../components/LotteryPopup.vue'
import HeaderSection from './components/HeaderSection.vue'
import LevelProgressSection from './components/LevelProgressSection.vue'
import ExchangeSection from './components/ExchangeSection.vue'
import RecordsPopup from './components/RecordsPopup.vue'
import BackpackPopup from './components/BackpackPopup.vue'
import ExchangePopup from './components/ExchangePopup.vue'

const store = useUserStore()

// 弹窗状态
const showRecordsPopup = ref(false)
const showExchangePopup = ref(false)
const exchangePopupIcon = ref('🎉')
const exchangePopupMessage = ref('兑换成功！')
const showPointChange = ref(false)
const pointChangeText = ref('')

// 背包相关状态
const showBackpackPopup = ref(false)

// 抽奖弹窗状态
const showLotteryPopup = ref(false)

// 积分兑换处理
function handleExchange(item: any) {
    if (store.currentPoints >= item.points) {
        const success = store.exchangeItem(item.id)
        if (success) {
            exchangePopupIcon.value = '🎉'
            exchangePopupMessage.value = `${item.name}兑换成功！已放入背包`
            showExchangePopup.value = true
            // 禁止背景页面滚动
            document.body.style.overflow = 'hidden'

            // 显示积分变动动画
            showPointChange.value = true
            pointChangeText.value = `- ${item.points} 积分`
            setTimeout(() => {
                showPointChange.value = false
            }, 1500)
        }
    }
}

// 使用物品处理
function handleUseItem(item: any) {
    const success = store.useItemFromBackpack(item.id)
    if (success) {
        showBackpackPopup.value = false
        exchangePopupIcon.value = '✨'
        exchangePopupMessage.value = `${item.name}使用成功！`
        showExchangePopup.value = true
        // 禁止背景页面滚动
        document.body.style.overflow = 'hidden'
    }
}

// 打开积分记录弹窗
function openRecordsPopup() {
    showRecordsPopup.value = true
    // 禁止背景页面滚动
    document.body.style.overflow = 'hidden'
}

// 关闭积分记录弹窗
function closeRecordsPopup() {
    showRecordsPopup.value = false
    // 恢复背景页面滚动
    document.body.style.overflow = 'auto'
}

// 打开背包弹窗
function openBackpackPopup() {
    showBackpackPopup.value = true
    // 禁止背景页面滚动
    document.body.style.overflow = 'hidden'
}

// 关闭背包弹窗
function closeBackpackPopup() {
    showBackpackPopup.value = false
    // 恢复背景页面滚动
    document.body.style.overflow = 'auto'
}

// 打开抽奖弹窗
function openLotteryPopup() {
    showLotteryPopup.value = true
    // 禁止背景页面滚动
    document.body.style.overflow = 'hidden'
}

// 关闭抽奖弹窗
function closeLotteryPopup() {
    showLotteryPopup.value = false
    // 恢复背景页面滚动
    document.body.style.overflow = 'auto'
}

// 关闭兑换成功弹窗
function closeExchangePopup() {
    showExchangePopup.value = false
    // 恢复背景页面滚动
    document.body.style.overflow = 'auto'
}
</script>

<style scoped>
/* 基础容器样式 */
.points-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffedf2 0%, #fff8fa 100%);
    position: relative;
    padding: 20px;
    font-family: 'Arial', sans-serif;
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

/* 积分内容区域 */
.points-content {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .points-container {
        padding: 15px;
    }
}
</style>