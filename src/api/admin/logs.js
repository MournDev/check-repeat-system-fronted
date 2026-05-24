import request from '../request'

// 获取实时监控统计数据
export const getRealtimeStats = () => {
  return request({
    url: '/api/v1/admin/dashboard/realtime-stats',
    method: 'get'
  })
}

// 获取操作日志列表
export const getOperationLogs = (params) => {
  return request({
    url: '/api/v1/admin/logs/operations',
    method: 'get',
    params
  })
}

// 获取安全日志列表
export const getSecurityLogs = (params) => {
  return request({
    url: '/api/v1/admin/logs/security',
    method: 'get',
    params
  })
}

// 获取登录日志列表
export const getLoginLogs = (params) => {
  return request({
    url: '/api/v1/admin/logs/login',
    method: 'get',
    params
  })
}

// 导出操作日志
export const exportOperationLogs = (params) => {
  return request({
    url: '/api/v1/admin/logs/operations/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取智能预警配置
export const getAlertConfig = () => {
  return request({
    url: '/api/v1/admin/alerts/config',
    method: 'get'
  })
}

// 更新智能预警配置
export const updateAlertConfig = (data) => {
  return request({
    url: '/api/v1/admin/alerts/config',
    method: 'put',
    data
  })
}

// 获取活跃预警列表
export const getActiveAlerts = () => {
  return request({
    url: '/api/v1/admin/alerts/active',
    method: 'get'
  })
}

// 删除告警规则
export const deleteAlertRule = (id) => {
  return request({
    url: `/api/v1/admin/alerts/config/${id}`,
    method: 'delete'
  })
}

// 启用/禁用告警规则
export const toggleAlertRule = (id, enabled) => {
  return request({
    url: `/api/v1/admin/alerts/config/${id}/toggle`,
    method: 'put',
    data: { enabled }
  })
}

// 处理预警
export const handleAlert = (data) => {
  return request({
    url: '/api/v1/admin/alerts/handle',
    method: 'post',
    data
  })
}

// 获取资源使用率
export const getResourceUsage = () => {
  return request({
    url: '/api/v1/admin/monitoring/resources',
    method: 'get'
  })
}

// 获取API响应时间统计
export const getApiResponseTimes = (params) => {
  return request({
    url: '/api/v1/admin/monitoring/response-times',
    method: 'get',
    params
  })
}