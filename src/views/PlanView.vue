<template>
    <div class="plan-container">
        <!-- 可爱的装饰元素 -->
        <div class="decorations">
            <!-- 静态星星装饰 -->
            <div v-for="i in 25" :key="'star-' + i" class="decoration star" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }"></div>
            
            <!-- 静态爱心装饰 -->
            <div v-for="i in 8" :key="'heart-' + i" class="decoration heart" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }"></div>
            
            <!-- 静态云朵装饰 -->
            <div v-for="i in 4" :key="'cloud-' + i" class="decoration cloud" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 50 + '%' }"></div>
        </div>

        <header class="plan-header">
            <div class="header-content">
                <h1>🎮 今日计划大挑战 🎮</h1>
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

        <!-- 日历视图 -->
        <div class="calendar-section card">
            <div class="calendar-header">
                <h2>📅 日历视图</h2>
                <div class="calendar-controls">
                    <button @click="prevWeek" class="calendar-btn">←</button>
                    <button @click="goToday" class="calendar-btn today">今天</button>
                    <button @click="nextWeek" class="calendar-btn">→</button>
                </div>
            </div>
            <div class="calendar-week">
                <div v-for="day in weekDays" :key="day.date" 
                    class="calendar-day" 
                    :class="{ 'today': day.isToday, 'selected': selectedDate === day.date }"
                    @click="selectDate(day.date)">
                    <div class="day-number">{{ day.dayOfMonth }}</div>
                    <div class="day-name">{{ day.dayName }}</div>
                    <div class="day-plans">{{ getDayPlanCount(day.date) }}个计划</div>
                </div>
            </div>
        </div>

        <div class="plan-content">
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

            <!-- 计划列表 -->
            <div class="plans-section">
                <div class="section-header">
                    <h2>🎯 {{ selectedDate === currentDateStr ? '今日' : formatDate(selectedDate) }}计划</h2>
                    <div class="plan-count">
                        剩余 {{ remainingPlans }} 个计划
                    </div>
                </div>

                <div v-if="Object.keys(plansBySubject).length === 0" class="no-plans">
                    <div class="no-plans-icon">📅</div>
                    <div class="no-plans-text">当前日期暂无计划</div>
                </div>
                <div v-else>
                    <div v-for="(plans, subject) in plansBySubject" :key="subject" class="subject-section">
                        <div class="subject-header">
                            <span class="subject-icon">{{ getPlanIconBySubject(String(subject)) }}</span>
                            <h3>{{ getPlanNameBySubject(String(subject)) }}</h3>
                        </div>
                        <div class="plans-list">
                            <div v-for="plan in plans" :key="plan.id" class="plan-item game-card"
                                :class="{ completed: plan.completionLevel }">
                                <div class="plan-header-info">
                                    <div class="plan-title">
                                        {{ plan.subjectName }}
                                    </div>
                                    <div class="plan-badge" :class="{ completed: plan.completionLevel, pending: !plan.completionLevel }">
                                        {{ plan.completionLevel ? '已完成' : '待完成' }}
                                    </div>
                                </div>

                                <p class="plan-description">{{ plan.description || getPlanDescriptionBySubject(plan.subject) }}</p>

                                <!-- 计划详情 -->
                                <div class="plan-details">
                                    <div v-if="plan.frequency" class="detail-item">
                                        <span class="detail-icon">🔄</span>
                                        <span class="detail-text">本周第{{ plan.frequency }}次</span>
                                    </div>
                                    <div v-if="plan.type === 'weekly'" class="detail-item">
                                        <span class="detail-icon">📊</span>
                                        <span class="detail-text">进度: {{ plan.completedCount || 0 }}/{{ plan.targetCount || 1 }}</span>
                                    </div>
                                    <div v-if="plan.timeRange" class="detail-item">
                                        <span class="detail-icon">⏰</span>
                                        <span class="detail-text">{{ plan.timeRange }}</span>
                                    </div>
                                </div>

                                <div class="plan-footer">
                                    <div class="plan-points">
                                        <span class="point-icon">⭐</span>
                                        {{ plan.completionLevel ? '已获得 ' + plan.points + ' 积分' : '完成可得 3 积分' }}
                                    </div>

                                    <div class="plan-actions">
                                        <button v-if="!plan.completionLevel" @click="startTimer(plan.id)" class="action-btn start-timer">
                                            <span class="btn-icon">⏱️</span> 开始计时
                                        </button>
                                        <button v-if="!plan.completionLevel" @click="quickComplete(plan.id)" class="action-btn quick-complete">
                                            <span class="btn-icon">✓</span> 快速完成
                                        </button>
                                        <button v-if="plan.completionLevel" @click="undoComplete(plan.id)" class="action-btn undo">
                                            <span class="btn-icon">↩️</span> 撤销
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 周计划模块 -->
            <div class="weekly-plans-section card">
                <div class="section-header">
                    <h2>📋 周计划 <span class="week-range">{{ selectedWeekRange }}</span></h2>
                </div>
                <div class="weekly-plans-list">
                    <div v-for="weeklyPlan in selectedWeekPlans" :key="weeklyPlan.id" class="weekly-plan-item game-card">
                        <div class="plan-header-info">
                            <div class="plan-title">
                                <span class="plan-icon">{{ getPlanIconBySubject(weeklyPlan.subject) }}</span>
                                {{ weeklyPlan.subjectName }} - {{ weeklyPlan.name }}
                            </div>
                            <div class="plan-badge" :class="{ completed: weeklyPlan.completed, pending: !weeklyPlan.completed }">
                                {{ weeklyPlan.completed ? '已完成' : '进行中' }}
                            </div>
                        </div>
                        <div class="plan-details">
                            <div class="detail-item">
                                <span class="detail-icon">🔄</span>
                                <span class="detail-text">频率: {{ weeklyPlan.frequency }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">📊</span>
                                <span class="detail-text">进度: {{ weeklyPlan.completedCount }}/{{ weeklyPlan.totalCount }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">⏰</span>
                                <span class="detail-text">时间: {{ weeklyPlan.timeRange }}</span>
                            </div>
                        </div>
                        <div class="plan-footer">
                            <div class="plan-points">
                                <span class="point-icon">⭐</span>
                                {{ weeklyPlan.completed ? '已获得 ' + weeklyPlan.points + ' 积分' : '完成可得 ' + weeklyPlan.points + ' 积分' }}
                            </div>
                            <div class="plan-actions">
                                <button v-if="!weeklyPlan.completed" @click="completeWeeklyPlan(weeklyPlan.id)" class="action-btn quick-complete">
                                    <span class="btn-icon">✓</span> 完成计划
                                </button>
                                <button v-if="weeklyPlan.completedCount > 0" @click="undoCompleteWeeklyPlan(weeklyPlan.id)" class="action-btn undo">
                                    <span class="btn-icon">↩️</span> 撤销
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-if="selectedWeekPlans.length === 0" class="no-plans">
                        <div class="no-plans-icon">📅</div>
                        <div class="no-plans-text">当前周暂无计划</div>
                    </div>
                </div>
            </div>

            <!-- 额外奖励提示 -->
            <div class="reward-hint card">
                <div class="reward-icon">🎁</div>
                <div class="reward-text">
                    <strong>每日奖励：</strong>完成本日所有计划可能会随机掉落积分喔！
                </div>
            </div>
        </div>

        <!-- 计时弹窗 -->
        <div v-if="showTimerPopup" class="game-popup-overlay" @click="closeTimerPopup">
            <div class="game-popup-content" @click.stop>
                <div class="timer-popup">
                    <div class="timer-header">
                        <h3>⏱️ 计时中</h3>
                        <div class="timer-plan-name">{{ currentTimerPlanName }}</div>
                    </div>
                    <div class="timer-display">{{ timerTime }}</div>
                    <div class="timer-actions">
                        <button @click="pauseTimer" class="game-btn">
                            <span class="btn-icon">{{ isTimerPaused ? '▶️' : '⏸️' }}</span> {{ isTimerPaused ? '继续' : '暂停' }}
                        </button>
                        <button @click="stopTimer" class="game-btn">
                            <span class="btn-icon">⏹️</span> 结束
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 游戏风格弹窗 -->
        <div v-if="showPopup" class="game-popup-overlay" @click="closePopup">
            <div class="game-popup-content" @click.stop>
                <div class="popup-animation">
                    <div class="popup-icon">{{ popupIcon }}</div>
                    <div class="popup-title">{{ popupMessage }}</div>
                    <div class="popup-points" v-if="popupPoints !== 0">
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

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import NavigationTabs from '../components/NavigationTabs.vue'

const router = useRouter()
const store = useUserStore()

// 日历相关
const currentDateStr = ref(new Date().toISOString().slice(0, 10))
const selectedDate = ref(currentDateStr.value)
const currentWeekStart = ref(new Date())

// 计时相关
const showTimerPopup = ref(false)
const currentTimerPlanId = ref('')
const currentTimerPlanName = ref('')
const timerSeconds = ref(0)
const isTimerPaused = ref(false)
const timerInterval = ref<number | null>(null)

// 弹窗状态
const showPopup = ref(false)
const popupMessage = ref('')
const popupIcon = ref('🎉')
const popupPoints = ref(0)

// 周计划类型定义
interface WeeklyPlan {
    id: string
    name: string
    subject: string
    subjectName: string
    frequency: string
    totalCount: number
    completedCount: number
    timeRange: string
    points: number
    completed: boolean
    weekStart: string
}

// 计算当前选中周的周计划
const selectedWeekPlans = computed(() => {
    // 获取选中周的开始日期（周一）
    const startOfWeek = new Date(currentWeekStart.value)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
    const weekStartStr = startOfWeek.toISOString().slice(0, 10)
    
    // 从 store.plans 中过滤出周计划
    return store.plans
        .filter(plan => plan.type === 'weekly')
        .map(plan => {
            const totalCount = plan.targetCount
            const completedCount = plan.completedCount
            const completed = completedCount >= totalCount
            
            return {
                id: plan.id,
                name: plan.description,
                subject: plan.subject,
                subjectName: plan.subjectName,
                frequency: plan.frequency === 'weekly' ? '每周' : plan.frequency,
                totalCount: totalCount,
                completedCount: completedCount,
                timeRange: plan.timeRange,
                points: plan.points,
                completed: completed,
                weekStart: weekStartStr
            }
        })
})

// 计算当前选中周的日期范围
const selectedWeekRange = computed(() => {
    // 获取选中周的开始日期（周一）
    const startOfWeek = new Date(currentWeekStart.value)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
    
    // 获取选中周的结束日期（周日）
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    // 格式化为 MM/DD 格式
    const startMonth = startOfWeek.getMonth() + 1
    const startDay = startOfWeek.getDate()
    const endMonth = endOfWeek.getMonth() + 1
    const endDay = endOfWeek.getDate()
    
    return `${startMonth}/${startDay} - ${endMonth}/${endDay}`
})

// 计算当前日期
const currentDate = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
})

