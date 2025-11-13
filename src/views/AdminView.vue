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

                <!-- 今日任务管理 -->
                <div class="admin-section">
                    <div class="section-header">
                        <h2 class="section-title">📝 任务管理</h2>
                        <div class="section-decoration"></div>
                    </div>
                    <div class="section-content">
                        <button class="btn add-task-btn" @click="showAddTaskModal">
                            <span class="btn-icon">➕</span>
                            <span>添加新任务</span>
                        </button>
                        <div class="tasks-list">
                            <div v-for="(task, index) in tasks" :key="task.id" class="task-item fade-in"
                                :style="{ animationDelay: index * 0.05 + 's' }">
                                <div class="task-info">
                                    <div class="task-header">
                                        <span class="task-icon">{{ task.icon }}</span>
                                        <h3 class="task-name">{{ task.name }}</h3>
                                        <span class="task-points">{{ task.points }} 🎯</span>
                                    </div>
                                    <p class="task-description">{{ task.description }}</p>
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
                            <div v-if="tasks.length === 0" class="no-tasks">
                                <p class="no-tasks-text">暂无任务</p>
                                <p class="no-tasks-hint">点击上方按钮添加新任务</p>
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
                            <div v-for="(reward, index) in rewards" :key="reward.id" class="reward-item fade-in"
                                :style="{ animationDelay: index * 0.05 + 's' }">
                                <div class="reward-info">
                                    <div class="reward-header">
                                        <span class="reward-icon">{{ reward.icon }}</span>
                                        <h3 class="reward-name">{{ reward.name }}</h3>
                                        <span class="reward-cost">{{ reward.cost }} 🎯</span>
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
                            <div v-if="rewards.length === 0" class="no-rewards">
                                <p class="no-rewards-text">暂无兑换项</p>
                                <p class="no-rewards-hint">点击上方按钮添加新兑换项</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 添加/编辑任务弹窗 -->
        <div v-if="showTaskModal" class="modal-overlay" @click="closeTaskModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2 class="modal-title">{{ isEditingTask ? '✏️ 编辑任务' : '➕ 添加任务' }}</h2>
                    <button class="close-btn" @click="closeTaskModal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="taskName" class="form-label">任务名称</label>
                        <input type="text" id="taskName" v-model="currentTask.name" placeholder="输入任务名称..."
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="taskDescription" class="form-label">任务描述</label>
                        <textarea id="taskDescription" v-model="currentTask.description" placeholder="输入任务描述..."
                            class="form-textarea" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="taskPoints" class="form-label">奖励积分</label>
                        <input type="number" id="taskPoints" v-model.number="currentTask.points" placeholder="输入积分..."
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="taskIcon" class="form-label">任务图标</label>
                        <input type="text" id="taskIcon" v-model="currentTask.icon" placeholder="输入图标（例如：📝）..."
                            class="form-input">
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
                        <label for="rewardIcon" class="form-label">兑换项图标</label>
                        <input type="text" id="rewardIcon" v-model="currentReward.icon" placeholder="输入图标（例如：🎁）..."
                            class="form-input">
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
import { ref, reactive } from 'vue'
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
    name: string
    description: string
    points: number
    icon: string
}

const tasks = ref<Task[]>([
    {
        id: '1',
        name: '完成每日学习',
        description: '今天学习至少1小时',
        points: 20,
        icon: '📚'
    },
    {
        id: '2',
        name: '复习笔记',
        description: '复习昨天的学习笔记',
        points: 15,
        icon: '📝'
    },
    {
        id: '3',
        name: '解决难题',
        description: '解决一个学习中遇到的难题',
        points: 30,
        icon: '🧩'
    }
])

// 兑换项相关
interface Reward {
    id: string
    name: string
    description: string
    cost: number
    icon: string
}

const rewards = ref<Reward[]>([
    {
        id: '1',
        name: '学习提醒',
        description: '设置一个学习提醒',
        cost: 50,
        icon: '⏰'
    },
    {
        id: '2',
        name: '学习计划',
        description: '获取一周学习计划模板',
        cost: 100,
        icon: '📅'
    },
    {
        id: '3',
        name: '激励卡片',
        description: '获得随机激励卡片',
        cost: 30,
        icon: '💌'
    }
])

// 模态框相关
const showTaskModal = ref(false)
const showRewardModal = ref(false)
const showConfirmModal = ref(false)
const isEditingTask = ref(false)
const isEditingReward = ref(false)
const confirmMessage = ref('')
const confirmAction = ref(() => { })

