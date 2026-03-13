<template>
    <div class="points-container">
        <!-- 更丰富的装饰元素 -->
        <div class="decorations">
            <div class="decoration heart"></div>
            <div class="decoration heart small"></div>
            <div class="decoration star"></div>
            <div class="decoration star small"></div>
            <div class="decoration circle"></div>
            <div class="decoration cloud"></div>
            <div class="decoration rainbow"></div>
            <div class="decoration gift-box"></div>
        </div>

        <!-- 游戏化头部 -->
        <header class="points-header">
            <h1>🏆 我的积分王国</h1>
            <div class="header-actions">
                <button v-if="store.enableLottery" class="lottery-btn" @click="showLotteryPopup = true">
                    🎰 幸运抽奖
                </button>
                <button class="backpack-btn" @click="showBackpackPopup = true">
                    🎒 我的背包 <span v-if="store.backpackItems.length > 0" class="badge">{{ store.backpackItems.length
                        }}</span>
                </button>
                <div class="logout-btn" @click="handleLogout">退出登录</div>
            </div>
        </header>

        <NavigationTabs />

        <!-- 游戏化进度展示 -->
        <div class="level-progress">
            <div class="level-info">
                <span class="level-badge">Lv.{{ currentLevel }}</span>
                <span class="next-level-text">距离下一级还需 {{ pointsToNextLevel }} 积分</span>
            </div>
            <div class="level-bar">
                <div class="level-fill" :style="{ width: levelProgress + '%' }"></div>
            </div>
        </div>

        <div class="points-content">
            <!-- 积分兑换 -->
            <div class="exchange-section">
                <h2>🎁 积分兑换商店</h2>
                <div class="current-points">
                    <div class="points-display">
                        <span class="points-icon">✨</span>
                        当前拥有积分: <span class="points-amount">{{ store.currentPoints }}</span>
                    </div>
                    <div class="level-up-hint" v-if="pointsToNextLevel <= 100">
                        💫 即将升级！加油哦~ 💫
                    </div>
                </div>

                <!-- 推荐兑换项 -->
                <div v-if="recommendedItems.length > 0" class="recommended-section">
                    <h3>🌟 推荐兑换</h3>
                    <div class="recommended-items">
                        <div v-for="item in recommendedItems" :key="item.id" class="exchange-item recommended">
                            <div class="item-info">
                                <div class="recommend-badge">🔥 热门</div>
                                <h3>{{ item.name }}</h3>
                                <p>{{ item.description }}</p>
                                <div class="item-price">需要 {{ item.points }} 积分</div>
                            </div>
                            <button @click="handleExchange(item)" class="exchange-btn"
                                :disabled="store.currentPoints < item.points">
                                {{ store.currentPoints < item.points ? '积分不足' : '立即兑换' }} </button>
                        </div>
                    </div>
                </div>

                <!-- 所有兑换项 -->
                <h3 class="section-title">🛍️ 全部商品</h3>
                <div class="exchange-items">
                    <div v-for="item in store.exchangeItems" :key="item.id" class="exchange-item"
                        :class="{ 'affordable': store.currentPoints >= item.points, 'unavailable': store.currentPoints < item.points }">
                        <div class="item-info">
                            <h3>{{ item.name }}</h3>
                            <p>{{ item.description }}</p>
                            <div class="item-price">需要 {{ item.points }} 积分</div>
                        </div>
                        <button @click="handleExchange(item)" class="exchange-btn"
                            :disabled="store.currentPoints < item.points">
                            {{ store.currentPoints < item.points ? '积分不足' : '立即兑换' }} </button>
                    </div>
                </div>
            </div>

            <!-- 积分记录按钮 -->
            <div class="view-records-section">
                <button @click="showRecordsPopup = true" class="view-records-btn">
                    📊 查看积分记录
                </button>
            </div>
        </div>

        <!-- 积分记录弹窗 -->
        <div v-if="showRecordsPopup" class="records-popup-overlay" @click="showRecordsPopup = false">
            <div class="records-popup-content" @click.stop>
                <div class="popup-header">
                    <h2>📊 我的积分记录</h2>
                    <button class="close-btn" @click="showRecordsPopup = false">✕</button>
                </div>

                <!-- 筛选按钮 -->
                <div class="filter-buttons">
                    <button v-for="filter in ['all', 'task', 'exchange']" :key="filter" @click="selectedFilter = filter"
                        :class="['filter-btn', { active: selectedFilter === filter }]">
                        {{ filter === 'all' ? '全部' : filter === 'task' ? '任务' : '兑换' }}
                    </button>
                </div>

                <div v-if="filteredRecords.length === 0" class="no-records">
                    <div class="empty-icon">📝</div>
                    <p>暂无积分记录</p>
                    <p class="hint">完成任务获取第一笔积分吧！</p>
                </div>

                <div v-else class="records-popup-list">
                    <div v-for="record in filteredRecords" :key="record.id" class="record-popup-item"
                        :class="record.points > 0 ? 'positive' : 'negative'">
                        <div class="record-icon">
                            {{ record.points > 0 ? '🎯' : '🛍️' }}
                        </div>
                        <div class="record-popup-info">
                            <div class="record-popup-date">{{ formatDate(record.date) }}</div>
                            <div class="record-popup-description">{{ record.description }}</div>
                        </div>
                        <div class="record-popup-points" :class="record.points > 0 ? 'positive' : 'negative'">
                            {{ record.points > 0 ? '+' : '' }}{{ record.points }}
                        </div>
                    </div>
                </div>

                <div class="popup-footer">
                    <button @click="showRecordsPopup = false" class="close-popup-btn">关闭</button>
                </div>
            </div>
        </div>

        <!-- 兑换成功弹窗 -->
        <div v-if="showExchangePopup" class="custom-popup-overlay" @click="showExchangePopup = false">
            <div class="custom-popup-content" @click.stop>
                <div class="popup-icon">{{ exchangePopupIcon }}</div>
                <div class="popup-message">{{ exchangePopupMessage }}</div>
                <!-- 积分变动动画 -->
                <transition name="point-change">
                    <div v-if="showPointChange" class="point-change-animation">
                        {{ pointChangeText }}
                    </div>
                </transition>
                <button class="popup-btn" @click="showExchangePopup = false">太棒了！</button>
            </div>
        </div>

        <!-- 背包弹窗 -->
        <div v-if="showBackpackPopup" class="backpack-popup-overlay" @click="showBackpackPopup = false">
            <div class="backpack-popup-content" @click.stop>
                <div class="popup-header">
                    <h2>🎒 我的背包</h2>
                    <button class="close-btn" @click="showBackpackPopup = false">✕</button>
                </div>

                <div v-if="store.backpackItems.length === 0" class="no-items">
                    <div class="empty-icon">🎒</div>
                    <p>背包空空如也</p>
                    <p class="hint">快去抽奖或兑换喜欢的物品吧！</p>
                </div>

                <div v-else class="backpack-items-list">
                    <div v-for="item in sortedBackpackItems" :key="item.id" class="backpack-item"
                        :class="getRarityClass(item.rarity)">
                        <div class="item-icon">{{ getRarityIcon(item.rarity) }}</div>
                        <div class="rarity-badge">{{ getRarityText(item.rarity) }}</div>
                        <div class="item-details">
                            <h3>{{ item.name }}</h3>
                            <p>{{ item.description }}</p>
                            <div v-if="item.effect" class="item-effect">{{ item.effect }}</div>
                            <div class="acquired-date">获得时间: {{ formatDate(item.acquiredDate) }}</div>
                        </div>
                        <button class="use-item-btn" @click="showUseConfirm = true; selectedItem = item">
                            使用
                        </button>
                    </div>
                </div>

                <div class="popup-footer">
                    <button @click="showBackpackPopup = false" class="close-popup-btn">关闭</button>
                </div>
            </div>
        </div>

        <!-- 使用物品确认弹窗 -->
        <div v-if="showUseConfirm" class="confirm-popup-overlay" @click="showUseConfirm = false">
            <div class="confirm-popup-content" @click.stop>
                <div class="confirm-icon">✨</div>
                <h3>使用物品确认</h3>
                <p v-if="selectedItem">是否立即使用「{{ selectedItem.name }}」？</p>
                <p class="confirm-hint">使用后物品将从背包中移除</p>
                <div class="confirm-buttons">
                    <button class="confirm-cancel" @click="showUseConfirm = false">取消</button>
                    <button class="confirm-use" @click="handleUseItem">确认使用</button>
                </div>
            </div>
        </div>

        <!-- 抽奖弹窗 -->
        <LotteryPopup v-if="store.enableLottery" :visible="showLotteryPopup" @close="showLotteryPopup = false" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, ItemRarity } from '../stores/userStore'
