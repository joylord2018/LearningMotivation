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

const emit = defineEmits(['show-task-modal', 'show-quick-setup', 'notification', 'confirm'])

const filterStartDate = computed(() => dateRange.value[0] || '')
const filterEndDate = computed(() => dateRange.value[1] || '')

const filteredPlans = computed(() => {
    return store.plans.filter(plan => {
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
    emit('confirm', {
        message: `确定要删除计划 "${task.subjectName}" 吗？`,
        action: () => {
            store.removePlan(task.id)
            emit('notification', '计划删除成功！', 'success', '✅')
        }
    })
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
    gap: 12px;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
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