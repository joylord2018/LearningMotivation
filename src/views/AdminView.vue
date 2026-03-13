<template>
    <div class="admin-container">
        <!-- 装饰元素 -->
        <div class="decorations">
            <div class="heart heart-1"></div>
            <div class="heart heart-2"></div>
            <div class="heart heart-3"></div>
            <div class="star star-1"></div>
            <div class="star star-2"></div>
            <div class="star star-3"></div>
            <div class="star star-4"></div>
            <div class="cloud cloud-1"></div>
            <div class="cloud cloud-2"></div>
            <div class="magic-wand magic-wand-1"></div>
            <div class="magic-wand magic-wand-2"></div>
        </div>

        <!-- 密码验证模态框 -->
        <div v-if="!isAuthenticated" class="password-modal-overlay" @click="closePasswordModal">
            <div class="password-modal-content" @click.stop>
                <div class="modal-header">
                    <h2 class="modal-title">🔒 管理员权限</h2>
                    <button class="close-btn" @click="closePasswordModal">✕</button>
                </div>
                <div class="modal-body">
                    <p class="modal-description">请输入管理员密码以访问管理功能</p>
                    <input type="password" v-model="adminPassword" placeholder="输入密码..." class="password-input"
                        @keyup.enter="authenticate">
                    <div v-if="authError" class="auth-error">{{ authError }}</div>
                    <button class="btn confirm-btn" @click="authenticate">
                        <span class="btn-icon">🔓</span>
                        <span>确认</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 管理页面内容 -->
        <div v-else class="admin-content">
            <!-- 页面头部 -->
            <div class="admin-header">
                <div class="header-content">
                    <h1 class="game-title">管理控制台 🧙‍♀️</h1>
                    <div class="header-actions">
                        <button class="btn back-btn" @click="goBack">
                            <span class="btn-icon">🏠</span>
                            <span>返回主页</span>
                        </button>
                        <button class="btn logout-btn" @click="logout">
                            <span class="btn-icon">🚪</span>
                            <span>登出</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 导航标签 -->
            <NavigationTabs />

            <!-- 管理功能区域 -->
            <div class="admin-sections">
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
                                <input type="text" id="userId" v-model="userId" placeholder="输入用户ID..."
                                    class="form-input">
                            </div>
                            <div class="form-group">
                                <label for="points" class="form-label">积分数量</label>
                                <input type="number" id="points" v-model.number="pointsToAdjust" placeholder="输入积分..."
                                    class="form-input">
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

                <!-- 计划管理 -->
                <div class="admin-section">
                    <div class="section-header">
                        <h2 class="section-title">📝 计划管理</h2>
                        <div class="section-decoration"></div>
                    </div>
                    <div class="section-content">
                        <button class="btn add-task-btn" @click="showAddTaskModal">
                            <span class="btn-icon">➕</span>
                            <span>添加新计划</span>
                        </button>
                        <div class="tasks-list">
                            <div v-for="(task, index) in store.plans" :key="task.id" class="task-item fade-in"
                                :style="{ animationDelay: index * 0.05 + 's' }">
                                <div class="task-info">
                                    <div class="task-header">
                                        <span class="task-icon">{{ task.icon || '📝' }}</span>
                                        <h3 class="task-name">{{ task.subjectName }}</h3>
                                        <span class="task-points">{{ task.points }} 🎯</span>
                                    </div>
                                    <p class="task-description">{{ task.description }}</p>
                                    <div class="task-meta">
                                        <span class="task-date">{{ task.date }}</span>
                                        <span class="task-subject">{{ task.subject }}</span>
                                    </div>
                                </div>
                                <div class="task-actions">
                                    <button class="btn edit-btn" @click="editTask(task)">
                                        <span class="btn-icon">✏️</span>
                                        <span>编辑</span>
                                    </button>
                                    <button class="btn delete-btn" @click="confirmDeleteTask(task)">
                                        <span class="btn-icon">🗑️</span>
                                        <span>删除</span>
                                    </button>
                                </div>
                            </div>
                            <div v-if="store.plans.length === 0" class="no-tasks">
                                <p class="no-tasks-text">暂无计划</p>
                                <p class="no-tasks-hint">点击上方按钮添加新计划</p>
                            </div>
                        </div>
                    </div>
                </div>

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
                        </div>
                    </div>
                </div>

                <!-- 行为管理 -->
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

                <!-- 兑换项管理 -->
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
                                        <span class="reward-icon">🎁</span> <!-- 使用固定图标或从store中获取 -->
                                        <h3 class="reward-name">{{ reward.name }}</h3>
                                        <span class="reward-cost">{{ reward.points }} 🎯</span> <!-- 修改为points -->
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
        </div>

        <!-- 添加/编辑计划弹窗 -->
        <div v-if="showTaskModal" class="modal-overlay" @click="closeTaskModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2 class="modal-title">{{ isEditingTask ? '✏️ 编辑计划' : '➕ 添加计划' }}</h2>
                    <button class="close-btn" @click="closeTaskModal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="taskName" class="form-label">计划名称<span class="required">*</span></label>
                        <input type="text" id="taskName" v-model="currentTask.subjectName" placeholder="输入计划名称..."
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="taskSubject" class="form-label">学科</label>
                        <select id="taskSubject" v-model="currentTask.subject" class="form-input">
                            <option value="chinese">语文</option>
                            <option value="math">数学</option>
                            <option value="english">英语</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="taskType" class="form-label">计划类型</label>
                        <select id="taskType" v-model="currentTask.type" class="form-input">
                            <option value="daily">日计划</option>
                            <option value="weekly">周计划</option>
                        </select>
                    </div>
                    
                    <!-- 日计划选项 -->
                    <div v-if="currentTask.type === 'daily'" class="form-group">
                        <label for="dailyType" class="form-label">日计划类型</label>
                        <select id="dailyType" v-model="currentTask.dailyType" class="form-input">
                            <option value="specific">特定日期</option>
                            <option value="everyday">每天</option>
                        </select>
                    </div>
                    
                    <!-- 特定日期选择 -->
                    <div v-if="currentTask.type === 'daily' && currentTask.dailyType === 'specific'" class="form-group">
                        <label for="taskDate" class="form-label">日期</label>
                        <input type="date" id="taskDate" v-model="currentTask.date" class="form-input">
                    </div>
                    
                    <!-- 周计划选项 -->
                    <div v-if="currentTask.type === 'weekly'" class="form-group">
                        <label for="weeklyType" class="form-label">周计划类型</label>
                        <select id="weeklyType" v-model="currentTask.weeklyType" class="form-input">
                            <option value="everyweek">每周</option>
                            <option value="specific">特定周</option>
                        </select>
                    </div>
                    
                    <!-- 特定周选择 -->
                    <div v-if="currentTask.type === 'weekly' && currentTask.weeklyType === 'specific'" class="form-group">
                        <label for="weekSelect" class="form-label">选择周</label>
                        <select id="weekSelect" v-model="currentTask.selectedWeek" class="form-input">
                            <option v-for="week in availableWeeks" :key="week.value" :value="week.value">
                                {{ week.label }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="taskTargetCount" class="form-label">目标次数</label>
                        <input type="number" id="taskTargetCount" v-model.number="currentTask.targetCount" placeholder="输入目标次数..."
                            class="form-input" min="1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">时间限制</label>
                        <div class="time-range-input">
                            <input type="time" v-model="startTime" class="form-input time-input">
                            <span class="time-separator">至</span>
                            <input type="time" v-model="endTime" class="form-input time-input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="taskDescription" class="form-label">计划描述<span class="required">*</span></label>
                        <textarea id="taskDescription" v-model="currentTask.description" placeholder="输入计划描述..."
                            class="form-textarea" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="taskPoints" class="form-label">奖励积分<span class="required">*</span></label>
                        <input type="number" id="taskPoints" v-model.number="currentTask.points" placeholder="输入积分..."
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">计划图标</label>
                        <div class="icon-input-group">
                            <input type="text" v-model="currentTask.icon" placeholder="输入图标（例如：📝）..."
                                class="form-input">
                            <button type="button" class="btn icon-select-btn" @click="openIconSelector('task')">
                                <span class="btn-icon">🎨</span>
                                <span>选择图标</span>
                            </button>
                        </div>
                    </div>
                    <button class="btn save-btn" @click="saveTask">
                        <span class="btn-icon">💾</span>
                        <span>保存</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 添加/编辑兑换项弹窗 -->
        <div v-if="showRewardModal" class="modal-overlay" @click="closeRewardModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2 class="modal-title">{{ isEditingReward ? '✏️ 编辑兑换项' : '➕ 添加兑换项' }}</h2>
                    <button class="close-btn" @click="closeRewardModal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="rewardName" class="form-label">兑换项名称</label>
                        <input type="text" id="rewardName" v-model="currentReward.name" placeholder="输入兑换项名称..."
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="rewardDescription" class="form-label">兑换项描述</label>
                        <textarea id="rewardDescription" v-model="currentReward.description" placeholder="输入兑换项描述..."
                            class="form-textarea" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="rewardCost" class="form-label">所需积分</label>
                        <input type="number" id="rewardCost" v-model.number="currentReward.cost" placeholder="输入所需积分..."
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">兑换项图标</label>
                        <div class="icon-input-group">
                            <input type="text" v-model="currentReward.icon" placeholder="输入图标（例如：🎁）..."
                                class="form-input">
                            <button type="button" class="btn icon-select-btn" @click="openIconSelector('reward')">
                                <span class="btn-icon">🎨</span>
                                <span>选择图标</span>
                            </button>
                        </div>
                    </div>
                    <button class="btn save-btn" @click="saveReward">
                        <span class="btn-icon">💾</span>
                        <span>保存</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 确认删除弹窗 -->
        <div v-if="showConfirmModal" class="confirm-modal-overlay" @click="closeConfirmModal">
            <div class="confirm-modal-content" @click.stop>
                <div class="modal-header">
                    <h2 class="modal-title">⚠️ 确认删除</h2>
                    <button class="close-btn" @click="closeConfirmModal">✕</button>
                </div>
                <div class="modal-body">
                    <p class="confirm-message">{{ confirmMessage }}</p>
                    <div class="confirm-actions">
                        <button class="btn cancel-btn" @click="closeConfirmModal">
                            <span class="btn-icon">❌</span>
                            <span>取消</span>
                        </button>
                        <button class="btn delete-confirm-btn" @click="confirmAction">
                            <span class="btn-icon">✅</span>
                            <span>确认</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 添加/编辑行为弹窗 -->
        <div v-if="showBehaviorModal" class="modal-overlay" @click="closeBehaviorModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2 class="modal-title">{{ isEditingBehavior ? '✏️ 编辑行为' : '➕ 添加行为' }}</h2>
                    <button class="close-btn" @click="closeBehaviorModal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="behaviorName" class="form-label">行为名称</label>
                        <input type="text" id="behaviorName" v-model="currentBehavior.name" placeholder="输入行为名称..."
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="behaviorDescription" class="form-label">行为描述</label>
                        <textarea id="behaviorDescription" v-model="currentBehavior.description" placeholder="输入行为描述..."
                            class="form-textarea" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">行为图标</label>
                        <div class="icon-input-group">
                            <input type="text" v-model="currentBehavior.icon" placeholder="输入图标（例如：🎯）..."
                                class="form-input">
                            <button type="button" class="btn icon-select-btn" @click="openIconSelector('behavior')">
                                <span class="btn-icon">🎨</span>
                                <span>选择图标</span>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="behaviorFrequency" class="form-label">频率</label>
                        <select id="behaviorFrequency" v-model="currentBehavior.frequency" class="form-input">
                            <option value="daily">每日</option>
                            <option value="weekly">每周</option>
                            <option value="custom">自定义</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="behaviorTargetCount" class="form-label">目标次数</label>
                        <input type="number" id="behaviorTargetCount" v-model.number="currentBehavior.targetCount" placeholder="输入目标次数..."
                            class="form-input" min="1">
                    </div>
                    <div class="form-group">
                        <label for="behaviorPoints" class="form-label">积分</label>
                        <input type="number" id="behaviorPoints" v-model.number="currentBehavior.points" placeholder="输入积分..."
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="behaviorType" class="form-label">类型</label>
                        <select id="behaviorType" v-model="currentBehavior.type" class="form-input">
                            <option value="positive">积极</option>
                            <option value="negative">消极</option>
                        </select>
                    </div>
                    <button class="btn save-btn" @click="saveBehavior">
                        <span class="btn-icon">💾</span>
                        <span>保存</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 图标选择器弹窗 -->
        <div v-if="showIconSelector" class="modal-overlay" @click="closeIconSelector">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2 class="modal-title">🎨 选择图标</h2>
                    <button class="close-btn" @click="closeIconSelector">✕</button>
                </div>
                <div class="modal-body">
                    <div class="icon-grid">
                        <button 
                            v-for="icon in availableIcons" 
                            :key="icon"
                            class="icon-item"
                            @click="selectIcon(icon)"
                        >
                            <span class="icon-preview">{{ icon }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 通知弹窗 -->
        <div v-if="showNotification" class="notification-overlay">
            <div class="notification-content" :class="notificationType">
                <span class="notification-icon">{{ notificationIcon }}</span>
                <p class="notification-message">{{ notificationMessage }}</p>
                <button class="close-notification-btn" @click="closeNotification">✕</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationTabs from '@/components/NavigationTabs.vue'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const store = useUserStore()
// 认证相关
const isAuthenticated = ref(false)
const adminPassword = ref('')
const authError = ref('')

// 积分调整相关
const userId = ref('')
const pointsToAdjust = ref(0)

// 任务相关
interface Task {
    id: string
    subject: 'chinese' | 'math' | 'english'
    subjectName: string
    date: string
    type: 'daily' | 'weekly'
    dailyType?: 'specific' | 'everyday'
    weeklyType?: 'everyweek' | 'specific'
    selectedWeek?: string
    frequency: 'once' | 'daily' | 'weekly'
    targetCount: number
    completedCount: number
    timeRange: string
    completionLevel: boolean
    points: number
    description: string
    icon?: string
}

// 不再使用本地tasks数组，直接使用store.plans

// 兑换项相关
interface Reward {
    id: string
    name: string
    description: string
    cost: number
    icon: string
}

// 行为相关
interface Behavior {
    id: string
    name: string
    description: string
    icon: string
    frequency: 'daily' | 'weekly' | 'custom'
    targetCount: number
    points: number
    type: 'positive' | 'negative'
}

// 模态框相关
const showTaskModal = ref(false)
const showRewardModal = ref(false)
const showBehaviorModal = ref(false)
const showConfirmModal = ref(false)
const isEditingTask = ref(false)
const isEditingReward = ref(false)
const isEditingBehavior = ref(false)
const confirmMessage = ref('')
const confirmAction = ref(() => { })

// 图标选择相关
const showIconSelector = ref(false)
const selectedIconType = ref<'task' | 'behavior' | 'reward'>('task')
const availableIcons = [
    '📝', '📚', '🎯', '🏠', '🌙', '💧', '✏️', '❌', '⏰', '🥗',
    '🎨', '🎵', '🏃', '💪', '🧠', '💤', '🍎', '🥦', '💖', '🌟'
]

// 生成可用的周选项
const availableWeeks = computed(() => {
    const weeks = []
    const now = new Date()
    
    // 生成未来8周的选项
    for (let i = 0; i < 8; i++) {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() + i * 7 - now.getDay() + 1) // 调整到周一
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6) // 周日
        
        const startStr = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日`
        const endStr = `${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`
        const weekNumber = Math.ceil((weekStart.getDate() + 6) / 7) // 计算周数
        
        weeks.push({
            label: `第${weekNumber}周 (${startStr} - ${endStr})`,
            value: `${weekStart.toISOString().slice(0, 10)}-${weekEnd.toISOString().slice(0, 10)}`
        })
    }
    
    return weeks
})

// 时间选择器变量
const startTime = ref('')
const endTime = ref('')

// 当前编辑的任务、兑换项和行为
const currentTask = reactive<Task>({
    id: '',
    subject: 'chinese',
    subjectName: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'daily',
    dailyType: 'specific',
    weeklyType: 'everyweek',
    selectedWeek: '',
    frequency: 'once',
    targetCount: 1,
    completedCount: 0,
    timeRange: '',
    completionLevel: false,
    points: 0,
    description: '',
    icon: ''
})

const currentReward = reactive<Reward>({
    id: '',
    name: '',
    description: '',
    cost: 0,
    icon: ''
})

const currentBehavior = reactive<Behavior>({
    id: '',
    name: '',
    description: '',
    icon: '',
    frequency: 'daily',
    targetCount: 1,
    points: 1,
    type: 'positive'
})

// 通知相关
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success') // success, error, info
const notificationIcon = ref('')

// 文件输入引用
const fileInput = ref<HTMLInputElement>()

// 方法
const authenticate = () => {
    // 实际应用中应该有更安全的认证方式
    if (adminPassword.value === '379487') {
        isAuthenticated.value = true
        adminPassword.value = ''
        authError.value = ''
        showNotificationMessage('认证成功！欢迎管理员 🧙‍♀️', 'success', '🎉')
    } else {
        authError.value = '密码错误，请重试'
        showNotificationMessage('认证失败，请检查密码', 'error', '❌')
    }
}

const closePasswordModal = () => {
    router.back()
}

const addPoints = () => {
    if (pointsToAdjust.value <= 0) {
        showNotificationMessage('请输入有效的积分数量', 'error', '❌')
        return
    }

    // 直接调用store的adjustPoints方法
    store.adjustPoints(pointsToAdjust.value, '管理员增加积分')
    showNotificationMessage(`成功增加 ${pointsToAdjust.value} 积分！`, 'success', '✅')
    pointsToAdjust.value = 0
}

const subtractPoints = () => {
    if (pointsToAdjust.value <= 0) {
        showNotificationMessage('请输入有效的积分数量', 'error', '❌')
        return
    }

    // 直接调用store的adjustPoints方法，传入负数
    store.adjustPoints(-pointsToAdjust.value, '管理员扣除积分')
    showNotificationMessage(`成功扣除 ${pointsToAdjust.value} 积分！`, 'success', '✅')
    pointsToAdjust.value = 0
}

const showAddTaskModal = () => {
    isEditingTask.value = false
    Object.assign(currentTask, {
        id: '',
        name: '',
        subject: 'chinese',
        subjectName: '',
        date: new Date().toISOString().slice(0, 10),
        type: 'daily',
        dailyType: 'specific',
        weeklyType: 'everyweek',
        selectedWeek: '',
        frequency: 'once',
        targetCount: 1,
        timeRange: '',
        completionLevel: null,
        points: 0,
        description: '',
        icon: ''
    })
    // 重置时间选择器
    startTime.value = ''
    endTime.value = ''
    showTaskModal.value = true
}

const showAddRewardModal = () => {
    isEditingReward.value = false
    Object.assign(currentReward, {
        id: '',
        name: '',
        description: '',
        cost: 0,
        icon: ''
    })
    showRewardModal.value = true
}

const showAddBehaviorModal = () => {
    isEditingBehavior.value = false
    Object.assign(currentBehavior, {
        id: '',
        name: '',
        description: '',
        icon: '',
        frequency: 'daily',
        targetCount: 1,
        points: 1,
        type: 'positive'
    })
    showBehaviorModal.value = true
}

const editTask = (task: Task) => {
    isEditingTask.value = true
    Object.assign(currentTask, task)
    // 解析时间范围并设置到时间选择器
    if (task.timeRange) {
        const [start, end] = task.timeRange.split('-')
        startTime.value = start?.trim() || ''
        endTime.value = end?.trim() || ''
    } else {
        startTime.value = ''
        endTime.value = ''
    }
    showTaskModal.value = true
}

const editReward = (reward: any) => { // 修改参数类型为any以适配store中的结构
    isEditingReward.value = true
    // 调整字段映射
    Object.assign(currentReward, {
        id: reward.id,
        name: reward.name,
        description: reward.description,
        cost: reward.points, // 将points映射到cost
        icon: reward.icon || '🎁' // 提供默认图标
    })
    showRewardModal.value = true
}

const editBehavior = (behavior: any) => {
    isEditingBehavior.value = true
    Object.assign(currentBehavior, behavior)
    showBehaviorModal.value = true
}

const saveTask = () => {
    if (!currentTask.subjectName || !currentTask.description || currentTask.points <= 0) {
        showNotificationMessage('请填写完整的计划信息', 'error', '❌')
        return
    }

    // 组合时间范围
    let timeRange = ''
    if (startTime.value && endTime.value) {
        timeRange = `${startTime.value}-${endTime.value}`
    }

    // 准备计划数据
    const newTask = {
        id: isEditingTask.value ? currentTask.id : `custom-${Date.now()}`,
        subject: currentTask.subject,
        subjectName: currentTask.subjectName,
        date: currentTask.date,
        type: currentTask.type,
        dailyType: currentTask.dailyType,
        weeklyType: currentTask.weeklyType,
        selectedWeek: currentTask.selectedWeek,
        frequency: currentTask.frequency,
        targetCount: currentTask.targetCount,
        completedCount: currentTask.completedCount || 0,
        timeRange: timeRange,
        completionLevel: currentTask.completionLevel,
        points: currentTask.points,
        description: currentTask.description,
        icon: currentTask.icon
    }

    // 添加到store的plans中
    if (isEditingTask.value) {
        const index = store.plans.findIndex(t => t.id === newTask.id)
        if (index !== -1) {
            store.plans[index] = newTask
            showNotificationMessage('计划更新成功！', 'success', '✅')
        }
    } else {
        store.plans.push(newTask)
        showNotificationMessage('计划添加成功！', 'success', '✅')
    }

    closeTaskModal()
}

const saveReward = () => {
    if (!currentReward.name || !currentReward.description || currentReward.cost <= 0) {
        showNotificationMessage('请填写完整的兑换项信息', 'error', '❌')
        return
    }

    if (isEditingReward.value) {
        // 修复参数格式，按照store方法的要求传入各个参数
        store.updateExchangeItem(
            currentReward.id,
            currentReward.name,
            currentReward.cost,
            currentReward.description
        )
    } else {
        // 修复参数格式
        store.addExchangeItem(
            currentReward.name,
            currentReward.cost,
            currentReward.description
        )
    }
    showNotificationMessage(isEditingReward.value ? '兑换项更新成功！' : '兑换项添加成功！', 'success', '✅')
    closeRewardModal()
}

const saveBehavior = () => {
    if (!currentBehavior.name || !currentBehavior.description || !currentBehavior.icon) {
        showNotificationMessage('请填写完整的行为信息', 'error', '❌')
        return
    }

    if (isEditingBehavior.value) {
        store.updateBehavior(currentBehavior.id, {
            name: currentBehavior.name,
            description: currentBehavior.description,
            icon: currentBehavior.icon,
            frequency: currentBehavior.frequency,
            targetCount: currentBehavior.targetCount,
            points: currentBehavior.points,
            type: currentBehavior.type
        })
        showNotificationMessage('行为更新成功！', 'success', '✅')
    } else {
        store.addBehavior({
            name: currentBehavior.name,
            description: currentBehavior.description,
            icon: currentBehavior.icon,
            frequency: currentBehavior.frequency,
            targetCount: currentBehavior.targetCount,
            points: currentBehavior.points,
            type: currentBehavior.type
        })
        showNotificationMessage('行为添加成功！', 'success', '✅')
    }

    closeBehaviorModal()
}

const confirmDeleteTask = (task: Task) => {
    confirmMessage.value = `确定要删除计划 "${task.subjectName}" 吗？`
    confirmAction.value = () => {
        // 从store中删除计划
        store.plans = store.plans.filter(t => t.id !== task.id)
        showNotificationMessage('计划删除成功！', 'success', '✅')
        closeConfirmModal()
    }
    showConfirmModal.value = true
}

const confirmDeleteReward = (reward: any) => {
    confirmMessage.value = `确定要删除兑换项 "${reward.name}" 吗？`
    confirmAction.value = () => {
        store.removeExchangeItem(reward.id)
        showNotificationMessage('兑换项删除成功！', 'success', '✅')
        closeConfirmModal()
    }
    showConfirmModal.value = true
}

const confirmDeleteBehavior = (behavior: any) => {
    confirmMessage.value = `确定要删除行为 "${behavior.name}" 吗？`
    confirmAction.value = () => {
        store.removeBehavior(behavior.id)
        showNotificationMessage('行为删除成功！', 'success', '✅')
        closeConfirmModal()
    }
    showConfirmModal.value = true
}

// 打开图标选择器
const openIconSelector = (type: 'task' | 'behavior' | 'reward') => {
    selectedIconType.value = type
    showIconSelector.value = true
}

// 选择图标
const selectIcon = (icon: string) => {
    if (selectedIconType.value === 'task') {
        currentTask.icon = icon
    } else if (selectedIconType.value === 'behavior') {
        currentBehavior.icon = icon
    } else if (selectedIconType.value === 'reward') {
        currentReward.icon = icon
    }
    showIconSelector.value = false
}

const closeTaskModal = () => {
    showTaskModal.value = false
}

const closeRewardModal = () => {
    showRewardModal.value = false
}

const closeBehaviorModal = () => {
    showBehaviorModal.value = false
}

const closeConfirmModal = () => {
    showConfirmModal.value = false
}

const closeIconSelector = () => {
    showIconSelector.value = false
}

const showNotificationMessage = (message: string, type: string, icon: string) => {
    notificationMessage.value = message
    notificationType.value = type
    notificationIcon.value = icon
    showNotification.value = true

    setTimeout(() => {
        closeNotification()
    }, 3000)
}

const closeNotification = () => {
    showNotification.value = false
}

const goBack = () => {
    router.back()
}

const logout = () => {
    isAuthenticated.value = false
    router.push('/')
}

// 数据导出功能
const exportData = () => {
    try {
        // 收集所有需要导出的数据
        const exportData = {
            userInfo: store.userInfo,
            currentPoints: store.currentPoints,
            plans: store.plans,
            behaviors: store.behaviors,
            pointRecords: store.pointRecords,
            exchangeItems: store.exchangeItems,
            lotteryRecords: store.lotteryRecords,
            backpackItems: store.backpackItems,
            achievements: store.achievements,
            totalTaskCompletions: store.totalTaskCompletions,
            studyStreak: store.studyStreak,
            lastCompletionDate: store.lastCompletionDate,
            lastLoginDate: store.lastLoginDate,
            enableReminders: store.enableReminders,
            enableLottery: store.enableLottery
        }

        // 转换为JSON字符串
        const jsonString = JSON.stringify(exportData, null, 2)
        
        // 创建Blob对象
        const blob = new Blob([jsonString], { type: 'application/json' })
        
        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `learning-motivation-data-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        showNotificationMessage('数据导出成功！', 'success', '✅')
    } catch (error) {
        console.error('导出数据失败:', error)
        showNotificationMessage('导出数据失败，请重试', 'error', '❌')
    }
}

// 触发文件选择
const triggerFileInput = () => {
    fileInput.value?.click()
}

// 数据导入功能
const importData = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const jsonString = e.target?.result as string
            const importedData = JSON.parse(jsonString)
            
            // 确认是否覆盖现有数据
            if (confirm('确定要导入数据吗？这将覆盖所有现有数据！')) {
                // 导入数据到store
                if (importedData.userInfo) store.userInfo = importedData.userInfo
                if (importedData.currentPoints !== undefined) store.currentPoints = importedData.currentPoints
                if (importedData.plans) store.plans = importedData.plans
                if (importedData.behaviors) store.behaviors = importedData.behaviors
                if (importedData.pointRecords) store.pointRecords = importedData.pointRecords
                if (importedData.exchangeItems) store.exchangeItems = importedData.exchangeItems
                if (importedData.lotteryRecords) store.lotteryRecords = importedData.lotteryRecords
                if (importedData.backpackItems) store.backpackItems = importedData.backpackItems
                if (importedData.achievements) store.achievements = importedData.achievements
                if (importedData.totalTaskCompletions !== undefined) store.totalTaskCompletions = importedData.totalTaskCompletions
                if (importedData.studyStreak !== undefined) store.studyStreak = importedData.studyStreak
                if (importedData.lastCompletionDate) store.lastCompletionDate = importedData.lastCompletionDate
                if (importedData.lastLoginDate) store.lastLoginDate = importedData.lastLoginDate
                if (importedData.enableReminders !== undefined) store.enableReminders = importedData.enableReminders
                if (importedData.enableLottery !== undefined) store.enableLottery = importedData.enableLottery
                
                showNotificationMessage('数据导入成功！', 'success', '✅')
            }
        } catch (error) {
            console.error('导入数据失败:', error)
            showNotificationMessage('导入数据失败，请检查文件格式', 'error', '❌')
        }
    }
    reader.onerror = () => {
        showNotificationMessage('读取文件失败，请重试', 'error', '❌')
    }
    reader.readAsText(file)
    
    // 重置文件输入
    target.value = ''
}