// 计算周日期
const weekDays = computed(() => {
    const days = []
    const start = new Date(currentWeekStart.value)
    start.setDate(start.getDate() - start.getDay() + 1) // 从周一开始
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        const dateStr = date.toISOString().slice(0, 10)
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        
        days.push({
            date: dateStr,
            dayOfMonth: date.getDate(),
            dayName: dayNames[date.getDay()],
            isToday: dateStr === currentDateStr.value
        })
    }
    return days
})

// 计算选中日期的计划
const selectedDatePlans = computed(() => {
    return store.plans.filter(plan => {
        if (plan.type === 'weekly') return false
        
        // 检查是否是特定范围类型的计划
        if (plan.dailyType === 'dateRange' && plan.startDate && plan.endDate) {
            const selected = new Date(selectedDate.value)
            const start = new Date(plan.startDate)
            const end = new Date(plan.endDate)
            return selected >= start && selected <= end
        }
        
        // 普通特定日期计划
        return plan.date === selectedDate.value
    })
})

// 按学科分组的计划
const plansBySubject = computed(() => {
    const grouped: { [key: string]: any[] } = {}
    selectedDatePlans.value.forEach(plan => {
        const subjectKey = String(plan.subject)
        if (!grouped[subjectKey]) {
            grouped[subjectKey] = []
        }
        grouped[subjectKey].push(plan)
    })
    return grouped
})

