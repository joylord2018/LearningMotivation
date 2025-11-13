<template>
    <div class="statistics-container">
        <!-- 装饰元素 -->
        <div class="decorations">
            <div class="decoration heart"></div>
            <div class="decoration star"></div>
            <div class="decoration circle"></div>
        </div>

        <header class="statistics-header">
            <h1>📊 学习统计</h1>
            <div class="logout-btn" @click="handleLogout">退出登录</div>
        </header>

        <NavigationTabs />

        <!-- 其余内容保持不变 -->
        <div class="statistics-content">
            <!-- 数据概览卡片 -->
            <div class="overview-section">
                <div class="overview-card">
                    <div class="card-icon">📝</div>
                    <div class="card-content">
                        <div class="card-value">{{ store.totalTaskCompletions }}</div>
                        <div class="card-label">累计完成任务</div>
                    </div>
                </div>
                <div class="overview-card">
                    <div class="card-icon">🔥</div>
                    <div class="card-content">
                        <div class="card-value">{{ store.studyStreak }}天</div>
                        <div class="card-label">连续学习</div>
                    </div>
                </div>
                <div class="overview-card">
                    <div class="card-icon">🎯</div>
                    <div class="card-content">
                        <div class="card-value">{{ store.unlockedAchievements.length }}</div>
                        <div class="card-label">解锁成就</div>
                    </div>
                </div>
            </div>

            <!-- 时间范围选择器 -->
            <div class="time-range-selector">
                <button v-for="range in timeRanges" :key="range.value"
                    :class="['range-btn', { active: selectedRange === range.value }]"
                    @click="selectedRange = range.value">
                    {{ range.label }}
                </button>
            </div>

            <!-- 学习数据可视化 -->
            <div class="charts-section">
                <!-- 每日/每周/每月积分图表 -->
                <div class="chart-card">
                    <h3>🎯 积分趋势</h3>
                    <div class="chart-container">
                        <div class="chart-bar-container">
                            <div v-for="(data, index) in chartData.pointsData" :key="index" class="bar-item">
                                <div class="bar"
                                    :style="{ height: `${data.value * 3}px`, backgroundColor: getBarColor(data.value) }">
                                </div>
                                <div class="bar-label">{{ data.label }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 学科完成情况 -->
                <div class="chart-card">
                    <h3>📚 学科表现</h3>
                    <div class="subject-stats">
                        <div v-for="subject in chartData.subjectStats" :key="subject.name" class="subject-stat">
                            <div class="subject-icon">{{ subject.icon }}</div>
                            <div class="subject-info">
                                <div class="subject-name">{{ subject.name }}</div>
                                <div class="subject-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill"
                                            :style="{ width: `${subject.completionRate}%`, backgroundColor: subject.color }">
                                        </div>
                                    </div>
                                    <div class="progress-text">{{ subject.completionRate }}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 学习建议 -->
                <div class="suggestions-card">
                    <h3>💡 学习建议</h3>
                    <div class="suggestions-list">
                        <div v-for="(suggestion, index) in learningSuggestions" :key="index" class="suggestion-item">
                            <div class="suggestion-icon">{{ suggestion.icon }}</div>
                            <div class="suggestion-text">{{ suggestion.text }}</div>
                        </div>
                    </div>
                </div>

                <!-- 学习历史记录 -->
                <div class="history-section">
                    <h3>📋 最近学习记录</h3>
                    <div class="history-list">
                        <div v-for="(record, index) in recentTaskRecords" :key="index" class="history-item">
                            <div class="history-date">{{ formatDate(record.date) }}</div>
                            <div class="history-info">
                                <div class="history-subject">{{ record.subjectName }}</div>
                                <div class="history-status">
                                    完成度：
                                    <span :class="getCompletionClass(record.completionLevel)">
                                        {{ getCompletionText(record.completionLevel) }}
                                    </span>
                                </div>
                            </div>
                            <div class="history-points">+{{ record.points }}分</div>
                        </div>
                    </div>
                </div>
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
const selectedRange = ref('week') // 默认显示周数据

// 类型定义
interface TimeRange {
    label: string;
    value: string;
}

interface ChartPointData {
    label: string;
    value: number;
}

interface SubjectStat {
    name: string;
    icon: string;
    color: string;
    completionRate: number;
    totalTasks: number;
    completedTasks: number;
}

interface ChartData {
    pointsData: ChartPointData[];
    subjectStats: SubjectStat[];
}

interface Suggestion {
    icon: string;
    text: string;
}

const timeRanges: TimeRange[] = [
    { label: '今日', value: 'day' },
    { label: '本周', value: 'week' },
    { label: '本月', value: 'month' }
]

// 格式化日期
function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取完成度样式类
function getCompletionClass(level: string | null): string {
    switch (level) {
        case 'low': return 'level-low'
        case 'medium': return 'level-medium'
        case 'high': return 'level-high'
        default: return ''
    }
}

// 获取完成度文本
function getCompletionText(level: string | null): string {
    switch (level) {
        case 'low': return '低'
        case 'medium': return '中'
        case 'high': return '高'
        default: return '未完成'
    }
}

// 获取柱状图颜色
function getBarColor(value: number): string {
    if (value >= 9) return '#ff6b81'
    if (value >= 6) return '#ff9ff3'
    if (value >= 3) return '#54a0ff'
    return '#5f27cd'
}

// 导航到其他页面
function navigateTo(route: string) {
    router.push(route)
}

// 处理退出登录
function handleLogout() {
    store.logout()
    router.push('/')
}

// 计算图表数据
const chartData = computed<ChartData>(() => {
    // 明确初始化pointsData和subjectStats
    const pointsData: ChartPointData[] = [];
    const subjectStats: SubjectStat[] = [
        { name: '语文', icon: '📚', color: '#ff6b81', completionRate: 0, totalTasks: 0, completedTasks: 0 },
        { name: '数学', icon: '🔢', color: '#54a0ff', completionRate: 0, totalTasks: 0, completedTasks: 0 },
        { name: '英语', icon: '🌍', color: '#ff9ff3', completionRate: 0, totalTasks: 0, completedTasks: 0 }
    ];

    // 根据选择的时间范围过滤任务
    let filteredTasks: typeof store.tasks = [];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    switch (selectedRange.value) {
        case 'day':
            filteredTasks = store.tasks.filter(task => task?.date === today);
            pointsData.push({
                label: '今日',
                value: store.todayPoints || 0
            });
            break;
        case 'week':
            // 获取过去7天的数据
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().slice(0, 10);
                const dayName = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

                const dayTasks = store.tasks.filter(task => task?.date === dateStr);
                const dayPoints = dayTasks.reduce((sum, task) => sum + (task.points || 0), 0);

                pointsData.push({
                    label: `周${dayName}`,
                    value: dayPoints
                });
            }
            filteredTasks = store.tasks.filter(task => {
                const taskDate = task?.date ? new Date(task.date) : new Date(0);
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return taskDate >= weekAgo;
            });
            break;
        case 'month':
            // 获取过去30天的数据（按周分组）
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
                const weekEnd = new Date(now);
                weekEnd.setDate(weekEnd.getDate() - (i * 7));

                const weekTasks = store.tasks.filter(task => {
                    const taskDate = task?.date ? new Date(task.date) : new Date(0);
                    return taskDate >= weekStart && taskDate <= weekEnd;
                });

                const weekPoints = weekTasks.reduce((sum, task) => sum + (task.points || 0), 0);
                pointsData.push({
                    label: `第${4 - i}周`,
                    value: weekPoints
                });
            }
            filteredTasks = store.tasks.filter(task => {
                const taskDate = task?.date ? new Date(task.date) : new Date(0);
                const monthAgo = new Date(now);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return taskDate >= monthAgo;
            });
            break;
    }

    // 计算各学科统计数据 - 修复类型错误
    filteredTasks.forEach(task => {
        // 确保task存在且有subjectName属性
        if (task && task.subjectName) {
            const subjectIndex = subjectStats.findIndex(s => s && s.name === task.subjectName);
            // 确保找到了对应的学科且索引有效
            if (subjectIndex !== -1 && subjectStats[subjectIndex]) {
                // 安全地更新totalTasks
                subjectStats[subjectIndex].totalTasks = (subjectStats[subjectIndex].totalTasks || 0) + 1;
                // 确保task.completionLevel存在且不为null
                if (task.completionLevel !== null) {
                    // 安全地更新completedTasks
                    subjectStats[subjectIndex].completedTasks = (subjectStats[subjectIndex].completedTasks || 0) + 1;
                }
            }
        }
    });

    // 计算完成率 - 修复类型错误
    subjectStats.forEach((subject, index) => {
        // 确保subject存在
        if (subject) {
            // 安全地计算完成率
            const total = subject.totalTasks || 0;
            const completed = subject.completedTasks || 0;
            subject.completionRate = total > 0
                ? Math.round((completed / total) * 100)
                : 0;
        }
    });

    // 确保返回的对象符合ChartData接口
    return {
        pointsData: pointsData || [],
        subjectStats: subjectStats || []
    };
});

