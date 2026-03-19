<template>
    <div class="tab-content">
        <div class="admin-section">
            <div class="section-header">
                <h2 class="section-title">📝 计划管理</h2>
                <div class="section-decoration"></div>
            </div>
            <div class="section-content">
                <div class="action-buttons-row">
                    <button class="btn add-task-btn" @click="showAddTaskModal">
                        <span class="btn-icon">➕</span>
                        <span>添加新计划</span>
                    </button>
                    <button class="btn quick-setup-btn" @click="openQuickSetupDrawer">
                        <span class="btn-icon">⚡</span>
                        <span>便捷设置</span>
                    </button>
                </div>
                
                <!-- 日历选择器 -->
                <div class="calendar-section">
                    <div class="calendar-header">
                        <h3>📅 选择日期</h3>
                        <div class="calendar-month">
                            {{ currentMonthYear }}
                        </div>
                        <div class="calendar-controls">
                            <button @click="prevWeek" class="calendar-btn">←</button>
                            <button @click="goToday" class="calendar-btn today">今天</button>
                            <button @click="nextWeek" class="calendar-btn">→</button>
                        </div>
                    </div>
                    <div class="calendar-week">
                        <div v-for="day in weekDays" :key="day.date" 
                            class="calendar-day" 
                            :class="{ 'today': day.isToday, 'selected': selectedDate.toISOString().slice(0, 10) === day.date }"
                            @click="selectDate(day.date)">
                            <div class="day-number">{{ day.dayOfMonth }}</div>
                            <div class="day-name">{{ day.dayName }}</div>
                            <div class="day-plans">{{ getDayPlanCount(day.date) }}个计划</div>
                        </div>
                    </div>
                </div>
                
                <!-- 筛选按钮 -->
                <div class="filter-buttons">
                    <button 
                        class="filter-btn" 
                        :class="{ active: selectedFilters.includes('all') }"
                        @click="toggleFilter('all')"
                    >
                        全部
                    </button>
                    <button 
                        class="filter-btn" 
                        :class="{ active: selectedFilters.includes('chinese') }"
                        @click="toggleFilter('chinese')"
                    >
                        📚 语文
                    </button>
                    <button 
                        class="filter-btn" 
                        :class="{ active: selectedFilters.includes('math') }"
                        @click="toggleFilter('math')"
                    >
                        🔢 数学
                    </button>
                    <button 
                        class="filter-btn" 
                        :class="{ active: selectedFilters.includes('english') }"
                        @click="toggleFilter('english')"
                    >
                        🗣️ 英语
                    </button>
                    <button 
                        class="filter-btn" 
                        :class="{ active: selectedFilters.includes('general') }"
                        @click="toggleFilter('general')"
                    >
                        🎯 全科
                    </button>
                    <button 
                        class="filter-btn" 
                        :class="{ active: selectedFilters.includes('dateRange') }"
                        @click="toggleFilter('dateRange')"
                    >
                        📅 范围
                    </button>
                    <button 
                        class="filter-btn" 
                        :class="{ active: selectedFilters.includes('weekly') }"
                        @click="toggleFilter('weekly')"
                    >
                        📋 周计划
                    </button>
                </div>
                
                <!-- 日期范围选择 -->
                <div v-if="selectedFilters.includes('dateRange')" class="date-range-filter">
                    <div class="form-group">
                        <label class="form-label">日期范围</label>
                        <el-date-picker
                            v-model="dateRange"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            style="width: 100%"
                        />
                    </div>
                </div>
                
                <div v-if="Object.keys(filteredPlansBySubject).length === 0" class="no-tasks">
                    <p class="no-tasks-text">暂无符合条件的计划</p>
                    <p class="no-tasks-hint">请调整筛选条件或添加新计划</p>
                </div>
                <div v-else>
                    <div v-for="(plans, subject) in filteredPlansBySubject" :key="subject" class="subject-section">
                        <div class="subject-header">
                            <span class="subject-icon">{{ getPlanIconBySubject(String(subject)) }}</span>
                            <h3>{{ getPlanNameBySubject(String(subject)) }}</h3>
                        </div>
                        <div class="tasks-list">
                            <div v-for="(task, index) in plans" :key="task.id" class="task-item fade-in"
                                :style="{ animationDelay: index * 0.05 + 's' }">
                                <div class="task-info">
                                    <div class="task-header">
                                        <span class="task-icon">{{ task.icon || '📝' }}</span>
                                        <h3 class="task-name">{{ task.subjectName }}</h3>
                                        <span class="task-points">{{ task.points }} 🎯</span>
                                    </div>
                                    <p class="task-description">{{ task.description }}</p>
                                    <div class="task-meta">
                                        <span class="task-date">{{ task.date }}</span>
                                        <span class="task-subject">{{ getPlanNameBySubject(String(task.subject)) }}</span>
                                        <span v-if="task.dailyType === 'dateRange'" class="task-type">
                                            特定范围: {{ formatDate(task.startDate) }} 至 {{ formatDate(task.endDate) }}
                                        </span>
                                        <span v-else-if="task.dailyType === 'everyday'" class="task-type">
                                            每天
                                        </span>
                                        <span v-else-if="task.type === 'weekly'" class="task-type">
                                            周计划
                                        </span>
                                        <span v-else class="task-type">
                                            特定日期
                                        </span>
                                    </div>
                                </div>
                                <div class="task-actions">
                                    <button class="btn edit-btn" @click="editTask(task)">
                                        <span class="btn-icon">✏️</span>
                                        <span>编辑</span>
                                    </button>
                                    <button class="btn delete-btn" @click="confirmDeleteTask(task)">
                                        <span class="btn-icon">🗑️</span>
                                        <span>删除</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../../stores'

