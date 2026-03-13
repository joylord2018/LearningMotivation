<template>
    <div class="statistics-container">
        <!-- 装饰元素 -->
        <div class="decorations">
            <!-- 闪烁的星星装饰 -->
            <div v-for="i in 15" :key="'star-' + i" class="decoration star" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDelay: Math.random() * 4 + 's' }"></div>
            
            <!-- 旋转的爱心装饰 -->
            <div v-for="i in 6" :key="'heart-' + i" class="decoration heart" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDelay: Math.random() * 3 + 's' }"></div>
            
            <!-- 浮动的圆形装饰 -->
            <div v-for="i in 4" :key="'circle-' + i" class="decoration circle" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDelay: Math.random() * 5 + 's' }"></div>
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
                <div class="overview-card">
                    <div class="card-icon">✨</div>
                    <div class="card-content">
                        <div class="card-value">{{ completedBehaviorsCount }}</div>
                        <div class="card-label">累计完成行为</div>
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
                                <div class="bar-wrapper">
                                    <div class="bar"
                                        :style="{ height: `${Math.min(data.value * 3, 200)}px`, backgroundColor: getBarColor(data.value) }">
                                    </div>
                                    <div class="bar-value">{{ data.value }}</div>
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

                <!-- 行为完成情况 -->
                <div class="chart-card">
                    <h3>🎯 行为表现</h3>
                    <div class="behavior-stats">
                        <div v-for="behavior in behaviorStats" :key="behavior.id" class="behavior-stat">
                            <div class="behavior-icon">{{ behavior.icon }}</div>
                            <div class="behavior-info">
                                <div class="behavior-name">{{ behavior.name }}</div>
                                <div class="behavior-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" 
                                            :style="{ width: `${behavior.completionRate}%`, backgroundColor: behavior.type === 'positive' ? '#4caf50' : '#ff6b81' }">
                                        </div>
                                    </div>
                                    <div class="progress-text">{{ behavior.completionRate }}%</div>
                                </div>
                            </div>
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

                <!-- 最近行为记录 -->
                <div class="history-section">
                    <h3>📋 最近行为记录</h3>
                    <div class="history-list">
                        <div v-for="(record, index) in recentBehaviorRecords" :key="index" class="history-item">
                            <div class="history-date">{{ formatDate(record.lastRecordDate) }}</div>
                            <div class="history-info">
                                <div class="history-subject">{{ record.name }}</div>
                                <div class="history-status">
                                    状态：
                                    <span :class="record.completed ? 'level-high' : ''">
                                        {{ record.completed ? '完成' : '未完成' }}
                                    </span>
                                </div>
                            </div>
                            <div class="history-points" :class="record.type === 'negative' ? 'negative' : ''">
                                {{ record.points > 0 ? '+' : '' }}{{ record.points }}分
                            </div>
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

interface BehaviorStat {
    id: string;
    name: string;
    icon: string;
    type: 'positive' | 'negative';
    completionRate: number;
    totalTasks: number;
    completedTasks: number;
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
function getCompletionClass(level: string | boolean | null): string {
    if (typeof level === 'boolean') {
        return level ? 'level-high' : ''
    }
    switch (level) {
        case 'low': return 'level-low'
        case 'medium': return 'level-medium'
        case 'high': return 'level-high'
        default: return ''
    }
}

// 获取完成度文本
function getCompletionText(level: string | boolean | null): string {
    if (typeof level === 'boolean') {
        return level ? '完成' : '未完成'
    }
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
    let filteredTasks: typeof store.plans = [];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    switch (selectedRange.value) {
        case 'day':
            filteredTasks = store.plans.filter(task => task?.date === today);
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

                const dayTasks = store.plans.filter(task => task?.date === dateStr);
                const dayPoints = dayTasks.reduce((sum, task) => sum + (task.points || 0), 0);

                pointsData.push({
                    label: `周${dayName}`,
                    value: dayPoints
                });
            }
            filteredTasks = store.plans.filter(task => {
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

                const weekTasks = store.plans.filter(task => {
                    const taskDate = task?.date ? new Date(task.date) : new Date(0);
                    return taskDate >= weekStart && taskDate <= weekEnd;
                });

                const weekPoints = weekTasks.reduce((sum, task) => sum + (task.points || 0), 0);
                pointsData.push({
                    label: `第${4 - i}周`,
                    value: weekPoints
                });
            }
            filteredTasks = store.plans.filter(task => {
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
                // 确保task.completionLevel存在且不为null，并且是true（完成状态）
                if (task.completionLevel !== null && task.completionLevel === true) {
                    // 安全地更新completedTasks
                    subjectStats[subjectIndex].completedTasks = (subjectStats[subjectIndex].completedTasks || 0) + 1;
                }
            }
        }
    });