// 确认重置数据
const confirmResetData = () => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
        store.resetAllData()
        showNotificationMessage('数据重置成功！', 'success', '✅')
    }
}
</script>

<style scoped>
/* 基础样式 */
.admin-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%);
    position: relative;
    padding: 20px;
    overflow-x: hidden;
}

/* 装饰元素 */
.decorations {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
}

/* 心形装饰 */
.heart {
    position: absolute;
    font-size: 24px;
    animation: float 6s ease-in-out infinite;
    opacity: 0.7;
}

.heart-1 {
    top: 10%;
    left: 5%;
    color: #ff6b8b;
    animation-duration: 7s;
}

.heart-2 {
    top: 30%;
    right: 8%;
    color: #ff8fa3;
    animation-duration: 8s;
    animation-delay: 1s;
}

.heart-3 {
    bottom: 15%;
    left: 12%;
    color: #ffb3c1;
    animation-duration: 6s;
    animation-delay: 2s;
}

/* 星星装饰 */
.star {
    position: absolute;
    font-size: 20px;
    animation: twinkle 4s ease-in-out infinite;
}

.star-1 {
    top: 20%;
    right: 15%;
    color: #ffd700;
    animation-delay: 0.5s;
}

.star-2 {
    top: 50%;
    left: 8%;
    color: #ffec3d;
    animation-delay: 1.2s;
}

