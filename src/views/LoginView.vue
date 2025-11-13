<template>
    <div class="login-container">
        <!-- 可爱的背景装饰元素 -->
        <div class="decorations">
            <div class="decoration heart"></div>
            <div class="decoration star"></div>
            <div class="decoration cloud"></div>
            <div class="decoration circle"></div>
            <div class="decoration rainbow"></div>
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
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const store = useUserStore()

const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
    if (store.login(username.value, password.value)) {
        localStorage.setItem('isLoggedIn', 'true')
        router.push('/tasks')
    } else {
        error.value = '账号或密码错误，请重试'
    }
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
    overflow: hidden;
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
    opacity: 0.6;
    animation: float 10s ease-in-out infinite;
}

.heart {
    top: 10%;
    right: 15%;
    width: 120px;
    height: 120px;
    background-color: #ffb6c1;
    transform: rotate(45deg);
    animation-delay: 0s;
}

.heart:before,
.heart:after {
    content: '';
    position: absolute;
    width: 120px;
    height: 120px;
    background-color: #ffb6c1;
    border-radius: 50%;
}

.heart:before {
    top: -60px;
    left: 0;
}

.heart:after {
    top: 0;
    left: -60px;
}

.star {
    bottom: 15%;
    left: 10%;
    width: 80px;
    height: 80px;
    background-color: #ffda6a;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation-delay: 2s;
    box-shadow: 0 0 20px #ffda6a;
}

.cloud {
    top: 25%;
    left: 20%;
    width: 150px;
    height: 80px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 40px;
    animation-delay: 1s;
}

.cloud:before,
.cloud:after {
    content: '';
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
}

.cloud:before {
    width: 70px;
    height: 70px;
    top: -30px;
    left: 20px;
}

.cloud:after {
    width: 90px;
    height: 90px;
    top: -40px;
    right: 20px;
}

.circle {
    bottom: 25%;
    right: 15%;
    width: 100px;
    height: 100px;
    background-color: #b5ead7;
    border-radius: 50%;
    animation-delay: 3s;
}

.rainbow {
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 100px;
    border-radius: 100px 100px 0 0;
    background: linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
    opacity: 0.3;
    animation-delay: 1.5s;
}

/* 浮动动画 */
@keyframes float {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(5deg);
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
</style>