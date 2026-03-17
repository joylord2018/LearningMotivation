<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../../../stores'

const store = useUserStore()

// 计算积分进度
const pointsProgress = computed(() => {
    const todayPlans = store.plans.filter(plan => plan.date === new Date().toISOString().slice(0, 10))
    const maxPossiblePoints = todayPlans.length * 3
    const currentPoints = store.todayPoints
    return Math.min(Math.round((currentPoints / maxPossiblePoints) * 100), 100)
})
</script>

<style scoped>
/* 今日积分展示卡片 */
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
</style>