.star-3 {
    bottom: 25%;
    right: 10%;
    color: #fff48c;
    animation-delay: 0.8s;
}

.star-4 {
    bottom: 10%;
    left: 20%;
    color: #ffee9c;
    animation-delay: 1.5s;
}

/* 云朵装饰 */
.cloud {
    position: absolute;
    font-size: 40px;
    animation: float 10s ease-in-out infinite;
    opacity: 0.8;
}

.cloud-1 {
    top: 15%;
    left: 20%;
    animation-duration: 15s;
}

.cloud-2 {
    bottom: 20%;
    right: 25%;
    animation-duration: 18s;
    animation-delay: 2s;
}

/* 魔法棒装饰 */
.magic-wand {
    position: absolute;
    font-size: 30px;
    animation: sparkle 3s ease-in-out infinite;
}

.magic-wand-1 {
    top: 25%;
    right: 15%;
    animation-delay: 1s;
}

.magic-wand-2 {
    bottom: 20%;
    left: 15%;
    animation-delay: 2s;
}

/* 页面头部 */
.admin-header {
    position: relative;
    z-index: 2;
    margin-bottom: 30px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 8px 30px rgba(255, 107, 139, 0.2);
    border: 2px solid #ffd1dc;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.game-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #ff6b8b;
    margin: 0;
    text-shadow: 3px 3px 0px #ffd1dc, 5px 5px 10px rgba(255, 107, 139, 0.3);
}