    // 计算总完成任务数
    const totalCompletedTasks = subjectStats.reduce((sum, subject) => sum + (subject.completedTasks || 0), 0);

    // 计算完成率 - 改为占总完成任务数的比例
    subjectStats.forEach((subject, index) => {
        // 确保subject存在
        if (subject) {
            // 安全地计算完成率（占总完成任务数的比例）
            const completed = subject.completedTasks || 0;
            subject.completionRate = totalCompletedTasks > 0
                ? Math.round((completed / totalCompletedTasks) * 100)
                : 0;
        }
    });

    // 确保返回的对象符合ChartData接口
    return {
        pointsData: pointsData || [],
        subjectStats: subjectStats || []
    };
});

// 最近任务记录 - 根据选择的时间范围显示
const recentTaskRecords = computed(() => {
    const now = new Date()
    let startDate = new Date(now)
    
    // 根据选择的时间范围设置起始日期
    switch (selectedRange.value) {
        case 'day':
            startDate.setHours(0, 0, 0, 0)
            break
        case 'week':
            startDate.setDate(startDate.getDate() - 7)
            break
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1)
            break
    }
    
    return store.plans
        .filter(task => {
            if (!task || task.completionLevel !== true) return false
            const taskDate = new Date(task.date)
            return taskDate >= startDate
        })
        .sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0
            const dateB = b.date ? new Date(b.date).getTime() : 0
            return dateB - dateA
        })
})

// 累计完成行为数量
const completedBehaviorsCount = computed(() => {
    return store.behaviors.filter(behavior => behavior && behavior.completed === true).length
})

// 行为统计数据
const behaviorStats = computed<BehaviorStat[]>(() => {
    // 计算总完成行为数
    const totalCompletedBehaviors = store.behaviors.reduce((sum, behavior) => sum + (behavior.currentCount || 0), 0);
    
    return store.behaviors.map(behavior => {
        const completionRate = totalCompletedBehaviors > 0 
            ? Math.round(((behavior.currentCount || 0) / totalCompletedBehaviors) * 100)
            : 0
        
        return {
            id: behavior.id,
            name: behavior.name,
            icon: behavior.icon,
            type: behavior.type,
            completionRate: completionRate,
            totalTasks: behavior.targetCount,
            completedTasks: behavior.currentCount
        }
    })
})

// 最近行为记录 - 根据选择的时间范围显示
const recentBehaviorRecords = computed(() => {
    const now = new Date()
    let startDate = new Date(now)
    
    // 根据选择的时间范围设置起始日期
    switch (selectedRange.value) {
        case 'day':
            startDate.setHours(0, 0, 0, 0)
            break
        case 'week':
            startDate.setDate(startDate.getDate() - 7)
            break
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1)
            break
    }
    
    return store.behaviors
        .filter(behavior => {
            if (!behavior || behavior.lastRecordDate === null) return false
            const recordDate = new Date(behavior.lastRecordDate)
            return recordDate >= startDate
        })
        .sort((a, b) => {
            const dateA = a.lastRecordDate ? new Date(a.lastRecordDate).getTime() : 0
            const dateB = b.lastRecordDate ? new Date(b.lastRecordDate).getTime() : 0
            return dateB - dateA
        })
})

