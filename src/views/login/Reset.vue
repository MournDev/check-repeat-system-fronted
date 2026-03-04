<template>
  <div class="reset-container">
    <!-- 背景图 -->
    <div class="background-wrapper">
      <div class="background-overlay"></div>
    </div>

    <div class="reset-content">
      <el-card class="reset-card">
        <div class="card-header">
          <h2 class="reset-title">找回密码</h2>
          <p class="reset-subtitle">通过邮箱或手机号重置账户密码</p>
        </div>

        <el-form :model="resetForm" :rules="resetRules" ref="resetFormRef" label-width="0">
          <el-form-item prop="username">
            <el-input 
              v-model="resetForm.username" 
              placeholder="请输入用户名" 
              size="large"
              :prefix-icon="User"
              clearable 
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input 
              v-model="resetForm.email" 
              placeholder="请输入邮箱（用于身份验证）" 
              size="large"
              :prefix-icon="Message"
              clearable 
            />
          </el-form-item>

          <el-form-item prop="newPassword">
            <el-input 
              v-model="resetForm.newPassword" 
              type="password" 
              placeholder="请输入新密码" 
              size="large"
              :prefix-icon="Lock"
              show-password 
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="resetForm.confirmPassword" 
              type="password" 
              placeholder="请确认新密码" 
              size="large"
              :prefix-icon="Lock"
              show-password 
            />
          </el-form-item>

          <el-form-item>
            <el-button 
              :loading="loading" 
              type="primary" 
              class="reset-btn" 
              @click="handleReset"
              size="large"
            >
              {{ loading ? '重置中...' : '重置密码' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="reset-footer">
          <el-button type="text" @click="goLogin" class="login-link">
            已有账号，去登录
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { forgetPassword } from '@/api/login'

const router = useRouter()
const resetFormRef = ref(null)
const loading = ref(false)

const resetForm = ref({
  username: '',
  email: '',
  newPassword: '',
  confirmPassword: ''
})

const resetRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱用于身份验证', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' }, 
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleReset = async () => {
  try {
    console.log('开始重置密码验证...')
    await resetFormRef.value.validate()
    loading.value = true

    console.log('表单验证通过，准备调用接口...')
    
    // 构建请求数据
    const payload = {
      username: resetForm.value.username,
      email: resetForm.value.email,
      newPassword: resetForm.value.newPassword
    }

    console.log('调用忘记密码接口，数据:', payload)
    
    // 调用忘记密码接口
    const res = await forgetPassword(payload)
    console.log('重置密码成功，响应:', res.data)

    ElMessage.success('密码重置成功，请使用新密码登录')
    
    // 延迟跳转，让用户看到成功消息
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 1500)
    
  } catch (err) {
    console.error('重置密码失败：', err)
    
    // 更精确的错误处理
    if (err?.response?.status === 404) {
      ElMessage.error('用户不存在或邮箱不匹配')
    } else if (err?.response?.status === 400) {
      ElMessage.error('请求参数错误，请检查输入')
    } else if (err?.message && !err.message.includes('validation')) {
      ElMessage.error(err.message || '重置失败，请重试')
    }
    // 表单验证错误不显示额外提示
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push({ name: 'Login' })
}
</script>

<style lang="scss" scoped>
.reset-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
}

.background-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.8) 0%,
    rgba(118, 75, 162, 0.8) 100%
  );
}

.reset-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 450px;
  padding: 0 20px;
}

.reset-card {
  width: 100%;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  
  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.reset-title {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.reset-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 400;
}

:deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

.reset-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.reset-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f2f6;
}

.login-link {
  color: #667eea;
  font-weight: 500;
  
  &:hover {
    color: #764ba2;
  }
}

// 响应式设计
@media (max-width: 480px) {
  .reset-content {
    max-width: 350px;
    padding: 0 15px;
  }
  
  .reset-card {
    padding: 2rem 1.5rem;
  }
  
  .reset-title {
    font-size: 1.5rem;
  }
}
</style>