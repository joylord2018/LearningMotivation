<template>
    <!-- 背包弹窗 -->
    <div v-if="visible" class="backpack-popup-overlay" @click="close">
        <div class="backpack-popup-content" @click.stop>
            <div class="popup-header">
                <h2>🎒 我的背包</h2>
                <button class="close-btn" @click="close">✕</button>
            </div>

            <div v-if="store.backpackItems.length === 0" class="no-items">
                <div class="empty-icon">🎒</div>
                <p>背包空空如也</p>
                <p class="hint">快去抽奖或兑换喜欢的物品吧！</p>
            </div>

            <div v-else class="backpack-items-list">
                <div v-for="item in sortedBackpackItems" :key="item.id" class="backpack-item"
                    :class="getRarityClass(item.rarity)">
                    <div class="item-icon">{{ getRarityIcon(item.rarity) }}</div>
                    <div class="rarity-badge">{{ getRarityText(item.rarity) }}</div>
                    <div class="item-details">
                        <h3>{{ item.name }}</h3>
                        <p>{{ item.description }}</p>
                        <div v-if="item.effect" class="item-effect">{{ item.effect }}</div>
                        <div class="acquired-date">获得时间: {{ formatDate(item.acquiredDate) }}</div>
                    </div>
                    <button class="use-item-btn" @click="openUseConfirm(item)">
                        使用
                    </button>
                </div>
            </div>

            <div class="popup-footer">
                <button @click="close" class="close-popup-btn">关闭</button>
            </div>
        </div>
    </div>

    <!-- 使用物品确认弹窗 -->
    <div v-if="showUseConfirm" class="confirm-popup-overlay" @click="closeUseConfirm">
        <div class="confirm-popup-content" @click.stop>
            <div class="confirm-icon">✨</div>
            <h3>使用物品确认</h3>
            <p v-if="selectedItem">是否立即使用「{{ selectedItem.name }}」？</p>
            <p class="confirm-hint">使用后物品将从背包中移除</p>
            <div class="confirm-buttons">
                <button class="confirm-cancel" @click="closeUseConfirm">取消</button>
                <button class="confirm-use" @click="handleUseItem">确认使用</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore, ItemRarity } from '../../../stores/userStore'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close', 'useItem'])

const store = useUserStore()

// 背包相关状态
const showUseConfirm = ref(false)
const selectedItem = ref<any>(null)

// 排序后的背包物品（按稀有度排序）
const sortedBackpackItems = computed(() => {
    return store.sortedBackpackItems
})

// 获取稀有度样式类
function getRarityClass(rarity?: ItemRarity) {
    if (!rarity) return ''
    return `rarity-${rarity}`
}

// 获取稀有度图标
function getRarityIcon(rarity?: ItemRarity) {
    if (!rarity) return '🎁'

    switch (rarity) {
        case ItemRarity.Common:
            return '✨'
        case ItemRarity.Rare:
            return '🌟'
        case ItemRarity.Epic:
            return '💎'
        case ItemRarity.Legendary:
            return '👑'
        default:
            return '🎁'
    }
}

// 获取稀有度文本
function getRarityText(rarity?: ItemRarity) {
    if (!rarity) return '普通'

    switch (rarity) {
        case ItemRarity.Common:
            return '普通'
        case ItemRarity.Rare:
            return '稀有'
        case ItemRarity.Epic:
            return '史诗'
        case ItemRarity.Legendary:
            return '传说'
        default:
            return '普通'
    }
}

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

// 打开使用物品确认弹窗
function openUseConfirm(item: any) {
    selectedItem.value = item
    showUseConfirm.value = true
    // 禁止背景页面滚动
    document.body.style.overflow = 'hidden'
}

// 关闭使用物品确认弹窗
function closeUseConfirm() {
    showUseConfirm.value = false
    // 恢复背景页面滚动
    document.body.style.overflow = 'auto'
}

// 使用物品处理
function handleUseItem() {
    if (selectedItem.value) {
        emit('useItem', selectedItem.value)
        showUseConfirm.value = false
        // 恢复背景页面滚动
        document.body.style.overflow = 'auto'
        selectedItem.value = null
    }
}

// 关闭弹窗
function close() {
    emit('close')
}
</script>

<style scoped>
/* 背包弹窗样式 */
.backpack-popup-overlay {
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

.backpack-popup-content {
    background-color: white;
    padding: 0;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    border: 3px solid #ffedf2;
    animation: slideIn 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
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

/* 背包物品列表 */
.backpack-items-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.backpack-item {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 16px;
    margin-bottom: 15px;
    background: linear-gradient(135deg, #fff8fa 0%, #ffedf2 100%);
    border: 2px solid #ffedf2;
    transition: all 0.3s ease;
    position: relative;
}

.backpack-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.2);
    border-color: #ffb6c1;
}

.item-icon {
    font-size: 2.5rem;
    margin-right: 20px;
    flex-shrink: 0;
    animation: bounce 2s ease-in-out infinite;
}

.item-details {
    flex: 1;
}

.item-details h3 {
    margin: 0 0 8px 0;
    color: #ff6b8b;
    font-size: 1.2rem;
}

.item-details p {
    margin: 0 0 8px 0;
    color: #ff8fab;
    font-size: 0.9rem;
}

.acquired-date {
    font-size: 0.8rem;
    color: #ffb6c1;
}

.use-item-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
    margin-left: 15px;
    flex-shrink: 0;
}

