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
        <PasswordModal v-if="!isAuthenticated" @authenticate="authenticate" @close="closePasswordModal" />

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
            <div class="admin-tabs">
                <button v-for="tab in tabs" :key="tab.id" :class="['tab-btn', { active: activeTab === tab.id }]"
                    @click="activeTab = tab.id">
                    <span class="tab-icon">{{ tab.icon }}</span>
                    <span class="tab-label">{{ tab.label }}</span>
                </button>
            </div>

            <!-- 管理功能区域 -->
            <div class="admin-sections">
                <!-- 仪表板 -->
                <DashboardTab v-if="activeTab === 'dashboard'" />

                <!-- 计划管理 -->
                <PlansTab v-if="activeTab === 'plans'" @show-quick-setup="openQuickSetupDrawer" @show-task-modal="handleShowTaskModal" @notification="showNotificationMessage" @confirm="handleConfirm" />

                <!-- 行为管理 -->
                <BehaviorsTab v-if="activeTab === 'behaviors'" @show-behavior-modal="handleShowBehaviorModal" @notification="showNotificationMessage" @confirm="handleConfirm" />

                <!-- 兑换项管理 -->
                <RewardsTab v-if="activeTab === 'rewards'" @show-reward-modal="handleShowRewardModal" @notification="showNotificationMessage" @confirm="handleConfirm" />

                <!-- 抽奖管理 -->
                <LotteryTab v-if="activeTab === 'lottery'" @notification="showNotificationMessage" />

                <!-- 系统设置 -->
                <SettingsTab v-if="activeTab === 'settings'" @notification="showNotificationMessage" />
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
                        <el-input id="taskName" v-model="currentTask.subjectName" placeholder="输入计划名称..." />
                    </div>
                    <div class="form-row">
                        <div class="form-group half">
                            <label for="taskSubject" class="form-label">学科</label>
                            <el-select id="taskSubject" v-model="currentTask.subject" style="width: 100%">
                                <el-option value="chinese" label="语文">语文</el-option>
                                <el-option value="math" label="数学">数学</el-option>
                                <el-option value="english" label="英语">英语</el-option>
                                <el-option value="general" label="全科">全科</el-option>
                            </el-select>
                        </div>
                        <div class="form-group half">
                            <label for="taskType" class="form-label">计划类型</label>
                            <el-select id="taskType" v-model="currentTask.type" style="width: 100%">
                                <el-option value="daily" label="日计划">日计划</el-option>
                                <el-option value="weekly" label="周计划">周计划</el-option>
                            </el-select>
                        </div>
                    </div>

                    <!-- 日计划选项 -->
                    <div v-if="currentTask.type === 'daily'" class="form-group">
                        <label for="dailyType" class="form-label">日计划类型</label>
                        <el-select id="dailyType" v-model="currentTask.dailyType">
                            <el-option value="specific" label="特定日期">特定日期</el-option>
                            <el-option value="everyday" label="每天">每天</el-option>
                            <el-option value="dateRange" label="特定范围">特定范围</el-option>
                        </el-select>
                    </div>

                    <!-- 特定范围日期选择 -->
                    <div v-if="currentTask.type === 'daily' && currentTask.dailyType === 'dateRange'"
                        class="form-group">
                        <label class="form-label">日期范围</label>
                        <el-date-picker v-model="taskDateRange" type="daterange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%"
                            value-format="YYYY-MM-DD" />
                    </div>

                    <!-- 特定日期选择 -->
                    <div v-if="currentTask.type === 'daily' && currentTask.dailyType === 'specific'" class="form-group">
                        <label for="taskDate" class="form-label">日期</label>
                        <el-date-picker id="taskDate" v-model="currentTask.date" type="date" placeholder="选择日期"
                            style="width: 100%" />
                    </div>

                    <!-- 周计划选项 -->
                    <div v-if="currentTask.type === 'weekly'" class="form-group">
                        <label for="weeklyType" class="form-label">周计划类型</label>
                        <el-select id="weeklyType" v-model="currentTask.weeklyType">
                            <el-option value="everyweek" label="每周">每周</el-option>
                            <el-option value="specific" label="特定周">特定周</el-option>
                        </el-select>
                    </div>

                    <!-- 特定周选择 -->
                    <div v-if="currentTask.type === 'weekly' && currentTask.weeklyType === 'specific'"
                        class="form-group">
                        <label for="weekSelect" class="form-label">选择周</label>
                        <el-select id="weekSelect" v-model="currentTask.selectedWeek">
                            <el-option v-for="week in availableWeeks" :key="week.value" :value="week.value">
                                {{ week.label }}
                            </el-option>
                        </el-select>
                    </div>
                    <div class="form-row">
                        <div class="form-group half">
                            <label for="taskTargetCount" class="form-label">目标次数</label>
                            <el-input-number id="taskTargetCount" v-model="currentTask.targetCount" placeholder="输入目标次数..."
                                :min="1" style="width: 100%" />
                        </div>
                        <div class="form-group half">
                            <label class="form-label">时间限制</label>
                            <el-time-picker v-model="timeRange" type="time"
                                placeholder="选择时间" style="width: 100%" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="taskDescription" class="form-label">计划描述<span class="required">*</span></label>
                        <el-input id="taskDescription" v-model="currentTask.description" type="textarea"
                            placeholder="输入计划描述..." :rows="3" />
                    </div>
                    <div class="form-group">
                        <label for="taskPoints" class="form-label">奖励积分<span class="required">*</span></label>
                        <el-input-number id="taskPoints" v-model="currentTask.points" placeholder="输入积分..." :min="0" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">计划图标</label>
                        <div class="icon-input-group">
                            <el-input v-model="currentTask.icon" placeholder="输入图标（例如：📝）..." />
                            <el-button type="primary" @click="openIconSelector('task')">
                                <span class="btn-icon">🎨</span>
                                <span>选择图标</span>
                            </el-button>
                        </div>
                    </div>
                    <el-button type="primary" @click="saveTask" style="width: 100%">
                        <span class="btn-icon">💾</span>
                        <span>保存</span>
                    </el-button>
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
                        <input type="number" id="rewardCost" v-model.number="currentReward.points"
                            placeholder="输入所需积分..." class="form-input">
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
                        <button class="btn delete-confirm-btn" @click="() => { confirmAction(); closeConfirmModal(); }">
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
                        <input type="number" id="behaviorTargetCount" v-model.number="currentBehavior.targetCount"
                            placeholder="输入目标次数..." class="form-input" min="1">
                    </div>
                    <div class="form-group">
                        <label for="behaviorPoints" class="form-label">积分</label>
                        <input type="number" id="behaviorPoints" v-model.number="currentBehavior.points"
                            placeholder="输入积分..." class="form-input">
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

        <!-- 添加/编辑抽奖物品弹窗 -->
        <div v-if="showLotteryItemModal" class="modal-overlay" @click="closeLotteryItemModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2 class="modal-title">{{ isEditingLotteryItem ? '✏️ 编辑抽奖物品' : '➕ 添加抽奖物品' }}</h2>
                    <button class="close-btn" @click="closeLotteryItemModal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="lotteryItemName" class="form-label">物品名称</label>
                        <input type="text" id="lotteryItemName" v-model="currentLotteryItem.name"
                            placeholder="输入物品名称..." class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="lotteryItemDescription" class="form-label">物品描述</label>
                        <textarea id="lotteryItemDescription" v-model="currentLotteryItem.description"
                            placeholder="输入物品描述..." class="form-textarea" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="lotteryItemRarity" class="form-label">稀有度</label>
                        <select id="lotteryItemRarity" v-model="currentLotteryItem.rarity" class="form-input">
                            <option value="common">普通</option>
                            <option value="rare">稀有</option>
                            <option value="epic">史诗</option>
                            <option value="legendary">传说</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="lotteryItemProbability" class="form-label">概率 (%)</label>
                        <input type="number" id="lotteryItemProbability" v-model.number="currentLotteryItem.probability"
                            placeholder="输入概率..." class="form-input" min="1" max="100">
                    </div>
                    <div class="form-group">
                        <label for="lotteryItemEffect" class="form-label">效果</label>
                        <input type="text" id="lotteryItemEffect" v-model="currentLotteryItem.effect"
                            placeholder="输入效果（例如：+100 积分）..." class="form-input">
                    </div>
                    <button class="btn save-btn" @click="saveLotteryItem">
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
                        <button v-for="icon in availableIcons" :key="icon" class="icon-item" @click="selectIcon(icon)">
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

        <!-- 便捷设置抽屉 -->
        <div v-if="showQuickSetupDrawer" class="drawer-overlay" @click="closeQuickSetupDrawer">
            <div class="drawer-content" @click.stop>
                <div class="drawer-header">
                    <h2 class="drawer-title">⚡ 便捷设置</h2>
                    <button class="close-btn" @click="closeQuickSetupDrawer">✕</button>
                </div>
                <div class="drawer-body">
                    <!-- 标签页 -->
                    <div class="drawer-tabs">
                        <button class="drawer-tab-btn" :class="{ active: quickSetupTab === 'single' }"
                            @click="quickSetupTab = 'single'">
                            单日设置
                        </button>
                        <button class="drawer-tab-btn" :class="{ active: quickSetupTab === 'batch' }"
                            @click="quickSetupTab = 'batch'">
                            批量设置
                        </button>
                        <button class="drawer-tab-btn" :class="{ active: quickSetupTab === 'templates' }"
                            @click="quickSetupTab = 'templates'">
                            模板管理
                        </button>
                    </div>

                    <!-- 单日设置 -->
                    <div v-if="quickSetupTab === 'single'" class="tab-content">
                        <div class="settings-section">
                            <div class="form-group">
                                <label class="form-label">日期</label>
                                <el-date-picker
                                    v-model="quickSetupDate"
                                    type="date"
                                    placeholder="选择日期"
                                    style="width: 100%"
                                />
                            </div>
                        </div>
                        <div class="filter-toggle" @click="toggleSingleFilters">
                            <span>筛选条件</span>
                            <span class="toggle-icon">{{ showSingleFilters ? '▲' : '▼' }}</span>
                        </div>
                        <div v-if="showSingleFilters" class="filter-section">
                            <div class="filter-row">
                                <div class="form-group">
                                    <label class="form-label">科目筛选</label>
                                    <el-select v-model="subjectFilter" placeholder="选择科目" style="width: 100%">
                                        <el-option value="" label="全部科目"></el-option>
                                        <el-option value="chinese" label="语文"></el-option>
                                        <el-option value="math" label="数学"></el-option>
                                        <el-option value="english" label="英语"></el-option>
                                        <el-option value="general" label="全科"></el-option>
                                    </el-select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">名称筛选</label>
                                    <el-input v-model="nameFilter" placeholder="输入计划名称..." style="width: 100%"></el-input>
                                </div>
                            </div>
                            <div class="filter-row">
                                <div class="form-group">
                                    <label class="form-label">描述筛选</label>
                                    <el-input v-model="descriptionFilter" placeholder="输入计划描述..." style="width: 100%"></el-input>
                                </div>
                            </div>
                        </div>
                        <div class="plans-list-container">
                            <div class="plans-list">
                                <el-card v-for="plan in filteredQuickSetupPlans" :key="plan.id" class="plan-card" @click="() => togglePlanForDate(plan.id, quickSetupDate || '', !isPlanSelectedForDate(plan.id, quickSetupDate || ''))" style="cursor: pointer;">
                                    <template #header>
                                        <div class="plan-card-header">
                                            <el-checkbox :checked="isPlanSelectedForDate(plan.id, quickSetupDate || '')" @change="(val: boolean) => togglePlanForDate(plan.id, quickSetupDate || '', val)" @click.stop></el-checkbox>
                                            <span class="plan-name">{{ plan.subjectName }}</span>
                                            <span class="plan-points">{{ plan.points }} 积分</span>
                                        </div>
                                    </template>
                                    <div class="plan-card-body">
                                        <div class="plan-meta">
                                            <span class="plan-subject">{{ getPlanNameBySubject(plan.subject) }}</span>
                                            <span class="plan-target">{{ plan.targetCount }} 次</span>
                                        </div>
                                        <div class="plan-description">{{ plan.description }}</div>
                                        <div v-if="plan.timeRange" class="plan-time">{{ plan.timeRange }}</div>
                                    </div>
                                </el-card>
                                <div v-if="filteredQuickSetupPlans.length === 0" class="no-plans-hint">暂无模板，请先在模板管理中添加</div>
                            </div>
                        </div>
                    </div>

                    <!-- 批量设置 -->
                    <div v-if="quickSetupTab === 'batch'" class="tab-content">
                        <div class="settings-section">
                            <div class="filter-row">
                                <div class="form-group">
                                    <label class="form-label">开始日期</label>
                                    <el-date-picker
                                        v-model="batchStartDate"
                                        type="date"
                                        placeholder="选择开始日期"
                                        style="width: 100%"
                                    />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">结束日期</label>
                                    <el-date-picker
                                        v-model="batchEndDate"
                                        type="date"
                                        placeholder="选择结束日期"
                                        style="width: 100%"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="filter-toggle" @click="toggleBatchFilters">
                            <span>筛选条件</span>
                            <span class="toggle-icon">{{ showBatchFilters ? '▲' : '▼' }}</span>
                        </div>
                        <div v-if="showBatchFilters" class="filter-section">
                            <div class="filter-row">
                                <div class="form-group">
                                    <label class="form-label">名称筛选</label>
                                    <el-input v-model="batchNameFilter" placeholder="输入计划名称..." style="width: 100%"></el-input>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">描述筛选</label>
                                    <el-input v-model="batchDescriptionFilter" placeholder="输入计划描述..." style="width: 100%"></el-input>
                                </div>
                            </div>
                            <div class="filter-row">
                                <div class="form-group">
                                    <label class="form-label">科目筛选</label>
                                    <el-select v-model="batchSubjectFilter" placeholder="选择科目" style="width: 100%">
                                        <el-option value="" label="全部科目"></el-option>
                                        <el-option value="chinese" label="语文"></el-option>
                                        <el-option value="math" label="数学"></el-option>
                                        <el-option value="english" label="英语"></el-option>
                                        <el-option value="general" label="全科"></el-option>
                                    </el-select>
                                </div>
                            </div>
                        </div>
                        <div class="plans-list-container">
                            <div class="plans-list">
                                <el-card v-for="plan in filteredBatchQuickSetupPlans" :key="plan.id" class="plan-card" @click="toggleBatchPlanSelection(plan.id)" style="cursor: pointer;">
                                    <template #header>
                                        <div class="plan-card-header">
                                            <el-checkbox v-model="selectedBatchPlans" :label="plan.id"></el-checkbox>
                                            <span class="plan-name">{{ plan.subjectName }}</span>
                                            <span class="plan-points">{{ plan.points }} 积分</span>
                                        </div>
                                    </template>
                                    <div class="plan-card-body">
                                        <div class="plan-meta">
                                            <span class="plan-subject">{{ getPlanNameBySubject(plan.subject) }}</span>
                                            <span class="plan-target">{{ plan.targetCount }} 次</span>
                                        </div>
                                        <div class="plan-description">{{ plan.description }}</div>
                                        <div v-if="plan.timeRange" class="plan-time">{{ plan.timeRange }}</div>
                                    </div>
                                </el-card>
                                <div v-if="filteredBatchQuickSetupPlans.length === 0" class="no-plans-hint">暂无模板，请先在模板管理中添加</div>
                            </div>
                        </div>
                        <button class="btn apply-btn" @click="applyBatchQuickSetup">
                            <span class="btn-icon">✅</span>
                            <span>批量应用</span>
                        </button>
                    </div>

                    <!-- 模板管理 -->
                    <div v-if="quickSetupTab === 'templates'" class="tab-content">
                        <el-button type="primary" @click="showAddTemplateModal" class="add-template-btn">
                            <span class="btn-icon">➕</span>
                            <span>添加模板</span>
                        </el-button>
                        <div class="templates-list">
                            <div v-for="template in store.quickSetupTemplates" :key="template.id" class="template-card">
                                <div class="template-card-header">
                                    <span class="template-name">{{ template.subjectName }}</span>
                                    <span class="template-points">{{ template.points }} 积分</span>
                                </div>
                                <div class="template-card-body">
                                    <div class="template-meta">
                                        <span class="template-subject">{{ getPlanNameBySubject(template.subject) }}</span>
                                        <span class="template-target">{{ template.targetCount }} 次</span>
                                    </div>
                                    <div class="template-description">{{ template.description }}</div>
                                    <div v-if="template.timeRange" class="template-time">{{ template.timeRange }}</div>
                                    <div class="template-actions">
                                        <el-button type="primary" size="small" @click="editTemplate(template)">
                                            <span class="btn-icon">✏️</span>
                                            <span>编辑</span>
                                        </el-button>
                                        <el-button type="danger" size="small" @click="confirmDeleteTemplate(template)">
                                            <span class="btn-icon">🗑️</span>
                                            <span>删除</span>
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                            <div v-if="store.quickSetupTemplates.length === 0" class="no-plans-hint">暂无模板，请点击添加模板按钮创建</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 添加/编辑模板弹窗 -->
        <div v-if="showTemplateModal" class="modal-overlay" @click="closeTemplateModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2 class="modal-title">{{ isEditingTemplate ? '✏️ 编辑模板' : '➕ 添加模板' }}</h2>
                    <button class="close-btn" @click="closeTemplateModal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="templateName" class="form-label">模板名称</label>
                        <el-input id="templateName" v-model="currentTemplate.subjectName" placeholder="输入模板名称..." style="width: 100%"></el-input>
                    </div>
                    <div class="form-group">
                        <label for="templateDescription" class="form-label">模板描述</label>
                        <el-input id="templateDescription" v-model="currentTemplate.description" type="textarea" placeholder="输入模板描述..." :rows="3" style="width: 100%"></el-input>
                    </div>
                    <div class="form-group">
                        <label for="templateSubject" class="form-label">学科</label>
                        <el-select id="templateSubject" v-model="currentTemplate.subject" placeholder="选择学科" style="width: 100%">
                            <el-option value="chinese" label="语文"></el-option>
                            <el-option value="math" label="数学"></el-option>
                            <el-option value="english" label="英语"></el-option>
                            <el-option value="general" label="全科"></el-option>
                        </el-select>
                    </div>
                    <div class="form-group">
                        <label for="templateTargetCount" class="form-label">目标次数</label>
                        <el-input-number id="templateTargetCount" v-model="currentTemplate.targetCount" placeholder="输入目标次数..." :min="1" style="width: 100%"></el-input-number>
                    </div>
                    <div class="form-group">
                        <label class="form-label">时间限制</label>
                        <el-time-picker v-model="templateTimeRange" type="time" placeholder="选择时间" style="width: 100%"></el-time-picker>
                    </div>
                    <div class="form-group">
                        <label for="templatePoints" class="form-label">奖励积分</label>
                        <el-input-number id="templatePoints" v-model="currentTemplate.points" placeholder="输入积分..." :min="0" style="width: 100%"></el-input-number>
                    </div>
                    <div class="form-group">
                        <label class="form-label">模板图标</label>
                        <div class="icon-input-group">
                            <el-input v-model="currentTemplate.icon" placeholder="输入图标（例如：📝）..." style="flex: 1"></el-input>
                            <el-button type="primary" @click="openIconSelector('template')">
                                <span class="btn-icon">🎨</span>
                                <span>选择图标</span>
                            </el-button>
                        </div>
                    </div>
                    <el-button type="primary" @click="saveTemplate" style="width: 100%">
                        <span class="btn-icon">💾</span>
                        <span>保存</span>
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore, ItemRarity } from '@/stores';
import PasswordModal from './components/PasswordModal.vue';
import DashboardTab from './components/DashboardTab.vue';
import PlansTab from './components/PlansTab.vue';
import BehaviorsTab from './components/BehaviorsTab.vue';
import RewardsTab from './components/RewardsTab.vue';
import LotteryTab from './components/LotteryTab.vue';
import SettingsTab from './components/SettingsTab.vue';

