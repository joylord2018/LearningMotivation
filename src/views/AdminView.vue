<template>
    <div class="admin-container">
        <!-- 密码验证模态框 -->
        <div v-if="!isPasswordVerified" class="password-modal">
            <div class="password-modal-content">
                <h2>🔒 请输入管理密码</h2>
                <div class="password-form">
                    <input v-model="adminPassword" type="password" placeholder="请输入密码" @keyup.enter="verifyPassword"
                        class="password-input" />
                    <button @click="verifyPassword" class="verify-btn">确认</button>
                </div>
                <p v-if="passwordError" class="error-message">密码错误，请重新输入！</p>
            </div>
        </div>

        <!-- 管理页面内容 -->
        <div v-else>
            <!-- 装饰元素 -->
            <div class="decorations">
                <div class="decoration heart"></div>
                <div class="decoration star"></div>
            </div>

            <header class="admin-header">
                <h1>管理中心 👑</h1>
                <div class="logout-btn" @click="handleLogout">退出登录</div>
            </header>

            <div class="nav-tabs">
                <button class="tab-btn" @click="navigateTo('/tasks')">任务</button>
                <button class="tab-btn" @click="navigateTo('/points')">积分</button>
                <button class="tab-btn active" @click="navigateTo('/admin')">管理</button>
            </div>

            <div class="admin-content">
                <!-- 积分调整 -->
                <div class="points-adjust-section">
                    <h2>积分调整</h2>
                    <div class="adjust-form">
                        <div class="form-group">
                            <label for="pointsAdjust">调整积分数量：</label>
                            <input id="pointsAdjust" v-model="pointsAdjust" type="number" placeholder="输入积分数量"
                                step="1" />
                        </div>
                        <div class="adjust-buttons">
                            <button class="add-btn" @click="handleAddPoints">增加积分</button>
                            <button class="subtract-btn" @click="handleSubtractPoints">减少积分</button>
                        </div>
                    </div>
                </div>

                <!-- 兑换项管理 -->
                <div class="exchange-items-section">
                    <h2>兑换项管理</h2>
                    <div class="exchange-items-list">
                        <div v-for="item in store.exchangeItems" :key="item.id" class="exchange-item">
                            <div class="item-info">
                                <h3>{{ item.name }}</h3>
                                <p>{{ item.description }}</p>
                                <div class="item-price">需要 {{ item.points }} 积分</div>
                            </div>
                            <div class="item-actions">
                                <button class="edit-btn" @click="editExchangeItem(item)">编辑</button>
                                <button class="delete-btn" @click="handleDeleteItem(item.id)">删除</button>
                            </div>
                        </div>
                    </div>

                    <!-- 添加兑换项 -->
                    <div class="add-exchange-form">
                        <h3>添加新兑换项</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="newItemName">名称：</label>
                                <input id="newItemName" v-model="newItem.name" type="text" placeholder="输入名称" />
                            </div>
                            <div class="form-group">
                                <label for="newItemPoints">积分：</label>
                                <input id="newItemPoints" v-model="newItem.points" type="number" placeholder="输入积分数量"
                                    step="1" />
                            </div>
                            <div class="form-group full-width">
                                <label for="newItemDesc">描述：</label>
                                <input id="newItemDesc" v-model="newItem.description" type="text" placeholder="输入描述" />
                            </div>
                        </div>
                        <button class="add-item-btn" @click="handleAddItem">添加</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 脚本部分保持不变
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const store = useUserStore()
const pointsAdjust = ref<number | ''>('')

// 导航到其他页面
function navigateTo(route: string) {
    router.push(route)
}

// 密码验证相关状态
const isPasswordVerified = ref(false)
const adminPassword = ref('')
const passwordError = ref(false)

// 新兑换项表单
const newItem = reactive({
    name: '',
    points: 0,
    description: ''
})

