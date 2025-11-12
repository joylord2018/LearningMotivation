<template>
    <div class="points-container">
        <!-- 装饰元素 -->
        <div class="decorations">
            <div class="decoration heart"></div>
            <div class="decoration star"></div>
            <div class="decoration circle"></div>
        </div>

        <header class="points-header">
            <h1>🏆 我的积分</h1>
            <div class="logout-btn" @click="handleLogout">退出登录</div>
        </header>

        <div class="nav-tabs">
            <button class="tab-btn" @click="navigateTo('/tasks')">任务</button>
            <button class="tab-btn active" @click="navigateTo('/points')">积分</button>
            <button class="tab-btn" @click="navigateTo('/admin')">管理</button>
        </div>

        <div class="points-content">
            <!-- 积分兑换 -->
            <div class="exchange-section">
                <h2>🎁 积分兑换</h2>
                <div class="current-points">
                    当前拥有积分: <span class="points-amount">{{ store.currentPoints }}</span>
                </div>
                <div class="exchange-items">
                    <div v-for="item in store.exchangeItems" :key="item.id" class="exchange-item">
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
                
                <div v-if="sortedRecords.length === 0" class="no-records">
                    <div class="empty-icon">📝</div>
                    <p>暂无积分记录</p>
                </div>
                
                <div v-else class="records-popup-list">
                    <div v-for="record in sortedRecords" :key="record.id" 
                         class="record-popup-item" :class="record.points > 0 ? 'positive' : 'negative'">
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
                <button class="popup-btn" @click="showExchangePopup = false">太棒了！</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 脚本部分保持不变
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const store = useUserStore()

// 弹窗状态
const showRecordsPopup = ref(false)
const showExchangePopup = ref(false)
const exchangePopupMessage = ref('')
const exchangePopupIcon = ref('🎉')

// 导航到其他页面
function navigateTo(route: string) {
    router.push(route)
}

// 按日期排序的积分记录
const sortedRecords = computed(() => {
    return [...store.pointRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// 格式化日期
function formatDate(dateString: string) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 处理积分兑换
function handleExchange(item: any) {
    if (store.currentPoints >= item.points) {
        if (confirm(`确定要花费 ${item.points} 积分兑换 ${item.name} 吗？`)) {
            const success = store.exchangeItem(item.id)
            if (success) {
                exchangePopupMessage.value = `兑换成功！已获得 ${item.name}`
                exchangePopupIcon.value = '🎁'
                showExchangePopup.value = true
            }
        }
    } else {
        exchangePopupMessage.value = '积分不足，无法兑换'
        exchangePopupIcon.value = '😔'
        showExchangePopup.value = true
    }
}

// 处理登出
function handleLogout() {
    store.logout()
    localStorage.removeItem('isLoggedIn')
    router.push('/')
}
</script>

<style scoped>
.points-container {
    min-height: 100vh;
    background-color: #fff5f7;
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
    opacity: 0.3;
}

.heart {
    top: 15%;
    right: 8%;
    width: 120px;
    height: 120px;
    background-color: #ffb6c1;
    border-radius: 50% 50% 0 0;
    transform: rotate(45deg);
    animation: float 8s ease-in-out infinite;
}

.star {
    bottom: 20%;
    left: 10%;
    width: 80px;
    height: 80px;
    background-color: #ffda6a;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation: float 6s ease-in-out infinite;
    animation-delay: 1s;
}

.circle {
    top: 60%;
    right: 15%;
    width: 100px;
    height: 100px;
    background-color: #b5ead7;
    border-radius: 50%;
    animation: float 10s ease-in-out infinite;
    animation-delay: 2s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0) rotate(0);
    }

    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

.points-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
}

.points-header h1 {
    color: #ff6b8b;
    font-size: 1.8rem;
    margin: 0;
    font-weight: 700;
}

.logout-btn {
    padding: 8px 16px;
    background-color: #ff8fab;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(255, 138, 171, 0.3);
}

.logout-btn:hover {
    background-color: #ff6b8b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
}

.nav-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    background-color: white;
    padding: 10px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
}

.tab-btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    background-color: #fff0f5;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #ff8fab;
    font-weight: 600;
    font-size: 1rem;
}

.tab-btn.active {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
}

.tab-btn:hover:not(.active) {
    background-color: #ffedf2;
    transform: translateY(-1px);
}

.points-content {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.exchange-section, 
.view-records-section {
    background-color: white;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
}

.exchange-section h2 {
    margin: 0 0 20px 0;
    color: #ff6b8b;
    font-size: 1.5rem;
    font-weight: 700;
}

.current-points {
    text-align: center;
    font-size: 1.2rem;
    color: #ff8fab;
    margin-bottom: 20px;
    font-weight: 600;
}

.points-amount {
    font-size: 1.8rem;
    color: #ff6b8b;
    font-weight: bold;
    margin: 0 8px;
}

.exchange-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}