const router = useRouter();
const store = useUserStore();

// 认证相关
const isAuthenticated = ref(false);
const adminPassword = ref('');
const authError = ref('');

// 检查认证状态
const checkAuthStatus = () => {
  const authData = localStorage.getItem('adminAuth');
  if (authData) {
    try {
      const { timestamp } = JSON.parse(authData);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      if (now - timestamp < thirtyMinutes) {
        isAuthenticated.value = true;
      } else {
        localStorage.removeItem('adminAuth');
      }
    } catch (error) {
      localStorage.removeItem('adminAuth');
    }
  }
};

// 控制滚动条
const disableScroll = () => {
  document.documentElement.classList.add('no-scroll');
};

const enableScroll = () => {
  document.documentElement.classList.remove('no-scroll');
};

// 标签管理
const activeTab = ref('dashboard');
const tabs = [
    { id: 'dashboard', label: '仪表板', icon: '📊' },
    { id: 'plans', label: '计划管理', icon: '📝' },
    { id: 'behaviors', label: '行为管理', icon: '🎯' },
    { id: 'rewards', label: '兑换项管理', icon: '🎁' },
    { id: 'lottery', label: '抽奖管理', icon: '🎰' },
    { id: 'settings', label: '系统设置', icon: '⚙️' }
];