// 最近任务记录
const recentTaskRecords = computed(() => {
    return store.tasks
        .filter(task => task?.completionLevel !== null)
        .sort((a, b) => {
            const dateA = a?.date ? new Date(a.date).getTime() : 0
            const dateB = b?.date ? new Date(b.date).getTime() : 0
            return dateB - dateA
        })
        .slice(0, 5)
})

// 学习建议
const learningSuggestions = computed<Suggestion[]>(() => {
    const suggestions: Suggestion[] = []
    const subjectStats = chartData.value.subjectStats
    const completedTasks = store.totalTaskCompletions || 0
    const streak = store.studyStreak || 0

    // 根据学科表现给出建议
    subjectStats.forEach(subject => {
        if (subject.completionRate < 60) {
            suggestions.push({
                icon: '🎯',
                text: `${subject.name}学科需要加强哦，建议多安排一些时间练习！`
            })
        }
    })

    // 根据连续学习天数给出建议
    if (streak >= 7) {
        suggestions.push({
            icon: '🔥',
            text: `太棒了！你已经连续学习${streak}天了，继续保持！`
        })
    } else if (streak < 3) {
        suggestions.push({
            icon: '⏰',
            text: `坚持每天学习，养成好习惯！目标是连续学习7天！`
        })
    }

    // 根据任务完成情况给出建议
    if (completedTasks >= 20) {
        suggestions.push({
            icon: '🌟',
            text: `你已经完成了${completedTasks}个任务，真厉害！可以尝试挑战更高难度的任务。`
        })
    }

    // 如果没有特别的建议，给出鼓励
    if (suggestions.length === 0) {
        suggestions.push({
            icon: '🎉',
            text: `你的学习表现很棒！继续保持良好的学习状态！`
        })
    }

    return suggestions
})