// 计算剩余计划数
const remainingPlans = computed(() => {
    return selectedDatePlans.value.filter(plan => !plan.completionLevel).length
})

// 计算积分进度
const pointsProgress = computed(() => {
    const todayPlans = store.plans.filter(plan => plan.date === currentDateStr.value)
    const maxPossiblePoints = todayPlans.length * 3
    const currentPoints = store.todayPoints
    return Math.min(Math.round((currentPoints / maxPossiblePoints) * 100), 100)
})

// 计算计时器显示时间
const timerTime = computed(() => {
    const hours = Math.floor(timerSeconds.value / 3600)
    const minutes = Math.floor((timerSeconds.value % 3600) / 60)
    const seconds = timerSeconds.value % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 加载本地存储的提醒设置
onMounted(() => {
    // 初始化今日计划
    store.initializeTodayPlans()
})

// 日历操作
function prevWeek() {
    const start = new Date(currentWeekStart.value)
    start.setDate(start.getDate() - 7)
    currentWeekStart.value = start
}

function nextWeek() {
    const start = new Date(currentWeekStart.value)
    start.setDate(start.getDate() + 7)
    currentWeekStart.value = start
}

function goToday() {
    currentWeekStart.value = new Date()
    selectedDate.value = currentDateStr.value
}

function selectDate(date: string) {
    selectedDate.value = date
}

function getDayPlanCount(date: string) {
    // 计算当日的日计划数量
    const dailyPlansCount = store.plans.filter(plan => plan.date === date && plan.type !== 'weekly').length
    
    // 检查该日期所在的周是否有周计划
    const hasWeeklyPlan = store.plans.some(plan => {
        if (plan.type !== 'weekly') return false
        
        // 检查是否有 selectedWeek 字段
        if (!plan.selectedWeek) {
            // 如果没有 selectedWeek，检查是否是周计划类型
            // 对于周计划，我们假设它属于当前周
            return true
        }
        
        try {
            // 解析周计划的日期范围（格式：YYYY-MM-DD-YYYY-MM-DD）
            const parts = plan.selectedWeek.split('-')
            if (parts.length === 6) {
                // 格式：YYYY-MM-DD-YYYY-MM-DD
                const weekStart = `${parts[0]}-${parts[1]}-${parts[2]}`
                const weekEnd = `${parts[3]}-${parts[4]}-${parts[5]}`
                
                // 将日期字符串转换为日期对象进行比较
                const currentDate = new Date(date)
                const startDate = new Date(weekStart)
                const endDate = new Date(weekEnd)
                
                // 比较日期
                return currentDate >= startDate && currentDate <= endDate
            } else {
                // 如果格式不正确，默认认为是周计划
                return true
            }
        } catch (error) {
            // 如果解析出错，默认认为是周计划
            return true
        }
    })
    
    // 如果该周有周计划，增加一条计划计数
    return dailyPlansCount + (hasWeeklyPlan ? 1 : 0)
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
}

// 获取计划图标
function getPlanIconBySubject(subject: string): string {
    const icons: { [key: string]: string } = {
        'chinese': '📚',
        'math': '🔢',
        'english': '🗣️'
    }
    return icons[subject] || '📝'
}

// 获取计划名称
function getPlanNameBySubject(subject: string): string {
    const names: { [key: string]: string } = {
        'chinese': '语文计划',
        'math': '数学计划',
        'english': '英语计划'
    }
    return names[subject] || '学习计划'
}

// 获取计划描述
function getPlanDescriptionBySubject(subject: string): string {
    // 使用默认描述
    const descriptions: { [key: string]: string } = {
        'chinese': '阅读一篇文章并理解内容',
        'math': '完成几道数学练习题',
        'english': '练习英语听力和口语'
    }
    return descriptions[subject] || '认真完成今日学习计划'
}

// 快速完成计划
function quickComplete(planId: string) {
    const plan = store.plans.find(p => p.id === planId)
    if (plan && !plan.completionLevel) {
        store.updatePlanCompletion(planId, true) // 标记为完成，获得积分
        const points = plan.points // 使用计划的points属性

        // 确保弹窗状态正确更新
        showPopup.value = false
        setTimeout(() => {
            popupMessage.value = '🎉 计划完成！'
            popupIcon.value = '🎊'
            popupPoints.value = points
            showPopup.value = true
            // 禁止背景页面滚动
            document.body.style.overflow = 'hidden'
        }, 50)

        // 检查是否完成了所有计划
        checkAllPlansCompleted()
    }
}

// 检查是否完成了所有计划
function checkAllPlansCompleted() {
    const todayPlans = store.plans.filter(plan => plan.date === currentDateStr.value && plan.type !== 'weekly')
    const allCompleted = todayPlans.length > 0 && todayPlans.every(plan => plan.completionLevel)
    
    if (allCompleted) {
        // 延迟显示奖励弹窗，让用户先看到计划完成的弹窗
        setTimeout(() => {
            // 随机掉落积分，概率随着积分的多少分配大小
            const randomPoints = getRandomPoints()
            if (randomPoints > 0) {
                store.adjustPoints(randomPoints, '完成所有计划随机掉落')
                showPopup.value = false
                setTimeout(() => {
                    popupMessage.value = '🎁 恭喜！完成所有计划获得随机积分！'
                    popupIcon.value = '💰'
                    popupPoints.value = randomPoints
                    showPopup.value = true
                    // 禁止背景页面滚动
                    document.body.style.overflow = 'hidden'
                }, 50)
            }
        }, 2000)
    }
}

// 获取随机积分，概率随着积分的多少分配大小
function getRandomPoints() {
    const random = Math.random() * 100
    if (random < 5) {
        return 8 // 5% 概率获得8积分
    } else if (random < 15) {
        return 7 // 10% 概率获得7积分
    } else if (random < 30) {
        return 6 // 15% 概率获得6积分
    } else if (random < 50) {
        return 5 // 20% 概率获得5积分
    } else if (random < 70) {
        return 4 // 20% 概率获得4积分
    } else if (random < 85) {
        return 3 // 15% 概率获得3积分
    } else if (random < 95) {
        return 2 // 10% 概率获得2积分
    } else if (random < 100) {
        return 1 // 5% 概率获得1积分
    } else {
        return 0 // 0% 概率获得0积分
    }
}

// 撤销完成
function undoComplete(planId: string) {
    store.undoPlanCompletion(planId)
    // 强制更新弹窗状态
    showPopup.value = false
    // 延迟显示撤销弹窗，确保响应式更新完成
    setTimeout(() => {
        popupMessage.value = '↩️ 已撤销完成状态'
        popupIcon.value = '🔄'
        popupPoints.value = 0
        showPopup.value = true
        // 禁止背景页面滚动
        document.body.style.overflow = 'hidden'
    }, 100)
}

// 开始计时
function startTimer(planId: string) {
    const plan = store.plans.find(p => p.id === planId)
    if (plan) {
        currentTimerPlanId.value = planId
        currentTimerPlanName.value = `${plan.subjectName} - ${getPlanNameBySubject(plan.subject)}`
        timerSeconds.value = 0
        isTimerPaused.value = false
        showTimerPopup.value = true
        // 禁止背景页面滚动
        document.body.style.overflow = 'hidden'
        
        // 开始计时
        if (timerInterval.value) {
            clearInterval(timerInterval.value)
        }
        
        timerInterval.value = window.setInterval(() => {
            if (!isTimerPaused.value) {
                timerSeconds.value++
            }
        }, 1000)
    }
}

// 暂停/继续计时
function pauseTimer() {
    isTimerPaused.value = !isTimerPaused.value
}

// 停止计时并完成计划
function stopTimer() {
    if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
    }
    
    showTimerPopup.value = false
    // 恢复背景页面滚动
    document.body.style.overflow = 'auto'
    
    // 完成计划
    if (currentTimerPlanId.value) {
        const plan = store.plans.find(p => p.id === currentTimerPlanId.value)
        if (plan && !plan.completionLevel) {
            store.updatePlanCompletion(currentTimerPlanId.value, true) // 标记为完成，获得积分
            const points = plan.points // 使用计划的points属性

            // 确保弹窗状态正确更新
            showPopup.value = false
            setTimeout(() => {
                popupMessage.value = '🎉 计划完成！'
                popupIcon.value = '🎊'
                popupPoints.value = points
                showPopup.value = true
                // 禁止背景页面滚动
                document.body.style.overflow = 'hidden'
            }, 50)

            // 检查是否完成了所有计划
            checkAllPlansCompleted()
        }
    }
    
    // 重置计时器
    timerSeconds.value = 0
    currentTimerPlanId.value = ''
    currentTimerPlanName.value = ''
}

// 关闭计时弹窗
function closeTimerPopup() {
    if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
    }
    
    showTimerPopup.value = false
    // 恢复背景页面滚动
    document.body.style.overflow = 'auto'
    timerSeconds.value = 0
    currentTimerPlanId.value = ''
    currentTimerPlanName.value = ''
}

