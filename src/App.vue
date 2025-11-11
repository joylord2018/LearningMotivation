<script setup lang="ts"></script>

<template>
  <router-view />
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #fff5f7;
  color: #333;
  line-height: 1.6;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #fff0f5;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ffb6c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ff8fab;
}

/* 输入框自动填充样式 */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px #fff8fa inset !important;
  box-shadow: 0 0 0 1000px #fff8fa inset !important;
  -webkit-text-fill-color: #ff6b8b !important;
}

/* 确保在移动设备上的良好体验 */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }

  /* 禁用双击缩放 */
  * {
    touch-action: manipulation;
  }
}
</style>