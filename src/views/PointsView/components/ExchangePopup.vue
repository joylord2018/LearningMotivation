<template>
    <!-- 兑换成功弹窗 -->
    <div v-if="visible" class="custom-popup-overlay" @click="close">
        <div class="custom-popup-content" @click.stop>
            <div class="popup-icon">{{ icon }}</div>
            <div class="popup-message">{{ message }}</div>
            <!-- 积分变动动画 -->
            <transition name="point-change">
                <div v-if="showPointChange" class="point-change-animation">
                    {{ pointChangeText }}
                </div>
            </transition>
            <button class="popup-btn" @click="close">太棒了！</button>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    icon: {
        type: String,
        default: '🎉'
    },
    message: {
        type: String,
        default: '操作成功！'
    },
    showPointChange: {
        type: Boolean,
        default: false
    },
    pointChangeText: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close'])

function close() {
    emit('close')
}
</script>

<style scoped>
/* 自定义弹窗 */
.custom-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 138, 171, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.custom-popup-content {
    background-color: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 107, 139, 0.3);
    text-align: center;
    border: 3px solid #ffedf2;
    animation: bounceIn 0.3s ease;
    position: relative;
}

.popup-icon {
    font-size: 3.5rem;
    margin-bottom: 20px;
    animation: pulse 2s ease-in-out infinite;
}

.popup-message {
    color: #ff6b8b;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 15px;
}

.point-change-animation {
    background: #ff6b8b;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: bold;
    margin-bottom: 20px;
}

.point-change-enter-active,
.point-change-leave-active {
    transition: all 0.5s ease;
}

.point-change-enter-from {
    transform: scale(0);
    opacity: 0;
}

.point-change-leave-to {
    transform: translateY(-30px);
    opacity: 0;
}

.popup-btn {
    padding: 12px 30px;
    background: linear-gradient(135deg, #ff8fab 0%, #ff6b8b 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 107, 139, 0.3);
}

.popup-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.4);
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

@keyframes bounceIn {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    70% {
        transform: scale(1.1);
        opacity: 1;
    }

    100% {
        transform: scale(1);
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }
}
</style>