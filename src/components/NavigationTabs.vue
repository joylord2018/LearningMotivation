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
    { name: 'tasks', icon: '📝', label: '任务' },
    { name: 'points', icon: '⭐', label: '积分' },
    { name: 'achievements', icon: '🏆', label: '成就' },
    { name: 'statistics', icon: '📊', label: '统计' },
    { name: 'admin', icon: '🛠️', label: '管理' },
    { name: 'profile', icon: '👤', label: '个人信息' },
    { name: 'Leaderboard', icon: '🏆', label: '积分排行' }
]
</script>
