<template>
    <div class="login-container">
        <div class="login-title">
            <h1>✨ 欢迎使用任务积分系统 ✨</h1>
            <p>做任务赚积分，兑换心仪好物吧！</p>
        </div>
        <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
                <label for="username">账号：</label>
                <input id="username" v-model="username" type="text" placeholder="请输入账号" required />
            </div>
            <div class="form-group">
                <label for="password">密码：</label>
                <input id="password" v-model="password" type="password" placeholder="请输入密码" required />
            </div>
            <button type="submit" class="login-btn">登录</button>
            <p v-if="error" class="error-message">💔 {{ error }}</p>
        </form>
        <div class="decoration"></div>
        <div class="decoration decoration-2"></div>
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
}

.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #fff5f7;
    background-image:
        radial-gradient(#ffc7d2 1px, transparent 1px),
        radial-gradient(#ffc7d2 1px, transparent 1px);
    background-size: 50px 50px;
    background-position: 0 0, 25px 25px;
    position: relative;
    padding: 20px;
}

.login-title {
    text-align: center;
    margin-bottom: 30px;
    color: #ff6b8b;
}

.login-title h1 {
    font-size: 2rem;
    margin-bottom: 10px;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(255, 107, 139, 0.2);
}

.login-title p {
    font-size: 1.1rem;
    color: #ff8fab;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 30px;
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.2);
    width: 100%;
    max-width: 400px;
    position: relative;
    overflow: hidden;
    border: 2px solid #ffd6e0;
}

/* 可爱的装饰元素 */
.login-form::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 80px;
    height: 80px;
    background-color: #ffedf2;
    border-radius: 50%;
    z-index: 0;
}

.login-form::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: -10px;
    width: 50px;
    height: 50px;
    background-color: #fff0f5;
    border-radius: 50%;
    z-index: 0;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    z-index: 1;
}

.form-group label {
    font-weight: bold;
    color: #ff6b8b;
    font-size: 1.1rem;
}

.form-group input {
    padding: 12px 16px;
    border: 2px solid #ffd6e0;
    border-radius: 12px;
    font-size: 16px;
    background-color: #fff8fa;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
}

.form-group input:focus {
    outline: none;
    border-color: #ff8fab;
    box-shadow: 0 0 0 3px rgba(255, 107, 139, 0.1);
    background-color: white;
}

.form-group input::placeholder {
    color: #ffb6c1;
}

.login-btn {
    padding: 12px 20px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 139, 0.4);
}

.login-btn:active {
    transform: translateY(0);
}

.error-message {
    color: #ff4d4f;
    margin: 0;
    text-align: center;
    font-size: 0.9rem;
    position: relative;
    z-index: 1;
}

/* 装饰性元素 */
.decoration {
    position: absolute;
    top: 20%;
    left: 10%;
    width: 100px;
    height: 100px;
    background-color: rgba(255, 220, 227, 0.5);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
}

.decoration-2 {
    top: 70%;
    right: 10%;
    width: 80px;
    height: 80px;
    animation-delay: 2s;
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

/* 手机适配 */
@media (max-width: 768px) {
    .login-container {
        padding: 15px;
    }

    .login-title h1 {
        font-size: 1.6rem;
    }

    .login-form {
        padding: 20px;
        margin: 0 10px;
    }

    .decoration {
        display: none;
    }
}
</style>