.header-actions {
    display: flex;
    gap: 15px;
}

/* 按钮样式 */
.btn {
    background: linear-gradient(45deg, #ff6b8b, #ff8fa3);
    color: white;
    border: none;
    border-radius: 30px;
    padding: 12px 25px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(255, 107, 139, 0.3);
    position: relative;
    overflow: hidden;
}

.btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: all 0.6s ease;
}

.btn:hover::before {
    left: 100%;
}

.btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.4);
}

.btn-icon {
    font-size: 1.2rem;
}

/* 不同按钮类型 */
.add-btn,
.add-task-btn,
.add-reward-btn {
    background: linear-gradient(45deg, #ff6b8b, #ff8fa3);
}

.subtract-btn {
    background: linear-gradient(45deg, #ff8fa3, #ffb3c1);
}

.edit-btn {
    background: linear-gradient(45deg, #feca57, #ff9ff3);
}

.delete-btn,
.delete-confirm-btn {
    background: linear-gradient(45deg, #ff6b6b, #ee5253);
}

.confirm-btn,
.save-btn {
    background: linear-gradient(45deg, #54a0ff, #5f27cd);
}

.cancel-btn {
    background: linear-gradient(45deg, #95a5a6, #7f8c8d);
}

.export-btn {
    background: linear-gradient(45deg, #48dbfb, #1287a5);
}

.import-btn {
    background: linear-gradient(45deg, #1dd1a1, #10ac84);
}

.reset-btn {
    background: linear-gradient(45deg, #ff9ff3, #f368e0);
}

/* 管理功能区域 */
.admin-sections {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 40px;
}

/* 管理区域 */
.admin-section {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 25px;
    padding: 30px;
    box-shadow: 0 10px 35px rgba(255, 107, 139, 0.2);
    border: 2px solid #ffd1dc;
    position: relative;
    overflow: hidden;
}

.admin-section::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: rgba(255, 107, 139, 0.05);
    border-radius: 50%;
    transform: translate(50%, -50%);
}

/* 区域标题 */
.section-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
    position: relative;
    z-index: 1;
}

.section-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #ff6b8b;
    margin: 0;
    text-shadow: 2px 2px 0px #ffd1dc;
}

.section-decoration {
    flex: 1;
    height: 3px;
    background: linear-gradient(90deg, #ff6b8b, transparent);
    border-radius: 3px;
}

/* 表单样式 */
.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #666;
    font-size: 1rem;
}

.form-input,
.form-textarea,
.password-input {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #ffd1dc;
    border-radius: 15px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: white;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}

.form-input:focus,
.form-textarea:focus,
.password-input:focus {
    outline: none;
    border-color: #ff6b8b;
    box-shadow: 0 0 0 3px rgba(255, 107, 139, 0.1);
}

/* 时间范围输入样式 */
.time-range-input {
    display: flex;
    align-items: center;
    gap: 10px;
}

.time-input {
    flex: 1;
}

.time-separator {
    font-weight: bold;
    color: #666;
}

/* 数据管理样式 */
.data-management {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;
}

.data-info {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 15px;
    padding: 20px;
    border: 2px solid #ffd1dc;
}

.data-info-text {
    margin: 10px 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
}

/* 必填项红星样式 */
.required {
    color: #ff6b6b;
    margin-left: 5px;
    font-weight: bold;
}

/* 积分控制面板 */
.point-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: flex-end;
}

.point-controls .form-group {
    flex: 1;
    min-width: 200px;
    margin-bottom: 0;
}

.action-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

/* 任务列表 */
.tasks-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 20px;
}

.task-item {
    background: linear-gradient(135deg, #fff 0%, #ffe6ea 100%);
    border-radius: 20px;
    padding: 20px;
    border: 2px solid #ffd1dc;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.task-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 107, 139, 0.1), transparent);
    transition: all 0.6s ease;
}

.task-item:hover::before {
    left: 100%;
}

.task-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 107, 139, 0.2);
}

.task-info {
    flex: 1;
    min-width: 250px;
}

.task-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
}

.task-icon {
    font-size: 2rem;
}

.task-name {
    font-size: 1.3rem;
    font-weight: bold;
    color: #ff6b8b;
    margin: 0;
    flex: 1;
}

.task-points {
    font-size: 1.1rem;
    font-weight: bold;
    color: #ff6b8b;
    background: rgba(255, 107, 139, 0.1);
    padding: 5px 15px;
    border-radius: 20px;
}

.task-description {
    color: #666;
    margin: 0 0 10px 0;
    line-height: 1.5;
}

.task-meta {
    display: flex;
    gap: 15px;
    font-size: 0.9rem;
    color: #666;
}

.task-date {
    background: rgba(255, 107, 139, 0.1);
    padding: 3px 10px;
    border-radius: 15px;
}

.task-subject {
    background: rgba(76, 175, 80, 0.1);
    padding: 3px 10px;
    border-radius: 15px;
}

.task-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* 兑换项列表 */
.rewards-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 20px;
}

.reward-item {
    background: linear-gradient(135deg, #fff 0%, #ffe6ea 100%);
    border-radius: 20px;
    padding: 20px;
    border: 2px solid #ffd1dc;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.reward-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 107, 139, 0.1), transparent);
    transition: all 0.6s ease;
}

.reward-item:hover::before {
    left: 100%;
}

.reward-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 107, 139, 0.2);
}