// 计划相关
const showTaskModal = ref(false);
const isEditingTask = ref(false);
const currentTask = ref({
    id: '',
    subjectName: '',
    subject: 'chinese',
    type: 'daily' as 'daily' | 'weekly',
    dailyType: 'specific' as 'specific' | 'dateRange' | 'everyday',
    weeklyType: 'everyweek' as 'everyweek' | 'specific',
    date: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    selectedWeek: '',
    frequency: 'once' as const,
    targetCount: 1,
    description: '',
    points: 10,
    icon: '📝',
    completed: false,
    completedCount: 0,
    timeRange: '',
    completionLevel: false
});
const timeRange = ref<string | Date>('');
const taskDateRange = ref<string[]>([]);

// 行为相关
const showBehaviorModal = ref(false);
const isEditingBehavior = ref(false);
const currentBehavior = ref({
    id: '',
    name: '',
    description: '',
    icon: '🎯',
    frequency: 'daily',
    targetCount: 1,
    points: 10,
    type: 'positive'
});

// 兑换项相关
const showRewardModal = ref(false);
const isEditingReward = ref(false);
const currentReward = ref({
    id: '',
    name: '',
    description: '',
    icon: '🎁',
    points: 100
});

// 抽奖相关
const showLotteryItemModal = ref(false);
const isEditingLotteryItem = ref(false);
const currentLotteryItem = ref({
    id: '',
    name: '',
    description: '',
    rarity: 0, // ItemRarity.Common
    probability: 50,
    effect: '+10 学习积分',
    icon: '🎁'
});

// 图标选择器
const showIconSelector = ref(false);
const selectedIconType = ref('');
const availableIcons = [
    '📝', '🎯', '🎨', '📚', '🔢', '🗣️', '🎵', '⚽', '🎮', '🧩',
    '🌟', '🔥', '💎', '💡', '🚀', '⚡', '🌈', '💪', '🎯', '🎰'
];

// 通知
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('success');

// 确认弹窗
const showConfirmModal = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(() => { });

// 便捷设置
const showQuickSetupDrawer = ref(false);
const quickSetupTab = ref('single');
const quickSetupDate = ref(new Date().toISOString().split('T')[0]);
const nameFilter = ref('');
const descriptionFilter = ref('');
const subjectFilter = ref('');
const selectedPlans = ref<string[]>([]);
const showSingleFilters = ref(false);

// 存储每个日期的计划选择状态
// 从本地存储加载日期计划选择状态
const loadDatePlanSelections = (): { [date: string]: string[] } => {
  try {
    const stored = localStorage.getItem('datePlanSelections');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('加载日期计划选择状态失败:', error);
    return {};
  }
};

// 保存日期计划选择状态到本地存储
const saveDatePlanSelections = (selections: { [date: string]: string[] }) => {
  try {
    localStorage.setItem('datePlanSelections', JSON.stringify(selections));
  } catch (error) {
    console.error('保存日期计划选择状态失败:', error);
  }
};

const datePlanSelections = ref<{ [date: string]: string[] }>(loadDatePlanSelections());

const toggleSingleFilters = () => {
    showSingleFilters.value = !showSingleFilters.value;
};

// 批量设置
const batchStartDate = ref(new Date().toISOString().split('T')[0]);
const batchEndDate = ref(new Date().toISOString().split('T')[0]);
const batchNameFilter = ref('');
const batchDescriptionFilter = ref('');
const batchSubjectFilter = ref('');
const selectedBatchPlans = ref<string[]>([]);
const showBatchFilters = ref(false);

const toggleBatchFilters = () => {
    showBatchFilters.value = !showBatchFilters.value;
};

// 模板管理
const showTemplateModal = ref(false);
const isEditingTemplate = ref(false);
const currentTemplate = ref({
    id: '',
    name: '',
    subjectName: '',
    description: '',
    subject: '',
    points: 10,
    targetCount: 1,
    timeRange: '',
    icon: ''
});
const templateTimeRange = ref<string | Date>('');

// 计算属性
const filteredQuickSetupPlans = computed(() => {
    return store.quickSetupTemplates.filter((plan: any) => {
        const matchesName = plan.subjectName.toLowerCase().includes(nameFilter.value.toLowerCase());
        const matchesDescription = plan.description.toLowerCase().includes(descriptionFilter.value.toLowerCase());
        const matchesSubject = subjectFilter.value ? plan.subject === subjectFilter.value : true;
        return matchesName && matchesDescription && matchesSubject;
    });
});