import NavigationTabs from '../components/NavigationTabs.vue'
import LotteryPopup from '../components/LotteryPopup.vue'

const router = useRouter()
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
const showUseConfirm = ref(false)
const selectedItem = ref<any>(null)

// 抽奖弹窗状态
const showLotteryPopup = ref(false)

// 排序后的背包物品（按稀有度排序）
const sortedBackpackItems = computed(() => {
    return store.sortedBackpackItems;
})

// 等级相关计算属性
const currentLevel = computed(() => {
    return Math.floor(store.currentPoints / 100) + 1
})

const pointsToNextLevel = computed(() => {
    const nextLevelPoints = currentLevel.value * 100
    return Math.max(0, nextLevelPoints - store.currentPoints)
})

const levelProgress = computed(() => {
    const currentLevelMin = (currentLevel.value - 1) * 100
    const currentLevelMax = currentLevel.value * 100
    const progress = ((store.currentPoints - currentLevelMin) / (currentLevelMax - currentLevelMin)) * 100
    return Math.min(100, progress)
})

// 推荐物品
const recommendedItems = computed(() => {
    return store.exchangeItems
        .filter(item => store.currentPoints >= item.points && item.points < 500)
        .slice(0, 2)
})

// 获取稀有度样式类
function getRarityClass(rarity?: ItemRarity) {
    if (!rarity) return ''
    return `rarity-${rarity}`
}

