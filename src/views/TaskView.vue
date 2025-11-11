<template>
    <div class="task-container">
        <!-- 装饰元素 -->
        <div class="decorations">
            <div class="decoration heart"></div>
            <div class="decoration star"></div>
            <div class="decoration circle"></div>
        </div>

        <header class="task-header">
            <h1>📝 今日任务</h1>
            <div class="logout-btn" @click="handleLogout">退出登录</div>
        </header>

        <div class="nav-tabs">
            <button class="tab-btn active" @click="navigateTo('/tasks')">任务</button>
            <button class="tab-btn" @click="navigateTo('/points')">积分</button>
            <button class="tab-btn" @click="navigateTo('/admin')">管理</button>
        </div>

        <div class="task-content">
            <div class="date-display">
                <h2>{{ currentDate }}</h2>
            </div>

            <!-- 今日积分展示 -->
            <div class="today-points">
                <h3>🌟 今日已获得积分</h3>
                <div class="points-value">{{ store.todayPoints }} 积分</div>
            </div>

            <!-- 任务列表 -->
            <div class="tasks-list">
                <div v-for="task in store.todayTasks" :key="task.id" class="task-item">
                    <div class="task-info">
                        <h3>{{ task.subjectName }} - {{ getTaskNameBySubject(task.subject) }}</h3>
                        <p>{{ getTaskDescriptionBySubject(task.subject) }}</p>
                        <div class="task-points">{{ task.completionLevel ? '已获得 ' + task.points + ' 积分' : '完成可得 1-3 积分'
                            }}</div>
                    </div>
                    <div class="task-status">
                        <span v-if="task.completionLevel" class="status-completed">✓ 已完成</span>
                        <div v-else class="completion-options">
                            <button @click="completeTask(task.id, 'low')" class="option-btn easy">简单 (1)</button>
                            <button @click="completeTask(task.id, 'medium')" class="option-btn medium">中等 (2)</button>
                            <button @click="completeTask(task.id, 'high')" class="option-btn hard">困难 (3)</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 脚本部分保持不变
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

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

// 导航到其他页面
function navigateTo(route: string) {
    router.push(route)
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
    const descriptions: { [key: string]: string } = {
        'chinese': '阅读一篇文章并理解内容',
        'math': '完成几道数学练习题',
        'english': '练习英语听力和口语'
    }
    return descriptions[subject] || '认真完成今日学习任务'
}

// 完成任务
function completeTask(taskId: string, difficulty: 'low' | 'medium' | 'high') {
    const task = store.tasks.find(t => t.id === taskId)
    if (task && !task.completionLevel) {
        store.updateTaskCompletion(taskId, difficulty)
        // 根据难度显示不同的提示信息
        let message = ''
        switch (difficulty) {
            case 'low':
                message = '🎉 任务轻松完成！'
                break
            case 'medium':
                message = '👍 任务完成得不错！'
                break
            case 'high':
                message = '💪 任务完成得很出色！'
                break
        }
        alert(message)
    }
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
.task-container {
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

.task-header {
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

.task-header h1 {
    color: #ff6b8b;
    font-size: 1.8rem;
    margin: 0;
    font-weight: 700;
}

.date-display {
    font-size: 1rem;
    color: #ff8fab;
    font-weight: 500;
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

.task-content {
    background-color: white;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
    position: relative;
}

.today-points {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 20px;
    color: #ff6b8b;
    text-align: center;
    padding: 15px;
    background-color: #fff0f5;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.points-icon {
    font-size: 1.5rem;
    animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }
}

.tasks-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.task-item {
    padding: 20px;
    background-color: #fff8fa;
    border-radius: 16px;
    transition: all 0.3s ease;
    border: 2px solid #ffedf2;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.05);
}

.task-item:hover {
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.15);
    transform: translateY(-2px);
}

.task-info {
    margin-bottom: 15px;
}

.task-info h3 {
    margin: 0 0 10px 0;
    color: #ff6b8b;
    font-size: 1.3rem;
}

.task-info p {
    color: #ff8fab;
    margin: 0 0 10px 0;
}

.task-points {
    color: #ff99b3;
    font-size: 0.9rem;
    font-weight: 500;
}

.task-status {
    color: #ff8fab;
    font-weight: 500;
}

.status-completed {
    color: #ff6b8b;
    font-weight: 600;
}

.completion-options {
    display: flex;
    gap: 10px;
    justify-content: center;
}

/* 任务难度按钮样式优化 */
.option-btn {
    padding: 10px 20px;
    border: 2px solid #ffedf2;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 0.9rem;
    position: relative;
    overflow: hidden;
}

.option-btn.easy {
    background-color: #fff0f5;
    color: #ff8fab;
}

.option-btn.easy:hover {
    background-color: #ff8fab;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 138, 171, 0.4);
    border-color: #ff6b8b;
}

.option-btn.medium {
    background-color: #fff8fa;
    color: #ff6b8b;
}

.option-btn.medium:hover {
    background-color: #ff6b8b;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
    border-color: #ff4757;
}

.option-btn.hard {
    background-color: #ffe6ed;
    color: #ff4757;
}

.option-btn.hard:hover {
    background-color: #ff4757;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
    border-color: #ff3344;
}

/* 手机适配 */
@media (max-width: 768px) {
    .task-container {
        padding: 10px;
    }

    .task-header {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .task-header h1 {
        font-size: 1.5rem;
    }

    .nav-tabs {
        flex-direction: column;
    }

    .completion-options {
        flex-direction: column;
    }

    .today-points {
        font-size: 1.1rem;
    }
}
</style>