<template>
    <div class="password-modal-overlay" @click="closePasswordModal">
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
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const adminPassword = ref('')
const authError = ref('')

const emit = defineEmits(['authenticate', 'close'])

const authenticate = () => {
    if (adminPassword.value === '379487') {
        emit('authenticate')
        adminPassword.value = ''
        authError.value = ''
    } else {
        authError.value = '密码错误，请重试'
    }
}

const closePasswordModal = () => {
    emit('close')
}
</script>

<style scoped>
.password-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 240, 245, 0.9) 0%, rgba(255, 230, 237, 0.9) 100%);
    background-image:
        radial-gradient(rgba(255, 214, 224, 0.3) 1px, transparent 1px),
        radial-gradient(rgba(255, 214, 224, 0.3) 1px, transparent 1px);
    background-size: 30px 30px;
    background-position: 0 0, 15px 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.password-modal-content {
    background: linear-gradient(135deg, #ffffff 0%, #fff0f5 100%);
    border-radius: 20px;
    padding: 30px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 20px 40px rgba(255, 107, 139, 0.3);
    border: 3px solid #ffd6e0;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.modal-title {
    color: #ff6b8b;
    font-size: 1.5rem;
    margin: 0;
    font-weight: 700;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    transition: color 0.3s ease;
}

.close-btn:hover {
    color: #ff6b8b;
}

.modal-description {
    color: #666;
    margin-bottom: 20px;
    text-align: center;
}

.password-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #ffd6e0;
    border-radius: 25px;
    font-size: 16px;
    margin-bottom: 15px;
    transition: border-color 0.3s ease;
}

.password-input:focus {
    outline: none;
    border-color: #ff6b8b;
    box-shadow: 0 0 0 3px rgba(255, 107, 139, 0.1);
}

.auth-error {
    color: #ff4757;
    margin-bottom: 15px;
    text-align: center;
    font-size: 14px;
}

.confirm-btn {
    width: 100%;
    background: linear-gradient(135deg, #ff6b8b 0%, #ff8fab 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.confirm-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
}

.btn-icon {
    font-size: 18px;
}
</style>