<template>
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
              <div v-if="plan.type === 'weekly'" class="detail-item">
                <span class="detail-icon">🔄</span>
                <span class="detail-text">本周第{{ plan.completedCount + 1 }}次</span>
              </div>
              <div v-if="plan.type === 'weekly' || plan.targetCount > 1" class="detail-item">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../../../stores'

const store = useUserStore()

// Props
const props = defineProps<{
  selectedDate: string
  currentDateStr: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'startTimer', planId: string): void
  (e: 'quickComplete', planId: string): void
  (e: 'undoComplete', planId: string): void
}>()

// 计算选中日期的计划
const selectedDatePlans = computed(() => {
  return store.plans.filter(plan => {
    if (plan.type === 'weekly') return false
    
    // 检查是否是特定范围类型的计划
    if (plan.dailyType === 'dateRange' && plan.startDate && plan.endDate) {
      const selected = new Date(props.selectedDate)
      const start = new Date(plan.startDate)
      const end = new Date(plan.endDate)
      return selected >= start && selected <= end
    }
    
    // 普通特定日期计划
    return plan.date === props.selectedDate
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

// 格式化日期
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
    'english': '🗣️',
    'general': '🎯'
  }
  return icons[subject] || '📝'
}

// 获取计划名称
function getPlanNameBySubject(subject: string): string {
  const names: { [key: string]: string } = {
    'chinese': '语文计划',
    'math': '数学计划',
    'english': '英语计划',
    'general': '全科计划'
  }
  return names[subject] || '学习计划'
}

// 获取计划描述
function getPlanDescriptionBySubject(subject: string): string {
  // 使用默认描述
  const descriptions: { [key: string]: string } = {
    'chinese': '阅读一篇文章并理解内容',
    'math': '完成几道数学练习题',
    'english': '练习英语听力和口语',
    'general': '综合复习各个学科的知识点'
  }
  return descriptions[subject] || '认真完成今日学习计划'
}

// 快速完成计划
function quickComplete(planId: string) {
  emit('quickComplete', planId)
}

// 撤销完成
function undoComplete(planId: string) {
  emit('undoComplete', planId)
}

// 开始计时
function startTimer(planId: string) {
  emit('startTimer', planId)
}
</script>

<style scoped>
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

/* 无计划状态 */
.no-plans {
    text-align: center;
    padding: 60px 20px;
    color: #ffb6c1;
}

.no-plans-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: bounce 1s ease-in-out infinite;
}

.no-plans-text {
    font-size: 1.2rem;
    font-weight: 500;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .plans-list {
        grid-template-columns: 1fr;
    }
}
</style>