// 学习建议
const learningSuggestions = computed<Suggestion[]>(() => {
    const suggestions: Suggestion[] = []
    const subjectStats = chartData.value.subjectStats
    const completedTasks = store.totalTaskCompletions || 0
    const streak = store.studyStreak || 0
    const recentTasks = recentTaskRecords.value
    const recentBehaviors = recentBehaviorRecords.value

    // 根据学科表现给出建议
    subjectStats.forEach(subject => {
        if (subject.completionRate < 30) {
            suggestions.push({
                icon: '🎯',
                text: `${subject.name}学科表现较差，建议制定详细的学习计划，每天安排固定时间进行练习！`
            })
        } else if (subject.completionRate < 60) {
            suggestions.push({
                icon: '📈',
                text: `${subject.name}学科表现一般，建议针对性地加强薄弱环节，提高学习效率！`
            })
        } else if (subject.completionRate < 85) {
            suggestions.push({
                icon: '🌟',
                text: `${subject.name}学科表现良好，继续保持并争取更上一层楼！`
            })
        } else if (subject.completionRate >= 85) {
            suggestions.push({
                icon: '🏆',
                text: `${subject.name}学科表现优秀，继续保持！可以尝试挑战更高难度的内容！`
            })
        }
    })

    // 根据最近学习记录给出建议
    if (recentTasks.length < 2) {
        suggestions.push({
            icon: '📚',
            text: `最近学习记录较少，建议增加学习频率，保持学习的连续性！`
        })
    } else if (recentTasks.length < 5) {
        suggestions.push({
            icon: '💪',
            text: `最近学习记录有所增加，继续保持这个良好的势头！`
        })
    } else if (recentTasks.length >= 7) {
        suggestions.push({
            icon: '🔥',
            text: `最近学习记录丰富，学习状态很好！继续保持这种学习热情！`
        })
    }

    // 根据连续学习天数给出建议
    if (streak >= 30) {
        suggestions.push({
            icon: '👑',
            text: `太厉害了！你已经连续学习${streak}天了，这是一个非常了不起的成就！`
        })
    } else if (streak >= 14) {
        suggestions.push({
            icon: '🌟',
            text: `很棒！你已经连续学习${streak}天了，这是一个非常棒的习惯！`
        })
    } else if (streak >= 7) {
        suggestions.push({
            icon: '🔥',
            text: `不错！你已经连续学习${streak}天了，继续保持这个良好的学习习惯！`
        })
    } else if (streak < 3) {
        suggestions.push({
            icon: '⏰',
            text: `坚持每天学习，养成好习惯！目标是连续学习7天！`
        })
    }

    // 根据任务完成情况给出建议
    if (completedTasks >= 100) {
        suggestions.push({
            icon: '🎖️',
            text: `你已经完成了${completedTasks}个任务，真的很优秀！可以尝试制定更具挑战性的学习目标！`
        })
    } else if (completedTasks >= 50) {
        suggestions.push({
            icon: '🏆',
            text: `你已经完成了${completedTasks}个任务，很棒！继续保持这个进度！`
        })
    } else if (completedTasks >= 20) {
        suggestions.push({
            icon: '🌟',
            text: `你已经完成了${completedTasks}个任务，真厉害！继续保持！`
        })
    }

    // 根据行为记录给出建议
    if (recentBehaviors.length > 0) {
        const completedBehaviors = recentBehaviors.filter(behavior => behavior.completed).length
        const completionRate = completedBehaviors / recentBehaviors.length
        
        if (completionRate >= 0.9) {
            suggestions.push({
                icon: '🎯',
                text: `你的行为习惯表现非常好，继续保持这些良好的习惯！`
            })
        } else if (completionRate >= 0.7) {
            suggestions.push({
                icon: '🌟',
                text: `你的行为习惯表现不错，继续努力！`
            })
        } else if (completionRate < 0.5) {
            suggestions.push({
                icon: '💪',
                text: `建议加强行为习惯的培养，良好的习惯有助于提高学习效果！`
            })
        }
    }

    // 根据学科平衡情况给出建议
    const subjectCompletionRates = subjectStats.map(s => s.completionRate)
    const averageRate = subjectCompletionRates.reduce((sum, rate) => sum + rate, 0) / subjectCompletionRates.length
    const maxRate = Math.max(...subjectCompletionRates)
    const minRate = Math.min(...subjectCompletionRates)
    
    if (maxRate - minRate > 50) {
        const weakSubject = subjectStats.find(s => s.completionRate === minRate)
        if (weakSubject) {
            suggestions.push({
                icon: '⚖️',
                text: `你的学科表现不够平衡，建议加强${weakSubject.name}学科的学习！`
            })
        }
    } else if (averageRate >= 70) {
        suggestions.push({
            icon: '🎓',
            text: `你的各学科表现比较均衡，继续保持这种全面发展的状态！`
        })
    }

    // 如果没有特别的建议，给出鼓励
    if (suggestions.length === 0) {
        suggestions.push({
            icon: '🎉',
            text: `你的学习表现很棒！继续保持良好的学习状态！`
        })
    }

    // 限制建议数量，最多显示5条
    return suggestions.slice(0, 5)
})