// 获取稀有度图标
function getRarityIcon(rarity?: ItemRarity) {
    if (!rarity) return '🎁'

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
            return '🎁'
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


// 登出函数
function handleLogout() {
    store.logout()
    router.push('/')
}

// 积分兑换处理
function handleExchange(item: any) {
    if (store.currentPoints >= item.points) {
        const success = store.exchangeItem(item.id)
        if (success) {
            exchangePopupIcon.value = '🎉'
            exchangePopupMessage.value = `${item.name}兑换成功！已放入背包`
            showExchangePopup.value = true

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
function handleUseItem() {
    if (selectedItem.value) {
        const success = store.useItemFromBackpack(selectedItem.value.id)
        if (success) {
            showUseConfirm.value = false
            showBackpackPopup.value = false
            exchangePopupIcon.value = '✨'
            exchangePopupMessage.value = `${selectedItem.value.name}使用成功！`
            showExchangePopup.value = true
            selectedItem.value = null
        }
    }
}

// 积分记录筛选
const selectedFilter = ref('all')

// 排序积分记录
const filteredRecords = computed(() => {
    let records = [...store.pointRecords]
    // 筛选记录
    if (selectedFilter.value !== 'all') {
        records = records.filter(record => record.type === selectedFilter.value)
    }
    // 排序记录
    return records.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
})

// 格式化日期
function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
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

/* 更丰富的装饰元素 */
.decorations {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

.decoration {
    position: absolute;
    opacity: 0.6;
    animation: float 8s ease-in-out infinite;
}

.decoration.heart {
    top: 10%;
    right: 15%;
    width: 60px;
    height: 60px;
    background-color: #ffb6c1;
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    animation-delay: 0s;
}

.decoration.heart.small {
    top: 25%;
    left: 10%;
    width: 40px;
    height: 40px;
    animation-delay: 1s;
}

.decoration.star {
    top: 30%;
    left: 10%;
    width: 50px;
    height: 50px;
    background-color: #ffd700;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation-delay: 2s;
}

.decoration.star.small {
    bottom: 15%;
    right: 25%;
    width: 30px;
    height: 30px;
    animation-delay: 3s;
}

.decoration.circle {
    bottom: 15%;
    right: 20%;
    width: 70px;
    height: 70px;
    background-color: #ffccda;
    border-radius: 50%;
    animation-delay: 4s;
}

.decoration.cloud {
    top: 5%;
    left: 15%;
    width: 80px;
    height: 50px;
    background-color: #f8f9fa;
    border-radius: 50px 50px 0 0;
    animation-delay: 5s;
}

.decoration.rainbow {
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 50px;
    background: linear-gradient(90deg, #ff7eb3, #ff8fab, #ffb344, #ffe566, #a3d9ff, #c2d9ff);
    border-radius: 100px 100px 0 0;
    opacity: 0.4;
    animation-delay: 6s;
}

.decoration.gift-box {
    bottom: 20%;
    left: 20%;
    width: 60px;
    height: 60px;
    background-color: #ff6b8b;
    position: relative;
    animation-delay: 7s;
}

.decoration.gift-box::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 10px;
    background-color: #ff4757;
}

.decoration.gift-box::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 10px;
    background-color: #ff4757;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(10deg);
    }
}

/* 游戏化头部样式 */
.points-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    padding: 20px 30px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    border: 3px solid #ffd6e0;
}

.points-header h1 {
    color: white;
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.3);
}

/* 头部操作区域 */
.header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: nowrap;
}

