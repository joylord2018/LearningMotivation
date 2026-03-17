<template>
    <header class="points-header">
        <h1>🏆 我的积分王国</h1>
        <div class="header-actions">
            <button v-if="store.enableLottery" class="lottery-btn" @click="openLotteryPopup">
                🎰 幸运抽奖
            </button>
            <button class="backpack-btn" @click="openBackpackPopup">
                🎒 我的背包 <span v-if="store.backpackItems.length > 0" class="badge">{{ store.backpackItems.length
                    }}</span>
            </button>
            <div class="logout-btn" @click="handleLogout">退出登录</div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/userStore'

const router = useRouter()
const store = useUserStore()

const emit = defineEmits(['openLottery', 'openBackpack'])

function handleLogout() {
    store.logout()
    router.push('/')
}

function openLotteryPopup() {
    emit('openLottery')
}

function openBackpackPopup() {
    emit('openBackpack')
}
</script>

<style scoped>
/* 游戏化头部样式 */
.points-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    padding: 20px 30px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    border: 3px solid #ffd6e0;
}

.points-header h1 {
    color: white;
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.3);
}

/* 头部操作区域 */
.header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: nowrap;
}

/* 背包按钮样式 */
.backpack-btn {
    position: relative;
    padding: 12px 15px;
    background: linear-gradient(135deg, #ffedf2 0%, #ffd6e0 100%);
    color: #ff6b8b;
    border: 2px solid #ffedf2;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 0.9rem;
    /* 稍微减小字体 */
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    white-space: nowrap;
    /* 防止文字换行 */
}

.backpack-btn:hover {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.2);
    border-color: #ff6b8b;
}

.backpack-btn .badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff4757;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.logout-btn {
    padding: 12px 15px;
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    border: 2px solid rgba(255, 255, 255, 0.3);
    font-size: 0.9rem;
    /* 稍微减小字体 */
    white-space: nowrap;
    /* 防止文字换行 */
}

.logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.3);
}

/* 抽奖按钮样式 */
.lottery-btn {
    padding: 12px 15px;
    background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
    color: white;
    border: 2px solid #ffedf2;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(254, 202, 87, 0.2);
    white-space: nowrap;
    /* 防止文字换行 */
}

.lottery-btn:hover {
    background: linear-gradient(135deg, #ff9ff3 0%, #feca57 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(254, 202, 87, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .points-header {
        flex-direction: column;
        gap: 15px;
        padding: 15px 20px;
    }

    .header-actions {
        flex-wrap: wrap;
        justify-content: center;
    }

    /* 小屏幕下进一步调整按钮样式 */
    .lottery-btn,
    .backpack-btn,
    .logout-btn {
        font-size: 0.8rem;
        padding: 10px 12px;
    }

    .backpack-btn,
    .logout-btn {
        flex: 1;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .header-actions {
        flex-direction: column;
        width: 100%;
    }

    .lottery-btn,
    .backpack-btn,
    .logout-btn {
        width: 100%;
        text-align: center;
        padding: 12px;
        font-size: 0.9rem;
    }
}
</style>