// 页面加载时初始化
onMounted(() => {
    // 确保今日任务已初始化
    store.initializeTodayTasks()
})
</script>

<style scoped>
.statistics-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #fff5f7 0%, #ffe6ec 100%);
    padding: 20px;
    position: relative;
    overflow: hidden;
}

/* 装饰元素 */
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
    opacity: 0.1;
}

.heart {
    width: 80px;
    height: 80px;
    background: #ff6b81;
    transform: rotate(45deg);
    top: 10%;
    right: 10%;
}

.heart:before,
.heart:after {
    content: '';
    width: 80px;
    height: 80px;
    background: #ff6b81;
    border-radius: 50%;
    position: absolute;
}

.heart:before {
    top: -40px;
    left: 0;
}

.heart:after {
    top: 0;
    left: -40px;
}

.star {
    width: 0;
    height: 0;
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;
    border-bottom: 86px solid #ff9ff3;
    transform: rotate(35deg);
    bottom: 20%;
    left: 5%;
}

.star:before,
.star:after {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;
    border-bottom: 86px solid #ff9ff3;
}

.star:before {
    transform: rotate(-70deg);
    top: 10px;
    left: -55px;
}

.star:after {
    transform: rotate(-70deg);
    top: 10px;
    left: -45px;
}

.circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #54a0ff;
    bottom: 10%;
    right: 20%;
}

/* 头部样式 */
.statistics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 5px 15px rgba(255, 107, 129, 0.1);
    position: relative;
    z-index: 1;
}

.statistics-header h1 {
    color: #5f27cd;
    font-size: 28px;
    margin: 0;
    text-shadow: 2px 2px 0px #feca57;
}

.logout-btn {
    padding: 10px 20px;
    background: #ff6b81;
    color: white;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(255, 107, 129, 0.3);
}

.logout-btn:hover {
    background: #ff5252;
    transform: translateY(-2px);
}

/* 内容区域 */
.statistics-content {
    position: relative;
    z-index: 1;
}

/* 概览卡片 */
.overview-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.overview-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 25px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 5px 15px rgba(255, 107, 129, 0.1);
    transition: all 0.3s ease;
}