/* 背包按钮样式 */
.backpack-btn {
    position: relative;
    padding: 12px 15px;
    background: linear-gradient(135deg, #ffedf2 0%, #ffd6e0 100%);
    color: #ff6b8b;
    border: 2px solid #ffedf2;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 0.9rem;
    /* 稍微减小字体 */
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    white-space: nowrap;
    /* 防止文字换行 */
}

.backpack-btn:hover {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.2);
    border-color: #ff6b8b;
}

.backpack-btn .badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff4757;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.logout-btn {
    padding: 12px 15px;
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    border: 2px solid rgba(255, 255, 255, 0.3);
    font-size: 0.9rem;
    /* 稍微减小字体 */
    white-space: nowrap;
    /* 防止文字换行 */
}

.logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.3);
}

/* 等级进度条 */
.level-progress {
    background: white;
    padding: 20px;
    border-radius: 20px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
    position: relative;
    z-index: 1;
}

.level-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.level-badge {
    background: linear-gradient(135deg, #ffd700, #ffa502);
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1rem;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.next-level-text {
    color: #ff8fab;
    font-size: 0.9rem;
    font-weight: 600;
}

.level-bar {
    height: 15px;
    background-color: #ffedf2;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid #ffd6e0;
}

.level-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff8fab 0%, #ff6b8b 100%);
    transition: width 0.5s ease;
    position: relative;
}

.level-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

/* 积分内容区域 */
.points-content {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

/* 兑换区域 */
.exchange-section {
    background-color: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.1);
    margin-bottom: 30px;
    border: 3px solid #ffedf2;
    position: relative;
    overflow: visible;
}

.exchange-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #ff8fab, #ff6b8b, #ff4757);
}

.exchange-section h2 {
    color: #ff6b8b;
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.5rem;
    text-align: center;
    text-shadow: 1px 1px 0px rgba(255, 107, 139, 0.2);
}

.section-title {
    color: #ff8fab;
    margin: 25px 0 15px 0;
    font-size: 1.3rem;
    border-left: 4px solid #ff6b8b;
    padding-left: 10px;
}

.current-points {
    text-align: center;
    margin-bottom: 30px;
}

.points-display {
    font-size: 1.2rem;
    color: #ff6b8b;
    margin-bottom: 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.points-icon {
    font-size: 1.5rem;
    animation: bounce 2s ease-in-out infinite;
}

.points-amount {
    font-size: 2.5rem;
    font-weight: bold;
    color: #ff4757;
    text-shadow: 2px 2px 0px rgba(255, 107, 139, 0.1);
    animation: pulse 2s ease-in-out infinite;
}

.level-up-hint {
    background: linear-gradient(135deg, #ffedf2, #ffd6e0);
    color: #ff6b8b;
    padding: 10px;
    border-radius: 15px;
    font-weight: 600;
    animation: glow 2s ease-in-out infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }
}

@keyframes glow {

    0%,
    100% {
        box-shadow: 0 0 10px rgba(255, 107, 139, 0.3);
    }

    50% {
        box-shadow: 0 0 20px rgba(255, 107, 139, 0.6);
    }
}

/* 推荐区域 */
.recommended-section {
    margin-bottom: 20px;
}

.recommended-section h3 {
    color: #ff6b8b;
    margin: 0 0 15px 0;
    font-size: 1.2rem;
}

.recommended-items {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    overflow-y: visible;
    padding-top: 20px;
    padding-bottom: 10px;
}

.recommended-items::-webkit-scrollbar {
    height: 6px;
}

.recommended-items::-webkit-scrollbar-thumb {
    background: #ffd6e0;
    border-radius: 10px;
}

.recommended-items::-webkit-scrollbar-track {
    background: #ffedf2;
    border-radius: 10px;
}

/* 兑换项列表 */
.exchange-items {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
}

.exchange-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #fff8fa 0%, #ffedf2 100%);
    padding: 20px;
    border-radius: 16px;
    border: 2px solid #ffedf2;
    transition: all 0.3s ease;
    position: relative;
    overflow: visible;
}

