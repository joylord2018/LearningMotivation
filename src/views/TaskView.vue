<template>
    <div class="task-container">
        <!-- 可爱的装饰元素 -->
        <div class="decorations">
            <div class="decoration heart"></div>
            <div class="decoration star"></div>
            <div class="decoration circle"></div>
            <div class="decoration cloud"></div>
            <div class="decoration gift"></div>
        </div>

        <header class="task-header">
            <div class="header-content">
                <h1>🎮 今日任务大挑战 🎮</h1>
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

        <div class="task-content">
            <!-- 今日积分展示卡片 -->
            <div class="today-points card">
                <div class="card-header">
                    <h3>🌟 今日已获得积分</h3>
                    <span class="sparkle">✨</span>
                </div>
                <div class="points-value">
                    <span class="points-number">{{ store.todayPoints }}</span>
                    <span class="points-unit">积分</span>
                </div>
                <div class="points-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: pointsProgress + '%' }"></div>
                    </div>
                    <div class="progress-text">{{ pointsProgress }}% 目标完成</div>
                </div>
            </div>

            <!-- 任务列表 -->
            <div class="tasks-section">
                <div class="section-header">
                    <h2>🎯 待完成任务</h2>
                    <div class="task-count">
                        剩余 {{ remainingTasks }} 个任务
                    </div>
                </div>

                <div class="tasks-list">
                    <div v-for="task in store.todayTasks" :key="task.id" class="task-item game-card"
                        :class="{ completed: task.completionLevel }">
                        <div class="task-header-info">
                            <div class="task-title">
                                <span class="task-icon">{{ getTaskIconBySubject(task.subject) }}</span>
                                {{ task.subjectName }} - {{ getTaskNameBySubject(task.subject) }}
                            </div>
                            <div class="task-badge" :class="getDifficultyClass(task.completionLevel)">
                                {{ task.completionLevel ? '已完成' : '待完成' }}
                            </div>
                        </div>

                        <p class="task-description">{{ getTaskDescriptionBySubject(task.subject) }}</p>

                        <div class="task-footer">
                            <div class="task-points">
                                <span class="point-icon">⭐</span>
                                {{ task.completionLevel ? '已获得 ' + task.points + ' 积分' : '完成可得 1-3 积分' }}
                            </div>

                            <div class="task-status">
                                <span v-if="task.completionLevel" class="status-completed">✓ 太棒了！</span>
                                <div v-else class="completion-options">
                                    <button @click="completeTask(task.id, 'low')" class="difficulty-btn easy"
                                        data-difficulty="简单">
                                        😊 简单 (1)
                                    </button>
                                    <button @click="completeTask(task.id, 'medium')" class="difficulty-btn medium"
                                        data-difficulty="中等">
                                        😄 中等 (2)
                                    </button>
                                    <button @click="completeTask(task.id, 'high')" class="difficulty-btn hard"
                                        data-difficulty="困难">
                                        🤩 困难 (3)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 额外奖励提示 -->
            <div class="reward-hint card">
                <div class="reward-icon">🎁</div>
                <div class="reward-text">
                    <strong>每日奖励：</strong>完成所有任务可获得额外5积分奖励！
                </div>
            </div>
        </div>

        <!-- 游戏风格弹窗 -->
        <div v-if="showPopup" class="game-popup-overlay" @click="closePopup">
            <div class="game-popup-content" @click.stop>
                <div class="popup-animation">
                    <div class="popup-icon">{{ popupIcon }}</div>
                    <div class="popup-title">🎉 任务完成！</div>
                    <div class="popup-message">{{ popupMessage }}</div>
                    <div class="popup-points">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import NavigationTabs from '../components/NavigationTabs.vue'

const router = useRouter()
const store = useUserStore()

// 计算当前日期
const currentDate = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
})

// 计算剩余任务数
const remainingTasks = computed(() => {
    return store.todayTasks.filter(task => !task.completionLevel).length
})

// 计算积分进度
const pointsProgress = computed(() => {
    const maxPossiblePoints = store.todayTasks.length * 3
    const currentPoints = store.todayPoints
    return Math.min(Math.round((currentPoints / maxPossiblePoints) * 100), 100)
})

// 弹窗状态
const showPopup = ref(false)
const popupMessage = ref('')
const popupIcon = ref('🎉')
const popupPoints = ref(0)

// 获取任务图标
function getTaskIconBySubject(subject: string): string {
    const icons: { [key: string]: string } = {
        'chinese': '📚',
        'math': '🔢',
        'english': '🗣️'
    }
    return icons[subject] || '📝'
}

// 获取任务名称
function getTaskNameBySubject(subject: string): string {
    const names: { [key: string]: string } = {
        'chinese': '语文任务',
        'math': '数学任务',
        'english': '英语任务'
    }
    return names[subject] || '学习任务'
}

