<template>
  <div class="admin-dashboard">
    <!-- 页面标题和快速操作 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-left">
          <h1 class="welcome-title">系统概览</h1>
          <p class="welcome-subtitle">欢迎回来，{{ userStore.userInfo?.realName || '管理员' }}！这里是系统管理中心</p>
        </div>
        <div class="welcome-actions">
          <button class="primary-button" @click="goToUserManagement">
            <el-icon><UserFilled /></el-icon>
            用户管理
          </button>
          <button class="secondary-button" @click="goToSchoolOverview">
            <el-icon><DataAnalysis /></el-icon>
            全校概览
          </button>
          <button class="secondary-button" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </button>
        </div>
      </div>
    </div>

    <!-- 系统统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon user-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon paper-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalPapers || 0 }}</div>
          <div class="stat-label">总论文数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon unassigned-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.unassignedCount || 0 }}</div>
          <div class="stat-label">待分配</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon health-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.systemHealth || 0 }}%</div>
          <div class="stat-label">系统健康度</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧：系统监控 -->
      <div class="main-left">
        <!-- 系统监控 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon><Monitor /></el-icon>
              系统监控
            </div>
            <div class="monitor-status">
              <span class="status-badge success">
                <el-icon><SuccessFilled /></el-icon>
                运行正常
              </span>
            </div>
          </div>
          
          <div class="monitor-content">
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-value">{{ systemMonitorData.cpuUsage }}%</div>
                <div class="metric-label">CPU使用率</div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: systemMonitorData.cpuUsage + '%' }"></div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-value">{{ formatMemory(systemMonitorData.memoryUsage) }}</div>
                <div class="metric-label">内存使用</div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: systemMonitorData.memoryUsage + '%' }"></div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-value">{{ systemMonitorData.todayVisits }}</div>
                <div class="metric-label">今日访问</div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: Math.min(100, systemMonitorData.todayVisits / 2) + '%' }"></div>
                </div>
              </div>
            </div>
            
            <div class="server-info">
              <h4>服务器信息</h4>
              <div class="server-details">
                <div class="server-detail-item">
                  <span class="detail-label">系统版本</span>
                  <span class="detail-value">{{ systemMonitorData.systemVersion }}</span>
                </div>
                <div class="server-detail-item">
                  <span class="detail-label">运行时间</span>
                  <span class="detail-value">{{ systemMonitorData.uptime }}</span>
                </div>
                <div class="server-detail-item">
                  <span class="detail-label">数据库</span>
                  <span class="detail-value">{{ systemMonitorData.database }}</span>
                </div>
                <div class="server-detail-item">
                  <span class="detail-label">最后备份</span>
                  <span class="detail-value">{{ systemMonitorData.lastBackup }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：数据统计和快速操作 -->
      <div class="main-right">
        <!-- 用户分布 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon><PieChart /></el-icon>
              用户分布
            </div>
          </div>
          
          <div class="users-distribution">
            <div class="distribution-item">
              <div class="dist-info">
                <div class="dist-value">{{ userDistribution.students }}</div>
                <div class="dist-label">学生</div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill student" :style="{ width: safePercent(userDistribution.students, userDistribution.total) + '%' }"></div>
              </div>
            </div>
            <div class="distribution-item">
              <div class="dist-info">
                <div class="dist-value">{{ userDistribution.teachers }}</div>
                <div class="dist-label">教师</div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill teacher" :style="{ width: safePercent(userDistribution.teachers, userDistribution.total) + '%' }"></div>
              </div>
            </div>
            <div class="distribution-item">
              <div class="dist-info">
                <div class="dist-value">{{ userDistribution.admins }}</div>
                <div class="dist-label">管理员</div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill admin" :style="{ width: safePercent(userDistribution.admins, userDistribution.total) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <el-icon><Operation /></el-icon>
              快速操作
            </div>
          </div>
          
          <div class="action-buttons">
            <button 
              class="action-button primary"
              @click="goToUserManagement"
            >
              <el-icon><UserFilled /></el-icon>
              用户管理
            </button>
            <button 
              class="action-button"
              @click="goToAdvisorAssign"
            >
              <el-icon><Connection /></el-icon>
              导师分配
            </button>
            <button 
              class="action-button"
              @click="goToSystemConfig"
            >
              <el-icon><Setting /></el-icon>
              系统配置
            </button>
            <button 
              class="action-button"
              @click="goToLogCenter"
            >
              <el-icon><Document /></el-icon>
              日志中心
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 导入管理员API
import { getDashboardStats, getRecentActivities } from '@/api/admin/dashboard'
import { getUserList } from '@/api/admin/users'
import { getPaperList } from '@/api/admin/papers'
import { getAssignmentStats } from '@/api/admin/assignment'

// 图标引入
import {
  UserFilled, Refresh, User, Document, Connection, TrendCharts,
  List, More, CollectionTag, Clock, Check, Monitor, SuccessFilled,
  PieChart, Operation, Setting, Histogram, DataAnalysis
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const stats = ref({})
const userDistribution = ref({ total: 0, students: 0, teachers: 0, admins: 0 })
const systemMonitorData = ref({
  cpuUsage: 0,
  memoryUsage: 0,
  todayVisits: 0,
  systemVersion: '',
  uptime: '',
  database: '',
  lastBackup: ''
})

// 安全计算百分比，避免除以 0 或产生 NaN
const safePercent = (count, total) => {
  const t = Number(total) || 0
  const c = Number(count) || 0
  if (t <= 0 || !isFinite(t) || !isFinite(c)) return 0
  const p = Math.max(0, Math.min(100, (c / t) * 100))
  return Math.round(p * 100) / 100
}

// 方法
const refreshData = async () => {
  try {
    await loadDashboardData()
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  }
}

const loadDashboardData = async () => {
  try {
    // 并行加载多个API数据
    const [
      statsResponse, 
      assignmentStatsResponse, 
      usersResponse, 
      papersResponse
    ] = await Promise.all([
      getDashboardStats(),
      getAssignmentStats(),
      getUserList({ page: 1, size: 500 }),
      getPaperList({ page: 1, size: 1 })
    ])

    // 处理统计数据
    stats.value = {
      totalUsers: statsResponse.data.totalUsers ?? 0,
      totalPapers: statsResponse.data.validPapers ?? 0,
      validPapers: statsResponse.data.validPapers ?? 0,
      unassignedCount: statsResponse.data.pendingPapers ?? 0,
      systemHealth: statsResponse.data.systemMonitor?.healthScore ?? 95
    }

    // 处理用户分布
    const allUsers = usersResponse.data.list || []
    const totalUsers = usersResponse.data.total ?? allUsers.length ?? statsResponse.data.totalUsers ?? 0
    userDistribution.value = {
      total: Number(totalUsers) || allUsers.length || statsResponse.data.totalUsers || 0,
      students: Number(statsResponse.data.students ?? allUsers.filter(user => user.roleCode === 'STUDENT').length) || 0,
      teachers: Number(statsResponse.data.teachers ?? allUsers.filter(user => user.roleCode === 'TEACHER').length) || 0,
      admins: Number(statsResponse.data.admins ?? allUsers.filter(user => user.roleCode === 'ADMIN').length) || 0
    }

    // 调试：打印接口返回的原始数据
    console.log('Dashboard Stats Response:', statsResponse)
    console.log('System Monitor data:', statsResponse.data.systemMonitor)
    
    // 从stats接口获取系统监控数据
    const monitorData = statsResponse.data.systemMonitor || {}
    systemMonitorData.value = {
      cpuUsage: monitorData.cpuUsage !== undefined ? Math.round(monitorData.cpuUsage * 100) : 0,
      memoryUsage: monitorData.memoryUsage !== undefined ? monitorData.memoryUsage : 0,
      todayVisits: statsResponse.data.totalUsers || 0, // 使用总用户数作为访问参考
      systemVersion: 'v2.1.0',
      uptime: monitorData.uptime || '未知',
      database: 'MySQL 8.0',
      lastBackup: '2小时前'
    }
    
    // 调试：打印处理后的数据
    console.log('Processed system monitor data:', systemMonitorData.value)

  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
    
    // 使用模拟数据作为降级方案
    stats.value = {
      totalUsers: 156,
      totalPapers: 89,
      unassignedCount: 12,
      systemHealth: 95
    }
    
    userDistribution.value = {
      total: 156,
      students: 120,
      teachers: 30,
      admins: 6
    }
    
    systemMonitorData.value = {
      cpuUsage: 65,
      memoryUsage: 45,
      todayVisits: 156,
      systemVersion: 'v2.1.0',
      uptime: '15天',
      database: 'MySQL 8.0',
      lastBackup: '2小时前'
    }
  }
}

const goToUserManagement = () => {
  router.push('/admin/user-management')
}

const goToAdvisorAssign = () => {
  router.push('/admin/paper-assignment')
}

const goToSystemConfig = () => {
  router.push('/admin/system-config')
}

const goToLogCenter = () => {
  router.push('/admin/log-center')
}

const goToSchoolOverview = () => {
  router.push('/admin/school-overview')
}

// 待办相关功能已移除

const formatTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const target = new Date(date)
  
  if (now.toDateString() === target.toDateString()) {
    return target.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return target.toLocaleDateString('zh-CN')
  }
}

const formatMemory = (usage) => {
  // 根据实际数据格式调整显示
  console.log('Formatting memory usage:', usage)
  if (usage === 0 || usage === undefined) {
    return '0.0GB'
  } else {
    // 直接显示GB数值
    return `${usage.toFixed(1)}GB`
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style lang="scss" scoped>
// 全局样式
.admin-dashboard {
  padding: 24px;
  min-height: 100vh;
  background: #f8fafc; // Slate-50
  color: #0f172a; // Slate-900
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 欢迎区域
.welcome-section {
  margin-bottom: 32px;
  
  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    
    .welcome-left {
      
      .welcome-title {
        font-size: 2rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 8px 0;
        line-height: 1.2;
      }
      
      .welcome-subtitle {
        font-size: 1rem;
        color: #64748b;
        margin: 0;
      }
    }
    
    .welcome-actions {
      display: flex;
      gap: 12px;
    }
  }
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    border-color: #cbd5e1;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    
    &.user-icon {
      background: #f0f9ff;
      color: #0ea5e9;
    }
    
    &.paper-icon {
      background: #fef3c7;
      color: #f59e0b;
    }
    
    &.unassigned-icon {
      background: #d1fae5;
      color: #10b981;
    }
    
    &.health-icon {
      background: #ede9fe;
      color: #8b5cf6;
    }
  }
  
  .stat-content {
    flex: 1;
    
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }
  }
}

// 主要内容区域
.main-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

// 通用卡片样式
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    border-color: #cbd5e1;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f172a;
      
      .el-icon {
        color: #64748b;
      }
    }
  }
}

