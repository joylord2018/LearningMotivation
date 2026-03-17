<template>
    <div class="tab-content">
        <div class="admin-section">
            <div class="section-header">
                <h2 class="section-title">🎰 抽奖管理</h2>
                <div class="section-decoration"></div>
            </div>
            <div class="section-content">
                <!-- 抽奖消耗设置 -->
                <div class="form-group">
                    <label for="lotteryCost" class="form-label">抽奖一次需要的积分</label>
                    <el-input-number id="lotteryCost" v-model="lotteryCost" placeholder="输入积分..." :min="1" />
                    <button class="btn save-btn" @click="saveLotteryCost">
                        <span class="btn-icon">💾</span>
                        <span>保存设置</span>
                    </button>
                </div>
                
                <!-- 抽奖物品管理 -->
                <button class="btn add-lottery-item-btn" @click="showAddLotteryItemModal">
                    <span class="btn-icon">➕</span>
                    <span>添加新抽奖物品</span>
                </button>
                <div class="lottery-items-list">
                    <div v-for="(item, index) in store.lotteryItems" :key="item.id" class="lottery-item fade-in" :style="{ animationDelay: index * 0.05 + 's' }">
                        <div class="lottery-item-info">
                            <div class="lottery-item-header">
                                <span class="lottery-item-icon">{{ getRarityIcon(item.rarity) }}</span>
                                <h3 class="lottery-item-name">{{ item.name }}</h3>
                                <span class="lottery-item-rarity">{{ getRarityText(item.rarity) }}</span>
                            </div>
                            <p class="lottery-item-description">{{ item.description }}</p>
                            <div class="lottery-item-meta">
                                <span class="lottery-item-probability">概率: {{ item.probability }}%</span>
                                <span class="lottery-item-effect">{{ item.effect }}</span>
                            </div>
                        </div>
                        <div class="lottery-item-actions">
                            <button class="btn edit-btn" @click="editLotteryItem(item)">
                                <span class="btn-icon">✏️</span>
                                <span>编辑</span>
                            </button>
                            <button class="btn delete-btn" @click="confirmDeleteLotteryItem(item)">
                                <span class="btn-icon">🗑️</span>
                                <span>删除</span>
                            </button>
                        </div>
                    </div>
                    <div v-if="store.lotteryItems.length === 0" class="no-lottery-items">
                        <p class="no-lottery-items-text">暂无抽奖物品</p>
                        <p class="no-lottery-items-hint">点击上方按钮添加新抽奖物品</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import { ItemRarity } from '../../../stores/userStore'

const store = useUserStore()
const lotteryCost = ref(10)

const emit = defineEmits(['show-lottery-item-modal', 'confirm', 'notification'])

function getRarityIcon(rarity: ItemRarity): string {
    const iconMap: { [key: string]: string } = {
        common: '📦',
        rare: '🌟',
        epic: '💎',
        legendary: '👑'
    }
    return iconMap[rarity] || '📦'
}

function getRarityText(rarity: ItemRarity): string {
    const textMap: { [key: string]: string } = {
        common: '普通',
        rare: '稀有',
        epic: '史诗',
        legendary: '传说'
    }
    return textMap[rarity] || '普通'
}

function saveLotteryCost() {
    store.setLotteryCost(lotteryCost.value)
    emit('notification', '抽奖消耗设置保存成功', 'success', '✅')
}

function showAddLotteryItemModal() {
    emit('show-lottery-item-modal', null)
}

function editLotteryItem(item: any) {
    emit('show-lottery-item-modal', item)
}

function confirmDeleteLotteryItem(item: any) {
    emit('confirm', {
        message: `确定要删除抽奖物品 "${item.name}" 吗？`,
        action: () => {
            store.removeLotteryItem(item.id)
            emit('notification', '抽奖物品删除成功', 'success', '✅')
        }
    })
}

onMounted(() => {
    lotteryCost.value = store.lotteryCost
})
</script>

<style scoped>
/* 抽奖物品列表 */
.lottery-items-list {
    margin-top: 20px;
}

.lottery-item {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: all 0.3s ease;
}

.lottery-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.lottery-item-info {
    flex: 1;
    margin-right: 16px;
}

.lottery-item-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 10px;
}

.lottery-item-icon {
    font-size: 24px;
}

.lottery-item-name {
    flex: 1;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #ff6b8b;
}

.lottery-item-rarity {
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.lottery-item-description {
    margin: 8px 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}

.lottery-item-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
}

.lottery-item-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.no-lottery-items {
    text-align: center;
    padding: 40px 20px;
    color: #999;
}

.no-lottery-items-text {
    font-size: 18px;
    margin-bottom: 8px;
}

.no-lottery-items-hint {
    font-size: 14px;
}

.add-lottery-item-btn {
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

.add-lottery-item-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
</style>