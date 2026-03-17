<template>
    <div class="tab-content">
        <div class="admin-section">
            <div class="section-header">
                <h2 class="section-title">🎁 兑换项管理</h2>
                <div class="section-decoration"></div>
            </div>
            <div class="section-content">
                <button class="btn add-reward-btn" @click="showAddRewardModal">
                    <span class="btn-icon">➕</span>
                    <span>添加新兑换项</span>
                </button>
                <div class="rewards-list">
                    <div v-for="(reward, index) in store.exchangeItems" :key="reward.id"
                        class="reward-item fade-in" :style="{ animationDelay: index * 0.05 + 's' }">
                        <div class="reward-info">
                            <div class="reward-header">
                                <span class="reward-icon">🎁</span>
                                <h3 class="reward-name">{{ reward.name }}</h3>
                                <span class="reward-cost">{{ reward.points }} 🎯</span>
                            </div>
                            <p class="reward-description">{{ reward.description }}</p>
                        </div>
                        <div class="reward-actions">
                            <button class="btn edit-btn" @click="editReward(reward)">
                                <span class="btn-icon">✏️</span>
                                <span>编辑</span>
                            </button>
                            <button class="btn delete-btn" @click="confirmDeleteReward(reward)">
                                <span class="btn-icon">🗑️</span>
                                <span>删除</span>
                            </button>
                        </div>
                    </div>
                    <div v-if="store.exchangeItems.length === 0" class="no-rewards">
                        <p class="no-rewards-text">暂无兑换项</p>
                        <p class="no-rewards-hint">点击上方按钮添加新兑换项</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '../../../stores'

const store = useUserStore()

const emit = defineEmits(['show-reward-modal', 'notification', 'confirm'])

function showAddRewardModal() {
    emit('show-reward-modal', null)
}

function editReward(reward: any) {
    emit('show-reward-modal', reward)
}

function confirmDeleteReward(reward: any) {
    emit('confirm', {
        message: `确定要删除兑换项 "${reward.name}" 吗？`,
        action: () => {
            store.removeExchangeItem(reward.id)
            emit('notification', '兑换项删除成功！', 'success', '✅')
        }
    })
}
</script>

<style scoped>
.add-reward-btn {
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

.add-reward-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
}

.rewards-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.reward-item {
    background: white;
    border: 2px solid #ffd6e0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.reward-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reward-info {
    flex: 1;
    margin-right: 16px;
}

.reward-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.reward-icon {
    font-size: 20px;
    margin-right: 10px;
}

.reward-name {
    flex: 1;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #ff6b8b;
}

.reward-cost {
    font-size: 14px;
    font-weight: 600;
    color: #ff8fab;
}

.reward-description {
    margin: 8px 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}

.reward-actions {
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

.no-rewards {
    text-align: center;
    padding: 40px 20px;
    color: #999;
    grid-column: 1 / -1;
}

.no-rewards-text {
    font-size: 18px;
    margin-bottom: 8px;
}

.no-rewards-hint {
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
    .rewards-list {
        grid-template-columns: 1fr;
    }
}
</style>