const filteredBatchQuickSetupPlans = computed(() => {
    return store.quickSetupTemplates.filter((plan: any) => {
        const matchesName = plan.subjectName.toLowerCase().includes(batchNameFilter.value.toLowerCase());
        const matchesDescription = plan.description.toLowerCase().includes(batchDescriptionFilter.value.toLowerCase());
        const matchesSubject = batchSubjectFilter.value ? plan.subject === batchSubjectFilter.value : true;
        return matchesName && matchesDescription && matchesSubject;
    });
});

// 生成可用周选项
const availableWeeks = computed(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const startDate = new Date(now);
        startDate.setDate(now.getDate() + i * 7);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        weeks.push({
            value: `${startDate.getFullYear()}-W${Math.ceil(startDate.getDate() / 7)}`,
            label: `${startDate.getMonth() + 1}月${startDate.getDate()}日 - ${endDate.getMonth() + 1}月${endDate.getDate()}日`
        });
    }
    return weeks;
});

// 方法
const authenticate = () => {
    isAuthenticated.value = true;
    authError.value = '';
    // 存储认证信息，有效期30分钟
    localStorage.setItem('adminAuth', JSON.stringify({ timestamp: Date.now() }));
    showNotificationMessage('认证成功！', 'success');
};

const closePasswordModal = () => {
    router.back();
};

const goBack = () => {
    router.push('/plans');
};

const logout = () => {
    isAuthenticated.value = false;
    adminPassword.value = '';
    router.push('/');
};

const showAddTaskModal = () => {
    isEditingTask.value = false;
    currentTask.value = {
        id: Date.now().toString(),
        subjectName: '',
        subject: 'chinese' as const,
        type: 'daily' as const,
        dailyType: 'specific' as const,
        weeklyType: 'everyweek' as const,
        date: new Date().toISOString().split('T')[0],
        startDate: '',
        endDate: '',
        selectedWeek: '',
        frequency: 'once' as const,
        targetCount: 1,
        description: '',
        points: 10,
        icon: '📝',
        completed: false,
        completedCount: 0,
        timeRange: '',
        completionLevel: false
    };
    timeRange.value = '';
    taskDateRange.value = [];
    showTaskModal.value = true;
    disableScroll();
};

const editTask = (task: any) => {
    isEditingTask.value = true;
    let timeRangeValue = '';
    
    if (task.timeRange) {
        if (typeof task.timeRange === 'string') {
            timeRangeValue = task.timeRange;
        } else if (task.timeRange instanceof Date) {
            // 将Date对象转换为HH:MM:SS格式的字符串
            const hours = String(task.timeRange.getHours()).padStart(2, '0');
            const minutes = String(task.timeRange.getMinutes()).padStart(2, '0');
            const seconds = String(task.timeRange.getSeconds()).padStart(2, '0');
            timeRangeValue = `${hours}:${minutes}:${seconds}`;
        }
    }
    
    currentTask.value = {
        ...task,
        frequency: task.frequency || 'once',
        completionLevel: task.completionLevel || false,
        timeRange: timeRangeValue,
        date: typeof task.date === 'object' ? task.date.toISOString().split('T')[0] : (task.date || new Date().toISOString().split('T')[0])
    };
    
    // 直接设置timeRange
    timeRange.value = timeRangeValue;
    
    // 恢复日期范围值
    if (task.dailyType === 'dateRange' && task.startDate && task.endDate) {
        taskDateRange.value = [task.startDate, task.endDate];
    } else {
        taskDateRange.value = [];
    }
    
    showTaskModal.value = true;
    disableScroll();
};

const saveTask = () => {
    if (!currentTask.value.subjectName || !currentTask.value.description) {
        showNotificationMessage('请填写计划名称和描述', 'error');
        return;
    }

    // 处理时间范围
    if (timeRange.value instanceof Date) {
        // 将Date对象转换为HH:MM:SS格式的字符串
        const hours = String(timeRange.value.getHours()).padStart(2, '0');
        const minutes = String(timeRange.value.getMinutes()).padStart(2, '0');
        const seconds = String(timeRange.value.getSeconds()).padStart(2, '0');
        currentTask.value.timeRange = `${hours}:${minutes}:${seconds}`;
    } else {
        currentTask.value.timeRange = timeRange.value || '';
    }

    // 处理日期范围
    if (currentTask.value.dailyType === 'dateRange' && taskDateRange.value.length === 2) {
        currentTask.value.startDate = taskDateRange.value[0] || '';
        currentTask.value.endDate = taskDateRange.value[1] || '';
    }

    console.log('保存计划数据:', currentTask.value);
    
    if (isEditingTask.value) {
        store.updatePlan({
            ...currentTask.value,
            date: (currentTask.value.date || new Date().toISOString().split('T')[0]) as string,
            subject: currentTask.value.subject as 'chinese' | 'math' | 'english' | 'general'
        });
        showNotificationMessage('计划更新成功', 'success');
    } else {
        // 如果是日期范围类型，为范围内的每一天创建计划
        if (currentTask.value.dailyType === 'dateRange' && taskDateRange.value.length === 2 && taskDateRange.value[0] && taskDateRange.value[1]) {
            // 直接从日期范围选择器获取YYYY-MM-DD格式的日期字符串
            const startDateStr = taskDateRange.value[0];
            const endDateStr = taskDateRange.value[1];
            
            console.log('开始日期:', startDateStr);
            console.log('结束日期:', endDateStr);
            
            // 解析为本地日期对象
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            
            // 确保日期对象有效
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                showNotificationMessage('日期格式错误，请重新选择日期范围', 'error');
                return;
            }
            
            // 计算日期范围内的天数
            const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            console.log('计算的天数差:', daysDiff);
            
            let count = 0;
            
            // 基于本地日期创建计划
            for (let i = 0; i < daysDiff; i++) {
                const current = new Date(startDate);
                current.setDate(startDate.getDate() + i);
                // 手动格式化为YYYY-MM-DD格式，避免时区问题
                const currentDate = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
                console.log('创建计划日期:', currentDate);
                
                // 确保date属性是string类型
                const taskData: any = {
                    ...currentTask.value,
                    id: `${currentTask.value.subject}-${currentDate}-${Date.now()}-${count}`,
                    date: currentDate,
                    startDate: startDateStr,
                    endDate: endDateStr,
                    subject: currentTask.value.subject as 'chinese' | 'math' | 'english' | 'general'
                };
                // 确保date属性是string类型
                taskData.date = currentDate;
                store.addPlan(taskData);
                count++;
            }
            console.log('日期范围计划创建完成，共创建:', count, '个计划');
            showNotificationMessage(`成功添加 ${count} 个计划`, 'success');
        } else {
            // 普通计划
            const taskData = {
                ...currentTask.value,
                date: (currentTask.value.date || new Date().toISOString().split('T')[0]) as string,
                subject: currentTask.value.subject as 'chinese' | 'math' | 'english' | 'general'
            };
            store.addPlan(taskData);
            showNotificationMessage('计划添加成功', 'success');
        }
    }
    closeTaskModal();
};

const closeTaskModal = () => {
    showTaskModal.value = false;
    enableScroll();
};

const showAddBehaviorModal = () => {
    isEditingBehavior.value = false;
    currentBehavior.value = {
        id: Date.now().toString(),
        name: '',
        description: '',
        icon: '🎯',
        frequency: 'daily',
        targetCount: 1,
        points: 10,
        type: 'positive'
    };
    showBehaviorModal.value = true;
    disableScroll();
};

const editBehavior = (behavior: any) => {
    isEditingBehavior.value = true;
    currentBehavior.value = { ...behavior };
    showBehaviorModal.value = true;
    disableScroll();
};

const saveBehavior = () => {
    if (!currentBehavior.value.name || !currentBehavior.value.description) {
        showNotificationMessage('请填写行为名称和描述', 'error');
        return;
    }

    if (isEditingBehavior.value) {
        store.updateBehavior(currentBehavior.value.id, {
            name: currentBehavior.value.name,
            description: currentBehavior.value.description,
            icon: currentBehavior.value.icon,
            frequency: currentBehavior.value.frequency as 'daily' | 'weekly' | 'custom',
            targetCount: currentBehavior.value.targetCount,
            points: currentBehavior.value.points,
            type: currentBehavior.value.type as 'positive' | 'negative'
        });
        showNotificationMessage('行为更新成功', 'success');
    } else {
        store.addBehavior({
            name: currentBehavior.value.name,
            description: currentBehavior.value.description,
            icon: currentBehavior.value.icon,
            frequency: currentBehavior.value.frequency as 'daily' | 'weekly' | 'custom',
            targetCount: currentBehavior.value.targetCount,
            points: currentBehavior.value.points,
            type: currentBehavior.value.type as 'positive' | 'negative'
        });
        showNotificationMessage('行为添加成功', 'success');
    }
    closeBehaviorModal();
};