const store = useUserStore()

const selectedFilters = ref<string[]>(['all'])
const dateRange = ref<string[]>([])
const selectedDate = ref(new Date())

const emit = defineEmits(['show-task-modal', 'show-quick-setup', 'notification', 'confirm'])

const filterStartDate = computed(() => dateRange.value[0] || '')
const filterEndDate = computed(() => dateRange.value[1] || '')

// 检查特定日期是否有计划
function hasPlansOnDate(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0]
    return store.plans.some(plan => plan.date === dateStr)
}

// 处理日期选择
function handleDatePick(date: Date) {
    selectedDate.value = date
    // 可以在这里添加逻辑，例如筛选该日期的计划
}

// 格式化日期
function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 日历相关
const currentWeekStart = ref(new Date())

// 计算当前月份和年份
const currentMonthYear = computed(() => {
  try {
    const date = new Date(currentWeekStart.value)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return `${year}年${month}月`
  } catch (error) {
    return '2024年1月'
  }
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
      isToday: dateStr === new Date().toISOString().slice(0, 10)
    })
  }
  return days
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
  selectedDate.value = new Date()
}

function selectDate(date: string) {
  selectedDate.value = new Date(date)
}

function getDayPlanCount(date: string) {
  const filteredPlans = store.plans.filter(plan => {
    // 特定日期计划
    if (plan.type === 'daily' && plan.dailyType === 'specific' && plan.date === date) {
      return true
    }
    
    // 日期范围计划 - 只计算一次，避免重复
    if (plan.type === 'daily' && plan.dailyType === 'dateRange' && plan.startDate && plan.endDate) {
      const selected = new Date(date)
      const start = new Date(plan.startDate)
      const end = new Date(plan.endDate)
      // 只在计划的date属性与当前日期匹配时计算，避免重复
      return selected >= start && selected <= end && plan.date === date
    }
    
    // 每天计划
    if (plan.type === 'daily' && plan.dailyType === 'everyday') {
      return true
    }
    
    // 周计划
    if (plan.type === 'weekly') {
      // 检查该日期所在的周是否有周计划
      if (!plan.selectedWeek) {
        // 如果没有 selectedWeek，检查是否是当前周
        const currentDate = new Date(date)
        const now = new Date()
        const currentWeekStart = new Date(now)
        currentWeekStart.setDate(now.getDate() - now.getDay() + 1)
        const currentWeekEnd = new Date(currentWeekStart)
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
        return currentDate >= currentWeekStart && currentDate <= currentWeekEnd
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
          // 如果格式不正确，默认认为是当前周
          const currentDate = new Date(date)
          const now = new Date()
          const currentWeekStart = new Date(now)
          currentWeekStart.setDate(now.getDate() - now.getDay() + 1)
          const currentWeekEnd = new Date(currentWeekStart)
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
          return currentDate >= currentWeekStart && currentDate <= currentWeekEnd
        }
      } catch (error) {
        // 如果解析出错，默认认为是当前周
        const currentDate = new Date(date)
        const now = new Date()
        const currentWeekStart = new Date(now)
        currentWeekStart.setDate(now.getDate() - now.getDay() + 1)
        const currentWeekEnd = new Date(currentWeekStart)
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
        return currentDate >= currentWeekStart && currentDate <= currentWeekEnd
      }
    }
    
    return false
  })
  
  return filteredPlans.length
}