.reward-info {
    flex: 1;
    min-width: 250px;
}

.reward-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
}

.reward-icon {
    font-size: 2rem;
}

.reward-name {
    font-size: 1.3rem;
    font-weight: bold;
    color: #ff6b8b;
    margin: 0;
    flex: 1;
}

.reward-cost {
    font-size: 1.1rem;
    font-weight: bold;
    color: #ff6b8b;
    background: rgba(255, 107, 139, 0.1);
    padding: 5px 15px;
    border-radius: 20px;
}

.reward-description {
    color: #666;
    margin: 0;
    line-height: 1.5;
}

.reward-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* 功能开关样式 */
.feature-toggle {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: linear-gradient(135deg, #fff 0%, #ffe6ea 100%);
    border-radius: 20px;
    border: 2px solid #ffd1dc;
    transition: all 0.3s ease;
}

.toggle-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 139, 0.2);
}

.toggle-info {
    flex: 1;
}

.toggle-name {
    font-size: 1.2rem;
    font-weight: bold;
    color: #ff6b8b;
    margin: 0 0 5px 0;
}

.toggle-description {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
}

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
    background: linear-gradient(45deg, #ff6b8b, #ff8fa3);
}

input:focus + .toggle-slider {
    box-shadow: 0 0 1px #ff6b8b;
}