// 验证密码
function verifyPassword() {
    if (adminPassword.value === '379487') {
        isPasswordVerified.value = true
        passwordError.value = false
        // 存储验证状态到本地存储，方便刷新页面后仍能保持登录状态
        localStorage.setItem('adminVerified', 'true')
    } else {
        passwordError.value = true
        adminPassword.value = ''
    }
}

// 编辑兑换项
const editExchangeItem = (item: any) => {
    const name = prompt('请输入新的名称：', item.name)
    const points = prompt('请输入新的积分数量：', item.points.toString())
    const description = prompt('请输入新的描述：', item.description)

    if (name && points && description) {
        const pointsNum = parseInt(points)
        if (!isNaN(pointsNum) && pointsNum > 0) {
            store.updateExchangeItem(item.id, name, pointsNum, description)
        } else {
            alert('请输入有效的积分数量')
        }
    }
}

// 处理添加积分
function handleAddPoints() {
    if (pointsAdjust.value && !isNaN(Number(pointsAdjust.value))) {
        const amount = Number(pointsAdjust.value)
        if (amount > 0) {
            store.adjustPoints(amount)
            pointsAdjust.value = ''
            alert(`成功增加 ${amount} 积分`)
        } else {
            alert('请输入正数')
        }
    } else {
        alert('请输入有效的积分数量')
    }
}

// 处理减少积分
function handleSubtractPoints() {
    if (pointsAdjust.value && !isNaN(Number(pointsAdjust.value))) {
        const amount = -Number(pointsAdjust.value)
        if (amount < 0) {
            if (store.currentPoints + amount >= 0) {
                store.adjustPoints(amount)
                pointsAdjust.value = ''
                alert(`成功减少 ${-amount} 积分`)
            } else {
                alert('积分不足，无法减少')
            }
        } else {
            alert('请输入正数')
        }
    } else {
        alert('请输入有效的积分数量')
    }
}

// 处理添加兑换项
function handleAddItem() {
    if (newItem.name && newItem.points > 0 && newItem.description) {
        store.addExchangeItem(newItem.name, newItem.points, newItem.description)

        // 重置表单
        newItem.name = ''
        newItem.points = 0
        newItem.description = ''

        alert('兑换项添加成功')
    } else {
        alert('请填写完整的兑换项信息')
    }
}

// 处理删除兑换项
function handleDeleteItem(itemId: string) {
    if (confirm('确定要删除这个兑换项吗？')) {
        store.removeExchangeItem(itemId)
        alert('兑换项已删除')
    }
}

// 处理登出
function handleLogout() {
    store.logout()
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('adminVerified')
    router.push('/')
}

// 检查本地存储中是否有验证状态
if (localStorage.getItem('adminVerified') === 'true') {
    isPasswordVerified.value = true
}
</script>

<style scoped>
.admin-container {
    min-height: 100vh;
    background-color: #fff5f7;
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: -1;
}

.decoration {
    position: absolute;
    opacity: 0.3;
}

.heart {
    top: 15%;
    right: 8%;
    width: 120px;
    height: 120px;
    background-color: #ffb6c1;
    border-radius: 50% 50% 0 0;
    transform: rotate(45deg);
    animation: float 8s ease-in-out infinite;
}

.star {
    bottom: 20%;
    left: 10%;
    width: 80px;
    height: 80px;
    background-color: #ffda6a;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation: float 6s ease-in-out infinite;
    animation-delay: 1s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0) rotate(0);
    }

    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

/* 密码验证模态框样式 */
.password-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 138, 171, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.password-modal-content {
    background-color: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    text-align: center;
    max-width: 400px;
    width: 90%;
    border: 2px solid #ffedf2;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.password-modal-content h2 {
    color: #ff6b8b;
    margin-bottom: 20px;
    font-size: 24px;
}

.password-input {
    padding: 12px;
    width: 100%;
    border: 2px solid #ff8fab;
    border-radius: 25px;
    font-size: 16px;
    margin-bottom: 15px;
    outline: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(255, 138, 171, 0.1);
}

