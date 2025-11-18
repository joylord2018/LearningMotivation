<template>
    <div class="leaderboard-container">
        <!-- 装饰元素 -->
        <div class="decorations">
            <div class="decoration heart"></div>
            <div class="decoration heart small"></div>
            <div class="decoration star"></div>
            <div class="decoration star small"></div>
            <div class="decoration cloud"></div>
            <div class="decoration rainbow"></div>
            <div class="decoration gift-box"></div>
        </div>

        <!-- 头部 -->
        <header class="leaderboard-header">
            <h1>🏆 积分排行榜</h1>
            <div class="header-actions">
                <div class="logout-btn" @click="handleLogout">退出登录</div>
            </div>
        </header>

        <NavigationTabs />

        <!-- 排行榜内容 -->
        <div class="leaderboard-content">
            <!-- 我的排名卡片 -->
            <div class="my-rank-card">
                <div class="card-header">
                    <h2>🎀 我的排名</h2>
                </div>
                <div class="my-rank-info">
                    <div class="rank-number">{{ myRank }}</div>
                    <div class="my-info">
                        <div class="my-avatar">
                            {{ myUser.avatar }}
                        </div>
                        <div class="my-details">
                            <div class="my-name">{{ myUser.nickname || '匿名用户' }}</div>
                            <div class="my-points">积分：{{ myUser.points }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 排行榜列表 -->
            <div class="rankings-list">
                <h2 class="rankings-title">🌟 积分排行榜</h2>
                <div class="rank-items">
                    <div 
                        v-for="(user, index) in topUsers" 
                        :key="user.id"
                        :class="['rank-item', {
                            'top-3': index < 3,
                            'my-rank': user.id === myUser.id
                        }]"
                    >
                        <!-- 排名数字 -->
                        <div class="rank-number">
                            <div v-if="index < 3" class="medal">
                                {{ index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉' }}
                            </div>
                            <div v-else class="normal-rank">{{ index + 1 }}</div>
                        </div>
                        
                        <!-- 用户信息 -->
                        <div class="user-info">
                            <div class="user-avatar">{{ user.avatar }}</div>
                            <div class="user-details">
                                <div class="user-name">{{ user.nickname }}</div>
                                <div class="user-level">Lv.{{ user.level }}</div>
                            </div>
                        </div>
                        
                        <!-- 用户积分 -->
                        <div class="user-points">
                            <span class="points-text">{{ user.points }}</span>
                            <span class="points-unit">积分</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationTabs from '@/components/NavigationTabs.vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const store = useUserStore()

// 模拟用户数据（实际项目中应该从后端获取）
const users = ref([
    { id: 'user-1', nickname: '小草莓', avatar: '🍓', points: 1500, level: 12 },
    { id: 'user-2', nickname: '小樱花', avatar: '🌸', points: 1250, level: 10 },
    { id: 'user-3', nickname: '小云朵', avatar: '☁️', points: 1000, level: 8 },
    { id: 'user-4', nickname: '小彩虹', avatar: '🌈', points: 950, level: 7 },
    { id: 'user-5', nickname: '小月亮', avatar: '🌙', points: 880, level: 7 },
    { id: 'user-6', nickname: '小星星', avatar: '⭐', points: 820, level: 6 },
    { id: 'user-7', nickname: '小爱心', avatar: '❤️', points: 750, level: 6 },
    { id: 'user-8', nickname: '小太阳', avatar: '☀️', points: 680, level: 5 },
    { id: 'user-9', nickname: '小雪花', avatar: '❄️', points: 620, level: 5 },
    { id: 'user-10', nickname: '小薄荷', avatar: '🍃', points: 550, level: 4 },
])

// 排序用户（从高到低）
const topUsers = computed(() => {
    return [...users.value].sort((a, b) => b.points - a.points)
})

// 我的用户数据
const myUser = ref({
    id: 'user-current',
    nickname: '当前用户',
    avatar: '😊',
    points: store.currentPoints,
    level: 5
})

// 计算我的排名
const myRank = computed(() => {
    const sorted = [...topUsers.value, myUser.value].sort((a, b) => b.points - a.points)
    return sorted.findIndex(user => user.id === myUser.value.id) + 1
})

// 退出登录
function handleLogout() {
    // 退出登录逻辑
    router.push('/login')
}
</script>

<style scoped>
.leaderboard-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #fff0f5 0%, #ffe4e1 50%, #ffebcd 100%);
    position: relative;
    overflow: hidden;
}

/* 装饰元素 */
.decorations {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

.decoration {
    position: absolute;
    opacity: 0.3;
    animation: float 20s infinite;
}

.decoration.heart {
    width: 50px;
    height: 50px;
    background: radial-gradient(circle at 30% 30%, #ff6b8b 0%, #ff8fab 70%);
    border-radius: 50%;
    top: 20%;
    left: 10%;
}

.decoration.heart.small {
    width: 20px;
    height: 20px;
    top: 15%;
    left: 85%;
    animation-delay: 5s;
}

.decoration.star {
    width: 60px;
    height: 60px;
    background: radial-gradient(circle at 30% 30%, #ffd700 0%, #ffed4e 70%);
    border-radius: 50%;
    top: 50%;
    left: 5%;
    animation-delay: 2s;
}

.decoration.star.small {
    width: 30px;
    height: 30px;
    top: 80%;
    left: 90%;
    animation-delay: 8s;
}

.decoration.cloud {
    width: 100px;
    height: 50px;
    background: white;
    border-radius: 50px;
    top: 30%;
    left: 80%;
    animation-delay: 4s;
}

.decoration.rainbow {
    width: 80px;
    height: 80px;
    background: conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff, #ff0000);
    border-radius: 50%;
    top: 70%;
    left: 50%;
    animation-delay: 6s;
}

.decoration.gift-box {
    width: 70px;
    height: 70px;
    background: radial-gradient(circle at 30% 30%, #ffb6c1 0%, #ffc0cb 70%);
    border-radius: 10px;
    top: 10%;
    left: 50%;
    animation-delay: 3s;
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
}

/* 头部 */
.leaderboard-header {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
    background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
    box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
}

.leaderboard-header h1 {
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.logout-btn {
    color: white;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
}

.logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

/* 内容区域 */
.leaderboard-content {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
}

/* 我的排名卡片 */
.my-rank-card {
    background: linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(255, 182, 193, 0.3);
    margin-bottom: 40px;
    text-align: center;
}

.my-rank-card .card-header h2 {
    color: #ff69b4;
    font-size: 2rem;
    margin-bottom: 20px;
    text-shadow: 1px 1px 2px rgba(255, 105, 180, 0.3);
}

.my-rank-info {
    display: flex;
    align-items: center;
    justify-content: center;
}

.my-rank-info .rank-number {
    font-size: 4rem;
    font-weight: bold;
    color: #ff1493;
    margin-right: 40px;
    text-shadow: 2px 2px 4px rgba(255, 20, 147, 0.3);
}

.my-info {
    display: flex;
    align-items: center;
}

.my-avatar {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    margin-right: 20px;
    box-shadow: 0 4px 12px rgba(255, 182, 193, 0.4);
}

.my-details .my-name {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ff69b4;
    margin-bottom: 10px;
}

.my-details .my-points {
    font-size: 1.2rem;
    color: #ff1493;
    font-weight: bold;
}

/* 排行榜列表 */
.rankings-title {
    color: #ff69b4;
    font-size: 2.5rem;
    margin-bottom: 30px;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(255, 105, 180, 0.3);
}

.rank-items {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(255, 182, 193, 0.3);
}

/* 排名项 */
.rank-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 15px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
}

.rank-item:hover {
    background: rgba(255, 182, 193, 0.2);
    transform: translateY(-2px);
}

/* 前3名样式 */
.rank-item.top-3 {
    background: linear-gradient(135deg, #fffaf0 0%, #ffe4b5 100%);
    padding: 20px;
    margin-bottom: 20px;
}

/* 我的排名样式 */
.rank-item.my-rank {
    background: linear-gradient(135deg, #fff0f5 0%, #ffb6c1 100%);
    border: 2px solid #ff69b4;
}

/* 排名数字 */
.rank-number {
    width: 80px;
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
}

.medal {
    font-size: 3rem;
}

.normal-rank {
    color: #ff69b4;
    text-shadow: 1px 1px 2px rgba(255, 105, 180, 0.3);
}

/* 用户信息 */
.user-info {
    display: flex;
    align-items: center;
    flex: 1;
    margin-left: 20px;
}

.user-avatar {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    margin-right: 15px;
    box-shadow: 0 2px 8px rgba(255, 182, 193, 0.3);
}

.user-details {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.user-name {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
}

.user-level {
    font-size: 0.9rem;
    color: #ff69b4;
}

/* 用户积分 */
.user-points {
    text-align: right;
}

.points-text {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ff1493;
    text-shadow: 1px 1px 2px rgba(255, 20, 147, 0.3);
}

.points-unit {
    font-size: 0.9rem;
    color: #ff69b4;
}
</style>