// 当前编辑的任务和兑换项
const currentTask = reactive<Task>({
    id: '',
    name: '',
    description: '',
    points: 0,
    icon: ''
})

const currentReward = reactive<Reward>({
    id: '',
    name: '',
    description: '',
    cost: 0,
    icon: ''
})

// 通知相关
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success') // success, error, info
const notificationIcon = ref('')

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
    router.push('/')
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
        description: '',
        points: 0,
        icon: ''
    })
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

const editTask = (task: Task) => {
    isEditingTask.value = true
    Object.assign(currentTask, task)
    showTaskModal.value = true
}

const editReward = (reward: Reward) => {
    isEditingReward.value = true
    Object.assign(currentReward, reward)
    showRewardModal.value = true
}

const saveTask = () => {
    if (!currentTask.name || !currentTask.description || currentTask.points <= 0 || !currentTask.icon) {
        showNotificationMessage('请填写完整的任务信息', 'error', '❌')
        return
    }

    // 这里需要修改，将任务添加到userStore的tasks中
    const today = new Date().toISOString().slice(0, 10)
    const newTask = {
        id: isEditingTask.value ? currentTask.id : `custom-${Date.now()}`,
        subject: 'chinese' as 'chinese' | 'math' | 'english', // 使用类型断言确保类型正确
        subjectName: currentTask.name,
        date: today,
        completionLevel: null,
        points: currentTask.points,
        description: currentTask.description
    }

    // 添加到store的tasks中
    if (isEditingTask.value) {
        const index = store.tasks.findIndex(t => t.id === newTask.id)
        if (index !== -1) {
            store.tasks[index] = newTask
            showNotificationMessage('任务更新成功！', 'success', '✅')
        }
    } else {
        store.tasks.push(newTask)
        showNotificationMessage('任务添加成功！', 'success', '✅')
    }

    closeTaskModal()
}

const saveReward = () => {
    if (!currentReward.name || !currentReward.description || currentReward.cost <= 0 || !currentReward.icon) {
        showNotificationMessage('请填写完整的兑换项信息', 'error', '❌')
        return
    }

    if (isEditingReward.value) {
        const index = rewards.value.findIndex(r => r.id === currentReward.id)
        if (index !== -1) {
            rewards.value[index] = { ...currentReward }
            showNotificationMessage('兑换项更新成功！', 'success', '✅')
        }
    } else {
        const newReward = {
            ...currentReward,
            id: Date.now().toString()
        }
        rewards.value.push(newReward)
        showNotificationMessage('兑换项添加成功！', 'success', '✅')
    }

    closeRewardModal()
}

const confirmDeleteTask = (task: Task) => {
    confirmMessage.value = `确定要删除任务 "${task.name}" 吗？`
    confirmAction.value = () => {
        tasks.value = tasks.value.filter(t => t.id !== task.id)
        showNotificationMessage('任务删除成功！', 'success', '✅')
        closeConfirmModal()
    }
    showConfirmModal.value = true
}

const confirmDeleteReward = (reward: Reward) => {
    confirmMessage.value = `确定要删除兑换项 "${reward.name}" 吗？`
    confirmAction.value = () => {
        rewards.value = rewards.value.filter(r => r.id !== reward.id)
        showNotificationMessage('兑换项删除成功！', 'success', '✅')
        closeConfirmModal()
    }
    showConfirmModal.value = true
}

const closeTaskModal = () => {
    showTaskModal.value = false
}

const closeRewardModal = () => {
    showRewardModal.value = false
}

const closeConfirmModal = () => {
    showConfirmModal.value = false
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
    router.push('/')
}

const logout = () => {
    isAuthenticated.value = false
    router.push('/login')
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
    display: flex;
    flex-direction: column;
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
    margin: 0;
    line-height: 1.5;
}

.task-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* 兑换项列表 */
.rewards-list {
    display: flex;
    flex-direction: column;
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

/* 无任务/兑换项状态 */
.no-tasks,
.no-rewards {
    text-align: center;
    padding: 40px 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    border: 2px dashed #ffb3c1;
}

.no-tasks-text,
.no-rewards-text {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 10px;
}

.no-tasks-hint,
.no-rewards-hint {
    font-size: 1rem;
    color: #999;
    margin: 0;
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

    .task-item,
    .reward-item {
        flex-direction: column;
        align-items: stretch;
    }

    .task-actions,
    .reward-actions {
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