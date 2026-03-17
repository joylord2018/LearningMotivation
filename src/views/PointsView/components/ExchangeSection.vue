<template>
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

        <!-- 积分记录按钮 -->
        <div class="view-records-section">
            <button @click="openRecordsPopup" class="view-records-btn">
                📊 查看积分记录
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../../../stores/userStore'

const store = useUserStore()

const emit = defineEmits(['exchange', 'openRecords'])

// 等级相关计算属性
const currentLevel = computed(() => {
    return Math.floor(store.currentPoints / 100) + 1
})

const pointsToNextLevel = computed(() => {
    const nextLevelPoints = currentLevel.value * 100
    return Math.max(0, nextLevelPoints - store.currentPoints)
})

// 推荐物品
const recommendedItems = computed(() => {
    return store.exchangeItems
        .filter(item => store.currentPoints >= item.points && item.points < 500)
        .slice(0, 2)
})

// 积分兑换处理
function handleExchange(item: any) {
    emit('exchange', item)
}

// 打开积分记录弹窗
function openRecordsPopup() {
    emit('openRecords')
}
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
    .exchange-section {
        padding: 20px;
    }

    .exchange-item {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }

    .points-amount {
        font-size: 2rem;
    }
}
</style>