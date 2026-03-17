<template>
    <div class="tab-content">
        <div class="admin-section">
            <div class="section-header">
                <h2 class="section-title">🎯 行为管理</h2>
                <div class="section-decoration"></div>
            </div>
            <div class="section-content">
                <button class="btn add-behavior-btn" @click="showAddBehaviorModal">
                    <span class="btn-icon">➕</span>
                    <span>添加新行为</span>
                </button>
                <div class="behaviors-list">
                    <div v-for="(behavior, index) in store.behaviors" :key="behavior.id"
                        class="behavior-item fade-in" :style="{ animationDelay: index * 0.05 + 's' }">
                        <div class="behavior-info">
                            <div class="behavior-header">
                                <span class="behavior-icon">{{ behavior.icon }}</span>
                                <h3 class="behavior-name">{{ behavior.name }}</h3>
                                <span class="behavior-points" :class="{ 'negative': behavior.type === 'negative' }">
                                    {{ behavior.points > 0 ? '+' : '' }}{{ behavior.points }}分
                                </span>
                            </div>
                            <p class="behavior-description">{{ behavior.description }}</p>
                            <div class="behavior-meta">
                                <span class="behavior-frequency">{{ behavior.frequency === 'daily' ? '每日' : behavior.frequency === 'weekly' ? '每周' : '自定义' }} {{ behavior.targetCount }}次</span>
                                <span class="behavior-type">{{ behavior.type === 'positive' ? '积极' : '消极' }}</span>
                            </div>
                        </div>
                        <div class="behavior-actions">
                            <button class="btn edit-btn" @click="editBehavior(behavior)">
                                <span class="btn-icon">✏️</span>
                                <span>编辑</span>
                            </button>
                            <button class="btn delete-btn" @click="confirmDeleteBehavior(behavior)">
                                <span class="btn-icon">🗑️</span>
                                <span>删除</span>
                            </button>
                        </div>
                    </div>
                    <div v-if="store.behaviors.length === 0" class="no-behaviors">
                        <p class="no-behaviors-text">暂无行为</p>
                        <p class="no-behaviors-hint">点击上方按钮添加新行为</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '../../../stores/userStore'

const store = useUserStore()

const emit = defineEmits(['show-behavior-modal', 'notification', 'confirm'])

function showAddBehaviorModal() {
    emit('show-behavior-modal', null)
}

function editBehavior(behavior: any) {
    emit('show-behavior-modal', behavior)
}

function confirmDeleteBehavior(behavior: any) {
    emit('confirm', {
        message: `确定要删除行为 "${behavior.name}" 吗？`,
        action: () => {
            store.removeBehavior(behavior.id)
            emit('notification', '行为删除成功！', 'success', '✅')
        }
    })
}
</script>

<style scoped>
.add-behavior-btn {
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
    margin-bottom: 20px;
}

.add-behavior-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
}

.behaviors-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.behavior-item {
    background: white;
    border: 2px solid #ffd6e0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.behavior-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.behavior-info {
    flex: 1;
    margin-right: 16px;
}

.behavior-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.behavior-icon {
    font-size: 20px;
    margin-right: 10px;
}

.behavior-name {
    flex: 1;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #ff6b8b;
}

.behavior-points {
    font-size: 14px;
    font-weight: 600;
    color: #4ade80;
}

.behavior-points.negative {
    color: #f87171;
}

.behavior-description {
    margin: 8px 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}

.behavior-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
}

.behavior-actions {
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

.no-behaviors {
    text-align: center;
    padding: 40px 20px;
    color: #999;
    grid-column: 1 / -1;
}

.no-behaviors-text {
    font-size: 18px;
    margin-bottom: 8px;
}

.no-behaviors-hint {
    font-size: 14px;
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
    .behaviors-list {
        grid-template-columns: 1fr;
    }
}
</style>