.exchange-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 107, 139, 0.2);
    border-color: #ffb6c1;
}

.exchange-item.recommended {
    background: linear-gradient(135deg, #ffd6e0 0%, #ffb6c1 100%);
    border-color: #ff6b8b;
    animation: recommendedGlow 2s ease-in-out infinite;
}

.exchange-item.affordable {
    border-color: #ff6b8b;
}

.exchange-item.unavailable {
    opacity: 0.7;
    filter: grayscale(20%);
}

@keyframes recommendedGlow {

    0%,
    100% {
        box-shadow: 0 4px 15px rgba(255, 107, 139, 0.3);
    }

    50% {
        box-shadow: 0 4px 25px rgba(255, 107, 139, 0.5);
    }
}

.recommend-badge {
    position: absolute;
    top: -16px;
    right: -8px;
    background: #ff4757;
    color: white;
    padding: 6px 16px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: bold;
    z-index: 9999;
}

.item-info {
    flex: 1;
}

.item-info h3 {
    margin: 0 0 8px 0;
    color: #ff6b8b;
    font-size: 1.2rem;
    font-weight: bold;
}

.item-info p {
    margin: 0 0 8px 0;
    color: #ff8fab;
    font-size: 0.9rem;
}

.item-price {
    font-weight: 600;
    color: #ff4757;
    font-size: 1.1rem;
}

.exchange-btn {
    padding: 12px 25px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
    margin-top: 10px;
    flex-shrink: 0;
}

.exchange-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
    background: linear-gradient(135deg, #ff6b8b 0%, #ff4757 100%);
}

.exchange-btn:disabled {
    background-color: #ffd6e0;
    cursor: not-allowed;
    box-shadow: none;
    color: #ff8fab;
}

/* 查看积分记录按钮 */
.view-records-section {
    text-align: center;
}

.view-records-btn {
    width: 100%;
    padding: 15px 20px;
    background: linear-gradient(135deg, #ffedf2 0%, #ffd6e0 100%);
    color: #ff6b8b;
    border: 2px solid #ffedf2;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 1.1rem;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
}

.view-records-btn:hover {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.2);
    border-color: #ff6b8b;
}

/* 积分记录弹窗 */
.records-popup-overlay {
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

.records-popup-content {
    background-color: white;
    padding: 0;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    border: 3px solid #ffedf2;
    animation: slideIn 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

/* 筛选按钮 */
.filter-buttons {
    display: flex;
    padding: 15px 20px;
    gap: 8px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.filter-btn {
    padding: 8px 16px;
    border: 1px solid #dee2e6;
    border-radius: 20px;
    background-color: white;
    color: #495057;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-btn:hover {
    border-color: #ff8fab;
    color: #ff6b8b;
}

.filter-btn.active {
    background-color: #ff8fab;
    border-color: #ff8fab;
    color: white;
    box-shadow: 0 2px 8px rgba(255, 138, 171, 0.3);
}

/* 背包弹窗样式 */
.backpack-popup-overlay {
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

.backpack-popup-content {
    background-color: white;
    padding: 0;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    border: 3px solid #ffedf2;
    animation: slideIn 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

/* 弹窗头部 */
.popup-header {
    padding: 20px 25px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 17px 17px 0 0;
    position: relative;
    z-index: 1;
}

.popup-header h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.3);
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1) rotate(90deg);
}

/* 背包物品列表 */
.backpack-items-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.backpack-item {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 16px;
    margin-bottom: 15px;
    background: linear-gradient(135deg, #fff8fa 0%, #ffedf2 100%);
    border: 2px solid #ffedf2;
    transition: all 0.3s ease;
    position: relative;
}

.backpack-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.2);
    border-color: #ffb6c1;
}

.item-icon {
    font-size: 2.5rem;
    margin-right: 20px;
    flex-shrink: 0;
    animation: bounce 2s ease-in-out infinite;
}

.item-details {
    flex: 1;
}

.item-details h3 {
    margin: 0 0 8px 0;
    color: #ff6b8b;
    font-size: 1.2rem;
}

.item-details p {
    margin: 0 0 8px 0;
    color: #ff8fab;
    font-size: 0.9rem;
}

.acquired-date {
    font-size: 0.8rem;
    color: #ffb6c1;
}

.use-item-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
    margin-left: 15px;
    flex-shrink: 0;
}

.use-item-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
    background: linear-gradient(135deg, #ff6b8b 0%, #ff4757 100%);
}

/* 无物品状态 */
.no-items {
    text-align: center;
    padding: 60px 20px;
    color: #ffb6c1;
}

.no-items .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: bounce 1s ease-in-out infinite;
}

