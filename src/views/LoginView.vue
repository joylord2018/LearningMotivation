<template>
    <div class="login-container">
        <button @click="clearCache" class="game-btn clear-cache-btn">
            <span class="btn-icon">🗑️</span> 清除缓存
        </button>
        <!-- 可爱的背景装饰元素 -->
        <div class="decorations">
            <!-- 星星装饰 -->
            <div v-for="(pos, index) in starPositions" :key="'star-' + index" class="decoration star" :style="{ left: pos.left, top: pos.top, animationDelay: pos.animationDelay }"></div>
            
            <!-- 云朵装饰 -->
            <div v-for="(pos, index) in cloudPositions" :key="'cloud-' + index" class="decoration cloud" :style="{ left: pos.left, top: pos.top, animationDelay: pos.animationDelay }"></div>
            
            <!-- 爱心装饰 -->
            <div v-for="i in 5" :key="'heart-' + i" class="decoration-with-string" :style="{ left: (i * 20 - 10) + '%' }">
                <template v-for="j in 1" :key="'heart-pos-' + i">
                    <div class="connection-string" :style="{ height: heartTop[i-1] + 'px' }"></div>
                    <div class="decoration heart" :style="{ top: heartTop[i-1] + 'px', animationDelay: Math.random() * 3 + 's' }"></div>
                </template>
            </div>
        </div>

        <div class="login-card">
            <div class="login-title">
                <h1>🎮 任务积分大冒险 🎮</h1>
                <p>收集积分，解锁成就，成为学习小能手！</p>
            </div>

            <div class="login-form-wrapper">
                <form @submit.prevent="handleLogin" class="login-form">
                    <div class="form-group">
                        <label for="username">
                            <span class="input-icon">👤</span>
                            勇者之名：
                        </label>
                        <input id="username" v-model="username" type="text" placeholder="请输入你的名字" required
                            class="game-input" />
                    </div>
                    <div class="form-group">
                        <label for="password">
                            <span class="input-icon">🔑</span>
                            冒险密码：
                        </label>
                        <input id="password" v-model="password" type="password" placeholder="请输入密码" required
                            class="game-input" />
                    </div>
                    <button type="submit" class="game-btn login-btn">
                        <span class="btn-icon">🚪</span> 开始冒险
                    </button>
                    <p v-if="error" class="error-message">💔 {{ error }}</p>
                </form>
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const store = useUserStore()

const username = ref('')
const password = ref('')
const error = ref('')

// 装饰元素位置
const starPositions = ref([])
const cloudPositions = ref([])
const heartTop = ref([])

// 初始化装饰元素位置
onMounted(() => {
    // 生成星星位置
    starPositions.value = Array.from({ length: 30 }, () => ({
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 5 + 's'
    }))
    
    // 生成云朵位置
    cloudPositions.value = Array.from({ length: 8 }, () => ({
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 5 + 's'
    }))
    
    // 生成爱心位置
    heartTop.value = Array.from({ length: 5 }, () => 200 + Math.random() * 150)
})

// 通知相关
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success') // success, error, info
const notificationIcon = ref('')

function handleLogin() {
    if (store.login(username.value, password.value)) {
        localStorage.setItem('isLoggedIn', 'true')
        router.push('/plans')
    } else {
        error.value = '账号或密码错误，请重试'
    }
}

function clearCache() {
    store.resetAllData()
    showNotificationMessage('缓存已清除！', 'success', '✅')
}

function showNotificationMessage(message: string, type: string, icon: string) {
    notificationMessage.value = message
    notificationType.value = type
    notificationIcon.value = icon
    showNotification.value = true

    setTimeout(() => {
        closeNotification()
    }, 3000)
}

function closeNotification() {
    showNotification.value = false
}
</script>

<style scoped>
/* 基础样式重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background-color: #fff5f7;
    overflow-x: hidden;
}

/* 主容器 */
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #fff0f5 0%, #ffe6ed 100%);
    padding: 20px;
    position: relative;
    overflow: visible;
}

/* 背景装饰 */
.decorations {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
}

.decoration {
    position: absolute;
    pointer-events: none;
}

/* 星星装饰 */
.star {
    width: 20px;
    height: 20px;
    background-color: #ffda6a;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation: twinkle 3s ease-in-out infinite;
    box-shadow: 0 0 10px #ffda6a;
}

/* 带连接线的装饰元素容器 */
.decoration-with-string {
    position: absolute;
    top: 0;
    width: 100px;
    height: 300px;
    pointer-events: none;
    transform-origin: top center;
    animation: pendulum 4s ease-in-out infinite;
}

/* 连接线 */
.connection-string {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 200px;
    background-color: rgba(255, 107, 139, 0.3);
    transform-origin: top center;
}

/* 爱心装饰 */
.heart {
    position: absolute;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 40px;
    height: 40px;
    background-color: #ff6b8b;
    z-index: 3;
}

.heart:before,
.heart:after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    background-color: #ff6b8b;
    border-radius: 50%;
}

