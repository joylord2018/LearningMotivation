<template>
    <!-- 积分记录弹窗 -->
    <div v-if="visible" class="records-popup-overlay" @click="close">
        <div class="records-popup-content" @click.stop>
            <div class="popup-header">
                <h2>📊 我的积分记录</h2>
                <button class="close-btn" @click="close">✕</button>
            </div>

            <!-- 筛选按钮 -->
            <div class="filter-buttons">
                <button v-for="filter in ['all', 'task', 'exchange']" :key="filter" @click="selectedFilter = filter"
                    :class="['filter-btn', { active: selectedFilter === filter }]">
                    {{ filter === 'all' ? '全部' : filter === 'task' ? '任务' : '兑换' }}
                </button>
            </div>

            <div v-if="filteredRecords.length === 0" class="no-records">
                <div class="empty-icon">📝</div>
                <p>暂无积分记录</p>
                <p class="hint">完成任务获取第一笔积分吧！</p>
            </div>

            <div v-else class="records-popup-list">
                <div v-for="record in filteredRecords" :key="record.id" class="record-popup-item"
                    :class="record.points > 0 ? 'positive' : 'negative'">
                    <div class="record-icon">
                        {{ record.points > 0 ? '🎯' : '🛍️' }}
                    </div>
                    <div class="record-popup-info">
                        <div class="record-popup-date">{{ formatDate(record.date) }}</div>
                        <div class="record-popup-description">{{ record.description }}</div>
                    </div>
                    <div class="record-popup-points" :class="record.points > 0 ? 'positive' : 'negative'">
                        {{ record.points > 0 ? '+' : '' }}{{ record.points }}
                    </div>
                </div>
            </div>

            <div class="popup-footer">
                <button @click="close" class="close-popup-btn">关闭</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../../../stores/userStore'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

const store = useUserStore()

// 积分记录筛选
const selectedFilter = ref('all')

// 排序积分记录
const filteredRecords = computed(() => {
    let records = [...store.pointRecords]
    // 筛选记录
    if (selectedFilter.value !== 'all') {
        records = records.filter(record => record.type === selectedFilter.value)
    }
    // 排序记录
    return records.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
})

// 格式化日期
function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 关闭弹窗
function close() {
    emit('close')
}
</script>

<style scoped>
/* 积分记录弹窗 */
.records-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 138, 171, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.records-popup-content {
    background-color: white;
    padding: 0;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    border: 3px solid #ffedf2;
    animation: slideIn 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

/* 筛选按钮 */
.filter-buttons {
    display: flex;
    padding: 15px 20px;
    gap: 8px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.filter-btn {
    padding: 8px 16px;
    border: 1px solid #dee2e6;
    border-radius: 20px;
    background-color: white;
    color: #495057;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-btn:hover {
    border-color: #ff8fab;
    color: #ff6b8b;
}

.filter-btn.active {
    background-color: #ff8fab;
    border-color: #ff8fab;
    color: white;
    box-shadow: 0 2px 8px rgba(255, 138, 171, 0.3);
}

/* 弹窗头部 */
.popup-header {
    padding: 20px 25px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 17px 17px 0 0;
    position: relative;
    z-index: 1;
}

.popup-header h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.3);
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1) rotate(90deg);
}

/* 无记录状态 */
.no-records {
    text-align: center;
    padding: 60px 20px;
    color: #ffb6c1;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    animation: bounce 1s ease-in-out infinite;
}

.no-records p {
    margin: 0;
    font-size: 1.1rem;
}

.no-records .hint {
    font-size: 1rem;
    color: #ffd6e0;
    margin-top: 10px;
}

/* 记录列表 */
.records-popup-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.record-popup-item {
    display: flex;
    align-items: center;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 12px;
    background-color: #f9f9f9;
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
}

.record-popup-item:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.record-popup-item.positive {
    border-left-color: #4CAF50;
    background-color: #f1f8e9;
}

.record-popup-item.negative {
    border-left-color: #f44336;
    background-color: #ffebee;
}

.record-icon {
    font-size: 24px;
    margin-right: 15px;
    flex-shrink: 0;
}

.record-popup-info {
    flex: 1;
}

.record-popup-date {
    font-size: 0.85rem;
    color: #888;
    margin-bottom: 4px;
}

.record-popup-description {
    font-size: 0.95rem;
    color: #333;
    font-weight: 500;
}

.record-popup-points {
    font-size: 1.1rem;
    font-weight: bold;
    flex-shrink: 0;
}

.record-popup-points.positive {
    color: #4CAF50;
}

.record-popup-points.negative {
    color: #f44336;
}

/* 弹窗底部 */
.popup-footer {
    padding: 20px;
    text-align: center;
    border-top: 2px solid #ffedf2;
}

.close-popup-btn {
    padding: 12px 30px;
    background: linear-gradient(135deg, #ffedf2 0%, #ffd6e0 100%);
    color: #ff6b8b;
    border: 2px solid #ffedf2;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.close-popup-btn:hover {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
    border-color: #ff6b8b;
}

/* 动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-15px);
    }
}
</style>