.password-input:focus {
    border-color: #ff6b8b;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.2);
    transform: translateY(-1px);
}

.verify-btn {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
    font-weight: 600;
}

.verify-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.4);
}

.error-message {
    color: #ff4757;
    margin-top: 10px;
    font-size: 14px;
    animation: shake 0.5s ease;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    75% {
        transform: translateX(5px);
    }
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
}

.admin-header h1 {
    color: #ff6b8b;
    font-size: 1.8rem;
    margin: 0;
    font-weight: 700;
}

.logout-btn {
    padding: 8px 16px;
    background-color: #ff8fab;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(255, 138, 171, 0.3);
}

.logout-btn:hover {
    background-color: #ff6b8b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
}

.nav-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    background-color: white;
    padding: 10px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
}

.tab-btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    background-color: #fff0f5;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #ff8fab;
    font-weight: 600;
    font-size: 1rem;
}

.tab-btn.active {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
}

.tab-btn:hover:not(.active) {
    background-color: #ffedf2;
    transform: translateY(-1px);
}

.admin-content {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.points-adjust-section,
.exchange-items-section {
    background-color: white;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.1);
    border: 2px solid #ffedf2;
}

.points-adjust-section h2,
.exchange-items-section h2 {
    margin: 0 0 20px 0;
    color: #ff6b8b;
    font-size: 1.5rem;
    font-weight: 700;
}

.adjust-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    color: #ff8fab;
    font-weight: 600;
    font-size: 0.95rem;
}

.form-group input {
    padding: 10px 15px;
    border: 2px solid #ffedf2;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
    outline: none;
}

.form-group input:focus {
    border-color: #ff6b8b;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.15);
    transform: translateY(-1px);
}

.adjust-buttons {
    display: flex;
    gap: 10px;
}

.add-btn,
.subtract-btn,
.edit-btn,
.delete-btn,
.add-item-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 0.95rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-btn {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    flex: 1;
}

.subtract-btn {
    background: linear-gradient(135deg, #ffb6c1 0%, #ff8fab 100%);
    color: white;
    flex: 1;
}

.edit-btn {
    background-color: #fff0f5;
    color: #ff8fab;
    border: 2px solid #ffedf2;
}

.delete-btn {
    background-color: #ff6b8b;
    color: white;
}

.add-item-btn {
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    width: 100%;
    margin-top: 15px;
}

.add-btn:hover,
.subtract-btn:hover,
.add-item-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
}

.edit-btn:hover {
    background-color: #ffedf2;
    transform: translateY(-1px);
}

.delete-btn:hover {
    background-color: #ff4757;
    transform: translateY(-1px);
}

.exchange-items-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 25px;
}

.exchange-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #fff8fa;
    border-radius: 16px;
    transition: all 0.3s ease;
    border: 2px solid #ffedf2;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.05);
}

.exchange-item:hover {
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.15);
    transform: translateY(-2px);
}

.item-info h3 {
    margin: 0 0 5px 0;
    color: #ff6b8b;
    font-size: 1.1rem;
}

.item-info p {
    margin: 0 0 8px 0;
    color: #ff8fab;
    font-size: 0.9rem;
}

.item-price {
    font-weight: bold;
    color: #ff6b8b;
    font-size: 1rem;
}

.item-actions {
    display: flex;
    gap: 10px;
}

.add-exchange-form h3 {
    color: #ff6b8b;
    margin: 0 0 15px 0;
    font-size: 1.2rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

/* 手机适配 */
@media (max-width: 768px) {
    .admin-container {
        padding: 10px;
    }

    .admin-header {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .admin-header h1 {
        font-size: 1.5rem;
    }

    .nav-tabs {
        flex-direction: column;
    }

    .adjust-buttons {
        flex-direction: column;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .exchange-item {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }

    .item-actions {
        justify-content: center;
    }
}
</style>