// 系统监控
.monitor-content {
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .metric-item {
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    
    .metric-label {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 12px;
    }
  }
  
  .server-info {
    margin-top: 24px;
    
    h4 {
      margin: 0 0 16px 0;
      color: #0f172a;
      font-weight: 600;
    }
    
    .server-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .server-detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      
      .detail-label {
        color: #64748b;
        font-size: 0.875rem;
      }
      
      .detail-value {
        color: #0f172a;
        font-weight: 500;
      }
    }
  }
}

// 用户分布
.users-distribution {
  .distribution-item {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .dist-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .dist-value {
        font-size: 1.125rem;
        font-weight: 700;
        color: #0f172a;
      }
      
      .dist-label {
        color: #64748b;
        font-size: 0.875rem;
      }
    }
  }
}

// 快速操作
.action-buttons {
  display: grid;
  gap: 12px;
  
  .action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(15, 23, 42, 0.1);
    }
    
    &.primary {
      background: #1e40af;
      color: white;
      
      &:hover {
        background: #1e3a8a;
      }
    }
    
    &:not(.primary) {
      background: #f8fafc;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      
      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
    }
    
    .el-icon {
      font-size: 16px;
    }
  }
}

// 进度条
.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
    
    &:not(.student):not(.teacher):not(.admin) {
      background: #0ea5e9;
    }
    
    &.student {
      background: #667eea;
    }
    
    &.teacher {
      background: #f5576c;
    }
    
    &.admin {
      background: #10b981;
    }
  }
}

// 状态标签
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  
  &.success {
    background: #d1fae5;
    color: #10b981;
  }
  
  .el-icon {
    font-size: 14px;
  }
}

// 按钮样式
.primary-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  background: #1e40af;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1e3a8a;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(30, 64, 175, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .el-icon {
    font-size: 16px;
  }
}

.secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .el-icon {
    font-size: 16px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 16px;
  }
  
  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .welcome-actions {
    width: 100%;
    
    .primary-button,
    .secondary-button {
      flex: 1;
      justify-content: center;
    }
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .server-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-title {
    font-size: 1.5rem !important;
  }
  
  .card {
    padding: 20px;
  }
}
</style>