import request from '../request'

// 获取分配统计
export const getAssignmentStats = () => {
  return request({
    url: '/api/admin/assignments/stats',
    method: 'get'
  })
}

// 执行自动分配
export const autoAssign = (data) => {
  return request({
    url: '/api/admin/assignments/auto-assign',
    method: 'post',
    data: data
  })
}

// 获取待分配学生列表
export const getPendingStudents = (params) => {
  return request({
    url: '/api/admin/assignments/pending-students',
    method: 'get',
    params: params
  })
}

// 获取可分配导师列表
export const getAvailableAdvisors = () => {
  return request({
    url: '/api/admin/assignments/available-advisors',
    method: 'get'
  })
}

// 执行手动分配
export const manualAssign = (data) => {
  return request({
    url: '/api/admin/assignments/manual-assign',
    method: 'post',
    data: data
  })
}