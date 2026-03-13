<template>
  <div class="profile-container">
    <!-- 可爱的装饰元素 -->
    <div class="decorations">
      <div class="decoration heart"></div>
      <div class="decoration star"></div>
      <div class="decoration circle"></div>
      <div class="decoration cloud"></div>
      <div class="decoration gift"></div>
      <div class="decoration heart small"></div>
      <div class="decoration star small"></div>
      <div class="decoration circle small"></div>
      <div class="decoration heart small"></div>
      <div class="decoration star small"></div>
      <!-- 新增更多装饰元素 -->
      <div class="decoration heart small" style="top: 70%; left: 80%; animation-delay: 1s;"></div>
      <div class="decoration star small" style="top: 30%; left: 85%; animation-delay: 2s;"></div>
      <div class="decoration cloud" style="top: 80%; left: 60%; animation-delay: 3s;"></div>
      <div class="decoration heart small" style="top: 10%; right: 10%; animation-delay: 0.5s;"></div>
      <div class="decoration star small" style="bottom: 20%; right: 25%; animation-delay: 1.5s;"></div>
    </div>

    <h2 class="page-title">👧 个人信息管理 💖</h2>

    <!-- 使用可复用的导航组件 -->
    <NavigationTabs />

    <div class="profile-section game-card">
      <div class="profile-header">
        <div class="user-info">
          <h3 class="username">{{ userStore.userInfo.username }}</h3>
          <p class="email">{{ email }}</p>
          <p class="member-since">加入时间: {{ memberSince }}</p>
        </div>
      </div>

      <div class="profile-form">
        <h4>基本信息</h4>
        <div class="form-group">
          <label for="nickname">昵称</label>
          <input id="nickname" v-model="nickname" type="text" placeholder="请输入昵称" />
        </div>
        <div class="form-group">
          <label for="bio">个人简介</label>
          <textarea id="bio" v-model="bio" placeholder="请输入个人简介" rows="4"></textarea>
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input id="email" v-model="email" type="email" placeholder="请输入邮箱" />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input id="password" v-model="password" type="password" placeholder="请输入新密码" />
        </div>

        <div class="action-buttons">
          <button class="save-btn" @click="saveProfile">保存修改</button>
          <button class="cancel-btn" @click="cancelEdit">取消</button>
        </div>
      </div>

      <div class="profile-stats">
        <h4>学习统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ totalTasks }}</div>
            <div class="stat-label">完成任务数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ currentPoints }}</div>
            <div class="stat-label">当前积分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ totalAchievements }}</div>
            <div class="stat-label">解锁成就</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ longestStreak }}</div>
            <div class="stat-label">最长连续学习</div>
          </div>
        </div>
      </div>

      <div class="security-section">
        <h4>安全设置</h4>
        <div class="form-group">
          <label for="current-password">当前密码</label>
          <input id="current-password" v-model="currentPassword" type="password" placeholder="请输入当前密码" />
        </div>
        <div class="form-group">
          <label for="new-password">新密码</label>
          <input id="new-password" v-model="newPassword" type="password" placeholder="请输入新密码" />
        </div>
        <div class="form-group">
          <label for="confirm-password">确认新密码</label>
          <input id="confirm-password" v-model="confirmPassword" type="password" placeholder="请确认新密码" />
        </div>
        <button class="change-password-btn" @click="changePassword">修改密码</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'
import NavigationTabs from '../components/NavigationTabs.vue'

const userStore = useUserStore()
const router = useRouter()

// 个人信息表单数据
const nickname = ref('')
const bio = ref('')
const email = ref('')
const password = ref('')

// 密码修改表单数据
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')



// 计算属性获取统计数据
const totalTasks = computed(() => userStore.plans.length)
const currentPoints = computed(() => userStore.currentPoints)
const totalAchievements = computed(() => userStore.achievements.filter(a => a.unlocked).length)
const longestStreak = computed(() => userStore.longestStreak || 0)

// 加入时间
const memberSince = computed(() => {
  const joinDate = (userStore.userInfo as any).joinDate || new Date().toISOString().split('T')[0]
  return joinDate
})

// 初始化表单数据
onMounted(() => {
  // 从用户存储中获取数据
  nickname.value = userStore.userInfo?.nickname || ''
  bio.value = userStore.userInfo?.bio || ''
  email.value = userStore.userInfo?.email || ''
})



// 保存个人信息
const saveProfile = () => {
  // 保存到用户存储
  userStore.updateUserInfo({
    nickname: nickname.value,
    bio: bio.value,
    email: email.value
  })

  // 显示保存成功提示
  alert('个人信息保存成功！')
}

// 取消编辑
const cancelEdit = () => {
  // 重置表单数据
  nickname.value = userStore.userInfo?.nickname || ''
  bio.value = userStore.userInfo?.bio || ''
  email.value = userStore.userInfo?.email || ''
}