input:checked + .toggle-slider:before {
    transform: translateX(26px);
}

/* 无任务/兑换项/行为状态 */
.no-tasks,
.no-rewards,
.no-behaviors {
    text-align: center;
    padding: 40px 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    border: 2px dashed #ffb3c1;
}

.no-tasks-text,
.no-rewards-text,
.no-behaviors-text {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 10px;
}

.no-tasks-hint,
.no-rewards-hint,
.no-behaviors-hint {
    font-size: 1rem;
    color: #999;
    margin: 0;
}

/* 行为列表 */
.behaviors-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 20px;
}

.behavior-item {
    background: linear-gradient(135deg, #fff 0%, #ffe6ea 100%);
    border-radius: 20px;
    padding: 20px;
    border: 2px solid #ffd1dc;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.behavior-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 107, 139, 0.1), transparent);
    transition: all 0.6s ease;
}

.behavior-item:hover::before {
    left: 100%;
}

.behavior-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 107, 139, 0.2);
}

.behavior-info {
    flex: 1;
    min-width: 250px;
}

.behavior-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
}

.behavior-icon {
    font-size: 2rem;
}

.behavior-name {
    font-size: 1.3rem;
    font-weight: bold;
    color: #ff6b8b;
    margin: 0;
    flex: 1;
}

