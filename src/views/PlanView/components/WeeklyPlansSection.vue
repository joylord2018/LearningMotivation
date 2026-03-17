<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../../../stores'

const store = useUserStore()

// Props
const props = defineProps<{
  weekStart: Date
}>()

// Emits
const emit = defineEmits<{
  (e: 'completeWeeklyPlan', planId: string): void
  (e: 'undoCompleteWeeklyPlan', planId: string): void
}>()

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
    const startOfWeek = new Date(props.weekStart)
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
                frequency: plan.frequency === 'weekly' ? '每周' : plan.frequency === 'daily' ? '每天' : plan.frequency === 'once' ? '一次' : plan.frequency,
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
    const startOfWeek = new Date(props.weekStart)
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

// 获取计划图标
function getPlanIconBySubject(subject: string): string {
  const icons: { [key: string]: string } = {
    'chinese': '📚',
    'math': '🔢',
    'english': '🗣️',
    'general': '🎯'
  }
  return icons[subject] || '📝'
}

// 完成周计划
function completeWeeklyPlan(planId: string) {
  emit('completeWeeklyPlan', planId)
}

// 撤销完成周计划
function undoCompleteWeeklyPlan(planId: string) {
  emit('undoCompleteWeeklyPlan', planId)
}
</script>

<style scoped>
/* 周计划模块 */
.weekly-plans-section {
    margin-top: 20px;
}

.weekly-plans-list {
    display: grid;
    gap: 15px;
}

.weekly-plan-item {
    padding: 20px;
    transition: all 0.3s ease;
}

.week-range {
    font-size: 0.8rem;
    color: #ff8fab;
    font-weight: normal;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .weekly-plans-list {
        grid-template-columns: 1fr;
    }
}
</style>