.no-items p {
    margin: 0 0 10px 0;
    font-size: 1.2rem;
}

.no-items .hint {
    font-size: 1rem;
    color: #ffd6e0;
}

/* 无记录状态 */
.no-records {
    text-align: center;
    padding: 60px 20px;
    color: #ffb6c1;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    animation: bounce 1s ease-in-out infinite;
}

.no-records p {
    margin: 0;
    font-size: 1.1rem;
}

.no-records .hint {
    font-size: 1rem;
    color: #ffd6e0;
    margin-top: 10px;
}

/* 使用确认弹窗 */
.confirm-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 138, 171, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
    animation: fadeIn 0.3s ease;
}

.confirm-popup-content {
    background-color: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    max-width: 400px;
    width: 85%;
    text-align: center;
    border: 3px solid #ffedf2;
    animation: bounceIn 0.3s ease;
}

.confirm-icon {
    font-size: 3rem;
    margin-bottom: 20px;
    animation: pulse 2s ease-in-out infinite;
}

.confirm-popup-content h3 {
    color: #ff6b8b;
    margin: 0 0 15px 0;
    font-size: 1.3rem;
}

.confirm-popup-content p {
    color: #ff8fab;
    margin: 0 0 10px 0;
    font-size: 1rem;
}

.confirm-hint {
    font-size: 0.9rem !important;
    color: #ffb6c1 !important;
}

.confirm-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 25px;
}

.confirm-cancel {
    padding: 12px 25px;
    background-color: #ffedf2;
    color: #ff6b8b;
    border: 2px solid #ffd6e0;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.confirm-cancel:hover {
    background-color: #ffd6e0;
    transform: translateY(-1px);
}

.confirm-use {
    padding: 12px 25px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
}

.confirm-use:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
    background: linear-gradient(135deg, #ff6b8b 0%, #ff4757 100%);
}

/* 弹窗底部 */
.popup-footer {
    padding: 20px;
    text-align: center;
    border-top: 2px solid #ffedf2;
}