// 获取任务描述
function getTaskDescriptionBySubject(subject: string): string {
    // 首先尝试从今日任务中获取实际的描述
    const todayTask = store.todayTasks.find(task => task.subject === subject);
    if (todayTask && todayTask.description) {
        return todayTask.description;
    }

    // 如果没有从store获取到，使用默认描述
    const descriptions: { [key: string]: string } = {
        'chinese': '阅读一篇文章并理解内容',
        'math': '完成几道数学练习题',
        'english': '练习英语听力和口语'
    }
    return descriptions[subject] || '认真完成今日学习任务'
}

// 获取难度样式类
function getDifficultyClass(completionLevel: string | null): string {
    if (!completionLevel) return 'pending'
    switch (completionLevel) {
        case 'low': return 'easy'
        case 'medium': return 'medium'
        case 'high': return 'hard'
        default: return 'completed'
    }
}

// 完成任务
function completeTask(taskId: string, difficulty: 'low' | 'medium' | 'high') {
    const task = store.tasks.find(t => t.id === taskId)
    if (task && !task.completionLevel) {
        // 计算积分
        const pointsMap = { low: 1, medium: 2, high: 3 }
        const points = pointsMap[difficulty]

        store.updateTaskCompletion(taskId, difficulty)

        // 根据难度显示不同的提示信息
        const messages = {
            low: '🎉 任务轻松完成！',
            medium: '👍 任务完成得不错！',
            high: '💪 任务完成得很出色！'
        }

        const icons = {
            low: '😊',
            medium: '😃',
            high: '🤩'
        }

        popupMessage.value = messages[difficulty]
        popupIcon.value = icons[difficulty]
        popupPoints.value = points
        showPopup.value = true

        // 检查是否完成所有任务
        if (store.todayTasks.every(t => t.completionLevel)) {
            // 延迟显示额外奖励提示
            setTimeout(() => {
                popupMessage.value = '🎉 恭喜完成所有任务！获得额外奖励！'
                popupIcon.value = '🎁'
                popupPoints.value = 5
                showPopup.value = true
            }, 2000)
        }
    }
}

// 关闭弹窗
function closePopup() {
    showPopup.value = false
}

// 处理登出
function handleLogout() {
    store.logout()
    localStorage.removeItem('isLoggedIn')
    router.push('/')
}

// 组件挂载时初始化今日任务
onMounted(() => {
    store.initializeTodayTasks()
})
</script>

<style scoped>
/* 主容器样式 */
.task-container {
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
    opacity: 0.6;
    animation: float 10s ease-in-out infinite;
}

.heart {
    top: 15%;
    right: 8%;
    width: 120px;
    height: 120px;
    background-color: #ffb6c1;
    transform: rotate(45deg);
    animation-delay: 0s;
}

.heart:before,
.heart:after {
    content: '';
    position: absolute;
    width: 120px;
    height: 120px;
    background-color: #ffb6c1;
    border-radius: 50%;
}

.heart:before {
    top: -60px;
    left: 0;
}

.heart:after {
    top: 0;
    left: -60px;
}

.star {
    bottom: 20%;
    left: 10%;
    width: 80px;
    height: 80px;
    background-color: #ffda6a;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation-delay: 1s;
    box-shadow: 0 0 20px rgba(255, 218, 106, 0.5);
}

.circle {
    top: 60%;
    right: 15%;
    width: 100px;
    height: 100px;
    background-color: #b5ead7;
    border-radius: 50%;
    animation-delay: 2s;
}

.cloud {
    top: 25%;
    left: 10%;
    width: 150px;
    height: 80px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 40px;
    animation-delay: 3s;
}

.cloud:before,
.cloud:after {
    content: '';
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
}

.cloud:before {
    width: 70px;
    height: 70px;
    top: -30px;
    left: 20px;
}

.cloud:after {
    width: 90px;
    height: 90px;
    top: -40px;
    right: 20px;
}

.gift {
    bottom: 10%;
    right: 10%;
    width: 80px;
    height: 80px;
    background-color: #ff8fab;
    animation-delay: 4s;
    position: relative;
}

.gift:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 20px;
    height: 100%;
    background-color: #ff6b8b;
    transform: translateX(-50%);
}

.gift:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 20px;
    background-color: #ff6b8b;
    transform: translateY(-50%);
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

