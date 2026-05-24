import request from '../request'

// 获取系统统计数据
export const getDashboardStats = () => {
  return request({
    url: '/api/v1/admin/dashboard/stats',
    method: 'get'
  })
}