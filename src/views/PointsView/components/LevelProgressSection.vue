<template>
    <div class="level-progress">
        <div class="level-info">
            <span class="level-badge">Lv.{{ currentLevel }}</span>
            <span class="next-level-text">距离下一级还需 {{ pointsToNextLevel }} 积分</span>
        </div>
        <div class="level-bar">
            <div class="level-fill" :style="{ width: levelProgress + '%' }"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../../../stores/userStore'

const store = useUserStore()

// 等级相关计算属性
const currentLevel = computed(() => {
    return Math.floor(store.currentPoints / 100) + 1
})

const pointsToNextLevel = computed(() => {
    const nextLevelPoints = currentLevel.value * 100
    return Math.max(0, nextLevelPoints - store.currentPoints)
})

const levelProgress = computed(() => {
    const currentLevelMin = (currentLevel.value - 1) * 100
    const currentLevelMax = currentLevel.value * 100
    const progress = ((store.currentPoints - currentLevelMin) / (currentLevelMax - currentLevelMin)) * 100
    return Math.min(100, progress)
})
</script>

<style scoped>
/* 等级进度条 */
.level-progress {
    background: white;
    padding: 20px;
    border-radius: 20px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
    position: relative;
    z-index: 1;
}

.level-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.level-badge {
    background: linear-gradient(135deg, #ffd700, #ffa502);
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1rem;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.next-level-text {
    color: #ff8fab;
    font-size: 0.9rem;
    font-weight: 600;
}

.level-bar {
    height: 15px;
    background-color: #ffedf2;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid #ffd6e0;
}

.level-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff8fab 0%, #ff6b8b 100%);
    transition: width 0.5s ease;
    position: relative;
}

.level-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .level-info {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }
}
</style>