.behavior-points {
    font-size: 1.1rem;
    font-weight: bold;
    color: #4caf50;
    background: rgba(76, 175, 80, 0.1);
    padding: 5px 15px;
    border-radius: 20px;
}

.behavior-points.negative {
    color: #f44336;
    background: rgba(244, 67, 54, 0.1);
}

.behavior-description {
    color: #666;
    margin: 0 0 10px 0;
    line-height: 1.5;
}

.behavior-meta {
    display: flex;
    gap: 15px;
    font-size: 0.9rem;
    color: #666;
}

.behavior-frequency {
    background: rgba(255, 107, 139, 0.1);
    padding: 3px 10px;
    border-radius: 15px;
}

.behavior-type {
    background: rgba(76, 175, 80, 0.1);
    padding: 3px 10px;
    border-radius: 15px;
}

.behavior-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* 图标输入组 */
.icon-input-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.icon-input-group .form-input {
    flex: 1;
}

.icon-select-btn {
    flex: 0 0 auto;
    white-space: nowrap;
}

/* 图标选择器 */
.icon-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 15px;
    margin-top: 20px;
}

.icon-item {
    background: linear-gradient(135deg, #fff 0%, #ffe6ea 100%);
    border: 2px solid #ffd1dc;
    border-radius: 15px;
    padding: 15px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.5rem;
}

.icon-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(255, 107, 139, 0.2);
    border-color: #ff6b8b;
}

