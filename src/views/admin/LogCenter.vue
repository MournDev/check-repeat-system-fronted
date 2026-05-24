<template>
  <div class="log-center">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">智能运维中心</h1>
        <p class="page-desc">系统监控、日志分析和智能预警</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="refreshLogs">刷新数据</el-button>
        <el-button :icon="Setting" @click="showAlertConfig">预警设置</el-button>
        <el-button :icon="Download" @click="exportLogs">导出日志</el-button>
      </div>
    </div>

    <!-- 实时监控概览 -->
    <el-row :gutter="16" class="monitor-cards">
      <el-col :xs="12" :sm="6">
        <el-card class="monitor-card" shadow="never">
          <div class="monitor-content">
            <div class="monitor-icon bg-success"><el-icon><User /></el-icon></div>
            <div class="monitor-info">
              <div class="monitor-value">{{ realtimeStats.onlineUsers }}</div>
              <div class="monitor-label">在线用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="monitor-card" shadow="never">
          <div class="monitor-content">
            <div class="monitor-icon bg-warning"><el-icon><Warning /></el-icon></div>
            <div class="monitor-info">
              <div class="monitor-value">{{ realtimeStats.warningCount }}</div>
              <div class="monitor-label">警告事件</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="monitor-card" shadow="never">
          <div class="monitor-content">
            <div class="monitor-icon bg-danger"><el-icon><CircleClose /></el-icon></div>
            <div class="monitor-info">
              <div class="monitor-value">{{ realtimeStats.errorCount }}</div>
              <div class="monitor-label">错误事件</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="monitor-card" shadow="never">
          <div class="monitor-content">
            <div class="monitor-icon bg-info"><el-icon><DataLine /></el-icon></div>
            <div class="monitor-info">
              <div class="monitor-value">{{ realtimeStats.systemLoad }}</div>
              <div class="monitor-label">系统负载</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 智能预警 -->
    <el-card class="alert-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title"><el-icon><Bell /></el-icon>智能预警</span>
          <el-switch v-model="alertEnabled" active-text="启用预警" inactive-text="关闭预警" />
        </div>
      </template>
      <div class="alerts-container">
        <div v-for="alert in activeAlerts" :key="alert.id" class="alert-item" :class="`alert-${alert.severity}`">
          <div class="alert-icon">
            <el-icon v-if="alert.severity === 'high' || alert.severity === 'critical'"><CircleCloseFilled /></el-icon>
            <el-icon v-else-if="alert.severity === 'medium'"><WarningFilled /></el-icon>
            <el-icon v-else><InfoFilled /></el-icon>
          </div>
          <div class="alert-content">
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-time">{{ formatDate(alert.triggerTime) }}</div>
          </div>
          <div class="alert-actions">
            <el-button size="small" type="primary" link @click="handleProcessAlert(alert)">处理</el-button>
            <el-button size="small" link @click="dismissAlert(alert.id)">忽略</el-button>
          </div>
        </div>
        <div v-if="activeAlerts.length === 0" class="no-alerts">
          <el-empty description="暂无预警信息" :image-size="80" />
        </div>
      </div>
    </el-card>

    <!-- 日志分类展示 -->
    <el-tabs v-model="activeTab" class="log-tabs" @tab-change="onTabChange">
      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="operation">
        <el-card shadow="never">
          <template #header>
            <div class="tab-header">
              <div class="header-filters">
                <el-date-picker
                  v-model="operationFilters.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 240px"
                />
                <el-select v-model="operationFilters.userType" placeholder="用户类型" clearable style="width: 120px">
                  <el-option label="学生" value="STUDENT" />
                  <el-option label="教师" value="TEACHER" />
                  <el-option label="管理员" value="ADMIN" />
                </el-select>
                <el-select v-model="operationFilters.module" placeholder="功能模块" clearable style="width: 140px" @change="onModuleChange">
                  <el-option
                    v-for="m in operationModules"
                    :key="m.value"
                    :label="m.label"
                    :value="m.value"
                  />
                </el-select>
                <el-select v-model="operationFilters.operationType" placeholder="操作类型" clearable filterable style="width: 180px">
                  <el-option
                    v-for="op in filteredOperationTypes"
                    :key="op.value"
                    :label="op.label"
                    :value="op.value"
                  />
                </el-select>
                <el-input v-model="operationFilters.keyword" placeholder="搜索用户/描述" clearable style="width: 180px" @keyup.enter="loadOperationLogs" />
                <el-button type="primary" :icon="Search" @click="loadOperationLogs">查询</el-button>
                <el-button @click="resetOperationFilters">重置</el-button>
              </div>
            </div>
          </template>

          <el-table :data="operationLogs" style="width: 100%" v-loading="operationLoading" stripe>
            <el-table-column prop="operationTime" label="操作时间" min-width="170">
              <template #default="{ row }">{{ formatDate(row.operationTime) }}</template>
            </el-table-column>
            <el-table-column prop="userName" label="操作用户" min-width="120" />
            <el-table-column prop="userType" label="用户类型" min-width="100">
              <template #default="{ row }">
                <el-tag :type="getUserTypeTag(row.userType)" size="small">{{ getUserTypeName(row.userType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operationType" label="操作类型" min-width="160">
              <template #default="{ row }">
                <el-tag size="small" :type="getOperationTag(row.operationType)">{{ getOperationName(row.operationType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="操作描述" min-width="180" show-overflow-tooltip />
            <el-table-column prop="ipAddress" label="IP地址" min-width="140" />
            <el-table-column prop="status" label="状态" min-width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="详情" width="80" align="center">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="viewLogDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="operationPagination.pageNum"
              v-model:page-size="operationPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="operationPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadOperationLogs"
              @current-change="loadOperationLogs"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 登录日志 -->
      <el-tab-pane label="登录日志" name="login">
        <el-card shadow="never">
          <template #header>
            <div class="tab-header">
              <div class="header-filters">
                <el-date-picker
                  v-model="loginFilters.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 240px"
                />
                <el-input v-model="loginFilters.ip" placeholder="IP地址" clearable style="width: 150px" />
                <el-button type="primary" :icon="Search" @click="loadLoginLogs">查询</el-button>
              </div>
            </div>
          </template>

          <el-table :data="loginLogs" style="width: 100%" v-loading="loginLoading" stripe>
            <el-table-column prop="loginTime" label="登录时间" min-width="170">
              <template #default="{ row }">{{ formatDate(row.loginTime) }}</template>
            </el-table-column>
            <el-table-column prop="username" label="用户名" min-width="120" />
            <el-table-column prop="loginIp" label="登录IP" min-width="140" />
            <el-table-column prop="loginLocation" label="登录地点" min-width="140" />
            <el-table-column prop="loginDevice" label="登录设备" min-width="140" show-overflow-tooltip />
            <el-table-column prop="loginResult" label="登录结果" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.loginResult === 1 ? 'success' : 'danger'" size="small">
                  {{ row.loginResult === 1 ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="failReason" label="失败原因" min-width="150" show-overflow-tooltip />
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="loginPagination.pageNum"
              v-model:page-size="loginPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="loginPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadLoginLogs"
              @current-change="loadLoginLogs"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 性能监控 -->
      <el-tab-pane label="性能监控" name="performance">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header><span>响应时间趋势</span></template>
              <div class="chart-container">
                <div id="response-time-chart" style="width: 100%; height: 300px;"></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <template #header><span>资源使用率</span></template>
              <div class="resource-stats">
                <div class="resource-item">
                  <div class="resource-label">
                    <span>CPU使用率</span>
                    <span class="resource-value">{{ resourceUsage.cpu }}%</span>
                  </div>
                  <el-progress :percentage="resourceUsage.cpu" :status="resourceUsage.cpu > 80 ? 'exception' : 'success'" />
                </div>
                <div class="resource-item">
                  <div class="resource-label">
                    <span>内存使用率</span>
                    <span class="resource-value">{{ resourceUsage.memory }}%</span>
                  </div>
                  <el-progress :percentage="resourceUsage.memory" :status="resourceUsage.memory > 80 ? 'exception' : 'warning'" />
                </div>
                <div class="resource-item">
                  <div class="resource-label">
                    <span>磁盘使用率</span>
                    <span class="resource-value">{{ resourceUsage.disk }}%</span>
                  </div>
                  <el-progress :percentage="resourceUsage.disk" :status="resourceUsage.disk > 80 ? 'exception' : ''" />
                </div>
                <div class="resource-item">
                  <div class="resource-label">
                    <span>数据库连接池</span>
                    <span class="resource-value">{{ resourceUsage.dbConnections }}%</span>
                  </div>
                  <el-progress :percentage="resourceUsage.dbConnections" :status="resourceUsage.dbConnections > 80 ? 'exception' : 'info'" />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 安全日志 -->
      <el-tab-pane label="安全日志" name="security">
        <el-card shadow="never">
          <template #header>
            <div class="tab-header">
              <div class="header-filters">
                <el-date-picker
                  v-model="securityFilters.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 240px"
                />
                <el-select v-model="securityFilters.eventType" placeholder="事件类型" clearable style="width: 150px">
                  <el-option label="登录失败" value="login_failed" />
                  <el-option label="登录成功" value="login_success" />
                </el-select>
                <el-button type="primary" :icon="Search" @click="loadSecurityLogs">查询</el-button>
              </div>
            </div>
          </template>

          <el-table :data="securityLogs" style="width: 100%" v-loading="securityLoading" stripe>
            <el-table-column prop="timestamp" label="时间" min-width="170">
              <template #default="{ row }">{{ formatDate(row.timestamp) }}</template>
            </el-table-column>
            <el-table-column prop="eventType" label="事件类型" min-width="120">
              <template #default="{ row }">
                <el-tag :type="getSecurityEventTag(row.eventType)" size="small">{{ getSecurityEventName(row.eventType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名" min-width="120" />
            <el-table-column prop="ipAddress" label="来源IP" min-width="140" />
            <el-table-column prop="location" label="地理位置" min-width="140" />
            <el-table-column prop="riskLevel" label="风险等级" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getRiskLevelTag(row.riskLevel)" size="small">{{ getRiskLevelName(row.riskLevel) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="事件描述" min-width="200" show-overflow-tooltip />
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="securityPagination.pageNum"
              v-model:page-size="securityPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="securityPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadSecurityLogs"
              @current-change="loadSecurityLogs"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 告警配置对话框 -->
    <el-dialog
      v-model="alertConfigVisible"
      title="预警规则设置"
      width="900px"
      destroy-on-close
    >
      <div class="alert-config-header">
        <el-button type="primary" :icon="Plus" @click="openAddRuleForm">
          添加规则
        </el-button>
        <el-tag type="info" size="small" style="margin-left: 12px">
          共 {{ alertRules.length }} 条规则
        </el-tag>
      </div>

      <el-table
        :data="alertRules"
        v-loading="alertConfigLoading"
        style="margin-top: 16px"
        empty-text="暂无告警规则，请点击上方按钮添加"
      >
        <el-table-column prop="ruleName" label="规则名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            {{ getRuleTypeName(row.ruleType) }}
          </template>
        </el-table-column>
        <el-table-column prop="metricName" label="指标" width="100" />
        <el-table-column label="阈值" width="90">
          <template #default="{ row }">
            {{ row.threshold }}{{ row.ruleType === 'CPU' || row.ruleType === 'MEMORY' || row.ruleType === 'DISK' ? '%' : '次' }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="持续(s)" width="80" />
        <el-table-column label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="getSeverityTag(row.severity)" size="small">
              {{ getSeverityName(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="70" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.enabled"
              size="small"
              @change="handleToggleRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="notifyEmail" label="通知邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditRuleForm(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDeleteRule(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="alertConfigVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 告警规则表单子对话框 -->
    <el-dialog
      v-model="ruleFormVisible"
      :title="ruleFormTitle"
      width="520px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="ruleForm" label-width="90px">
        <el-form-item label="规则名称" required>
          <el-input v-model="ruleForm.ruleName" placeholder="如：CPU过载预警" maxlength="64" />
        </el-form-item>
        <el-form-item label="规则类型" required>
          <el-select v-model="ruleForm.ruleType" style="width: 100%">
            <el-option
              v-for="opt in ruleTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="指标名称">
          <el-input v-model="ruleForm.metricName" placeholder="如：CPU使用率" maxlength="64" />
        </el-form-item>
        <el-form-item label="阈值" required>
          <el-input-number
            v-model="ruleForm.threshold"
            :min="1"
            :max="99999"
            :precision="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="持续时间(s)">
          <el-input-number
            v-model="ruleForm.duration"
            :min="0"
            :max="86400"
            style="width: 100%"
          />
          <span class="form-tip">连续超过阈值多久后触发告警</span>
        </el-form-item>
        <el-form-item label="严重级别">
          <el-select v-model="ruleForm.severity" style="width: 100%">
            <el-option
              v-for="opt in severityOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="ruleForm.enabled" />
        </el-form-item>
        <el-form-item label="通知邮箱">
          <el-input v-model="ruleForm.notifyEmail" placeholder="告警时发送通知的邮箱" maxlength="128" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="2"
            placeholder="规则说明"
            maxlength="256"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ruleFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRuleForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="操作日志详情" width="600px">
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="操作时间">{{ formatDate(currentLog.operationTime) }}</el-descriptions-item>
          <el-descriptions-item label="操作用户">{{ currentLog.userName }}</el-descriptions-item>
          <el-descriptions-item label="用户类型">{{ getUserTypeName(currentLog.userType) }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">{{ getOperationName(currentLog.operationType) }}</el-descriptions-item>
          <el-descriptions-item label="操作描述">{{ currentLog.description }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentLog.ipAddress }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentLog.status === 1 ? 'success' : 'danger'">
              {{ currentLog.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentLog.requestParams" label="请求参数">
            <span style="word-break: break-all; font-size: 0.875rem;">{{ currentLog.requestParams }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getOperationLogs, exportOperationLogs, getLoginLogs,
  getSecurityLogs, getRealtimeStats, getActiveAlerts, handleAlert,
  getAlertConfig, updateAlertConfig, deleteAlertRule, toggleAlertRule,
  getResourceUsage, getApiResponseTimes
} from '@/api/v1/admin/logs'
import * as echarts from 'echarts'
import {
  Refresh, Setting, Download, Search, User, Warning, CircleClose,
  DataLine, Bell, CircleCloseFilled, WarningFilled, InfoFilled, Plus
} from '@element-plus/icons-vue'

// ==================== 操作类型字典 ====================
const OPERATION_MODULES = [
  {
    value: 'auth', label: '用户认证',
    types: [
      { value: 'user_login', label: '用户登录' },
      { value: 'user_logout', label: '用户登出' },
      { value: 'user_register', label: '用户注册' },
      { value: 'user_change_password', label: '修改密码' },
      { value: 'user_update_info', label: '更新个人信息' },
      { value: 'user_upload_avatar', label: '上传头像' },
      { value: 'user_login_history', label: '查询登录历史' },
      { value: 'user_send_verify_email', label: '发送验证邮件' },
      { value: 'user_verify_email', label: '验证邮箱' },
      { value: 'user_send_email_code', label: '发送邮箱验证码' },
      { value: 'user_update_email', label: '更新邮箱' }
    ]
  },
  {
    value: 'student', label: '学生论文',
    types: [
      { value: 'student_paper_submit', label: '论文提交' },
      { value: 'student_paper_update', label: '论文更新' },
      { value: 'student_paper_withdraw', label: '论文撤回' },
      { value: 'student_paper_resubmit', label: '论文重新提交' },
      { value: 'student_paper_modify_request', label: '论文修改请求' },
      { value: 'student_paper_batch_delete', label: '批量删除论文' },
      { value: 'student_paper_batch_download', label: '批量下载论文' },
      { value: 'student_attachment_upload', label: '附件上传' },
      { value: 'student_attachment_delete', label: '附件删除' },
      { value: 'add_student', label: '添加学生' },
      { value: 'delete_student', label: '删除学生' },
      { value: 'batch_delete_student', label: '批量删除学生' },
      { value: 'import_students', label: '导入学生' },
      { value: 'export_students', label: '导出学生' },
      { value: 'contact_student', label: '联系学生' },
      { value: 'send_reminder', label: '发送提醒' }
    ]
  },
  {
    value: 'check', label: '查重任务',
    types: [
      { value: 'check_task_create', label: '创建查重任务' },
      { value: 'check_task_cancel', label: '取消查重任务' },
      { value: 'check_task_list', label: '查询任务列表' },
      { value: 'check_task_detail', label: '查询任务详情' },
      { value: 'check_task_by_id', label: '按ID查询任务' },
      { value: 'check_task_delete', label: '删除查重任务' },
      { value: 'check_task_recheck', label: '重新查重' },
      { value: 'check_task_batch_create', label: '批量创建任务' },
      { value: 'check_task_status', label: '查询任务状态' },
      { value: 'recheck_plagiarism', label: '重新查重检测' }
    ]
  },
  {
    value: 'teacher', label: '教师管理',
    types: [
      { value: 'teacher_allocation_create', label: '创建教师分配' },
      { value: 'teacher_allocation_revoke', label: '撤销教师分配' },
      { value: 'teacher_allocation_batch_create', label: '批量教师分配' },
      { value: 'teacher_batch_review', label: '批量审核' },
      { value: 'teacher_paper_review', label: '论文审核' },
      { value: 'teacher_change_password', label: '教师修改密码' },
      { value: 'teacher_get_info', label: '获取教师信息' },
      { value: 'teacher_update_info', label: '更新教师信息' },
      { value: 'teacher_confirm_assignment', label: '确认分配' },
      { value: 'teacher_reject_assignment', label: '拒绝分配' },
      { value: 'paper_review', label: '论文评阅' },
      { value: 'send_message', label: '发送消息' },
      { value: 'batch_send_message', label: '批量发送消息' },
      { value: 'delegate_review', label: '委托审核' },
      { value: 'assign_advisor', label: '分配导师' },
      { value: 'batch_assign_advisor', label: '批量分配导师' }
    ]
  },
  {
    value: 'admin', label: '管理员操作',
    types: [
      { value: 'admin_user_create', label: '创建用户' },
      { value: 'admin_user_update', label: '更新用户' },
      { value: 'admin_user_delete', label: '删除用户' },
      { value: 'admin_user_batch_delete', label: '批量删除用户' },
      { value: 'admin_user_password_reset', label: '重置密码' },
      { value: 'admin_user_status_update', label: '更新用户状态' },
      { value: 'admin_paper_audit', label: '论文审核' },
      { value: 'admin_paper_batch_audit', label: '批量审核论文' },
      { value: 'admin_paper_delete', label: '删除论文' },
      { value: 'admin_auto_assign', label: '自动分配' },
      { value: 'admin_manual_assign', label: '手动分配' },
      { value: 'user_assign_role', label: '分配角色' }
    ]
  },
  {
    value: 'config', label: '系统配置',
    types: [
      { value: 'config_basic_update', label: '基础配置更新' },
      { value: 'config_email_update', label: '邮件配置更新' },
      { value: 'config_performance_update', label: '性能配置更新' },
      { value: 'config_plagiarism_update', label: '查重配置更新' },
      { value: 'config_security_update', label: '安全配置更新' },
      { value: 'config_save_all', label: '保存全部配置' },
      { value: 'config_get_all', label: '获取全部配置' },
      { value: 'config_refresh', label: '刷新配置' },
      { value: 'config_reset_default', label: '恢复默认配置' },
      { value: 'config_export', label: '导出配置' },
      { value: 'config_test_email', label: '测试邮件' },
      { value: 'system_param_update', label: '系统参数更新' },
      { value: 'system_param_init', label: '初始化系统参数' },
      { value: 'system_maintenance_status', label: '维护状态切换' }
    ]
  },
  {
    value: 'rule', label: '查重规则',
    types: [
      { value: 'check_rule_create', label: '创建规则' },
      { value: 'check_rule_update', label: '更新规则' },
      { value: 'check_rule_delete', label: '删除规则' },
      { value: 'check_rule_status', label: '规则状态变更' },
      { value: 'check_rule_set_default', label: '设为默认规则' }
    ]
  },
  {
    value: 'dict', label: '字典数据',
    types: [
      { value: 'dict_data_create', label: '创建字典' },
      { value: 'dict_data_update', label: '更新字典' },
      { value: 'dict_data_delete', label: '删除字典' },
      { value: 'dict_data_batch_delete', label: '批量删除字典' }
    ]
  },
  {
    value: 'role', label: '角色权限',
    types: [
      { value: 'role_create', label: '创建角色' },
      { value: 'role_update', label: '更新角色' },
      { value: 'role_delete', label: '删除角色' },
      { value: 'role_list', label: '查询角色列表' },
      { value: 'permission_tree', label: '获取权限树' }
    ]
  },
  {
    value: 'notification', label: '消息通知',
    types: [
      { value: 'notification_paper_status', label: '论文状态通知' },
      { value: 'notification_paper_review', label: '审核结果通知' },
      { value: 'notice_read', label: '标记已读' },
      { value: 'notice_batch_read', label: '批量标记已读' },
      { value: 'notice_read_all', label: '全部标记已读' },
      { value: 'notice_delete', label: '删除通知' },
      { value: 'notice_batch_delete', label: '批量删除通知' },
      { value: 'notice_clear_all', label: '清空通知' }
    ]
  },
  {
    value: 'template', label: '消息模板',
    types: [
      { value: 'message_template_create', label: '创建模板' },
      { value: 'message_template_update', label: '更新模板' },
      { value: 'message_template_delete', label: '删除模板' },
      { value: 'message_template_status', label: '模板状态变更' }
    ]
  },
  {
    value: 'auto', label: '自动分配',
    types: [
      { value: 'auto_allocation_create', label: '创建自动分配' },
      { value: 'auto_allocation_clean', label: '清理自动分配' }
    ]
  }
]

// 构建扁平化的操作类型映射
const operationTypeMap = {}
const operationTagMap = {}
OPERATION_MODULES.forEach(m => {
  m.types.forEach(t => {
    operationTypeMap[t.value] = t.label
    // 根据模块给tag着色
    const tagColors = { auth: '', student: 'primary', check: 'success', teacher: 'warning', admin: 'danger', config: 'info', rule: '', dict: 'info', role: 'warning', notification: 'success', template: '', auto: 'info' }
    operationTagMap[t.value] = tagColors[m.value] || ''
  })
})

// ==================== 响应式数据 ====================
const activeTab = ref('operation')
const operationLoading = ref(false)
const securityLoading = ref(false)
const loginLoading = ref(false)
const detailDialogVisible = ref(false)
const alertEnabled = ref(true)
const currentLog = ref(null)

const realtimeStats = ref({ onlineUsers: 0, warningCount: 0, errorCount: 0, systemLoad: '正常' })
const activeAlerts = ref([])
const resourceUsage = ref({ cpu: 0, memory: 0, disk: 0, dbConnections: 0 })
const responseTimeData = ref({ timestamps: [], responseTimes: [] })

const chartInstance = ref(null)
let updateTimer = null

// 操作日志筛选
const operationFilters = reactive({ dateRange: [], userType: '', module: '', operationType: '', keyword: '' })
const securityFilters = reactive({ dateRange: [], eventType: '' })
const loginFilters = reactive({ dateRange: [], ip: '' })

// 分页
const operationPagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })
const securityPagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })
const loginPagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const operationLogs = ref([])
const securityLogs = ref([])
const loginLogs = ref([])

// 模块列表
const operationModules = computed(() => OPERATION_MODULES.map(m => ({ value: m.value, label: m.label })))

// 根据选中的模块过滤操作类型
const filteredOperationTypes = computed(() => {
  if (!operationFilters.module) {
    // 未选择模块时显示所有操作类型
    return OPERATION_MODULES.flatMap(m => m.types)
  }
  const module = OPERATION_MODULES.find(m => m.value === operationFilters.module)
  return module ? module.types : []
})

// 模块变更时清除操作类型选择
function onModuleChange() {
  operationFilters.operationType = ''
}

function resetOperationFilters() {
  operationFilters.dateRange = []
  operationFilters.userType = ''
  operationFilters.module = ''
  operationFilters.operationType = ''
  operationFilters.keyword = ''
  operationPagination.pageNum = 1
  loadOperationLogs()
}

// ==================== 数据加载 ====================
async function refreshLogs(showMessage = true) {
  try {
    await Promise.all([
      loadOperationLogs(),
      loadSecurityLogs(),
      updateRealtimeStats(),
      loadActiveAlerts(),
      loadApiResponseTimes(),
      loadResourceUsage()
    ])
    if (showMessage) ElMessage.success('数据已刷新')
  } catch (error) {
    if (showMessage) ElMessage.error('刷新数据失败')
  }
}

function onTabChange(tab) {
  if (tab === 'login') loadLoginLogs()
  else if (tab === 'security') loadSecurityLogs()
  else if (tab === 'performance') {
    setTimeout(() => { if (!chartInstance.value) initChart() }, 300)
  }
}

const alertConfigVisible = ref(false)
const alertConfigLoading = ref(false)
const alertRules = ref([])

const ruleFormVisible = ref(false)
const ruleFormTitle = ref('')
const editingRuleId = ref(null)
const ruleForm = reactive({
  ruleName: '',
  ruleType: 'CPU',
  metricName: '',
  threshold: 80,
  duration: 60,
  severity: 'medium',
  enabled: true,
  notifyEmail: '',
  description: ''
})
const ruleTypeOptions = [
  { label: 'CPU', value: 'CPU' },
  { label: '内存', value: 'MEMORY' },
  { label: '磁盘', value: 'DISK' },
  { label: '存储', value: 'STORAGE' },
  { label: '登录失败', value: 'LOGIN_FAIL' },
  { label: '查重失败', value: 'CHECK_FAIL' }
]
const severityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '严重', value: 'critical' }
]

async function showAlertConfig() {
  alertConfigVisible.value = true
  await loadAlertRules()
}

async function loadAlertRules() {
  alertConfigLoading.value = true
  try {
    const res = await getAlertConfig()
    if (res.code === 200) {
      alertRules.value = res.data?.rules || []
    }
  } catch { ElMessage.error('获取告警配置失败') }
  finally { alertConfigLoading.value = false }
}

function openAddRuleForm() {
  ruleFormTitle.value = '添加告警规则'
  editingRuleId.value = null
  Object.assign(ruleForm, {
    ruleName: '',
    ruleType: 'CPU',
    metricName: '',
    threshold: 80,
    duration: 60,
    severity: 'medium',
    enabled: true,
    notifyEmail: '',
    description: ''
  })
  ruleFormVisible.value = true
}

function openEditRuleForm(rule) {
  ruleFormTitle.value = '编辑告警规则'
  editingRuleId.value = rule.id
  Object.assign(ruleForm, {
    ruleName: rule.ruleName || '',
    ruleType: rule.ruleType || 'CPU',
    metricName: rule.metricName || '',
    threshold: rule.threshold ?? 80,
    duration: rule.duration ?? 60,
    severity: rule.severity || 'medium',
    enabled: rule.enabled ?? true,
    notifyEmail: rule.notifyEmail || '',
    description: rule.description || ''
  })
  ruleFormVisible.value = true
}

async function submitRuleForm() {
  try {
    const payload = {
      rules: [{
        ...(editingRuleId.value ? { id: editingRuleId.value } : {}),
        ruleName: ruleForm.ruleName,
        ruleType: ruleForm.ruleType,
        metricName: ruleForm.metricName,
        threshold: ruleForm.threshold,
        duration: ruleForm.duration,
        severity: ruleForm.severity,
        enabled: ruleForm.enabled,
        notifyEmail: ruleForm.notifyEmail,
        description: ruleForm.description
      }]
    }
    const response = await updateAlertConfig(payload)
    if (response.code === 200) {
      ElMessage.success(editingRuleId.value ? '规则更新成功' : '规则创建成功')
      ruleFormVisible.value = false
      await loadAlertRules()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch { ElMessage.error('保存告警规则失败') }
}

async function handleDeleteRule(rule) {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则「${rule.ruleName}」吗？删除后不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const response = await deleteAlertRule(rule.id)
    if (response.code === 200) {
      ElMessage.success('规则已删除')
      await loadAlertRules()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除告警规则失败')
    }
  }
}

async function handleToggleRule(rule) {
  try {
    const newEnabled = !rule.enabled
    const response = await toggleAlertRule(rule.id, newEnabled)
    if (response.code === 200) {
      rule.enabled = newEnabled
      ElMessage.success(newEnabled ? '已启用' : '已禁用')
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch { ElMessage.error('切换规则状态失败') }
}

function getSeverityTag(severity) {
  const map = { low: 'info', medium: 'warning', high: 'danger', critical: '' }
  return map[severity] || 'info'
}

function getSeverityName(severity) {
  const map = { low: '低', medium: '中', high: '高', critical: '严重' }
  return map[severity] || severity
}

function getRuleTypeName(type) {
  const map = { CPU: 'CPU', MEMORY: '内存', DISK: '磁盘', STORAGE: '存储', LOGIN_FAIL: '登录失败', CHECK_FAIL: '查重失败' }
  return map[type] || type
}

async function exportLogs() {
  try {
    ElMessage.info('正在导出日志...')
    const params = {
      startDate: operationFilters.dateRange?.[0],
      endDate: operationFilters.dateRange?.[1],
      userType: operationFilters.userType,
      operationType: operationFilters.operationType,
      keyword: operationFilters.keyword
    }
    const response = await exportOperationLogs(params)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `operation-logs-${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('日志导出成功')
  } catch (error) {
    ElMessage.error('日志导出失败')
  }
}

async function updateRealtimeStats() {
  try {
    const response = await getRealtimeStats()
    if (response.code === 200) {
      realtimeStats.value = {
        onlineUsers: response.data.onlineUsers || 0,
        warningCount: response.data.warningCount || 0,
        errorCount: response.data.errorCount || 0,
        systemLoad: response.data.systemLoad || '正常'
      }
    }
  } catch (error) {
    console.error('获取实时统计失败:', error)
  }
}

async function loadOperationLogs() {
  operationLoading.value = true
  try {
    const params = {
      page: operationPagination.pageNum,
      size: operationPagination.pageSize,
      startDate: operationFilters.dateRange?.[0] || undefined,
      endDate: operationFilters.dateRange?.[1] || undefined,
      userType: operationFilters.userType || undefined,
      operationType: operationFilters.operationType || undefined,
      keyword: operationFilters.keyword || undefined
    }
    const response = await getOperationLogs(params)
    if (response.code === 200) {
      const data = response.data
      operationLogs.value = data.records || []
      operationPagination.total = Number(data.total) || 0
    }
  } catch (error) {
    ElMessage.error('加载操作日志失败')
  } finally {
    operationLoading.value = false
  }
}

async function loadLoginLogs() {
  loginLoading.value = true
  try {
    const params = {
      page: loginPagination.pageNum,
      size: loginPagination.pageSize,
      startDate: loginFilters.dateRange?.[0] || undefined,
      endDate: loginFilters.dateRange?.[1] || undefined,
      ip: loginFilters.ip || undefined
    }
    const response = await getLoginLogs(params)
    if (response.code === 200) {
      const data = response.data
      loginLogs.value = data.records || []
      loginPagination.total = Number(data.total) || 0
    }
  } catch (error) {
    ElMessage.error('加载登录日志失败')
  } finally {
    loginLoading.value = false
  }
}

async function loadSecurityLogs() {
  securityLoading.value = true
  try {
    const params = {
      page: securityPagination.pageNum,
      size: securityPagination.pageSize,
      startDate: securityFilters.dateRange?.[0] || undefined,
      endDate: securityFilters.dateRange?.[1] || undefined,
      eventType: securityFilters.eventType || undefined
    }
    const response = await getSecurityLogs(params)
    if (response.code === 200) {
      const data = response.data
      securityLogs.value = data.records || []
      securityPagination.total = Number(data.total) || 0
    }
  } catch (error) {
    ElMessage.error('加载安全日志失败')
  } finally {
    securityLoading.value = false
  }
}

// ==================== 图表 ====================
function initChart() {
  const chartDom = document.getElementById('response-time-chart')
  if (chartDom && chartDom.clientWidth > 0) {
    chartInstance.value = echarts.init(chartDom)
    updateChart()
  } else {
    setTimeout(() => initChart(), 300)
  }
}

function updateChart() {
  if (!chartInstance.value || responseTimeData.value.timestamps.length === 0) return
  const option = {
    tooltip: { trigger: 'axis', formatter: '{b}: {c}ms' },
    xAxis: { type: 'category', data: responseTimeData.value.timestamps.map(t => `${t}`) },
    yAxis: { type: 'value', name: '响应时间(ms)', axisLabel: { formatter: '{value}ms' } },
    series: [{
      data: responseTimeData.value.responseTimes,
      type: 'line', smooth: true,
      areaStyle: { opacity: 0.15, color: '#0066cc' },
      lineStyle: { width: 2, color: '#0066cc' },
      itemStyle: { color: '#0066cc' }
    }],
    grid: { left: '10%', right: '10%', bottom: '10%', top: '10%' }
  }
  chartInstance.value.setOption(option)
}

async function loadApiResponseTimes() {
  try {
    const response = await getApiResponseTimes({ period: '1h' })
    if (response.code === 200 && response.data) {
      responseTimeData.value = {
        timestamps: response.data.timestamps || [],
        responseTimes: response.data.avgResponseTime || []
      }
      updateChart()
    }
  } catch (error) {
    console.error('加载API响应时间失败:', error)
  }
}

async function loadResourceUsage() {
  try {
    const response = await getResourceUsage()
    if (response.code === 200 && response.data) {
      resourceUsage.value = {
        cpu: Math.round(response.data.cpuUsage || 0),
        memory: Math.round(response.data.memoryUsage || 0),
        disk: Math.round(response.data.diskUsage || 0),
        dbConnections: Math.round(response.data.dbPoolUsage || response.data.connections || 0)
      }
    }
  } catch (error) {
    console.error('加载资源使用率失败:', error)
  }
}

async function loadActiveAlerts() {
  try {
    const response = await getActiveAlerts()
    if (response.code === 200) activeAlerts.value = response.data || []
  } catch (error) {
    console.error('加载活跃告警失败:', error)
  }
}

// ==================== 操作方法 ====================
function viewLogDetail(log) {
  currentLog.value = log
  detailDialogVisible.value = true
}

async function handleProcessAlert(alert) {
  try {
    const response = await handleAlert({ alertId: alert.id, action: 'resolve', remark: `处理预警：${alert.title}` })
    if (response.code === 200) {
      dismissAlert(alert.id)
      ElMessage.success('预警处理完成')
    }
  } catch (error) {
    ElMessage.error('处理预警失败')
  }
}

function dismissAlert(alertId) {
  const index = activeAlerts.value.findIndex(a => a.id === alertId)
  if (index > -1) activeAlerts.value.splice(index, 1)
}

// ==================== 格式化工具函数 ====================
function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

function getUserTypeName(userType) {
  const map = { 'STUDENT': '学生', 'TEACHER': '教师', 'ADMIN': '管理员' }
  return map[userType] || userType || ''
}

function getUserTypeTag(userType) {
  const map = { 'STUDENT': 'primary', 'TEACHER': 'success', 'ADMIN': 'warning' }
  return map[userType] || 'info'
}

function getOperationName(type) {
  return operationTypeMap[type] || type || ''
}

function getOperationTag(type) {
  return operationTagMap[type] || 'info'
}

function getSecurityEventName(eventType) {
  const map = {
    'login_success': '登录成功', 'login_failed': '登录失败', 'logout': '用户登出',
    'permission_denied': '权限拒绝', 'abnormal_access': '异常访问', 'data_modified': '数据修改',
    'password_changed': '密码修改', 'account_locked': '账户锁定', 'account_unlocked': '账户解锁',
    'session_expired': '会话过期'
  }
  return map[eventType] || eventType || ''
}

function getSecurityEventTag(eventType) {
  const map = {
    'login_success': 'success', 'login_failed': 'danger', 'logout': 'info',
    'permission_denied': 'warning', 'abnormal_access': 'warning', 'data_modified': 'info',
    'password_changed': 'success', 'account_locked': 'danger', 'account_unlocked': 'success',
    'session_expired': 'warning'
  }
  return map[eventType] || 'info'
}

function getRiskLevelName(level) {
  const map = { 'high': '高风险', 'medium': '中风险', 'low': '低风险' }
  return map[level] || level || ''
}

function getRiskLevelTag(level) {
  const map = { 'high': 'danger', 'medium': 'warning', 'low': 'success' }
  return map[level] || 'info'
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await refreshLogs(false)
  setTimeout(() => initChart(), 500)
  setInterval(async () => {
    try {
      await updateRealtimeStats()
      await loadActiveAlerts()
      await loadApiResponseTimes()
      await loadResourceUsage()
    } catch (error) {
      console.warn('定时刷新数据失败:', error)
    }
  }, 120000)
})

onUnmounted(() => {
  if (chartInstance.value) chartInstance.value.dispose()
  if (updateTimer) clearTimeout(updateTimer)
})
</script>

<style lang="scss" scoped>
.log-center { padding: 0; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;

  .header-content {
    .page-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 600;
      color: #1d1d1f;
    }
    .page-desc { margin: 0; color: #86868b; font-size: 0.95rem; }
  }
  .header-actions { display: flex; gap: 0.75rem; }
}

.monitor-cards {
  margin-bottom: 1.5rem;
  .monitor-card {
    border: 1px solid #d2d2d7;
    border-radius: 18px;
    .monitor-content {
      display: flex;
      align-items: center;
      .monitor-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 14px;
        margin-right: 1rem;
        .el-icon { color: white; font-size: 1.5rem; }
        &.bg-success { background: #34c759; }
        &.bg-warning { background: #ff9500; }
        &.bg-danger { background: #ff3b30; }
        &.bg-info { background: #5ac8fa; }
      }
      .monitor-info {
        .monitor-value { font-size: 1.75rem; font-weight: 700; color: #1d1d1f; line-height: 1; }
        .monitor-label { font-size: 0.875rem; color: #86868b; margin-top: 0.25rem; }
      }
    }
  }
}

.alert-card {
  margin-bottom: 1.5rem;
  border-radius: 18px;
  border: 1px solid #d2d2d7;

  :deep(.el-card__header) {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #d2d2d7;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .card-title {
        display: flex;
        align-items: center;
        font-weight: 600;
        color: #1d1d1f;
        .el-icon { margin-right: 0.5rem; color: #0066cc; }
      }
    }
  }

  .alerts-container {
    .alert-item {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border-radius: 8px;
      border-left: 4px solid;

      &.alert-critical { background-color: rgba(139, 0, 0, 0.12); border-left-color: #8b0000; }
      &.alert-high { background-color: rgba(255, 59, 48, 0.08); border-left-color: #ff3b30; }
      &.alert-medium { background-color: rgba(255, 149, 0, 0.08); border-left-color: #ff9500; }
      &.alert-low { background-color: rgba(52, 199, 89, 0.08); border-left-color: #34c759; }

      .alert-icon { margin-right: 1rem; margin-top: 0.25rem; .el-icon { font-size: 1.25rem; } }
      .alert-content {
        flex: 1;
        .alert-title { font-weight: 600; color: #1d1d1f; margin-bottom: 0.25rem; }
        .alert-message { color: #86868b; margin-bottom: 0.25rem; line-height: 1.4; }
        .alert-time { font-size: 0.875rem; color: #86868b; }
      }
      .alert-actions { display: flex; flex-direction: column; gap: 0.25rem; }
    }
    .no-alerts { padding: 2rem 0; text-align: center; }
  }
}

.log-tabs {
  :deep(.el-tabs__content) { padding: 0; }
  .tab-header {
    .header-filters {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 0.5rem;
}

.resource-stats {
  .resource-item {
    margin-bottom: 1.25rem;
    &:last-child { margin-bottom: 0; }
    .resource-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.375rem;
      > span:first-child { font-size: 0.875rem; color: #86868b; }
      .resource-value { font-weight: 600; color: #1d1d1f; font-size: 1rem; }
    }
  }
}

.alert-config-header {
  display: flex;
  align-items: center;
}
.form-tip {
  font-size: 0.75rem;
  color: #909399;
  margin-left: 0.5rem;
}
.chart-container { height: 300px; }

.log-detail {
  :deep(.el-descriptions__label) { width: 100px; }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    .header-actions { width: 100%; .el-button { flex: 1; } }
  }
  .monitor-cards .el-col { margin-bottom: 0.75rem; }
  .alert-card .alerts-container .alert-item {
    flex-direction: column;
    .alert-icon { margin-right: 0; margin-bottom: 0.5rem; }
    .alert-actions { flex-direction: row; justify-content: flex-end; margin-top: 0.5rem; }
  }
  .log-tabs .tab-header .header-filters {
    flex-direction: column;
    align-items: stretch;
    .el-date-editor, .el-select, .el-input, .el-button { width: 100% !important; }
  }
}
</style>