const filteredPlans = computed(() => {
    return store.plans.filter(plan => {
        // 首先检查日期过滤
        const selectedDateStr = selectedDate.value.toISOString().slice(0, 10)
        
        // 对于特定日期计划，检查是否匹配选中日期
        if (plan.type === 'daily' && plan.dailyType === 'specific' && plan.date !== selectedDateStr) {
            return false
        }
        
        // 对于日期范围计划，检查是否在范围内且日期匹配
        if (plan.type === 'daily' && plan.dailyType === 'dateRange' && plan.startDate && plan.endDate) {
            const selected = new Date(selectedDateStr)
            const start = new Date(plan.startDate)
            const end = new Date(plan.endDate)
            if (selected < start || selected > end || plan.date !== selectedDateStr) {
                return false
            }
        }
        
        // 对于每天计划，默认显示
        if (plan.type === 'daily' && plan.dailyType === 'everyday') {
            // 每天计划默认显示
        }
        
        // 对于每周计划，检查是否应该显示
        if (plan.type === 'weekly') {
            // 检查该日期所在的周是否有周计划
            if (!plan.selectedWeek) {
                // 如果没有 selectedWeek，检查是否是当前周
                const currentDate = new Date(selectedDateStr)
                const now = new Date()
                const currentWeekStart = new Date(now)
                currentWeekStart.setDate(now.getDate() - now.getDay() + 1)
                const currentWeekEnd = new Date(currentWeekStart)
                currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
                if (!(currentDate >= currentWeekStart && currentDate <= currentWeekEnd)) {
                    return false
                }
            } else {
                try {
                    // 解析周计划的日期范围（格式：YYYY-MM-DD-YYYY-MM-DD）
                    const parts = plan.selectedWeek.split('-')
                    if (parts.length === 6) {
                        // 格式：YYYY-MM-DD-YYYY-MM-DD
                        const weekStart = `${parts[0]}-${parts[1]}-${parts[2]}`
                        const weekEnd = `${parts[3]}-${parts[4]}-${parts[5]}`
                        
                        // 将日期字符串转换为日期对象进行比较
                        const currentDate = new Date(selectedDateStr)
                        const startDate = new Date(weekStart)
                        const endDate = new Date(weekEnd)
                        
                        // 比较日期
                        if (!(currentDate >= startDate && currentDate <= endDate)) {
                            return false
                        }
                    } else {
                        // 如果格式不正确，默认认为是当前周
                        const currentDate = new Date(selectedDateStr)
                        const now = new Date()
                        const currentWeekStart = new Date(now)
                        currentWeekStart.setDate(now.getDate() - now.getDay() + 1)
                        const currentWeekEnd = new Date(currentWeekStart)
                        currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
                        if (!(currentDate >= currentWeekStart && currentDate <= currentWeekEnd)) {
                            return false
                        }
                    }
                } catch (error) {
                    // 如果解析出错，默认认为是当前周
                    const currentDate = new Date(selectedDateStr)
                    const now = new Date()
                    const currentWeekStart = new Date(now)
                    currentWeekStart.setDate(now.getDate() - now.getDay() + 1)
                    const currentWeekEnd = new Date(currentWeekStart)
                    currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
                    if (!(currentDate >= currentWeekStart && currentDate <= currentWeekEnd)) {
                        return false
                    }
                }
            }
        }
        
        // 检查其他筛选条件
        if (selectedFilters.value.includes('all')) {
            return true
        }
        
        const subjectFilters = ['chinese', 'math', 'english', 'general']
        const selectedSubjects = selectedFilters.value.filter(f => subjectFilters.includes(f))
        if (selectedSubjects.length > 0 && !selectedSubjects.includes(plan.subject)) {
            return false
        }
        
        if (selectedFilters.value.includes('weekly') && plan.type !== 'weekly') {
            return false
        }
        
        if (selectedFilters.value.includes('dateRange') && filterStartDate.value && filterEndDate.value) {
            const planDate = new Date(plan.date)
            const startDate = new Date(filterStartDate.value)
            const endDate = new Date(filterEndDate.value)
            if (planDate < startDate || planDate > endDate) {
                return false
            }
        }
        
        return true
    })
})

const filteredPlansBySubject = computed(() => {
    const grouped: { [key: string]: any[] } = {}
    filteredPlans.value.forEach(plan => {
        const subjectKey = String(plan.subject)
        if (!grouped[subjectKey]) {
            grouped[subjectKey] = []
        }
        grouped[subjectKey].push(plan)
    })
    
    // 按固定顺序排序：语文、数学、英语、全科
    const orderedGroups: { [key: string]: any[] } = {}
    const subjectOrder = ['chinese', 'math', 'english', 'general']
    subjectOrder.forEach(subject => {
        if (grouped[subject]) {
            orderedGroups[subject] = grouped[subject]
        }
    })
    
    return orderedGroups
})