/* 页面头部 */
.task-header {
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

.task-header::before {
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

.task-header h1 {
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

/* 任务内容区域 */
.task-content {
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

/* 今日积分卡片 */
.today-points {
    text-align: center;
    padding: 25px;
}

.today-points .card-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    position: relative;
    z-index: 1;
}

.today-points h3 {
    color: #ff6b8b;
    font-size: 1.3rem;
    margin: 0;
    font-weight: 700;
}

.sparkle {
    font-size: 1.5rem;
    animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.7;
    }

    50% {
        transform: scale(1.2);
        opacity: 1;
    }
}

.points-value {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 5px;
    margin-bottom: 15px;
    position: relative;
    z-index: 1;
}

.points-number {
    font-size: 3rem;
    font-weight: 800;
    color: #ff6b8b;
    text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.2);
    animation: pointsPulse 3s ease-in-out infinite;
}

@keyframes pointsPulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

.points-unit {
    font-size: 1.2rem;
    color: #ff8fab;
    font-weight: 600;
}

.points-progress {
    max-width: 300px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

.progress-bar {
    height: 12px;
    background-color: #ffedf2;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;
    border: 2px solid #ffd6e0;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffb6c1, #ff6b8b);
    border-radius: 4px;
    transition: width 0.5s ease;
    position: relative;
}

.progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: progressShine 2s infinite;
}

@keyframes progressShine {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.progress-text {
    font-size: 0.9rem;
    color: #ff8fab;
    font-weight: 500;
}

/* 任务区域 */
.tasks-section {
    position: relative;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 10px;
}

.section-header h2 {
    color: #ff6b8b;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.1);
}

.task-count {
    background-color: #ff8fab;
    color: white;
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 138, 171, 0.3);
}

/* 游戏卡片样式 */
.game-card {
    background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
    border-radius: 16px;
    border: 2px solid #ffd6e0;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.game-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 107, 139, 0.2);
    border-color: #ff8fab;
}

.game-card.completed {
    background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
    border-color: #b5ead7;
}

.game-card.completed::before {
    content: '✓';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    color: #4ade80;
    opacity: 0.3;
}

/* 任务项 */
.tasks-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.task-item {
    padding: 20px;
    transition: all 0.3s ease;
}

.task-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
}

.task-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #ff6b8b;
    display: flex;
    align-items: center;
    gap: 8px;
}

.task-icon {
    font-size: 1.5rem;
}

.task-badge {
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.task-badge.pending {
    background-color: #ffedf2;
    color: #ff8fab;
    border: 1px solid #ffd6e0;
}

.task-badge.easy {
    background-color: #f0fff4;
    color: #4ade80;
    border: 1px solid #bbf7d0;
}

.task-badge.medium {
    background-color: #fefce8;
    color: #facc15;
    border: 1px solid #fde68a;
}

.task-badge.hard {
    background-color: #fff1f2;
    color: #f87171;
    border: 1px solid #fecdd3;
}

.task-badge.completed {
    background-color: #e0f2fe;
    color: #0ea5e9;
    border: 1px solid #bae6fd;
}

.task-description {
    color: #ff8fab;
    margin: 0 0 15px 0;
    font-size: 1rem;
    position: relative;
    z-index: 1;
    line-height: 1.4;
}

.task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    position: relative;
    z-index: 1;
}

.task-points {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #ff8fab;
    font-size: 0.9rem;
    font-weight: 500;
}

.point-icon {
    font-size: 1rem;
}

.task-status {
    color: #ff8fab;
    font-weight: 500;
}

.status-completed {
    color: #4ade80;
    font-weight: 600;
    font-size: 1rem;
}

/* 完成选项 */
.completion-options {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* 难度按钮 */
.difficulty-btn {
    padding: 8px 16px;
    border: 2px solid #ffd6e0;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 0.9rem;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 5px;
}

.difficulty-btn.easy {
    background-color: #fff0f5;
    color: #ff8fab;
}

.difficulty-btn.easy:hover {
    background-color: #ff8fab;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 138, 171, 0.4);
    border-color: #ff6b8b;
}

.difficulty-btn.medium {
    background-color: #fff8fa;
    color: #ff6b8b;
}

.difficulty-btn.medium:hover {
    background-color: #ff6b8b;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
    border-color: #ff4757;
}

.difficulty-btn.hard {
    background-color: #ffe6ed;
    color: #ff4757;
}

.difficulty-btn.hard:hover {
    background-color: #ff4757;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
    border-color: #ff3344;
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
        transform: translateY(-30px) scale(0.9);
        opacity: 0;
    }

    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
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

/* 响应式设计 */
@media (max-width: 768px) {
    .task-container {
        padding: 15px;
    }

    .task-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .header-content h1 {
        font-size: 1.5rem;
    }

    .task-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .completion-options {
        flex-direction: column;
    }

    .today-points .points-number {
        font-size: 2.5rem;
    }

    .section-header {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .task-header-info {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .reward-hint {
        flex-direction: column;
        text-align: center;
    }

    .game-popup-content {
        padding: 25px 20px;
    }

    .popup-icon {
        font-size: 4rem;
    }
}
</style>