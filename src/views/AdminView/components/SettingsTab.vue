<template>
    <div class="tab-content">
        <!-- 功能开关管理 -->
        <div class="admin-section">
            <div class="section-header">
                <h2 class="section-title">⚙️ 功能开关</h2>
                <div class="section-decoration"></div>
            </div>
            <div class="section-content">
                <div class="feature-toggle">
                    <div class="toggle-item">
                        <div class="toggle-info">
                            <h3 class="toggle-name">🔔 学习提醒</h3>
                            <p class="toggle-description">启用学习提醒功能</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" v-model="store.enableReminders">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="toggle-item">
                        <div class="toggle-info">
                            <h3 class="toggle-name">🎰 抽奖功能</h3>
                            <p class="toggle-description">启用积分抽奖功能</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" v-model="store.enableLottery">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="toggle-item">
                        <div class="toggle-info">
                            <h3 class="toggle-name">🎁 每日奖励</h3>
                            <p class="toggle-description">启用完成所有计划后随机掉落积分功能</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" v-model="store.enableDailyReward">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- 数据导出导入 -->
        <div class="admin-section">
            <div class="section-header">
                <h2 class="section-title">💾 数据管理</h2>
                <div class="section-decoration"></div>
            </div>
            <div class="section-content">
                <div class="data-management">
                    <button class="btn export-btn" @click="exportData">
                        <span class="btn-icon">📤</span>
                        <span>导出数据</span>
                    </button>
                    <input type="file" ref="fileInput" style="display: none" @change="importData" accept=".json" />
                    <button class="btn import-btn" @click="triggerFileInput">
                        <span class="btn-icon">📥</span>
                        <span>导入数据</span>
                    </button>
                    <button class="btn reset-btn" @click="confirmResetData">
                        <span class="btn-icon">🔄</span>
                        <span>重置所有数据</span>
                    </button>
                </div>
                <div class="data-info">
                    <p class="data-info-text">📝 数据导出将生成包含所有用户数据的JSON文件</p>
                    <p class="data-info-text">🔒 数据文件包含敏感信息，请妥善保管</p>
                    <p class="data-info-text">⚠️ 导入数据将覆盖现有数据，请谨慎操作</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUserStore } from '../../../stores'

const store = useUserStore()
const fileInput = ref<HTMLInputElement | null>(null)

const emit = defineEmits(['confirm', 'notification'])

function exportData() {
    const data = {
        plans: store.plans,
        behaviors: store.behaviors,
        exchangeItems: store.exchangeItems,
        lotteryItems: store.lotteryItems,
        quickSetupTemplates: store.quickSetupTemplates
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `learning-motivation-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    emit('notification', '数据导出成功', 'success', '✅')
}

function triggerFileInput() {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

function importData(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target?.result as string)
            if (data.plans) store.plans = data.plans
            if (data.behaviors) store.behaviors = data.behaviors
            if (data.exchangeItems) store.exchangeItems = data.exchangeItems
            if (data.lotteryItems) store.lotteryItems = data.lotteryItems
            if (data.quickSetupTemplates) store.quickSetupTemplates = data.quickSetupTemplates
            emit('notification', '数据导入成功', 'success', '✅')
        } catch (error) {
            emit('notification', '数据导入失败，请检查文件格式', 'error', '❌')
        }
    }
    reader.readAsText(file)
}

function confirmResetData() {
    emit('confirm', {
        message: '确定要重置所有数据吗？此操作不可恢复！',
        action: () => {
            store.resetAllData()
            emit('notification', '数据重置成功', 'success', '✅')
        }
    })
}
</script>

<style scoped>
/* 功能开关 */
.feature-toggle {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.toggle-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toggle-info {
    flex: 1;
}

.toggle-name {
    margin: 0 0 5px 0;
    font-size: 16px;
    font-weight: 700;
    color: #ff6b8b;
}

.toggle-description {
    margin: 0;
    font-size: 14px;
    color: #666;
}

/* 开关样式 */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked + .toggle-slider {
    background-color: #4ade80;
}

input:focus + .toggle-slider {
    box-shadow: 0 0 1px #4ade80;
}

input:checked + .toggle-slider:before {
    transform: translateX(26px);
}

/* 数据管理 */
.data-management {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.export-btn,
.import-btn,
.reset-btn {
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
}

.export-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
    color: white;
}

.import-btn {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    color: white;
}

.reset-btn {
    background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
    color: white;
}

.export-btn:hover,
.import-btn:hover,
.reset-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.data-info {
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-info-text {
    margin: 8px 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .data-management {
        flex-direction: column;
    }
    
    .toggle-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .toggle-switch {
        align-self: flex-end;
    }
}
</style>