.use-item-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
    background: linear-gradient(135deg, #ff6b8b 0%, #ff4757 100%);
}

/* 无物品状态 */
.no-items {
    text-align: center;
    padding: 60px 20px;
    color: #ffb6c1;
}

.no-items .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: bounce 1s ease-in-out infinite;
}

.no-items p {
    margin: 0 0 10px 0;
    font-size: 1.2rem;
}

.no-items .hint {
    font-size: 1rem;
    color: #ffd6e0;
}

/* 使用确认弹窗 */
.confirm-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 138, 171, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
    animation: fadeIn 0.3s ease;
}

.confirm-popup-content {
    background-color: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    max-width: 400px;
    width: 85%;
    text-align: center;
    border: 3px solid #ffedf2;
    animation: bounceIn 0.3s ease;
}

.confirm-icon {
    font-size: 3rem;
    margin-bottom: 20px;
    animation: pulse 2s ease-in-out infinite;
}

.confirm-popup-content h3 {
    color: #ff6b8b;
    margin: 0 0 15px 0;
    font-size: 1.3rem;
}

.confirm-popup-content p {
    color: #ff8fab;
    margin: 0 0 10px 0;
    font-size: 1rem;
}

.confirm-hint {
    font-size: 0.9rem !important;
    color: #ffb6c1 !important;
}

.confirm-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 25px;
}

.confirm-cancel {
    padding: 12px 25px;
    background-color: #ffedf2;
    color: #ff6b8b;
    border: 2px solid #ffd6e0;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.confirm-cancel:hover {
    background-color: #ffd6e0;
    transform: translateY(-1px);
}

.confirm-use {
    padding: 12px 25px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
}

.confirm-use:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
    background: linear-gradient(135deg, #ff6b8b 0%, #ff4757 100%);
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

/* 背包物品稀有度样式 */
.backpack-item.rarity-common {
    background-color: #f8f9fa;
    border: 2px solid #e9ecef;
}

.backpack-item.rarity-rare {
    background-color: #e7f3ff;
    border: 2px solid #1976d2;
    position: relative;
    animation: rareGlow 2s ease-in-out infinite;
}

.backpack-item.rarity-epic {
    background-color: #f3e5f5;
    border: 2px solid #7b1fa2;
    position: relative;
    animation: epicGlow 2s ease-in-out infinite;
}

.backpack-item.rarity-legendary {
    background-color: #fff3e0;
    border: 2px solid #ff6f00;
    position: relative;
    animation: legendaryGlow 2s ease-in-out infinite;
}

/* 稀有度徽章 */
.rarity-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #ff6b81;
    color: white;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: bold;
    z-index: 1;
}

.rarity-rare .rarity-badge {
    background-color: #1976d2;
}

.rarity-epic .rarity-badge {
    background-color: #7b1fa2;
}

.rarity-legendary .rarity-badge {
    background-color: #ff6f00;
    animation: legendaryBadgeGlow 1s ease-in-out infinite;
}

/* 物品效果文本 */
.item-effect {
    color: #ff6b81;
    font-style: italic;
    margin-top: 5px;
    font-size: 14px;
}

/* 发光动画 */
@keyframes rareGlow {
    0% {
        box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
    }

    50% {
        box-shadow: 0 0 15px rgba(25, 118, 210, 0.6);
    }

    100% {
        box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
    }
}

@keyframes epicGlow {
    0% {
        box-shadow: 0 0 5px rgba(123, 31, 162, 0.3);
    }

    50% {
        box-shadow: 0 0 15px rgba(123, 31, 162, 0.6);
    }

    100% {
        box-shadow: 0 0 5px rgba(123, 31, 162, 0.3);
    }
}

@keyframes legendaryGlow {
    0% {
        box-shadow: 0 0 5px rgba(255, 111, 0, 0.5);
    }

    50% {
        box-shadow: 0 0 20px rgba(255, 111, 0, 0.8);
    }

    100% {
        box-shadow: 0 0 5px rgba(255, 111, 0, 0.5);
    }
}

@keyframes legendaryBadgeGlow {
    0% {
        box-shadow: 0 0 5px rgba(255, 111, 0, 0.7);
    }

    50% {
        box-shadow: 0 0 10px rgba(255, 111, 0, 1);
    }

    100% {
        box-shadow: 0 0 5px rgba(255, 111, 0, 0.7);
    }
}

/* 调整背包物品布局以适应稀有度徽章 */
.backpack-item {
    position: relative;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    transition: transform 0.3s, box-shadow 0.3s;
}

.backpack-item:hover {
    transform: translateY(-2px);
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

@keyframes bounceIn {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    70% {
        transform: scale(1.1);
        opacity: 1;
    }

    100% {
        transform: scale(1);
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

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .backpack-item {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }

    .use-item-btn {
        margin-left: 0;
        width: 100%;
    }

    .item-icon {
        margin-right: 0;
    }
}
</style>