// 关闭弹窗
function closePopup() {
    showPopup.value = false
    // 恢复背景页面滚动
    document.body.style.overflow = 'auto'
}

// 完成周计划
function completeWeeklyPlan(planId: string) {
    const plan = store.plans.find(p => p.id === planId)
    if (plan && !plan.completionLevel) {
        store.updatePlanCompletion(planId, true) // 标记为完成，获得积分
        const points = plan.points // 使用计划的points属性

        // 确保弹窗状态正确更新
        showPopup.value = false
        setTimeout(() => {
            popupMessage.value = '🎉 周计划完成！'
            popupIcon.value = '🎊'
            popupPoints.value = points
            showPopup.value = true
            // 禁止背景页面滚动
            document.body.style.overflow = 'hidden'
        }, 50)
    }
}

// 撤销完成周计划
function undoCompleteWeeklyPlan(planId: string) {
    const plan = store.plans.find(p => p.id === planId)
    if (plan && plan.type === 'weekly' && plan.completedCount > 0) {
        const currentCount = plan.completedCount
        // 对于周计划，调用 updatePlanCompletion 并传入 false 来减少一次完成次数
        store.updatePlanCompletion(planId, false)
        // 强制更新弹窗状态
        showPopup.value = false
        // 延迟显示撤销弹窗，确保响应式更新完成
        setTimeout(() => {
            popupMessage.value = `↩️ 已撤销第${currentCount}次完成`
            popupIcon.value = '🔄'
            popupPoints.value = 0
            showPopup.value = true
            // 禁止背景页面滚动
            document.body.style.overflow = 'hidden'
        }, 100)
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
/* 主容器样式 */
.plan-container {
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

/* 日历区域 */
.calendar-section {
    margin-bottom: 20px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    position: relative;
    z-index: 1;
}

.calendar-header h2 {
    color: #ff6b8b;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.1);
}

.calendar-controls {
    display: flex;
    gap: 10px;
    align-items: center;
}

.calendar-btn {
    padding: 8px 12px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(255, 138, 171, 0.3);
}

.calendar-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255, 107, 139, 0.4);
    background: linear-gradient(135deg, #ff6b8b 0%, #ff4757 100%);
}

.calendar-btn.today {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
}

.calendar-btn.today:hover {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    box-shadow: 0 6px 15px rgba(34, 197, 94, 0.4);
}

.calendar-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    position: relative;
    z-index: 1;
}

.calendar-day {
    background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
    border: 2px solid #ffd6e0;
    border-radius: 16px;
    padding: 15px 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.calendar-day:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 107, 139, 0.2);
    border-color: #ff8fab;
}