const closeBehaviorModal = () => {
    showBehaviorModal.value = false;
    enableScroll();
};

const showAddRewardModal = () => {
    isEditingReward.value = false;
    currentReward.value = {
        id: Date.now().toString(),
        name: '',
        description: '',
        points: 100,
        icon: '🎁'
    };
    showRewardModal.value = true;
    disableScroll();
};

const editReward = (reward: any) => {
    isEditingReward.value = true;
    currentReward.value = { ...reward, points: reward.points || reward.cost || 100 };
    showRewardModal.value = true;
    disableScroll();
};

const saveReward = () => {
    if (!currentReward.value.name || !currentReward.value.description) {
        showNotificationMessage('请填写兑换项名称和描述', 'error');
        return;
    }

    if (isEditingReward.value) {
        store.updateExchangeItem(currentReward.value.id, currentReward.value.name, currentReward.value.points, currentReward.value.description);
        showNotificationMessage('兑换项更新成功', 'success');
    } else {
        store.addExchangeItem(currentReward.value.name, currentReward.value.points, currentReward.value.description);
        showNotificationMessage('兑换项添加成功', 'success');
    }
    closeRewardModal();
};

const closeRewardModal = () => {
    showRewardModal.value = false;
    enableScroll();
};

const showAddLotteryItemModal = () => {
    isEditingLotteryItem.value = false;
    currentLotteryItem.value = {
        id: Date.now().toString(),
        name: '',
        description: '',
        rarity: 0, // ItemRarity.Common
        probability: 50,
        effect: '',
        icon: '🎁'
    };
    showLotteryItemModal.value = true;
    disableScroll();
};

const editLotteryItem = (item: any) => {
    isEditingLotteryItem.value = true;
    currentLotteryItem.value = {
        ...item,
        rarity: typeof item.rarity === 'string' ? 0 : item.rarity
    };
    showLotteryItemModal.value = true;
    disableScroll();
};

const saveLotteryItem = () => {
    if (!currentLotteryItem.value.name || !currentLotteryItem.value.description) {
        showNotificationMessage('请填写物品名称和描述', 'error');
        return;
    }

    if (isEditingLotteryItem.value) {
        store.updateLotteryItem(currentLotteryItem.value.id, currentLotteryItem.value.name, currentLotteryItem.value.description, ItemRarity.Common, currentLotteryItem.value.probability, currentLotteryItem.value.effect);
        showNotificationMessage('抽奖物品更新成功', 'success');
    } else {
        store.addLotteryItem(currentLotteryItem.value.name, currentLotteryItem.value.description, ItemRarity.Common, currentLotteryItem.value.probability, currentLotteryItem.value.effect);
        showNotificationMessage('抽奖物品添加成功', 'success');
    }
    closeLotteryItemModal();
};

const closeLotteryItemModal = () => {
    showLotteryItemModal.value = false;
    enableScroll();
};

// 检查计划在指定日期是否被选中
function isPlanSelectedForDate(planId: string, date: string): boolean {
    if (!date) return false;
    if (!datePlanSelections.value[date]) return false;
    return datePlanSelections.value[date].includes(planId);
}

// 切换计划在指定日期的选中状态
function togglePlanForDate(planId: string, date: string, checked: boolean) {
    if (!date) return;
    
    if (!datePlanSelections.value[date]) {
        // 初始化日期的选择状态
        const newSelections = { ...datePlanSelections.value };
        newSelections[date] = [];
        datePlanSelections.value = newSelections;
    }
    
    // 确保datePlanSelections.value[date]存在
    if (!datePlanSelections.value[date]) return;
    
    const index = datePlanSelections.value[date].indexOf(planId);
    if (checked && index === -1) {
        // 创建一个新的对象来触发响应式更新
        const newSelections = { ...datePlanSelections.value };
        newSelections[date] = [...(newSelections[date] || []), planId];
        datePlanSelections.value = newSelections;
        
        // 即时应用设置 - 添加计划
        const template = store.quickSetupTemplates.find((t: any) => t.id === planId);
        if (template) {
            const newPlan = {
                id: `${template.subject}-${date}-${Date.now()}`,
                subject: template.subject,
                subjectName: template.subjectName,
                date: date,
                type: 'daily' as const,
                dailyType: 'specific' as const,
                weeklyType: 'everyweek' as const,
                selectedWeek: '',
                frequency: 'once' as const,
                targetCount: template.targetCount || 1,
                completedCount: 0,
                timeRange: template.timeRange || '',
                completionLevel: false,
                points: template.points || 0,
                description: template.description || '',
                icon: template.icon || ''
            };
            store.addPlan(newPlan);
            showNotificationMessage('计划添加成功', 'success');
        }
    } else if (!checked && index > -1) {
        // 创建一个新的对象来触发响应式更新
        const newSelections = { ...datePlanSelections.value };
        newSelections[date] = (newSelections[date] || []).filter(id => id !== planId);
        datePlanSelections.value = newSelections;
        
        // 即时应用设置 - 移除计划
        const template = store.quickSetupTemplates.find((t: any) => t.id === planId);
        if (template) {
            // 只移除通过该模板添加的计划，通过检查计划的 subjectName 和 description 是否与模板匹配
            const plansToRemove = store.plans.filter((plan: any) => 
                plan.date === date && 
                plan.subject === template.subject &&
                plan.subjectName === template.subjectName &&
                plan.description === template.description
            );
            plansToRemove.forEach((plan: any) => {
                store.removePlan(plan.id);
            });
            showNotificationMessage('计划移除成功', 'success');
        }
    }
    
    // 保存到本地存储
    saveDatePlanSelections(datePlanSelections.value);
}



const openIconSelector = (type: string) => {
    selectedIconType.value = type;
    showIconSelector.value = true;
    disableScroll();
};

const selectIcon = (icon: string) => {
    switch (selectedIconType.value) {
        case 'task':
            currentTask.value.icon = icon;
            break;
        case 'behavior':
            currentBehavior.value.icon = icon;
            break;
        case 'reward':
            currentReward.value.icon = icon;
            break;
        case 'template':
            currentTemplate.value.icon = icon;
            break;
    }
    closeIconSelector();
};

const closeIconSelector = () => {
    showIconSelector.value = false;
    enableScroll();
};

const showNotificationMessage = (message: string, type: 'success' | 'error' = 'success') => {
    notificationMessage.value = message;
    notificationType.value = type;
    showNotification.value = true;
    setTimeout(() => {
        closeNotification();
    }, 3000);
};

const closeNotification = () => {
    showNotification.value = false;
};

const confirmDeleteTask = (task: any) => {
    confirmMessage.value = `确定要删除计划 "${task.subjectName}" 吗？`;
    confirmAction.value = () => {
        store.removePlan(task.id);
        
        // 同步更新datePlanSelections，确保单日设置里的勾选状态与实际计划状态一致
        const date = task.date;
        if (date) {
            // 遍历所有模板，查找匹配的模板
            for (const template of store.quickSetupTemplates) {
                if (template.subject === task.subject &&
                    template.subjectName === task.subjectName &&
                    template.description === task.description) {
                    // 从datePlanSelections中移除该模板的勾选状态
                    if (datePlanSelections.value && datePlanSelections.value[date]) {
                        const index = datePlanSelections.value[date].indexOf(template.id);
                        if (index > -1) {
                            // 创建一个新的对象来触发响应式更新
                            const newSelections = { ...datePlanSelections.value };
                            newSelections[date] = (newSelections[date] || []).filter(id => id !== template.id);
                            datePlanSelections.value = newSelections;
                            // 保存到本地存储
                            saveDatePlanSelections(datePlanSelections.value);
                            break;
                        }
                    }
                }
            }
        }
        
        showNotificationMessage('计划删除成功', 'success');
        closeConfirmModal();
    };
    showConfirmModal.value = true;
};

const confirmDeleteBehavior = (behavior: any) => {
    confirmMessage.value = `确定要删除行为 "${behavior.name}" 吗？`;
    confirmAction.value = () => {
        store.removeBehavior(behavior.id);
        showNotificationMessage('行为删除成功', 'success');
        closeConfirmModal();
    };
    showConfirmModal.value = true;
};

const confirmDeleteReward = (reward: any) => {
    confirmMessage.value = `确定要删除兑换项 "${reward.name}" 吗？`;
    confirmAction.value = () => {
        store.removeExchangeItem(reward.id);
        showNotificationMessage('兑换项删除成功', 'success');
        closeConfirmModal();
    };
    showConfirmModal.value = true;
};

const confirmDeleteLotteryItem = (item: any) => {
    confirmMessage.value = `确定要删除抽奖物品 "${item.name}" 吗？`;
    confirmAction.value = () => {
        store.removeLotteryItem(item.id);
        showNotificationMessage('抽奖物品删除成功', 'success');
        closeConfirmModal();
    };
    showConfirmModal.value = true;
};