// 页面加载时初始化
onMounted(() => {
    // 确保今日任务已初始化
    store.initializeTodayPlans()
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
    pointer-events: none;
}

/* 闪烁的星星装饰 */
.star {
    width: 12px;
    height: 12px;
    background-color: #ff9ff3;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation: pulse 3s ease-in-out infinite;
    box-shadow: 0 0 6px #ff9ff3;
}

/* 旋转的爱心装饰 */
.heart {
    width: 25px;
    height: 25px;
    background-color: #ff6b81;
    transform: rotate(45deg);
    animation: rotateHeart 6s linear infinite;
}

.heart:before,
.heart:after {
    content: '';
    position: absolute;
    width: 25px;
    height: 25px;
    background-color: #ff6b81;
    border-radius: 50%;
}

.heart:before {
    top: -12px;
    left: 0;
}

.heart:after {
    top: 0;
    left: -12px;
}

/* 浮动的圆形装饰 */
.circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(84, 160, 255, 0.3);
    animation: floatCircle 8s ease-in-out infinite;
    box-shadow: 0 0 15px rgba(84, 160, 255, 0.5);
}

/* 星星脉冲动画 */
@keyframes pulse {
    0%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1.2);
        box-shadow: 0 0 10px #ff9ff3;
    }
}

/* 爱心旋转动画 */
@keyframes rotateHeart {
    0% {
        transform: rotate(45deg) scale(1);
    }
    25% {
        transform: rotate(45deg) scale(1.1);
    }
    50% {
        transform: rotate(45deg) scale(1);
    }
    75% {
        transform: rotate(45deg) scale(0.9);
    }
    100% {
        transform: rotate(45deg) scale(1);
    }
}

/* 圆形浮动动画 */
@keyframes floatCircle {
    0%, 100% {
        transform: translateY(0) translateX(0);
        opacity: 0.3;
    }
    25% {
        transform: translateY(-20px) translateX(10px);
        opacity: 0.6;
    }
    50% {
        transform: translateY(-10px) translateX(20px);
        opacity: 0.8;
    }
    75% {
        transform: translateY(-15px) translateX(5px);
        opacity: 0.5;
    }
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

.bar-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.bar {
    width: 100%;
    min-height: 10px;
    border-radius: 10px 10px 0 0;
    transition: height 0.5s ease;
    position: relative;
    overflow: hidden;
}

.bar-value {
    position: absolute;
    top: -25px;
    font-weight: bold;
    color: #5f27cd;
    font-size: 14px;
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

/* 行为统计 */
.behavior-stats {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.behavior-stat {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 15px;
}

.behavior-icon {
    font-size: 36px;
}

.behavior-info {
    flex: 1;
}

.behavior-name {
    font-weight: bold;
    color: #5f27cd;
    margin-bottom: 10px;
}

.behavior-progress {
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
    align-items: center;
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
    max-height: 300px;
    overflow-y: auto;
    padding-right: 10px;
}

/* 滚动条样式 */
.history-list::-webkit-scrollbar {
    width: 6px;
}

.history-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.history-list::-webkit-scrollbar-thumb {
    background: #ff9ff3;
    border-radius: 10px;
}

.history-list::-webkit-scrollbar-thumb:hover {
    background: #ff6b81;
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

.history-points.negative {
    color: #ff9800;
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