.icon-preview {
    display: block;
    font-size: 2rem;
}

/* 模态框样式 */
.modal-overlay,
.password-modal-overlay,
.confirm-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.modal-content,
.password-modal-content,
.confirm-modal-content {
    background: white;
    border-radius: 25px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border: 3px solid #ffd1dc;
    position: relative;
    animation: bounceIn 0.4s ease;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid #ffd1dc;
}

.modal-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #ff6b8b;
    margin: 0;
    text-shadow: 2px 2px 0px #ffd1dc;
}

.close-btn {
    background: #ff6b8b;
    color: white;
    border: none;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    background: #ff8fa3;
    transform: scale(1.1);
}

.modal-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.modal-description {
    color: #666;
    font-size: 1.1rem;
    line-height: 1.5;
}

/* 认证错误 */
.auth-error {
    color: #e74c3c;
    font-size: 0.9rem;
    text-align: center;
    margin-top: -10px;
}

/* 确认操作区域 */
.confirm-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

.confirm-message {
    color: #666;
    font-size: 1.1rem;
    text-align: center;
    line-height: 1.5;
}

/* 通知弹窗 */
.notification-overlay {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px 25px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease;
    max-width: 400px;
}

.notification-content.success {
    background: linear-gradient(45deg, #66bb6a, #43a047);
    color: white;
}

.notification-content.error {
    background: linear-gradient(45deg, #ef5350, #e53935);
    color: white;
}

.notification-content.info {
    background: linear-gradient(45deg, #42a5f5, #1e88e5);
    color: white;
}

.notification-icon {
    font-size: 1.5rem;
}

.notification-message {
    flex: 1;
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
}

.close-notification-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.close-notification-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

/* 动画效果 */
@keyframes float {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

@keyframes twinkle {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.6;
        transform: scale(0.8);
    }
}

@keyframes sparkle {

    0%,
    100% {
        opacity: 0.7;
        transform: rotate(0deg);
    }

    50% {
        opacity: 1;
        transform: rotate(10deg);
    }
}

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
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes bounceIn {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    70% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .admin-container {
        padding: 15px;
    }

    .header-content {
        flex-direction: column;
        text-align: center;
    }

    .game-title {
        font-size: 2rem;
    }

    .admin-section {
        padding: 20px;
    }

    .section-title {
        font-size: 1.5rem;
    }

    .point-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .action-buttons {
        flex-direction: column;
    }

    .tasks-list,
    .rewards-list,
    .behaviors-list {
        grid-template-columns: 1fr;
    }

    .task-item,
    .reward-item,
    .behavior-item {
        flex-direction: column;
        align-items: stretch;
    }

    .task-actions,
    .reward-actions,
    .behavior-actions {
        justify-content: center;
    }

    .modal-content,
    .password-modal-content,
    .confirm-modal-content {
        padding: 25px 20px;
        margin: 20px;
    }

    .modal-title {
        font-size: 1.6rem;
    }

    .notification-content {
        max-width: calc(100vw - 40px);
    }
}
</style>