const closeConfirmModal = () => {
    showConfirmModal.value = false;
    enableScroll();
};

const openQuickSetupDrawer = () => {
    showQuickSetupDrawer.value = true;
    disableScroll();
};

const closeQuickSetupDrawer = () => {
    showQuickSetupDrawer.value = false;
    enableScroll();
};

const applyQuickSetup = () => {
    if (selectedPlans.value.length === 0) {
        showNotificationMessage('请选择至少一个计划', 'error');
        return;
    }

    const selectedTemplates = store.quickSetupTemplates.filter((template: any) => selectedPlans.value.includes(template.id));
    selectedTemplates.forEach((template: any) => {
        const taskData = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            subjectName: template.subjectName,
            subject: template.subject as 'chinese' | 'math' | 'english',
            type: (template.type || 'daily') as 'daily' | 'weekly',
            dailyType: (template.dailyType || 'specific') as 'specific' | 'dateRange' | 'everyday',
            weeklyType: (template.weeklyType || 'everyweek') as 'everyweek' | 'specific',
            selectedWeek: template.selectedWeek || '',
            date: (quickSetupDate.value || new Date().toISOString().split('T')[0]) as string,
            startDate: quickSetupDate.value || '',
            endDate: quickSetupDate.value || '',
            frequency: (template.frequency || 'once') as 'once' | 'daily' | 'weekly',
            targetCount: template.targetCount || 1,
            completedCount: 0,
            timeRange: Array.isArray(template.timeRange) ? template.timeRange.join('-') : (template.timeRange || ''),
            completionLevel: false,
            points: template.points || 0,
            description: template.description,
            icon: template.icon
        };
        store.addPlan(taskData);
    });

    showNotificationMessage(`成功添加 ${selectedPlans.value.length} 个计划`, 'success');
    selectedPlans.value = [];
};

// 切换批量计划选择状态
const toggleBatchPlanSelection = (planId: string) => {
    const index = selectedBatchPlans.value.indexOf(planId);
    if (index === -1) {
        selectedBatchPlans.value.push(planId);
    } else {
        selectedBatchPlans.value.splice(index, 1);
    }
};

const applyBatchQuickSetup = () => {
    if (selectedBatchPlans.value.length === 0) {
        showNotificationMessage('请选择至少一个计划', 'error');
        return;
    }

    if (!batchStartDate.value || !batchEndDate.value) {
        showNotificationMessage('请选择开始和结束日期', 'error');
        return;
    }

    if (batchStartDate.value && batchEndDate.value && new Date(batchStartDate.value) > new Date(batchEndDate.value)) {
        showNotificationMessage('开始日期不能晚于结束日期', 'error');
        return;
    }

    if (!batchStartDate.value || !batchEndDate.value) return;

    const startDate = new Date(batchStartDate.value);
    const endDate = new Date(batchEndDate.value);
    const selectedTemplates = store.quickSetupTemplates.filter((template: any) => selectedBatchPlans.value.includes(template.id));

    let count = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = d.toISOString().split('T')[0];
        selectedTemplates.forEach((template: any) => {
            const taskData = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + count,
                subjectName: template.subjectName,
                subject: template.subject as 'chinese' | 'math' | 'english',
                type: (template.type || 'daily') as 'daily' | 'weekly',
                dailyType: (template.dailyType || 'specific') as 'specific' | 'dateRange' | 'everyday',
                weeklyType: (template.weeklyType || 'everyweek') as 'everyweek' | 'specific',
                selectedWeek: template.selectedWeek || '',
                date: currentDate as string,
                startDate: currentDate,
                endDate: currentDate,
                frequency: (template.frequency || 'once') as 'once' | 'daily' | 'weekly',
                targetCount: template.targetCount || 1,
                completedCount: 0,
                timeRange: template.timeRange || '',
                completionLevel: false,
                points: template.points || 0,
                description: template.description,
                icon: template.icon
            };
            store.addPlan(taskData);
            count++;
        });
    }

    showNotificationMessage(`成功添加 ${count} 个计划`, 'success');
    selectedBatchPlans.value = [];
};

const showAddTemplateModal = () => {
    isEditingTemplate.value = false;
    currentTemplate.value = {
        id: Date.now().toString(),
        name: '',
        subjectName: '',
        description: '',
        subject: 'chinese',
        targetCount: 1,
        timeRange: '',
        points: 10,
        icon: '📝'
    };
    // 重置时间范围
    templateTimeRange.value = '';
    showTemplateModal.value = true;
    disableScroll();
};

const editTemplate = (template: any) => {
    isEditingTemplate.value = true;
    currentTemplate.value = {
        id: template.id,
        name: template.name || '',
        subjectName: template.subjectName || '',
        description: template.description || '',
        subject: template.subject || 'chinese',
        targetCount: template.targetCount || 1,
        timeRange: template.timeRange || '',
        points: template.points || 10,
        icon: template.icon || '📝'
    };
    // 处理时间范围
    if (template.timeRange) {
        // 将时间字符串转换为Date对象
        const timeParts = template.timeRange.split(':');
        if (timeParts.length === 3) {
            const date = new Date();
            date.setHours(parseInt(timeParts[0]));
            date.setMinutes(parseInt(timeParts[1]));
            date.setSeconds(parseInt(timeParts[2]));
            templateTimeRange.value = date;
        } else {
            templateTimeRange.value = '';
        }
    } else {
        templateTimeRange.value = '';
    }
    showTemplateModal.value = true;
    disableScroll();
};

const saveTemplate = () => {
    if (!currentTemplate.value.subjectName || !currentTemplate.value.description) {
        showNotificationMessage('请填写模板名称和描述', 'error');
        return;
    }

    // 处理时间范围
    if (templateTimeRange.value instanceof Date) {
        // 将Date对象转换为HH:MM:SS格式的字符串
        const hours = String(templateTimeRange.value.getHours()).padStart(2, '0');
        const minutes = String(templateTimeRange.value.getMinutes()).padStart(2, '0');
        const seconds = String(templateTimeRange.value.getSeconds()).padStart(2, '0');
        currentTemplate.value.timeRange = `${hours}:${minutes}:${seconds}`;
    } else {
        currentTemplate.value.timeRange = templateTimeRange.value || '';
    }

    if (isEditingTemplate.value) {
        store.updateQuickSetupTemplate(currentTemplate.value.id, {
            subjectName: currentTemplate.value.subjectName,
            description: currentTemplate.value.description,
            subject: currentTemplate.value.subject as 'chinese' | 'math' | 'english' | 'general',
            targetCount: currentTemplate.value.targetCount,
            timeRange: currentTemplate.value.timeRange,
            points: currentTemplate.value.points,
            icon: currentTemplate.value.icon
        });
        showNotificationMessage('模板更新成功', 'success');
    } else {
        const templateData = {
            id: `template-${Date.now()}`,
            subject: currentTemplate.value.subject as 'chinese' | 'math' | 'english' | 'general',
            subjectName: currentTemplate.value.subjectName,
            date: new Date().toISOString().split('T')[0] as string,
            type: 'daily' as 'daily' | 'weekly',
            dailyType: 'specific' as 'specific' | 'dateRange' | 'everyday',
            weeklyType: 'everyweek' as 'everyweek' | 'specific',
            selectedWeek: '',
            startDate: '',
            endDate: '',
            frequency: 'once' as 'once' | 'daily' | 'weekly',
            targetCount: currentTemplate.value.targetCount,
            completedCount: 0,
            timeRange: currentTemplate.value.timeRange,
            completionLevel: false,
            points: currentTemplate.value.points,
            description: currentTemplate.value.description,
            icon: currentTemplate.value.icon
        };
        store.addQuickSetupTemplate(templateData);
        showNotificationMessage('模板添加成功', 'success');
    }
    closeTemplateModal();
};

const closeTemplateModal = () => {
    showTemplateModal.value = false;
    enableScroll();
};

const confirmDeleteTemplate = (template: any) => {
    confirmMessage.value = `确定要删除模板 "${template.subjectName}" 吗？`;
    confirmAction.value = () => {
        store.removeQuickSetupTemplate(template.id);
        showNotificationMessage('模板删除成功', 'success');
        closeConfirmModal();
    };
    showConfirmModal.value = true;
};

// 处理子组件事件
const handleShowTaskModal = (task: any) => {
    if (task) {
        editTask(task);
    } else {
        showAddTaskModal();
    }
};

const handleShowBehaviorModal = (behavior: any) => {
    if (behavior) {
        editBehavior(behavior);
    } else {
        showAddBehaviorModal();
    }
};

