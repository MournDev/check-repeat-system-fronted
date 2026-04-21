<template>
  <div class="auth-page">
    <!-- 左侧：角色视觉区 -->
    <div class="left-panel">
      <div class="left-top">
        <div class="brand-mark">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="white" fill-opacity="0.15" />
            <path d="M7 14L12 9L17 14L12 19L7 14Z" fill="white" fill-opacity="0.9" />
            <path d="M13 14L18 9L21 12V16L18 19L13 14Z" fill="white" fill-opacity="0.5" />
          </svg>
        </div>
        <span class="brand-name">论文查重系统</span>
      </div>

      <div class="characters-area">
        <AnimatedCharacters
          :page-type="pageType"
          :is-typing="isTyping"
          :show-password="showPassword"
          :password-length="passwordLength"
          :is-error="isError"
        />
      </div>

      <!-- 底部链接已移除 -->

      <div class="decor-blur decor-blur-1"></div>
      <div class="decor-blur decor-blur-2"></div>
      <div class="decor-grid"></div>
    </div>

    <!-- 右侧：表单区 -->
    <div class="right-panel">
      <div class="form-wrapper">
        <div class="mobile-logo">
          <div class="mobile-logo-icon">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path d="M7 14L12 9L17 14L12 19L7 14Z" fill="#1E40AF" fill-opacity="0.9" />
              <path d="M13 14L18 9L21 12V16L18 19L13 14Z" fill="#3B82F6" fill-opacity="0.7" />
            </svg>
          </div>
          <span>论文查重系统</span>
        </div>

        <div class="form-header">
          <h1 class="form-title">{{ title }}</h1>
          <p class="form-subtitle">
            {{ subtitle }}
          </p>
        </div>

        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AnimatedCharacters from '@/components/animated-characters/AnimatedCharacters.vue'

interface AuthLayoutProps {
  pageType?: 'login' | 'register' | 'reset';
  title?: string;
  subtitle?: string;
  isTyping?: boolean;
  showPassword?: boolean;
  passwordLength?: number;
  isError?: boolean;
}

const props = withDefaults(defineProps<AuthLayoutProps>(), {
  pageType: 'login',
  title: '登录到工作台',
  subtitle: '统一接入学生论文管理系统',
  isTyping: false,
  showPassword: false,
  passwordLength: 0,
  isError: false,
})
</script>

<style lang="scss" scoped>
.auth-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;

    .left-panel {
      display: none;
    }

    .mobile-logo {
      display: flex;
    }
  }
}

/* 左侧面板 */
.left-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  background: linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%);
  overflow: hidden;
}

.left-top {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}

.brand-name {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}

.characters-area {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 500px;
}

.left-footer {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 24px;
}

.footer-link {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;

  &:hover {
    color: rgba(255, 255, 255, 0.85);
  }
}

.decor-blur {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.decor-blur-1 {
  top: 15%;
  right: 10%;
  width: 300px;
  height: 300px;
  background: rgba(59, 130, 246, 0.25);
  filter: blur(80px);
}

.decor-blur-2 {
  bottom: 10%;
  left: 5%;
  width: 400px;
  height: 400px;
  background: rgba(30, 64, 175, 0.3);
  filter: blur(100px);
}

.decor-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 1;
}

/* 右侧面板 */
.right-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: #ffffff;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

.mobile-logo {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 48px;
}

.mobile-logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.form-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .right-panel {
    padding: 20px;
  }

  .form-title {
    font-size: 22px;
  }
}
</style>