.exchange-item {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    background-color: #fff8fa;
    border-radius: 16px;
    transition: all 0.3s ease;
    border: 2px solid #ffedf2;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.05);
    position: relative;
    overflow: hidden;
}

.exchange-item::before {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    width: 60px;
    height: 60px;
    background-color: rgba(255, 107, 139, 0.1);
    border-radius: 50%;
}

.exchange-item:hover {
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.15);
    transform: translateY(-2px);
}

.item-info h3 {
    margin: 0 0 8px 0;
    color: #ff6b8b;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.item-info p {
    margin: 0 0 10px 0;
    color: #ff8fab;
    font-size: 0.95rem;
}

.item-price {
    font-weight: bold;
    color: #ff6b8b;
    font-size: 1.1rem;
}

.exchange-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
    margin-top: 10px;
}

.exchange-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
}

.exchange-btn:disabled {
    background-color: #ffd6e0;
    cursor: not-allowed;
    box-shadow: none;
}

/* 查看积分记录按钮样式 */
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

/* 积分记录弹窗样式 */
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
    transform: scale(1.1);
}

/* 弹窗记录列表 */
.records-popup-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.record-popup-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 16px;
    margin-bottom: 12px;
    background-color: #fff8fa;
    border: 2px solid #ffedf2;
    position: relative;
    transition: all 0.3s ease;
}

.record-popup-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
}

.record-popup-item.positive {
    border-color: #ffedf2;
}

.record-popup-item.negative {
    border-color: #ffd6e0;
}

.record-icon {
    font-size: 1.8rem;
    margin-right: 15px;
    flex-shrink: 0;
}

.record-popup-info {
    flex: 1;
}

.record-popup-date {
    color: #ff99b3;
    font-size: 0.85rem;
    margin-bottom: 5px;
}

.record-popup-description {
    color: #ff6b8b;
    font-weight: 500;
    font-size: 0.95rem;
}

.record-popup-points {
    font-weight: bold;
    font-size: 1.1rem;
    min-width: 60px;
    text-align: right;
}

.record-popup-item.positive .record-popup-points {
    color: #ff6b8b;
}

.record-popup-item.negative .record-popup-points {
    color: #ff8fab;
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

/* 弹窗底部 */
.popup-footer {
    padding: 20px;
    text-align: center;
    border-top: 2px solid #ffedf2;
}

.close-popup-btn {
    padding: 12px 30px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
}

.close-popup-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.4);
}

/* 兑换成功弹窗样式 */
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
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    text-align: center;
    max-width: 350px;
    width: 90%;
    border: 3px solid #ffedf2;
    animation: slideIn 0.3s ease;
    position: relative;
    overflow: hidden;
}

/* 弹窗内部装饰 */
.custom-popup-content::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 80px;
    height: 80px;
    background-color: rgba(255, 203, 219, 0.2);
    border-radius: 50%;
}

.custom-popup-content::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: -15px;
    width: 60px;
    height: 60px;
    background-color: rgba(255, 203, 219, 0.2);
    border-radius: 50%;
}

.popup-icon {
    font-size: 4rem;
    margin-bottom: 15px;
    animation: bounce 0.6s ease-in-out infinite;
}

.popup-message {
    font-size: 1.2rem;
    color: #ff6b8b;
    margin-bottom: 20px;
    font-weight: 600;
    position: relative;
    z-index: 1;
}

.popup-btn {
    padding: 12px 25px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
    position: relative;
    z-index: 1;
}

.popup-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.4);
}

.popup-btn:active {
    transform: translateY(0);
}

/* 滚动条样式 */
.records-popup-list::-webkit-scrollbar {
    width: 8px;
}

.records-popup-list::-webkit-scrollbar-track {
    background: #fff0f5;
    border-radius: 4px;
}

.records-popup-list::-webkit-scrollbar-thumb {
    background: #ffb6c1;
    border-radius: 4px;
}

.records-popup-list::-webkit-scrollbar-thumb:hover {
    background: #ff8fab;
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
        transform: translateY(-30px) scale(0.9);
        opacity: 0;
    }
    to {
        transform: translateY(0) scale(1);
        opacity: 1;
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

/* 手机适配 */
@media (max-width: 768px) {
    .points-container {
        padding: 10px;
    }

    .points-header {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .points-header h1 {
        font-size: 1.5rem;
    }

    .nav-tabs {
        flex-direction: column;
    }

    .exchange-items {
        grid-template-columns: 1fr;
    }

    .records-popup-content {
        width: 95%;
        max-height: 90vh;
    }

    .record-popup-item {
        flex-direction: column;
        text-align: center;
        gap: 10px;
    }

    .record-icon {
        margin-right: 0;
    }

    .record-popup-points {
        min-width: auto;
        text-align: center;
    }
}
</style>