const handleShowRewardModal = (reward: any) => {
    if (reward) {
        editReward(reward);
    } else {
        showAddRewardModal();
    }
};

const handleConfirm = (data: { message: string; action: () => void }) => {
    confirmMessage.value = data.message;
    confirmAction.value = data.action;
    showConfirmModal.value = true;
    disableScroll();
};

const getPlanIconBySubject = (subject: string) => {
    const iconMap: { [key: string]: string } = {
        chinese: '📚',
        math: '🔢',
        english: '🗣️'
    };
    return iconMap[subject] || '📝';
};

const getPlanNameBySubject = (subject: string) => {
    const nameMap: { [key: string]: string } = {
        chinese: '语文',
        math: '数学',
        english: '英语'
    };
    return nameMap[subject] || '其他';
};



const notificationIcon = computed(() => {
    return notificationType.value === 'success' ? '✅' : '❌';
});

// 生命周期
onMounted(() => {
  // 检查认证状态
  checkAuthStatus();
});
</script>

<style scoped>
/* 主容器 */
.admin-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #fff0f5 0%, #ffe6ed 100%);
    background-image:
        radial-gradient(#ffd6e0 1px, transparent 1px),
        radial-gradient(#ffd6e0 1px, transparent 1px);
    background-size: 30px 30px;
    background-position: 0 0, 15px 15px;
    padding: 20px;
    position: relative;
    overflow: hidden;
}



/* 装饰元素 */
.decorations {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

.heart,
.star,
.cloud,
.magic-wand {
    position: absolute;
    opacity: 0.3;
    animation: float 6s ease-in-out infinite;
}

.heart {
    color: #ff6b6b;
    font-size: 24px;
}

.star {
    color: #ffd93d;
    font-size: 20px;
}

.cloud {
    color: #f8f9fa;
    font-size: 32px;
}

.magic-wand {
    color: #9b59b6;
    font-size: 28px;
}

.heart-1 {
    top: 10%;
    left: 5%;
    animation-delay: 0s;
}

.heart-2 {
    top: 60%;
    right: 10%;
    animation-delay: 2s;
}

.heart-3 {
    bottom: 15%;
    left: 15%;
    animation-delay: 4s;
}

.star-1 {
    top: 20%;
    right: 15%;
    animation-delay: 0.5s;
}

.star-2 {
    bottom: 30%;
    right: 20%;
    animation-delay: 1.5s;
}

.star-3 {
    top: 40%;
    left: 10%;
    animation-delay: 2.5s;
}

.star-4 {
    bottom: 20%;
    left: 30%;
    animation-delay: 3.5s;
}

.cloud-1 {
    top: 15%;
    right: 25%;
    animation-delay: 1s;
}

.cloud-2 {
    bottom: 25%;
    left: 20%;
    animation-delay: 3s;
}

.magic-wand-1 {
    top: 30%;
    right: 10%;
    animation-delay: 0.5s;
}

.magic-wand-2 {
    bottom: 40%;
    left: 25%;
    animation-delay: 2.5s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(10deg);
    }
}

/* 密码模态框 */
.password-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.password-modal-content {
    background: white;
    border-radius: 12px;
    padding: 30px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    animation: modalFadeIn 0.3s ease;
}

/* 管理内容 */
.admin-content {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    overflow: hidden;
}

/* 页面头部 */
.admin-header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    padding: 20px;
    color: white;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.game-title {
    font-size: 28px;
    font-weight: bold;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header-actions {
    display: flex;
    gap: 10px;
}

/* 导航标签 */
.admin-tabs {
    display: flex;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    overflow-x: auto;
    white-space: nowrap;
}

.tab-btn {
    flex: 0 0 auto;
    min-width: 100px;
    padding: 15px 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
}

.tab-btn:hover {
    background: #e9ecef;
}

.tab-btn.active {
    background: white;
    border-bottom: 3px solid #4facfe;
    color: #4facfe;
}

.tab-icon {
    font-size: 16px;
}

/* 管理功能区域 */
.admin-sections {
    padding: 20px;
}

.tab-content {
    animation: fadeIn 0.3s ease;
}

/* 区块样式 */
.admin-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    overflow: hidden;
}

.section-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title {
    margin: 0;
    font-size: 18px;
}

.section-decoration {
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
}

.section-content {
    padding: 20px;
}

/* 按钮样式 */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-icon {
    font-size: 16px;
}

.add-btn {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
}

.subtract-btn {
    background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
    color: white;
}

.back-btn {
    background: linear-gradient(135deg, #2196F3 0%, #0b7dda 100%);
    color: white;
}

.logout-btn {
    background: linear-gradient(135deg, #ff9800 0%, #e68a00 100%);
    color: white;
}

.save-btn {
    background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
    color: white;
}

.delete-btn {
    background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
    color: white;
}

.edit-btn {
    background: linear-gradient(135deg, #2196F3 0%, #0b7dda 100%);
    color: white;
}

.apply-btn {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    width: 100%;
    margin-top: 20px;
}

.export-btn {
    background: linear-gradient(135deg, #2196F3 0%, #0b7dda 100%);
    color: white;
}

.import-btn {
    background: linear-gradient(135deg, #ff9800 0%, #e68a00 100%);
    color: white;
}

.reset-btn {
    background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
    color: white;
}

/* 表单样式 */
.form-group {
    margin-bottom: 16px;
}

.form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
}

.form-group.half {
    flex: 1;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s ease;
}

.icon-input-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.icon-input-group .el-input {
    flex: 1;
}

.form-input:focus {
    outline: none;
    border-color: #4facfe;
    box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}

.form-textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    resize: vertical;
    transition: border-color 0.3s ease;
}

.form-textarea:focus {
    outline: none;
    border-color: #4facfe;
    box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}

.required {
    color: #f44336;
    margin-left: 4px;
}

/* 仪表板统计 */
.dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.stat-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-5px);
}

.stat-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 14px;
    color: #666;
}

/* 计划管理 */
.action-buttons-row {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.filter-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
}

.filter-btn:hover {
    background: #f8f9fa;
}

.filter-btn.active {
    background: #4facfe;
    color: white;
    border-color: #4facfe;
}

.date-range-filter {
    margin-bottom: 20px;
}

.subject-section {
    margin-bottom: 30px;
}

.subject-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f0f0;
}

.subject-icon {
    font-size: 20px;
}

.subject-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.tasks-list {
    display: grid;
    gap: 15px;
}

.task-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
}

.task-info {
    flex: 1;
}

.task-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.task-icon {
    font-size: 20px;
}

.task-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    flex: 1;
}

.task-points {
    font-weight: 600;
    color: #4CAF50;
}

.task-description {
    margin: 10px 0;
    color: #666;
    font-size: 14px;
}

.task-meta {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #999;
}

.task-actions {
    display: flex;
    gap: 10px;
}

/* 行为管理 */
.behaviors-list {
    display: grid;
    gap: 15px;
    margin-top: 20px;
}

.behavior-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
}

.behavior-info {
    flex: 1;
}

.behavior-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.behavior-icon {
    font-size: 20px;
}

.behavior-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    flex: 1;
}

.behavior-points {
    font-weight: 600;
}

.behavior-points.negative {
    color: #f44336;
}

.behavior-description {
    margin: 10px 0;
    color: #666;
    font-size: 14px;
}

.behavior-meta {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #999;
}

.behavior-actions {
    display: flex;
    gap: 10px;
}

/* 兑换项管理 */
.rewards-list {
    display: grid;
    gap: 15px;
    margin-top: 20px;
}

.reward-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
}

.reward-info {
    flex: 1;
}

.reward-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.reward-icon {
    font-size: 20px;
}

.reward-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    flex: 1;
}

.reward-cost {
    font-weight: 600;
    color: #ff9800;
}

.reward-description {
    margin: 10px 0;
    color: #666;
    font-size: 14px;
}

.reward-actions {
    display: flex;
    gap: 10px;
}

/* 抽奖管理 */
.lottery-items-list {
    display: grid;
    gap: 15px;
    margin-top: 20px;
}

.lottery-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;
}

.lottery-item-info {
    flex: 1;
    min-width: 250px;
}

.lottery-item-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.lottery-item-icon {
    font-size: 20px;
}

.lottery-item-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    flex: 1;
}

