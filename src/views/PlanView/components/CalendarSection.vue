<template>
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from '../../../stores'

const store = useUserStore()

// 日历相关
const currentDateStr = ref(new Date().toISOString().slice(0, 10))
const selectedDate = ref(currentDateStr.value)
const currentWeekStart = ref(new Date())

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

// 暴露给父组件
const weekStart = computed(() => currentWeekStart.value)
export { selectedDate, weekStart, currentDateStr }
</script>

<style scoped>
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
</style>