// 修改密码
const changePassword = () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('新密码和确认密码不一致！')
    return
  }

  if (newPassword.value.length < 6) {
    alert('密码长度不能少于6位！')
    return
  }

  // 验证当前密码
  if (currentPassword.value !== userStore.userInfo.password) {
    alert('当前密码输入错误！')
    return
  }

  userStore.updatePassword(newPassword.value)

  // 重置密码表单
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''

  alert('密码修改成功！')
}
</script>

<style scoped>
/* 主容器样式 */
.profile-container {
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
  opacity: 0.6;
  animation: float 20s infinite ease-in-out;
}

.heart {
  width: 50px;
  height: 50px;
  background: radial-gradient(circle at 75% 30%, #ff1493 12%, transparent 12%),
    radial-gradient(circle at 25% 30%, #ff1493 12%, transparent 12%),
    radial-gradient(circle at 50% 50%, #ff1493 30%, transparent 30%);
  top: 20%;
  left: 10%;
  transform: rotate(-15deg);
}

.star {
  width: 40px;
  height: 40px;
  background: gold;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  top: 15%;
  right: 20%;
}

.circle {
  width: 60px;
  height: 60px;
  border: 3px solid #ff69b4;
  border-radius: 50%;
  top: 60%;
  left: 15%;
}

.cloud {
  width: 100px;
  height: 60px;
  background: #fff;
  border-radius: 50px;
  position: relative;
  top: 40%;
  right: 10%;
}

.cloud::before {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  top: -20px;
  left: 20px;
}

.cloud::after {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 50%;
  top: -30px;
  left: 40px;
}

.gift {
  width: 60px;
  height: 50px;
  background: #ff6b6b;
  position: relative;
  top: 70%;
  right: 25%;
}

.gift::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 70px;
  background: #ffd93d;
  left: 20px;
  top: -10px;
}

.gift::after {
  content: '';
  position: absolute;
  width: 70px;
  height: 20px;
  background: #ffd93d;
  left: -5px;
  top: 15px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #ff69b4;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 2px 2px 0px #ffd6e0;
}

.game-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
  background-clip: padding-box, border-box;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: bold;
  color: #ff1493;
  margin-bottom: 5px;
  text-shadow: 1px 1px 0px #ffd6e0;
}

.email {
  color: #ff69b4;
  margin-bottom: 5px;
}

.member-since {
  color: #ff69b4;
  font-size: 14px;
}

.profile-form {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.profile-form h4,
.profile-stats h4,
.security-section h4 {
  font-size: 20px;
  font-weight: bold;
  color: #ff1493;
  margin-bottom: 20px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ffd6e0 0%, #ffe6ed 100%);
  border-radius: 20px;
  border: 2px solid #ff69b4;
  display: inline-block;
  text-shadow: 1px 1px 0px #ffd6e0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #ff69b4;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ffd6e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #fff;
  box-shadow: inset 0 2px 4px rgba(255, 105, 180, 0.1);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff1493;
  box-shadow: 0 0 0 4px rgba(255, 105, 180, 0.2),
              inset 0 2px 4px rgba(255, 105, 180, 0.3);
  background-color: #fff;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.save-btn,
.cancel-btn,
.change-password-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.save-btn {
  background: linear-gradient(135deg, #ff1493 0%, #ff69b4 100%);
  color: white;
}

.save-btn:hover {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  box-shadow: 0 6px 16px rgba(255, 105, 180, 0.5);
  transform: translateY(-2px);
}

.cancel-btn {
  background: linear-gradient(135deg, #ffd6e0 0%, #ffe6ed 100%);
  color: #ff69b4;
  border: 2px solid #ffb6c1;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #ffe6ed 0%, #ffd6e0 100%);
  box-shadow: 0 6px 16px rgba(255, 105, 180, 0.3);
  transform: translateY(-2px);
}

.profile-stats {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #ffe6ed;
  border-radius: 16px;
  border: 2px solid #ffd6e0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 105, 180, 0.15);
}

.stat-item:hover {
  transform: translateY(-5px) scale(1.03);
  border-color: #ff1493;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #ff1493;
  margin-bottom: 5px;
}

.stat-label {
  color: #ff69b4;
  font-size: 14px;
}

.security-section {
  margin-bottom: 30px;
}

.change-password-btn {
  background: linear-gradient(135deg, #ffd93d 0%, #ffed4e 100%);
  color: #ff69b4;
  font-weight: 700;
}

.change-password-btn:hover {
  background: linear-gradient(135deg, #ffed4e 0%, #ffd93d 100%);
  box-shadow: 0 6px 16px rgba(255, 217, 61, 0.5);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>