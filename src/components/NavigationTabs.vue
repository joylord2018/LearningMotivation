<template>
    <div class="navigation-tabs">
        <div 
            v-for="tab in tabs" 
            :key="tab.name"
            :class="['tab-item', {
                active: $route.name === tab.name
            }]"
            @click="$router.push({ name: tab.name })"
        >
            <div class="tab-icon">{{ tab.icon }}</div>
            <div class="tab-label">{{ tab.label }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const tabs = [
    { name: 'plans', icon: '📝', label: '计划' },
    { name: 'behavior', icon: '🎯', label: '行为' },
    { name: 'points', icon: '⭐', label: '积分' },
    { name: 'achievements', icon: '🏆', label: '成就' },
    { name: 'statistics', icon: '📊', label: '统计' },
    { name: 'admin', icon: '🛠️', label: '管理' },
    { name: 'profile', icon: '👤', label: '个人信息' },
    { name: 'Leaderboard', icon: '🏆', label: '积分排行' }
]
</script>

<style scoped>
/* 导航标签容器 */
.navigation-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
    border-radius: 30px;
    padding: 15px;
    box-shadow: 0 10px 25px rgba(255, 138, 171, 0.2);
    border: 3px solid #ffd6e0;
    margin: 20px 0;
    position: relative;
    z-index: 10;
}

/* 标签项 */
.tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 10px 15px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #ff8fab;
    text-align: center;
}

/* 激活状态 */
.tab-item.active {
    background: linear-gradient(135deg, #ff6b8b 0%, #ff8fab 100%);
    color: white;
    box-shadow: 0 5px 15px rgba(255, 107, 139, 0.3);
}

/* 标签图标 */
.tab-icon {
    font-size: 20px;
}

/* 标签文本 */
.tab-label {
    font-size: 14px;
    font-weight: bold;
}

/* 悬停效果 */
.tab-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 139, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .navigation-tabs {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .tab-icon {
        font-size: 18px;
    }
    
    .tab-label {
        font-size: 12px;
    }
}

@media (max-width: 480px) {
    .navigation-tabs {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