.calendar-day.today {
    background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
    border-color: #4ade80;
    box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
}

.calendar-day.selected {
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
    border-color: #0ea5e9;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.day-number {
    font-size: 1.2rem;
    font-weight: 700;
    color: #ff6b8b;
    margin-bottom: 5px;
}

.day-name {
    font-size: 0.8rem;
    color: #ff8fab;
    margin-bottom: 8px;
}

.day-plans {
    font-size: 0.75rem;
    color: #ff6b8b;
    font-weight: 500;
    background-color: rgba(255, 107, 139, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
    display: inline-block;
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
    pointer-events: none;
}

/* 星星装饰 */
.star {
    width: 15px;
    height: 15px;
    background-color: #ffda6a;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    box-shadow: 0 0 8px #ffda6a;
}

/* 爱心装饰 */
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

/* 云朵装饰 */
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

/* 页面头部 */
.plan-header {
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

.plan-header::before {
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

.plan-header h1 {
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

/* 计划内容区域 */
.plan-content {
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

/* 计划区域 */
.plans-section {
    position: relative;
}

/* 学科分类区域 */
.subject-section {
    margin-bottom: 30px;
    background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
    border-radius: 20px;
    border: 2px solid #ffd6e0;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    overflow: hidden;
}

/* 学科标题 */
.subject-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 20px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    font-weight: 700;
}

.subject-header .subject-icon {
    font-size: 1.5rem;
}

.subject-header h3 {
    margin: 0;
    font-size: 1.2rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subject-section .plans-list {
    padding: 20px;
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

.plan-count {
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

/* 计划项 */
.plans-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.plan-item {
    padding: 20px;
    transition: all 0.3s ease;
}

.plan-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
}

.plan-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #ff6b8b;
    display: flex;
    align-items: center;
    gap: 8px;
}

.plan-icon {
    font-size: 1.5rem;
}

.plan-badge {
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.plan-badge.pending {
    background-color: #ffedf2;
    color: #ff8fab;
    border: 1px solid #ffd6e0;
}

.plan-badge.easy {
    background-color: #f0fff4;
    color: #4ade80;
    border: 1px solid #bbf7d0;
}

.plan-badge.medium {
    background-color: #fefce8;
    color: #facc15;
    border: 1px solid #fde68a;
}

.plan-badge.hard {
    background-color: #fff1f2;
    color: #f87171;
    border: 1px solid #fecdd3;
}

.plan-badge.completed {
    background-color: #e0f2fe;
    color: #0ea5e9;
    border: 1px solid #bae6fd;
}

.plan-description {
    color: #ff8fab;
    margin: 0 0 15px 0;
    font-size: 1rem;
    position: relative;
    z-index: 1;
    line-height: 1.4;
}

/* 计划详情项 */
.plan-details {
    margin-bottom: 15px;
    position: relative;
    z-index: 1;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #ff8fab;
    margin-bottom: 5px;
}

.detail-icon {
    font-size: 1rem;
}

.detail-text {
    font-weight: 500;
}

.plan-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    position: relative;
    z-index: 1;
}

.plan-points {
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

/* 计划操作按钮 */
.plan-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.action-btn {
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

.action-btn.start-timer {
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
    color: #0ea5e9;
    border-color: #0ea5e9;
}

.action-btn.start-timer:hover {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

.action-btn.quick-complete {
    background: linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%);
    color: #22c55e;
    border-color: #22c55e;
}

.action-btn.quick-complete:hover {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.action-btn.undo {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    color: #f59e0b;
    border-color: #f59e0b;
}

.action-btn.undo:hover {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-icon {
    font-size: 1rem;
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

/* 提醒设置 */
.reminder-settings {
    background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%);
    padding: 20px;
    margin-top: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(128, 222, 234, 0.3);
}

.reminder-settings .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.reminder-settings .card-header h3 {
    color: #006064;
    margin: 0;
    font-size: 1.3em;
}

.reminder-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.reminder-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.8);
}

.reminder-label {
    font-size: 1em;
    color: #00838f;
    font-weight: 500;
}

.toggle-switch {
    width: 50px;
    height: 25px;
    border-radius: 25px;
    background-color: #e0f7fa;
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s;
}

.toggle-switch:checked {
    background-color: #00bcd4;
}

.toggle-switch::before {
    content: '';
    width: 21px;
    height: 21px;
    border-radius: 50%;
    background-color: white;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: left 0.3s;
}

.toggle-switch:checked::before {
    left: 27px;
}

.time-input {
    padding: 10px;
    border: 2px solid #80deea;
    border-radius: 10px;
    font-size: 1em;
    color: #006064;
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
}

.frequency-select {
    padding: 10px 15px;
    border: 2px solid #80deea;
    border-radius: 10px;
    font-size: 1em;
    color: #006064;
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg fill="#006064" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 10px top 50%;
    padding-right: 40px;
}

.custom-days .days-container {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.custom-days .day-item {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
}

.custom-days .day-checkbox {
    width: 18px;
    height: 18px;
    accent-color: #00bcd4;
    cursor: pointer;
}

.custom-days .day-label {
    font-size: 0.95em;
    color: #006064;
    cursor: pointer;
    user-select: none;
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

/* 新增游戏按钮样式 */
.game-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    font-weight: 700;
    box-shadow: 0 6px 15px rgba(255, 138, 171, 0.4);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
}

.game-btn::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transform: rotate(45deg);
    animation: shimmer 3s infinite;
}

.game-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(255, 107, 139, 0.5);
    background: linear-gradient(135deg, #ff6b8b 0%, #ff4757 100%);
}

.game-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(255, 107, 139, 0.4);
}

.btn-icon {
    font-size: 1.2rem;
    animation: bounce 1.5s ease-in-out infinite;
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

/* 计时弹窗样式 */
.timer-popup {
    text-align: center;
}

.timer-header {
    margin-bottom: 20px;
}

.timer-header h3 {
    color: #ff6b8b;
    font-size: 1.3rem;
    margin: 0 0 10px 0;
    font-weight: 700;
}

.timer-plan-name {
    color: #ff8fab;
    font-size: 1.1rem;
    font-weight: 600;
}

.timer-display {
    font-size: 3rem;
    font-weight: 800;
    color: #ff6b8b;
    margin: 30px 0;
    text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.2);
    font-family: 'Courier New', monospace;
}

.timer-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
}

/* 周计划模块 */
.weekly-plans-section {
    margin-top: 20px;
}

.week-range {
    font-size: 0.8em;
    color: #ff8fab;
    font-weight: normal;
    margin-left: 10px;
    background-color: rgba(255, 138, 171, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
}

.weekly-plans-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.weekly-plan-item {
    padding: 20px;
    transition: all 0.3s ease;
}

.no-plans {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
    border: 2px dashed #ffd6e0;
    border-radius: 16px;
    color: #ff8fab;
    grid-column: 1 / -1; /* 占满整个宽度 */
}

.no-plans-icon {
    font-size: 3rem;
    margin-bottom: 15px;
}

.no-plans-text {
    font-size: 1.1rem;
    font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .plans-list {
        grid-template-columns: 1fr;
    }

    .weekly-plans-list {
        grid-template-columns: 1fr;
    }

    .plan-container {
        padding: 15px;
    }

    .plan-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .header-content h1 {
        font-size: 1.5rem;
    }

    .plan-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .plan-actions {
        justify-content: center;
    }

    .today-points .points-number {
        font-size: 2.5rem;
    }

    .section-header {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .plan-header-info {
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

    .calendar-week {
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
    }

    .calendar-day {
        padding: 10px 5px;
    }

    .day-number {
        font-size: 1rem;
    }

    .day-name {
        font-size: 0.7rem;
    }

    .day-plans {
        font-size: 0.65rem;
    }

    .timer-display {
        font-size: 2rem;
    }

    .timer-actions {
        flex-direction: column;
        align-items: center;
    }
}

@media (max-width: 480px) {
    .calendar-week {
        grid-template-columns: repeat(7, 1fr);
        gap: 3px;
    }

    .calendar-day {
        padding: 8px 3px;
        border-radius: 10px;
    }

    .day-number {
        font-size: 0.9rem;
    }

    .day-name {
        font-size: 0.6rem;
        margin-bottom: 3px;
    }

    .day-plans {
        font-size: 0.55rem;
        padding: 2px 4px;
    }

    .calendar-btn {
        padding: 6px 10px;
        font-size: 0.8rem;
    }
}
</style>