.lottery-item-rarity {
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.lottery-item-rarity.common {
    background: #e0e0e0;
    color: #333;
}

.lottery-item-rarity.rare {
    background: #bbdefb;
    color: #1976d2;
}

.lottery-item-rarity.epic {
    background: #ce93d8;
    color: #7b1fa2;
}

.lottery-item-rarity.legendary {
    background: #ffcc80;
    color: #e65100;
}

.lottery-item-description {
    margin: 10px 0;
    color: #666;
    font-size: 14px;
}

.lottery-item-meta {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #999;
}

.lottery-item-actions {
    display: flex;
    gap: 10px;
}

/* 系统设置 */
.feature-toggle {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 12px;
}

.toggle-info {
    flex: 1;
}

.toggle-name {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
}

.toggle-description {
    margin: 0;
    font-size: 14px;
    color: #666;
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

input:checked+.toggle-slider {
    background-color: #4facfe;
}

input:focus+.toggle-slider {
    box-shadow: 0 0 1px #4facfe;
}

input:checked+.toggle-slider:before {
    transform: translateX(26px);
}

.data-management {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.data-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 12px;
}

.data-info-text {
    margin: 5px 0;
    font-size: 14px;
    color: #666;
}

/* 模态框 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 30px;
    width: 90%;
    max-width: 700px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    animation: modalFadeIn 0.3s ease;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.modal-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    transition: color 0.3s ease;
}

.close-btn:hover {
    color: #333;
}

.modal-body {
    max-height: 70vh;
    overflow-y: auto;
}

/* 确认模态框 */
.confirm-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.confirm-modal-content {
    background: white;
    border-radius: 12px;
    padding: 30px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    animation: modalFadeIn 0.3s ease;
}

.confirm-message {
    margin: 0 0 20px 0;
    font-size: 16px;
    text-align: center;
}

.confirm-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.cancel-btn {
    background: #9e9e9e;
    color: white;
}

.delete-confirm-btn {
    background: #f44336;
    color: white;
}

/* 图标选择器 */
.icon-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    margin-top: 20px;
}

.icon-item {
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
}

.icon-item:hover {
    background: #e3f2fd;
    border-color: #4facfe;
    transform: translateY(-2px);
}

.icon-preview {
    font-size: 24px;
}

/* 通知 */
.notification-overlay {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1001;
    animation: slideInRight 0.3s ease;
}

.notification-content {
    background: white;
    border-radius: 8px;
    padding: 15px 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 300px;
}

.notification-content.success {
    border-left: 4px solid #4CAF50;
}

.notification-content.error {
    border-left: 4px solid #f44336;
}

.notification-icon {
    font-size: 20px;
}

.notification-message {
    flex: 1;
    margin: 0;
    font-size: 14px;
}

.close-notification-btn {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #999;
    transition: color 0.3s ease;
}

.close-notification-btn:hover {
    color: #333;
}

/* 便捷设置抽屉 */
.drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease;
}

.drawer-content {
    position: fixed;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: white;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    animation: slideInRight 0.3s ease;
    display: flex;
    flex-direction: column;
}

.drawer-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.drawer-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
}

.drawer-body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.drawer-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.drawer-tab-btn {
    flex: 1;
    padding: 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
}

.drawer-tab-btn:hover {
    background: #f8f9fa;
}

.drawer-tab-btn.active {
    background: #4facfe;
    color: white;
}

.filter-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 15px;
    font-weight: 600;
}

.toggle-icon {
    font-size: 12px;
}

.filter-section {
    margin-bottom: 15px;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 8px;
}

.filter-row {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;
}

.filter-row:last-child {
    margin-bottom: 0;
}

.filter-row .form-group {
    flex: 1;
    margin-bottom: 0;
}

.plans-list-container {
    border: 2px solid #ffd6e0;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 15px;
}

.plans-list {
    margin-top: 0;
    min-height: 200px;
    max-height: 70vh;
    overflow-y: auto;
    padding: 15px;
    background: #fff;
}

.no-plans-hint {
    text-align: center;
    padding: 20px;
    color: #999;
    font-size: 14px;
}

.plan-checkbox-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: background 0.3s ease;
}

.plan-checkbox-item:hover {
    background: #e3f2fd;
}

.plan-checkbox-item input[type="checkbox"] {
    width: 16px;
    height: 16px;
}

.plan-name {
    flex: 1;
    font-weight: 500;
}

.plan-subject {
    font-size: 12px;
    color: #666;
    background: #e0e0e0;
    padding: 2px 8px;
    border-radius: 12px;
}

.templates-list {
    margin-top: 20px;
}

.template-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
}

.template-info {
    flex: 1;
}

.template-name {
    margin: 0 0 5px 0;
    font-size: 16px;
    font-weight: 600;
}

.template-description {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #666;
}

.template-subject {
    font-size: 12px;
    color: #666;
    background: #e0e0e0;
    padding: 2px 8px;
    border-radius: 12px;
}

.template-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    justify-content: flex-end;
}

/* 计划卡片样式 */
.plan-card {
    margin-bottom: 12px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 1px solid #e8e8e8;
    padding: 0 !important;
}

.plan-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #ff8fab;
}

.plan-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 15px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 2px solid #ff8fab;
    border-radius: 8px 8px 0 0;
    margin: 0 !important;
}

.plan-card-header .plan-name {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.plan-card-header .plan-points {
    font-size: 12px;
    font-weight: 600;
    color: #4CAF50;
    background: #f1f8e9;
    padding: 2px 6px;
    border-radius: 10px;
}

.plan-card-body {
    padding: 0 15px 8px 15px;
    margin: 0 !important;
}

.plan-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
}

.plan-meta .plan-subject {
    font-size: 12px;
    color: #666;
    background: #e3f2fd;
    padding: 2px 6px;
    border-radius: 10px;
}

.plan-meta .plan-target {
    font-size: 12px;
    color: #666;
    background: #fff3e0;
    padding: 2px 6px;
    border-radius: 10px;
}

.plan-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 6px;
    line-height: 1.4;
}

.plan-time {
    font-size: 12px;
    color: #999;
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 10px;
    display: inline-block;
}

/* 模板卡片样式 */
.template-card {
    margin-bottom: 12px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 1px solid #e8e8e8;
    padding: 10px;
}

.template-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #ff8fab;
}

.template-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 15px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 2px solid #ff8fab;
    border-radius: 8px 8px 0 0;
    margin: -10px -10px 8px -10px;
}

.template-card-header .template-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.template-card-header .template-points {
    font-size: 12px;
    font-weight: 600;
    color: #4CAF50;
    background: #f1f8e9;
    padding: 2px 6px;
    border-radius: 10px;
}

.template-card-body {
    padding: 0;
}

.template-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
}

.template-meta .template-subject {
    font-size: 11px;
    color: #666;
    background: #e3f2fd;
    padding: 1px 6px;
    border-radius: 8px;
}

.template-meta .template-target {
    font-size: 11px;
    color: #666;
    background: #fff3e0;
    padding: 1px 6px;
    border-radius: 8px;
}

.template-description {
    font-size: 12px;
    color: #666;
    margin-bottom: 6px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.template-time {
    font-size: 11px;
    color: #999;
    background: #f5f5f5;
    padding: 1px 6px;
    border-radius: 8px;
    display: inline-block;
    margin-bottom: 8px;
}

.template-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    justify-content: flex-end;
}

.template-actions .el-button {
    padding: 4px 12px;
    font-size: 12px;
    border-radius: 6px;
}

/* 添加模板按钮 */
.add-template-btn {
    margin-bottom: 15px;
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: bold;
}

/* 无数据状态 */
.no-tasks,
.no-behaviors,
.no-rewards,
.no-lottery-items {
    text-align: center;
    padding: 40px 20px;
    background: #f8f9fa;
    border-radius: 12px;
    margin-top: 20px;
}

.no-tasks-text,
.no-behaviors-text,
.no-rewards-text,
.no-lottery-items-text {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 500;
    color: #666;
}

.no-tasks-hint,
.no-behaviors-hint,
.no-rewards-hint,
.no-lottery-items-hint {
    margin: 0;
    font-size: 14px;
    color: #999;
}

/* 动画 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .admin-container {
        padding: 10px;
    }

    .header-content {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .admin-tabs {
        overflow-x: auto;
        white-space: nowrap;
    }

    .tab-btn {
        flex: 0 0 auto;
        min-width: 100px;
    }

    .dashboard-stats {
        grid-template-columns: 1fr;
    }

    .action-buttons-row {
        flex-direction: column;
    }

    .filter-buttons {
        flex-wrap: wrap;
    }

    .task-item,
    .behavior-item,
    .reward-item,
    .lottery-item {
        flex-direction: column;
        align-items: stretch;
    }

    .task-actions,
    .behavior-actions,
    .reward-actions,
    .lottery-item-actions {
        justify-content: flex-end;
        margin-top: 15px;
    }

    .data-management {
        flex-direction: column;
    }

    .drawer-content {
        width: 95%;
    }

    .icon-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (max-width: 480px) {
    .modal-content {
        padding: 20px;
    }

    .drawer-content {
        width: 100%;
    }

    .icon-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* 滚动条样式 */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>