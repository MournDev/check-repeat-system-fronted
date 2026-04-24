// 教师端API接口
import request from "./request";

// 获取消息会话列表
export const getMessageSessions = () => {
  return request({
    url: '/api/teacher/message/sessions',
    method: 'get',
    _skipLoginRedirect: true // 跳过重定向，避免401时清除token和跳转
  })
}

// 发送消息
export const sendMessage = (data) => {
  return request({
    url: '/api/teacher/message/send',
    method: 'post',
    data,
    _skipLoginRedirect: true // 跳过重定向，避免401时清除token和跳转
  })
}

// 获取消息列表
export const getMessageList = (params) => {
  return request({
    url: '/api/teacher/message/list',
    method: 'get',
    params,
    _skipLoginRedirect: true // 跳过重定向，避免401时清除token和跳转
  })
}

// 标记消息已读
export const markMessagesRead = (data) => {
  let sessionId;
  if (typeof data === 'object' && data !== null) {
    sessionId = data.sessionId;
  } else {
    sessionId = data;
  }
  return request({
    url: '/api/teacher/message/mark-read',
    method: 'post',
    params: {
      sessionId
    },
    _skipLoginRedirect: true // 跳过重定向，避免401时清除token和跳转
  })
}

// 上传文件上传消息文件
export const uploadMessageFile = (formData) => {
  return request({
    url: '/api/teacher/message/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传文件（别名）
export const uploadFile = uploadMessageFile

// 下载消息附件
export const downloadMessageAttachment = (attachmentId) => {
  return request({
    url: `/api/teacher/message/attachment/${attachmentId}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 清空消息
export const clearMessages = (sessionId) => {
  return request({
    url: '/api/teacher/message/clear',
    method: 'post',
    params: {
      sessionId
    }
  })
}

// 导出聊天记录
export const exportChatHistory = (data) => {
  return request({
    url: '/api/teacher/message/export',
    method: 'post',
    data,
    responseType: 'blob'
  })
}

// 获取共享文件列表
export const getSharedFiles = (sessionId) => {
  return request({
    url: '/api/teacher/message/files',
    method: 'get',
    params: {
      sessionId
    }
  })
}

// 下载共享文件
export const downloadSharedFile = (fileId) => {
  return request({
    url: `/api/teacher/message/files/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 标记消息已读
export const markMessagesAsRead = (sessionId) => {
  return request({
    url: '/api/teacher/message/mark-read',
    method: 'post',
    params: {
      sessionId
    }
  })
}

// 撤回消息
export const recallMessage = (messageId) => {
  return request({
    url: '/api/teacher/message/recall',
    method: 'post',
    params: {
      messageId
    }
  })
}

// 获取学生信息
export const getStudentInfo = (studentId) => {
  return request({
    url: `/api/teacher/message/student-info`,
    method: 'get',
    params: {
      studentId
    }
  })
}

// 下载论文
export const downloadPaper = (paperId) => {
  return request({
    url: `/api/teacher/papers/${paperId}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

// 获取教师仪表板统计信息
export const getTeacherDashboardStats = (teacherId) => {
  return request({
    url: teacherId ? `/api/teacher/dashboard/stats/${teacherId}` : '/api/teacher/dashboard/stats',
    method: 'get'
  })
}

// 获取待审核论文列表
export const getPendingReviewList = (pageNum, pageSize) => {
  return request({
    url: '/api/teacher/dashboard/pending-papers',
    method: 'get',
    params: {
      pageNum,
      pageSize
    }
  })
}

// 获取学生统计信息
export const getStudentStats = (teacherId) => {
  return request({
    url: teacherId ? `/api/teacher/students/stats/${teacherId}` : '/api/teacher/students/stats',
    method: 'get'
  })
}

// 导出教师数据
export const exportTeacherData = (data) => {
  return request({
    url: '/api/teacher/export/data',
    method: 'post',
    data,
    responseType: 'blob'
  })
}

// 获取审核统计信息
export const getReviewStats = (params) => {
  return request({
    url: '/api/teacher/review/statistics',
    method: 'get'
  })
}

// 获取学院分布
export const getCollegeDistribution = (params) => {
  return request({
    url: '/api/teacher/review/statistics',
    method: 'get'
  })
}

// 添加学生
export const addStudent = (data) => {
  return request({
    url: '/api/teacher/students',
    method: 'post',
    data
  })
}

// 获取学生列表
export const getStudentListFull = (params) => {
  return request({
    url: '/api/teacher/students',
    method: 'get',
    params
  })
}

// 删除学生
export const deleteStudent = (studentId) => {
  return request({
    url: `/api/teacher/students/${studentId}`,
    method: 'delete'
  })
}

// 分配导师
export const assignAdvisor = (data) => {
  return request({
    url: '/api/teacher/students/assign-advisor',
    method: 'post',
    data
  })
}

// 批量分配导师
export const batchAssignAdvisor = (data) => {
  return request({
    url: '/api/teacher/students/batch-assign-advisor',
    method: 'post',
    data
  })
}

// 批量发送消息
export const batchSendMessage = (data) => {
  return request({
    url: '/api/teacher/message/batch-send',
    method: 'post',
    data
  })
}

// 批量删除学生
export const batchDeleteStudents = (studentIds) => {
  return request({
    url: '/api/teacher/students/batch-delete',
    method: 'post',
    data: {
      studentIds
    }
  })
}

// 导出学生数据
export const exportStudentData = (params) => {
  return request({
    url: '/api/teacher/students/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导入学生数据
export const importStudentData = (formData) => {
  return request({
    url: '/api/teacher/students/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取学院列表
export const getColleges = () => {
  return request({
    url: '/api/common/dict/colleges',
    method: 'get'
  })
}

// 获取专业列表
export const getMajors = (collegeId) => {
  return request({
    url: '/api/common/dict/majors',
    method: 'get',
    params: {
      collegeId
    }
  })
}

// 获取学生论文信息
export const getStudentPaper = (studentId) => {
  return request({
    url: `/api/teacher/students/${studentId}/paper`,
    method: 'get'
  })
}

// 获取学生所有论文
export const getStudentPapers = (studentId) => {
  return request({
    url: `/api/teacher/students/${studentId}/papers`,
    method: 'get'
  })
}

// 数据统计相关接口

// 获取详细数据
export const getDetailData = (params) => {
  return request({
    url: '/api/teacher/data-analysis/detail-data',
    method: 'get',
    params
  })
}

// 获取审核趋势
export const getReviewTrend = (params) => {
  return request({
    url: '/api/teacher/data-analysis/review-trend',
    method: 'get',
    params
  })
}

// 获取审核状态分布
export const getReviewStatusDistribution = (params) => {
  return request({
    url: '/api/teacher/data-analysis/review-status-distribution',
    method: 'get',
    params
  })
}

// 获取相似度分布
export const getSimilarityDistribution = (params) => {
  return request({
    url: '/api/teacher/data-analysis/similarity-distribution',
    method: 'get',
    params
  })
}

// 导出数据
export const exportData = (params) => {
  return request({
    url: '/api/teacher/data-analysis/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

// 待审核相关接口

// 执行审核
export const doReview = (data) => {
  // 构建 FormData 对象
  const formData = new FormData()
  
  // 添加论文ID列表（逗号分隔）
  if (data.paperIds && Array.isArray(data.paperIds)) {
    formData.append('paperIds', data.paperIds.join(','))
  } else if (data.paperIds) {
    formData.append('paperIds', data.paperIds)
  }
  
  // 添加审核状态
  if (data.reviewStatus !== undefined) {
    formData.append('reviewStatus', data.reviewStatus)
  }
  
  // 添加审核意见
  if (data.reviewOpinion) {
    formData.append('reviewOpinion', data.reviewOpinion)
  }
  
  // 添加审核附件（如果有）
  if (data.reviewAttach) {
    formData.append('reviewAttach', data.reviewAttach)
  }
  
  return request({
    url: '/api/teacher/reviews/do-review',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取待审核统计
export const getPendingStats = () => {
  return request({
    url: '/api/teacher/pending-reviews/stats',
    method: 'get'
  })
}

// 重新查重
export const recheckPlagiarism = (paperId) => {
  return request({
    url: `/api/teacher/reviews/recheck/${paperId}`,
    method: 'post'
  })
}

// 发送提醒
export const sendReminder = (paperId) => {
  return request({
    url: `/api/teacher/reviews/remind/${paperId}`,
    method: 'post'
  })
}

// 联系学生
export const contactStudent = (data) => {
  return request({
    url: '/api/teacher/reviews/contact-student',
    method: 'post',
    data
  })
}

// 获取查重报告
export const getPlagiarismReport = (paperId) => {
  return request({
    url: `/api/teacher/reviews/plagiarism-report/${paperId}`,
    method: 'get'
  })
}

// 获取今日审核数量
export const getTodayReviewedCount = () => {
  return request({
    url: '/api/teacher/reviews/today-count',
    method: 'get'
  })
}

// 委托审核
export const delegateReview = (data) => {
  return request({
    url: '/api/teacher/reviews/delegate',
    method: 'post',
    data
  })
}

// 获取论文内容
export const getPaperContent = (paperId) => {
  return request({
    url: `/api/teacher/reviews/paper-content/${paperId}`,
    method: 'get'
  })
}

// 获取论文预览URL
export const getPaperPreviewUrl = (paperId) => {
  return request({
    url: `/api/teacher/reviews/paper-preview/${paperId}`,
    method: 'get'
  })
}

// 获取审核历史
export const getReviewHistory = (paperId) => {
  return request({
    url: `/api/teacher/reviews/history/${paperId}`,
    method: 'get'
  })
}

// 获取教师审核历史
export const getTeacherReviewHistory = (params) => {
  return request({
    url: '/api/teacher/reviews/history',
    method: 'get',
    params
  })
}

// 获取详细查重报告
export const getDetailedPlagiarismReport = (paperId) => {
  return request({
    url: `/api/teacher/reviews/detailed-plagiarism-report/${paperId}`,
    method: 'get'
  })
}

// 获取论文报告
export const getPaperReport = (reportId) => {
  return request({
    url: `/api/teacher/reports/preview`,
    method: 'get',
    params: {
      reportId
    }
  })
}

// 获取简单查重报告列表
export const getSimpleCheckReport = (paperId) => {
  return request({
    url: `/api/teacher/reports/list`,
    method: 'get',
    params: {
      paperId
    }
  })
}

// 导出查重报告
export const exportCheckReport = (reportId, format) => {
  return request({
    url: `/api/teacher/reports/download`,
    method: 'post',
    data: {
      reportId,
      format
    },
    responseType: 'blob'
  })
}

// 获取已审核列表
export const getReviewedList = (params) => {
  return request({
    url: '/api/teacher/reviews/reviewed-list',
    method: 'get',
    params
  })
}

// 获取教师信息
export const getInfo = (userId) => {
  return request({
    url: '/api/teacher/info/get',
    method: 'get',
    params: {
      userId
    }
  })
}

// 更新教师信息
export const updateInfo = (data) => {
  return request({
    url: '/api/teacher/info/update',
    method: 'post',
    data
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/api/teacher/info/changePassword',
    method: 'post',
    params: {
      userId: data.userId,
      newPassword: data.newPassword
    }
  })
}

// 审核模板相关接口

// 创建审核模板
export const createReviewTemplate = (data) => {
  return request({
    url: '/api/teacher/review-templates',
    method: 'post',
    data
  })
}

// 获取审核模板列表
export const getReviewTemplates = (params) => {
  return request({
    url: '/api/teacher/review-templates',
    method: 'get',
    params
  })
}

// 获取审核模板详情
export const getReviewTemplateDetail = (templateId) => {
  return request({
    url: `/api/teacher/review-templates/${templateId}`,
    method: 'get'
  })
}

// 更新审核模板
export const updateReviewTemplate = (templateId, data) => {
  return request({
    url: `/api/teacher/review-templates/${templateId}`,
    method: 'put',
    data
  })
}

// 删除审核模板
export const deleteReviewTemplate = (templateId) => {
  return request({
    url: `/api/teacher/review-templates/${templateId}`,
    method: 'delete'
  })
}

// 使用审核模板
export const useReviewTemplate = (data) => {
  return request({
    url: '/api/teacher/review-templates/use',
    method: 'post',
    data
  })
}

// 学生分组相关接口

// 添加学生到分组
export const addStudentsToGroup = (data) => {
  return request({
    url: '/api/teacher/student-groups/add-students',
    method: 'post',
    data
  })
}

// 获取学生分组列表
export const getStudentGroups = (params) => {
  return request({
    url: '/api/teacher/student-groups',
    method: 'get',
    params
  })
}

// 创建学生分组
export const createStudentGroup = (data) => {
  return request({
    url: '/api/teacher/student-groups',
    method: 'post',
    data
  })
}

// 更新学生分组
export const updateStudentGroup = (groupId, data) => {
  return request({
    url: `/api/teacher/student-groups/${groupId}`,
    method: 'put',
    data
  })
}

// 删除学生分组
export const deleteStudentGroup = (groupId) => {
  return request({
    url: `/api/teacher/student-groups/${groupId}`,
    method: 'delete'
  })
}

// 从分组中移除学生
export const removeStudentsFromGroup = (data) => {
  return request({
    url: '/api/teacher/student-groups/remove-students',
    method: 'post',
    data
  })
}

// 从分组中移除单个学生
export const removeStudentFromGroup = (groupId, studentId) => {
  return request({
    url: `/api/teacher/student-groups/${groupId}/students/${studentId}`,
    method: 'delete'
  })
}

// 获取未分组的学生列表
export const getStudentsNotInGroup = (params) => {
  return request({
    url: `/api/teacher/student-groups/${params.groupId}/students/not-in-group`,
    method: 'get'
  })
}

// 相似度阈值相关接口

// 获取相似度阈值设置
export const getSimilarityThresholds = () => {
  return request({
    url: '/api/teacher/similarity-thresholds',
    method: 'get'
  })
}

// 更新相似度阈值设置
export const updateSimilarityThresholds = (data) => {
  return request({
    url: '/api/teacher/similarity-thresholds',
    method: 'put',
    data
  })
}

// 审核流程相关接口

// 获取审核流程配置
export const getReviewWorkflow = () => {
  return request({
    url: '/api/teacher/review-workflow',
    method: 'get'
  })
}

// 更新审核流程配置
export const updateReviewWorkflow = (data) => {
  return request({
    url: '/api/teacher/review-workflow',
    method: 'put',
    data
  })
}

// 获取教师列表
export const getTeachers = (params) => {
  return request({
    url: '/api/teacher/review-workflow/teachers',
    method: 'get',
    params
  })
}

// 聊天相关接口

// 导出聊天记录
export const exportChatRecords = (params) => {
  return request({
    url: '/api/teacher/message/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

// 清空聊天记录
export const clearChatHistory = (sessionId) => {
  return request({
    url: '/api/teacher/message/clear',
    method: 'post',
    params: {
      sessionId
    }
  })
}

// 详细对比接口：根据报告ID和来源ID，返回原文与相似内容的详细对比数据
export const compareReport = (reportId, sourceId) => {
  return request({
    url: '/api/teacher/reports/compare',
    method: 'get',
    params: {
      reportId,
      sourceId
    }
  })
}

// 审核操作接口：处理教师对论文的审核操作（通过）
export const approveReport = (reportId, comment) => {
  return request({
    url: '/api/teacher/reports/approve',
    method: 'post',
    params: {
      reportId,
      comment
    }
  })
}

// 审核操作接口：处理教师对论文的审核操作（要求修改）
export const requestRevision = (reportId, comment) => {
  return request({
    url: '/api/teacher/reports/revision',
    method: 'post',
    params: {
      reportId,
      comment
    }
  })
}

// 联系学生接口：教师向学生发送消息
export const contactStudentReport = (reportId, content) => {
  return request({
    url: '/api/teacher/reports/contact',
    method: 'post',
    params: {
      reportId,
      content
    }
  })
}

// 相似来源详情接口：获取相似来源的详细信息
export const getSourceDetail = (sourceId) => {
  return request({
    url: '/api/teacher/reports/source/detail',
    method: 'get',
    params: {
      sourceId
    }
  })
}

// 历史报告列表接口：获取论文的历史查重报告列表
export const getHistoryReportList = (paperId) => {
  return request({
    url: '/api/teacher/reports/history',
    method: 'get',
    params: {
      paperId
    }
  })
}