.close-popup-btn {
    padding: 12px 30px;
    background: linear-gradient(135deg, #ffedf2 0%, #ffd6e0 100%);
    color: #ff6b8b;
    border: 2px solid #ffedf2;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.close-popup-btn:hover {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
    border-color: #ff6b8b;
}

/* 抽奖按钮样式 */
.lottery-btn {
    padding: 12px 15px;
    background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
    color: white;
    border: 2px solid #ffedf2;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(254, 202, 87, 0.2);
    white-space: nowrap;
    /* 防止文字换行 */
}

.lottery-btn:hover {
    background: linear-gradient(135deg, #ff9ff3 0%, #feca57 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(254, 202, 87, 0.3);
}

/* 背包物品稀有度样式 */
.backpack-item.rarity-common {
    background-color: #f8f9fa;
    border: 2px solid #e9ecef;
}

.backpack-item.rarity-rare {
    background-color: #e7f3ff;
    border: 2px solid #1976d2;
    position: relative;
    animation: rareGlow 2s ease-in-out infinite;
}

.backpack-item.rarity-epic {
    background-color: #f3e5f5;
    border: 2px solid #7b1fa2;
    position: relative;
    animation: epicGlow 2s ease-in-out infinite;
}

.backpack-item.rarity-legendary {
    background-color: #fff3e0;
    border: 2px solid #ff6f00;
    position: relative;
    animation: legendaryGlow 2s ease-in-out infinite;
}

/* 稀有度徽章 */
.rarity-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #ff6b81;
    color: white;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: bold;
    z-index: 1;
}

.rarity-rare .rarity-badge {
    background-color: #1976d2;
}

.rarity-epic .rarity-badge {
    background-color: #7b1fa2;
}

.rarity-legendary .rarity-badge {
    background-color: #ff6f00;
    animation: legendaryBadgeGlow 1s ease-in-out infinite;
}

/* 物品效果文本 */
.item-effect {
    color: #ff6b81;
    font-style: italic;
    margin-top: 5px;
    font-size: 14px;
}

/* 发光动画 */
@keyframes rareGlow {
    0% {
        box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
    }

    50% {
        box-shadow: 0 0 15px rgba(25, 118, 210, 0.6);
    }

    100% {
        box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
    }
}

@keyframes epicGlow {
    0% {
        box-shadow: 0 0 5px rgba(123, 31, 162, 0.3);
    }

    50% {
        box-shadow: 0 0 15px rgba(123, 31, 162, 0.6);
    }

    100% {
        box-shadow: 0 0 5px rgba(123, 31, 162, 0.3);
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

@keyframes legendaryBadgeGlow {
    0% {
        box-shadow: 0 0 5px rgba(255, 111, 0, 0.7);
    }

    50% {
        box-shadow: 0 0 10px rgba(255, 111, 0, 1);
    }

    100% {
        box-shadow: 0 0 5px rgba(255, 111, 0, 0.7);
    }
}

/* 调整背包物品布局以适应稀有度徽章 */
.backpack-item {
    position: relative;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    transition: transform 0.3s, box-shadow 0.3s;
}

.backpack-item:hover {
    transform: translateY(-2px);
}

/* 自定义弹窗 */
.custom-popup-overlay {
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

.custom-popup-content {
    background-color: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    text-align: center;
    border: 3px solid #ffedf2;
    animation: bounceIn 0.3s ease;
    position: relative;
}

.records-popup-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.record-popup-item {
    display: flex;
    align-items: center;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 12px;
    background-color: #f9f9f9;
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
}

.record-popup-item:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.record-popup-item.positive {
    border-left-color: #4CAF50;
    background-color: #f1f8e9;
}

.record-popup-item.negative {
    border-left-color: #f44336;
    background-color: #ffebee;
}

.record-icon {
    font-size: 24px;
    margin-right: 15px;
    flex-shrink: 0;
}

.record-popup-info {
    flex: 1;
}

.record-popup-date {
    font-size: 0.85rem;
    color: #888;
    margin-bottom: 4px;
}

.record-popup-description {
    font-size: 0.95rem;
    color: #333;
    font-weight: 500;
}

.record-popup-points {
    font-size: 1.1rem;
    font-weight: bold;
    flex-shrink: 0;
}

.record-popup-points.positive {
    color: #4CAF50;
}

.record-popup-points.negative {
    color: #f44336;
}

.popup-icon {
    font-size: 3.5rem;
    margin-bottom: 20px;
    animation: pulse 2s ease-in-out infinite;
}

.popup-message {
    color: #ff6b8b;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 15px;
}

.point-change-animation {
    background: #ff6b8b;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: bold;
    margin-bottom: 20px;
}

.point-change-enter-active,
.point-change-leave-active {
    transition: all 0.5s ease;
}

.point-change-enter-from {
    transform: scale(0);
    opacity: 0;
}

.point-change-leave-to {
    transform: translateY(-30px);
    opacity: 0;
}

.popup-btn {
    padding: 12px 30px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
}

.popup-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
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

@keyframes bounceIn {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    70% {
        transform: scale(1.1);
        opacity: 1;
    }

    100% {
        transform: scale(1);
    }
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-15px);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .points-container {
        padding: 15px;
    }

    .points-header {
        flex-direction: column;
        gap: 15px;
        padding: 15px 20px;
    }

    .header-actions {
        flex-wrap: wrap;
        justify-content: center;
    }

    /* 小屏幕下进一步调整按钮样式 */
    .lottery-btn,
    .backpack-btn,
    .logout-btn {
        font-size: 0.8rem;
        padding: 10px 12px;
    }

    .backpack-btn,
    .logout-btn {
        flex: 1;
        text-align: center;
    }

    .level-info {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .exchange-section {
        padding: 20px;
    }

    .exchange-item {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }

    .use-item-btn {
        margin-left: 0;
        width: 100%;
    }

    .backpack-item {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }

    .item-icon {
        margin-right: 0;
    }

    .points-amount {
        font-size: 2rem;
    }
}

@media (max-width: 480px) {
    .header-actions {
        flex-direction: column;
        width: 100%;
    }

    .lottery-btn,
    .backpack-btn,
    .logout-btn {
        width: 100%;
        text-align: center;
        padding: 12px;
        font-size: 0.9rem;
    }
}
</style>