function toggleFilter(filter: string) {
    if (filter === 'all') {
        selectedFilters.value = ['all']
    } else {
        if (selectedFilters.value.includes('all')) {
            selectedFilters.value = []
        }
        
        const index = selectedFilters.value.indexOf(filter)
        if (index > -1) {
            selectedFilters.value.splice(index, 1)
        } else {
            selectedFilters.value.push(filter)
        }
        
        if (selectedFilters.value.length === 0) {
            selectedFilters.value = ['all']
        }
    }
}

function getPlanIconBySubject(subject: string): string {
    const icons: { [key: string]: string } = {
        'chinese': '📚',
        'math': '🔢',
        'english': '🗣️',
        'general': '🎯'
    }
    return icons[subject.toLowerCase()] || '📝'
}

function getPlanNameBySubject(subject: string): string {
    const names: { [key: string]: string } = {
        'chinese': '语文计划',
        'math': '数学计划',
        'english': '英语计划',
        'general': '全科计划'
    }
    return names[subject.toLowerCase()] || '学习计划'
}

function showAddTaskModal() {
    emit('show-task-modal', null)
}

function editTask(task: any) {
    emit('show-task-modal', task)
}

function confirmDeleteTask(task: any) {
    // 检查是否是日期范围计划
    if (task.dailyType === 'dateRange' && task.startDate && task.endDate) {
        emit('confirm', {
            message: `确定要删除计划 "${task.subjectName}" 及其整个日期范围内的所有计划吗？`,
            action: () => {
                // 找到该日期范围内的所有计划并删除
                const plansToDelete = store.plans.filter(plan => {
                    return plan.dailyType === 'dateRange' && 
                           plan.startDate === task.startDate && 
                           plan.endDate === task.endDate && 
                           plan.subjectName === task.subjectName
                })
                
                plansToDelete.forEach(plan => {
                    store.removePlan(plan.id)
                })
                
                emit('notification', `成功删除 ${plansToDelete.length} 个计划！`, 'success', '✅')
            }
        })
    } else {
        emit('confirm', {
            message: `确定要删除计划 "${task.subjectName}" 吗？`,
            action: () => {
                store.removePlan(task.id)
                emit('notification', '计划删除成功！', 'success', '✅')
            }
        })
    }
}

function openQuickSetupDrawer() {
    emit('show-quick-setup')
}
</script>

<style scoped>
.action-buttons-row {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.add-task-btn,
.quick-setup-btn {
    background: linear-gradient(135deg, #ff6b8b 0%, #ff8fab 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.quick-setup-btn {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
}

.add-task-btn:hover,
.quick-setup-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.calendar-section {
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    position: relative;
    z-index: 1;
    flex-wrap: wrap;
    gap: 10px;
}

.calendar-header h3 {
    color: #ff6b8b;
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.1);
}

.calendar-month {
    font-size: 1.1rem;
    font-weight: 600;
    color: #ff8fab;
    background-color: rgba(255, 138, 171, 0.1);
    padding: 6px 12px;
    border-radius: 15px;
    text-align: center;
    min-width: 100px;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 10 !important;
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

.filter-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 8px 16px;
    border: 2px solid #ffd6e0;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 600;
    color: #666;
}

.filter-btn.active {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border-color: #ff6b8b;
}

.date-range-filter {
    margin-bottom: 20px;
}

.no-tasks {
    text-align: center;
    padding: 40px 20px;
    color: #999;
}

.no-tasks-text {
    font-size: 18px;
    margin-bottom: 8px;
}

.no-tasks-hint {
    font-size: 14px;
}

.subject-section {
    margin-bottom: 30px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.subject-header {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.subject-icon {
    font-size: 20px;
}

.subject-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
}

.tasks-list {
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.task-item {
    background: white;
    border: 2px solid #ffd6e0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.task-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-info {
    flex: 1;
    margin-right: 16px;
}

.task-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.task-icon {
    font-size: 20px;
    margin-right: 10px;
}

.task-name {
    flex: 1;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #ff6b8b;
}

.task-points {
    font-size: 14px;
    font-weight: 600;
    color: #ff8fab;
}

.task-description {
    margin: 8px 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}

.task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
}

.task-type {
    background-color: #f0f0f0;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    color: #666;
}

.task-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.edit-btn,
.delete-btn {
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 5px;
}

.edit-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
    color: white;
}

.delete-btn {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    color: white;
}

.edit-btn:hover,
.delete-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .tasks-list {
        grid-template-columns: 1fr;
    }
    
    .action-buttons-row {
        flex-direction: column;
    }
    
    .filter-buttons {
        flex-wrap: wrap;
    }
}
</style>