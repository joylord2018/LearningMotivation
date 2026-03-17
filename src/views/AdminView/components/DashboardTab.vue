<template>
    <div class="tab-content">
        <!-- 积分调整区域 -->
        <div class="admin-section">
            <div class="section-header">
                <h2 class="section-title">🎯 积分管理</h2>
                <div class="section-decoration"></div>
            </div>
            <div class="section-content">
                <div class="point-controls">
                    <div class="form-group">
                        <label for="userId" class="form-label">用户账号</label>
                        <el-input id="userId" v-model="userId" placeholder="输入用户ID..." />
                    </div>
                    <div class="form-group">
                        <label for="points" class="form-label">积分数量</label>
                        <el-input-number id="points" v-model="pointsToAdjust" placeholder="输入积分..." :min="1" />
                    </div>
                    <div class="action-buttons">
                        <button class="btn add-btn" @click="addPoints">
                            <span class="btn-icon">➕</span>
                            <span>增加积分</span>
                        </button>
                        <button class="btn subtract-btn" @click="subtractPoints">
                            <span class="btn-icon">➖</span>
                            <span>扣除积分</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 系统概览 -->
        <div class="admin-section">
            <div class="section-header">
                <h2 class="section-title">📊 系统概览</h2>
                <div class="section-decoration"></div>
            </div>
            <div class="section-content">
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-info">
                            <div class="stat-value">{{ store.plans.length }}</div>
                            <div class="stat-label">学习计划</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <div class="stat-value">{{ store.behaviors.length }}</div>
                            <div class="stat-label">行为记录</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎁</div>
                        <div class="stat-info">
                            <div class="stat-value">{{ store.exchangeItems.length }}</div>
                            <div class="stat-label">兑换项</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-info">
                            <div class="stat-value">{{ store.achievements.length }}</div>
                            <div class="stat-label">成就</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUserStore } from '../../../stores/userStore'

const store = useUserStore()

const userId = ref('')
const pointsToAdjust = ref(0)

const emit = defineEmits(['notification'])

const addPoints = () => {
    if (pointsToAdjust.value <= 0) {
        emit('notification', '请输入有效的积分数量', 'error', '❌')
        return
    }

    store.adjustPoints(pointsToAdjust.value, '管理员增加积分')
    emit('notification', `成功增加 ${pointsToAdjust.value} 积分！`, 'success', '✅')
    pointsToAdjust.value = 0
}

const subtractPoints = () => {
    if (pointsToAdjust.value <= 0) {
        emit('notification', '请输入有效的积分数量', 'error', '❌')
        return
    }

    store.adjustPoints(-pointsToAdjust.value, '管理员扣除积分')
    emit('notification', `成功扣除 ${pointsToAdjust.value} 积分！`, 'success', '✅')
    pointsToAdjust.value = 0
}
</script>

<style scoped>
.admin-section {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.section-header {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-decoration {
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 2px;
}

.section-content {
    padding: 20px;
}

.point-controls {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    align-items: end;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.btn {
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.add-btn {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    color: white;
}

.subtract-btn {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    color: white;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-icon {
    font-size: 18px;
}

.dashboard-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.stat-card {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid #bae6fd;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(14, 165, 233, 0.2);
}

.stat-icon {
    font-size: 32px;
    margin-bottom: 10px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #0ea5e9;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 14px;
    color: #666;
}

@media (max-width: 768px) {
    .point-controls {
        grid-template-columns: 1fr;
    }
    
    .dashboard-stats {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>