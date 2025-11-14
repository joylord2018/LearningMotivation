<template>
    <div class="nav-tabs">
        <button v-for="tab in tabs" :key="tab.path" class="tab-btn" :class="{ active: currentPath === tab.path }"
            @click="navigateTo(tab.path)">
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-text">{{ tab.text }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 定义导航标签数据
const tabs = ref([
    { path: '/tasks', icon: '📝', text: '任务' },
    { path: '/points', icon: '⭐', text: '积分' },
    { path: '/achievements', icon: '🏆', text: '成就' },
    { path: '/statistics', icon: '📊', text: '统计' },
    { path: '/admin', icon: '🛠️', text: '管理' },
    { path: '/profile', icon: '👤', text: '个人信息' }
])

const router = useRouter()
const route = useRoute()

// 计算当前路径，用于高亮当前标签
const currentPath = computed(() => {
    return route.path
})

// 导航到指定路径
function navigateTo(path: string) {
    router.push(path)
}
</script>

<style scoped>
/* 导航标签 - 优化为可爱粉嫩游戏风格 */
.nav-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #fff0f3 0%, #ffe6ec 100%);
    padding: 15px;
    border-radius: 25px;
    box-shadow: 0 6px 20px rgba(255, 107, 129, 0.15),
        0 0 0 3px rgba(255, 175, 191, 0.3);
    position: relative;
    z-index: 1;
    flex-wrap: wrap;
}

.tab-btn {
    flex: 1;
    min-width: 120px;
    padding: 15px 10px;
    background: linear-gradient(145deg, #ffffff, #f0f0f0);
    border: 2px solid #ffb3c1;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    color: #5f27cd;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05),
        inset 0 -2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    position: relative;
    overflow: hidden;
}

.tab-btn::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    transform: rotate(45deg);
    transition: all 0.3s ease;
    opacity: 0;
}

.tab-btn:hover {
    background: linear-gradient(145deg, #ffecee, #ffffff);
    border-color: #ff6b81;
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(255, 107, 129, 0.2),
        0 0 0 3px rgba(255, 107, 129, 0.2);
}

.tab-btn:hover::before {
    opacity: 1;
    animation: shimmer 1.5s infinite;
}

.tab-btn.active {
    background: linear-gradient(145deg, #ff6b81, #ff5252);
    color: white;
    border-color: #ff6b81;
    box-shadow: 0 8px 20px rgba(255, 107, 129, 0.4),
        0 0 0 3px rgba(255, 107, 129, 0.3),
        inset 0 3px 5px rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.tab-btn.active::after {
    content: '✨';
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 20px;
    animation: starGlow 1.5s infinite alternate;
}

.tab-icon {
    font-size: 24px;
    display: block;
}

.tab-text {
    font-size: 14px;
    white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .nav-tabs {
        flex-wrap: wrap;
        gap: 10px;
        padding: 12px;
    }

    .tab-btn {
        flex: 1 1 calc(50% - 5px);
        min-width: auto;
        padding: 12px 8px;
        font-size: 12px;
    }

    .tab-icon {
        font-size: 20px;
    }

    .tab-text {
        font-size: 16px;
    }
}

@media (max-width: 480px) {
    .nav-tabs {
        margin: 15px 10px;
        border-radius: 15px;
    }

    .tab-btn {
        padding: 12px;
        font-size: 14px;
    }
}
</style>