.overview-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(255, 107, 129, 0.2);
}

.card-icon {
    font-size: 48px;
}

.card-content {
    flex: 1;
}

.card-value {
    font-size: 32px;
    font-weight: bold;
    color: #ff6b81;
    margin-bottom: 5px;
}

.card-label {
    color: #5f27cd;
    font-weight: bold;
}

/* 时间范围选择器 */
.time-range-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    background: white;
    padding: 15px;
    border-radius: 20px;
    box-shadow: 0 5px 15px rgba(255, 107, 129, 0.1);
}

.range-btn {
    flex: 1;
    padding: 10px 20px;
    background: #f8f9fa;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    font-weight: bold;
    color: #5f27cd;
    transition: all 0.3s ease;
}

.range-btn:hover {
    background: #ff9ff3;
}

.range-btn.active {
    background: #54a0ff;
    color: white;
    box-shadow: 0 4px 10px rgba(84, 160, 255, 0.3);
}

/* 图表区域 */
.charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
}

.chart-card,
.suggestions-card {
    background: white;
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 5px 15px rgba(255, 107, 129, 0.1);
}

.chart-card h3,
.suggestions-card h3,
.history-section h3 {
    color: #5f27cd;
    font-size: 22px;
    margin-bottom: 20px;
    text-shadow: 1px 1px 0px #feca57;
}

/* 柱状图样式 */
.chart-container {
    height: 300px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.chart-bar-container {
    display: flex;
    align-items: flex-end;
    gap: 20px;
    height: 100%;
    width: 100%;
    padding-bottom: 30px;
}

.bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.bar {
    width: 100%;
    min-height: 10px;
    border-radius: 10px 10px 0 0;
    transition: height 0.5s ease;
    position: relative;
    overflow: hidden;
}

.bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3));
}

.bar-label {
    font-weight: bold;
    color: #5f27cd;
    text-align: center;
}

/* 学科统计 */
.subject-stats {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.subject-stat {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 15px;
}

.subject-icon {
    font-size: 36px;
}

.subject-info {
    flex: 1;
}

.subject-name {
    font-weight: bold;
    color: #5f27cd;
    margin-bottom: 10px;
}

.subject-progress {
    display: flex;
    align-items: center;
    gap: 15px;
}

.progress-bar {
    flex: 1;
    height: 15px;
    background: #ecf0f1;
    border-radius: 10px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.5s ease;
}

.progress-text {
    font-weight: bold;
    color: #ff6b81;
}

/* 学习建议 */
.suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.suggestion-item {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
    background: linear-gradient(135deg, #fff5f7 0%, #ffe6ec 100%);
    border-radius: 15px;
    border-left: 5px solid #ff6b81;
}

.suggestion-icon {
    font-size: 24px;
    flex-shrink: 0;
    margin-top: 2px;
}

.suggestion-text {
    flex: 1;
    color: #5f27cd;
    line-height: 1.5;
}

/* 历史记录 */
.history-section {
    background: white;
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 5px 15px rgba(255, 107, 129, 0.1);
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.history-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 15px;
    transition: all 0.3s ease;
}

.history-item:hover {
    background: #ffe6ec;
    transform: translateX(5px);
}

.history-date {
    font-weight: bold;
    color: #54a0ff;
    min-width: 80px;
}

.history-info {
    flex: 1;
}

.history-subject {
    font-weight: bold;
    color: #5f27cd;
    margin-bottom: 5px;
}

.history-status {
    color: #666;
}

.history-points {
    font-weight: bold;
    color: #ff6b81;
}

/* 完成度样式 */
.level-low {
    color: #ff9800;
}

.level-medium {
    color: #2196f3;
}

.level-high {
    color: #4caf50;
}

/* 动画效果 */
@keyframes shimmer {
    0% {
        transform: translateX(-100%) rotate(45deg);
    }

    100% {
        transform: translateX(100%) rotate(45deg);
    }
}

@keyframes starGlow {
    0% {
        transform: scale(1);
        opacity: 0.7;
    }

    100% {
        transform: scale(1.2);
        opacity: 1;
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .charts-section {
        grid-template-columns: 1fr;
    }

    .overview-section {
        grid-template-columns: 1fr;
    }

    .statistics-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .time-range-selector {
        flex-wrap: wrap;
    }

    .range-btn {
        flex: 1 1 calc(33.333% - 6.666px);
    }
}
</style>