.heart:before {
    top: -20px;
    left: 0;
}

.heart:after {
    top: 0;
    left: -20px;
}

/* 云朵装饰 */
.cloud {
    width: 100px;
    height: 50px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 25px;
    animation: float 15s ease-in-out infinite;
    z-index: 1;
}

.cloud:before,
.cloud:after {
    content: '';
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
}

.cloud:before {
    width: 40px;
    height: 40px;
    top: -15px;
    left: 10px;
}

.cloud:after {
    width: 50px;
    height: 50px;
    top: -20px;
    right: 10px;
}

/* 星星闪烁动画 */
@keyframes twinkle {
    0%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1.2);
        box-shadow: 0 0 15px #ffda6a;
    }
}

/* 钟摆摇摆动画 */
@keyframes pendulum {
    0%, 100% {
        transform: rotate(-5deg);
    }
    50% {
        transform: rotate(5deg);
    }
}

/* 浮动动画 */
@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-20px);
    }
}

/* 登录卡片 */
.login-card {
    background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
    border-radius: 30px;
    padding: 40px;
    box-shadow: 0 15px 35px rgba(255, 138, 171, 0.2);
    max-width: 450px;
    width: 100%;
    position: relative;
    z-index: 1;
    border: 3px solid #ffd6e0;
    overflow: hidden;
}

/* 清除缓存按钮 */
.clear-cache-btn {
    position: absolute !important;
    top: 15px;
    right: 15px;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 20px;
    z-index: 100;
    background: linear-gradient(135deg, #ff6b8b 0%, #ff8fab 100%);
    color: white;
    border: none;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 6px 15px rgba(255, 107, 139, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
}

.clear-cache-btn .btn-icon {
    font-size: 16px;
}

/* 卡片装饰 */
.login-card::before {
    content: '✨';
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 40px;
    animation: sparkle 2s ease-in-out infinite;
}

.login-card::after {
    content: '🎀';
    position: absolute;
    bottom: -10px;
    left: -10px;
    font-size: 40px;
    animation: bounce 2s ease-in-out infinite;
}

@keyframes sparkle {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.7;
    }

    50% {
        transform: scale(1.2);
        opacity: 1;
    }
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

/* 标题样式 */
.login-title {
    text-align: center;
    margin-bottom: 30px;
    color: #ff6b8b;
}

.login-title h1 {
    font-size: 2.2rem;
    margin-bottom: 10px;
    font-weight: 800;
    text-shadow: 3px 3px 6px rgba(255, 107, 139, 0.2);
    animation: titlePulse 2s ease-in-out infinite;
}

@keyframes titlePulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

.login-title p {
    font-size: 1.2rem;
    color: #ff8fab;
    font-weight: 500;
}

/* 表单样式 */
.login-form-wrapper {
    position: relative;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 25px;
    position: relative;
    z-index: 2;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
}

.form-group label {
    font-weight: bold;
    color: #ff6b8b;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.input-icon {
    font-size: 1.3rem;
}

/* 游戏风格输入框 */
.game-input {
    padding: 15px 20px;
    border: 3px solid #ffb6c1;
    border-radius: 20px;
    font-size: 16px;
    background-color: #fff;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 8px rgba(255, 182, 193, 0.2);
}

.game-input:focus {
    outline: none;
    border-color: #ff6b8b;
    box-shadow: 0 0 0 5px rgba(255, 107, 139, 0.1), 0 6px 15px rgba(255, 107, 139, 0.3);
    background-color: #fff0f5;
    transform: translateY(-2px);
}

.game-input::placeholder {
    color: #ffb6c1;
}

/* 游戏风格按钮 */
.game-btn {
    padding: 15px 20px;
    background: linear-gradient(135deg, #ff6b8b 0%, #ff8fab 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    box-shadow: 0 6px 15px rgba(255, 107, 139, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    overflow: hidden;
}

.game-btn::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: rotate(45deg);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%) rotate(45deg);
    }

    100% {
        transform: translateX(100%) rotate(45deg);
    }
}

.game-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(255, 107, 139, 0.4);
    background: linear-gradient(135deg, #ff5277 0%, #ff6b8b 100%);
}

.game-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(255, 107, 139, 0.4);
}

.btn-icon {
    font-size: 20px;
}

/* 错误信息 */
.error-message {
    color: #ff4d4f;
    margin: 0;
    text-align: center;
    font-size: 1rem;
    font-weight: 500;
    position: relative;
    z-index: 1;
    padding: 10px;
    background-color: rgba(255, 77, 79, 0.1);
    border-radius: 15px;
    border: 2px solid rgba(255, 77, 79, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .login-container {
        padding: 15px;
    }

    .login-card {
        padding: 30px 20px;
        margin: 0 10px;
    }

    .login-title h1 {
        font-size: 1.8rem;
    }

    .login-title p {
        font-size: 1rem;
    }

    .game-input {
        padding: 12px 16px;
    }

    .game-btn {
        padding: 12px 16px;
        font-size: 16px;
    }
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
</style>