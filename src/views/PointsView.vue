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

            <!-- 积分记录 -->
            <div class="points-history">
                <h2>📊 积分记录</h2>
                <div v-if="sortedRecords.length === 0" class="no-records">暂无积分记录</div>
                <div v-else class="records-list">
                    <div v-for="record in sortedRecords" :key="record.id" class="record-item">
                        <div class="record-info">
                            <div class="record-date">{{ formatDate(record.date) }}</div>
                            <div class="record-description">{{ record.description }}</div>
                        </div>
                        <div class="record-points" :class="record.points > 0 ? 'positive' : 'negative'">
                            {{ record.points > 0 ? '+' : '' }}{{ record.points }}
                        </div>
                    </div>
                </div>
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
                alert(`兑换成功！已获得 ${item.name}`)
            }
        }
    } else {
        alert('积分不足，无法兑换')
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
.points-history {
    background-color: white;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
}

.exchange-section h2,
.points-history h2 {
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

.records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
}

.record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-radius: 16px;
    transition: all 0.3s ease;
    border: 2px solid;
    background-color: #fff8fa;
    position: relative;
    overflow: hidden;
}

.record-item::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    border-radius: 16px 0 0 16px;
}

.record-item.positive {
    border-color: #ffedf2;
}

.record-item.positive::after {
    background-color: #ff6b8b;
}

.record-item.negative {
    border-color: #ffd6e0;
}

.record-item.negative::after {
    background-color: #ff8fab;
}

.record-date {
    color: #ff99b3;
    font-size: 0.85rem;
    min-width: 120px;
}

.record-description {
    flex: 1;
    margin: 0 15px;
    color: #ff6b8b;
    font-weight: 500;
}

.record-points {
    font-weight: bold;
    font-size: 1.1rem;
    min-width: 50px;
    text-align: right;
}

.record-item.positive .record-points {
    color: #ff6b8b;
}

.record-item.negative .record-points {
    color: #ff8fab;
}

.no-records {
    text-align: center;
    color: #ffb6c1;
    padding: 40px;
    font-size: 1rem;
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

    .record-item {
        flex-direction: column;
        gap: 8px;
        text-align: center;
    }

    .record-date,
    .record-points {
        min-width: auto;
    }
}
</style>