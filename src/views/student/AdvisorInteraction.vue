<template>
  <div class="advisor-interaction-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">导师互动</h1>
      <p class="page-desc">与指导老师沟通交流，获取论文指导</p>
    </div>

    <el-row :gutter="20" class="interaction-content">
      <!-- 左侧：导师信息和消息列表 -->
      <el-col :xs="24" :lg="8">
        <!-- 导师信息卡片 -->
        <el-card class="advisor-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><UserFilled /></el-icon>
                指导老师
              </span>
            </div>
          </template>

          <div v-if="advisorInfo" class="advisor-detail">
            <div class="advisor-avatar">
              <el-avatar :size="80" :src="getAvatarUrl(advisorInfo.avatar)" :alt="advisorInfo.name">
                {{ advisorInfo.name?.charAt(0) }}
              </el-avatar>
            </div>
            <div class="advisor-info">
              <h3>{{ advisorInfo.name }}</h3>
              <p class="advisor-title">{{ advisorInfo.title }}</p>
              <p class="advisor-field">
                <el-icon><School /></el-icon>
                {{ advisorInfo.researchField }}
              </p>
              <p class="advisor-contact">
                <el-icon><Message /></el-icon>
                {{ advisorInfo.email }}
              </p>
              <p class="advisor-contact">
                <el-icon><Phone /></el-icon>
                {{ advisorInfo.phone }}
              </p>
              <p class="advisor-office">
                <el-icon><OfficeBuilding /></el-icon>
                {{ advisorInfo.office }}
              </p>
              <p class="advisor-office-hours">
                <el-icon><Clock /></el-icon>
                {{ advisorInfo.officeHours }}
              </p>
            </div>
            <div class="advisor-actions">
              <el-button type="primary" :icon="ChatDotRound" @click="startNewMessage">
                发送消息
              </el-button>
            </div>
          </div>
          <div v-else class="no-advisor">
            <el-empty description="暂未分配指导老师" :image-size="80">
              <p class="no-advisor-tip">请等待管理员分配指导老师</p>
            </el-empty>
          </div>
        </el-card>

        <!-- 消息会话列表 -->
        <el-card class="sessions-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><ChatLineRound /></el-icon>
                消息会话
              </span>
            </div>
          </template>

          <div class="sessions-list">
            <div 
              v-for="session in messageSessions" 
              :key="session.id"
              class="session-item"
              :class="{ 'session-active': session.id === activeSessionId }"
              @click="switchSession(session.id)"
            >
              <div class="session-avatar">
                <el-avatar :size="40" :src="getSessionAvatar(session)">
                  {{ session.name?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="session-content">
                <div class="session-header">
                  <span class="session-name">{{ session.name }}</span>
                  <span class="session-time">{{ formatTime(session.lastTime) }}</span>
                </div>
                <div class="session-preview">
                  {{ session.lastMessage }}
                </div>
                <div class="session-meta">
                  <el-tag v-if="session.unreadCount > 0" type="danger" size="small">
                    {{ session.unreadCount }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：消息对话区域 -->
      <el-col :xs="24" :lg="16">
        <el-card class="chat-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><ChatDotRound /></el-icon>
                {{ currentSession?.name || '消息对话' }}
                <el-tag v-if="currentSession?.unreadCount > 0" type="danger" size="small" effect="dark">
                  {{ currentSession.unreadCount }} 条未读
                </el-tag>
              </span>
              <div class="chat-actions">
                <el-button text :icon="Refresh" @click="refreshMessages">
                  刷新
                </el-button>
                <el-dropdown trigger="click">
                  <el-button text :icon="MoreFilled">
                    更多
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :icon="Delete" @click="clearMessages">清空消息</el-dropdown-item>
                      <el-dropdown-item :icon="Download" @click="exportChatHistory">导出聊天记录</el-dropdown-item>
                      <el-dropdown-item divided :icon="User" @click="viewAdvisorProfile">查看导师主页</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>

          <!-- 消息区域 -->
          <div class="chat-container">
            <div v-if="activeSessionId" class="messages-area">
              <!-- 快捷回复按钮 -->
              <div class="quick-replies">
                <el-tag
                  v-for="(reply, index) in quickReplyOptions"
                  :key="index"
                  type="info"
                  size="small"
                  effect="plain"
                  round
                  @click="insertQuickReply(reply)"
                >
                  {{ reply }}
                </el-tag>
              </div>
              
              <div 
                v-for="message in currentMessages" 
                :key="message.id"
                class="message-item"
                :class="{
                  'message-sent': message.sender === 'student',
                  'message-received': message.sender === 'advisor'
                }"
              >
                <div class="message-avatar">
                  <el-avatar :size="32" :src="getAvatarUrl(message.avatar)">
                    {{ message.senderName?.charAt(0) }}
                  </el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-info">
                    <span class="message-sender">{{ message.senderName }}</span>
                    <span class="message-time">{{ message.formattedTime || formatTime(message.sendTime) }}</span>
                  </div>
                  <div class="message-bubble">
                    <div class="message-text">{{ message.content }}</div>
                  </div>
                  <div v-if="message.attachments" class="message-attachments">
                    <div 
                      v-for="file in message.attachments" 
                      :key="file.id"
                      class="attachment-item"
                    >
                      <el-icon><Document /></el-icon>
                      <span>{{ file.name }}</span>
                      <el-button type="primary" text size="small" @click="downloadAttachment(file)">
                        下载
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 加载状态 -->
              <div v-loading="loadingMessages" class="loading-mask">
                <span></span>
              </div>
            </div>
            <div v-else class="no-session">
              <el-empty description="请选择一个会话开始聊天" :image-size="120" />
            </div>
          </div>

          <!-- 消息输入区域 -->
          <div v-if="activeSessionId" class="message-input">
            <div class="input-toolbar">
              <el-button text :icon="Paperclip" @click="attachFile">
                添加附件
              </el-button>
              <el-button text :icon="Picture" @click="attachImage">
                添加图片
              </el-button>
              <el-divider direction="vertical" />
              <span class="toolbar-tip">支持 Word、PDF、图片等格式</span>
            </div>
            <el-input
              v-model="newMessage"
              type="textarea"
              :rows="3"
              placeholder="输入消息内容，按 Ctrl+Enter 发送..."
              resize="none"
              @keydown.ctrl.enter.exact="sendMessage"
            />
            <div class="input-actions">
              <div class="input-info">
                <span v-if="attachments.length > 0" class="attachment-count">
                  <el-icon><Paperclip /></el-icon>
                  已添加 {{ attachments.length }} 个附件
                </span>
              </div>
              <el-button 
                type="primary" 
                :icon="Promotion" 
                :disabled="!newMessage.trim() && attachments.length === 0"
                @click="sendMessage"
              >
                发送
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 论文相关文件 -->
        <el-card class="files-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Folder /></el-icon>
                共享文件
              </span>
            </div>
          </template>

          <el-table :data="sharedFiles" stripe style="width: 100%">
            <el-table-column prop="name" label="文件名" min-width="200">
              <template #default="{ row }">
                <div class="file-name">
                  <el-icon>
                    <component :is="getFileIcon(row.type)" />
                  </el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="100">
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="uploader" label="上传者" width="100" />
            <el-table-column prop="uploadTime" label="上传时间" width="140">
              <template #default="{ row }">
                {{ formatDate(row.uploadTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" text :icon="Download" size="small">
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发送消息对话框 -->
    <el-dialog 
      v-model="messageDialogVisible" 
      title="发送新消息" 
      width="500px"
    >
      <el-form :model="messageForm" label-width="80px">
        <el-form-item label="收件人">
          <el-input :value="advisorInfo?.name" disabled />
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="messageForm.subject" placeholder="请输入消息主题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input 
            v-model="messageForm.content" 
            type="textarea" 
            :rows="4"
            placeholder="请输入消息内容"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            action="#"
            multiple
            :file-list="messageForm.attachments"
            :auto-upload="false"
          >
            <el-button type="primary" text :icon="Paperclip">添加附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="messageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="sendNewMessage">
          发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

// API 导入
import { 
  getAdvisorInteractionInfo, 
  getMessageSessions, 
  getMessages, 
  sendMessage as sendMsgApi,
  uploadMessageFile,
  downloadMessageAttachment,
  clearMessages as clearMsgApi,
  exportChatHistory as exportHistoryApi,
  getSharedFiles,
  downloadSharedFile,
  markMessagesAsRead,
  recallMessage
} from "@/api/student.js";

// 图标引入
import {
  UserFilled, School, Message, Phone, OfficeBuilding, Clock,
  ChatLineRound, ChatDotRound, Promotion, Paperclip, Picture,
  Folder, Download, Document, Refresh, MoreFilled, Delete, User
} from '@element-plus/icons-vue'

// 响应式数据
const userStore = useUserStore()
const advisorInfo = ref(null)
const messageSessions = ref([])
const activeSessionId = ref(null)
const currentMessages = ref([])
const newMessage = ref('')
const attachments = ref([])
const messageDialogVisible = ref(false)
const sharedFiles = ref([])
const loadingMessages = ref(false)

// 快捷回复选项
const quickReplyOptions = ref([
  '谢谢老师，我会尽快修改',
  '收到，老师辛苦了',
  '请问老师什么时候有空？',
  '我已经按照您的意见修改了'
])

const messageForm = reactive({
  subject: '',
  content: '',
  attachments: []
})

// 计算属性
const currentSession = computed(() => {
  return messageSessions.value.find(session => session.id === activeSessionId.value)
})

// 方法：处理头像 URL，确保空值时返回 undefined 让 el-avatar 显示默认文字
const getAvatarUrl = (avatar) => {
  if (!avatar || avatar === 'null' || avatar === 'undefined' || avatar.trim() === '') {
    return undefined // 返回 undefined，el-avatar 会显示插槽中的文字
  }
  return avatar
}

// 方法：从会话成员中提取对方（非当前用户）的头像
const getSessionAvatar = (session) => {
  if (!session || !session.members) return undefined
  
  // 找到不是当前用户的成员（即导师/联系人）
  const otherMember = session.members.find(member => member.userId !== userStore.userInfo?.userId)
  
  // 如果有其他成员，返回其头像；否则返回第一个成员的头像
  const avatar = otherMember ? otherMember.avatar : session.members[0]?.avatar
  
  // 如果 avatar 为空、null 或 undefined，返回 undefined（让 el-avatar 显示插槽内容）
  if (!avatar || avatar === 'null' || avatar === 'undefined') return undefined
  
  return avatar
}

// 方法
const loadAdvisorData = async () => {
  console.log('开始加载导师数据');
  try {
    // 获取导师信息
    const advisorRes = await getAdvisorInteractionInfo();
    console.log('导师信息响应:', advisorRes);
    if (advisorRes.code === 200 && advisorRes.data) {
      advisorInfo.value = advisorRes.data;
      console.log('设置 advisorInfo:', advisorInfo.value);
    } else {
      console.warn('获取导师信息失败或未分配导师:', advisorRes.message);
      // API 成功但没有数据，说明未分配导师
      advisorInfo.value = null;
    }
    
    // 获取消息会话列表
    const sessionsRes = await getMessageSessions();
    if (sessionsRes.code === 200) {
      messageSessions.value = sessionsRes.data;
    } else {
      console.warn('获取会话列表失败:', sessionsRes.message);
      messageSessions.value = [];
    }
    
    // 获取共享文件
    if (activeSessionId.value) {
      const filesRes = await getSharedFiles(activeSessionId.value);
      if (filesRes.code === 200) {
        sharedFiles.value = filesRes.data;
      }
    }
  } catch (error) {
    console.error('加载导师数据失败:', error);
    ElMessage.error('加载数据失败：' + (error.message || '未知错误'));
  }
};

const loadMessages = async (sessionId) => {
  loadingMessages.value = true;
  try {
    const res = await getMessages(sessionId, 1, 20);
    if (res.code === 200) {
      currentMessages.value = res.data.records || [];
      // 标记消息为已读
      await markMessagesAsRead(sessionId);
    }
  } catch (error) {
    console.error('加载消息失败:', error);
    ElMessage.error('加载消息失败');
  } finally {
    loadingMessages.value = false;
  }
};

const switchSession = (sessionId) => {
  activeSessionId.value = sessionId
  loadMessages(sessionId)
}

const startNewMessage = () => {
  messageDialogVisible.value = true
}

const sendNewMessage = () => {
  ElMessage.success('消息发送成功')
  messageDialogVisible.value = false
  // 重置表单
  Object.keys(messageForm).forEach(key => {
    if (key !== 'attachments') {
      messageForm[key] = ''
    }
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim() && attachments.length === 0) return;

  try {
    const messageData = {
      sessionId: activeSessionId.value,
      receiverId: currentSession.value?.id,
      content: newMessage.value,
      attachmentIds: attachments.value.map(att => att.id)
    };

    const res = await sendMsgApi(messageData);
    
    if (res.code === 200) {
      // 发送成功后刷新消息列表
      await loadMessages(activeSessionId.value);
      newMessage.value = '';
      attachments.value = [];
      ElMessage.success('消息发送成功');
    } else {
      ElMessage.error(res.message || '发送失败');
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送失败');
  }
};

// 快捷回复
const insertQuickReply = (text) => {
  if (newMessage.value) {
    newMessage.value += '\n' + text
  } else {
    newMessage.value = text
  }
}

// 刷新消息
const refreshMessages = async () => {
  if (!activeSessionId.value) return
  
  loadingMessages.value = true
  try {
    // TODO: 调用刷新消息接口
    await loadMessages(activeSessionId.value)
    ElMessage.success('消息已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loadingMessages.value = false
  }
}



// 查看导师主页
const viewAdvisorProfile = () => {
  console.log('查看导师主页被点击');
  console.log('advisorInfo:', advisorInfo.value);
  
  if (advisorInfo.value) {
    ElMessageBox.alert(
      `<div style="text-align: left;">
        <p><strong>姓名：</strong>${advisorInfo.value.name}</p>
        <p><strong>职称：</strong>${advisorInfo.value.title}</p>
        <p><strong>研究方向：</strong>${advisorInfo.value.researchField}</p>
        <p><strong>邮箱：</strong>${advisorInfo.value.email}</p>
        <p><strong>电话：</strong>${advisorInfo.value.phone}</p>
        <p><strong>办公室：</strong>${advisorInfo.value.office}</p>
        <p><strong>办公时间：</strong>${advisorInfo.value.officeHours}</p>
      </div>`,
      '导师信息',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定'
      }
    )
  } else {
    ElMessage.warning('暂无导师信息');
    console.log('advisorInfo 为空');
  }
}

// 下载附件
const downloadAttachment = async (file) => {
  try {
    const res = await downloadMessageAttachment(file.id);
    // 创建下载链接
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    window.URL.revokeObjectURL(url);
    ElMessage.success(`正在下载：${file.name}`);
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败');
  }
};

// 清空消息
const clearMessages = async () => {
  try {
    await ElMessageBox.confirm('确定要清空当前会话的消息吗？此操作不可恢复', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const res = await clearMsgApi(activeSessionId.value);
    if (res.code === 200) {
      currentMessages.value = [];
      ElMessage.success('消息已清空');
    } else {
      ElMessage.error(res.message || '清空失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空失败:', error);
      ElMessage.error('清空失败');
    }
  }
};

// 导出聊天记录
const exportChatHistory = async () => {
  try {
    const exportData = {
      sessionId: activeSessionId.value,
      format: 'pdf',
      startTime: '2024-01-01',
      endTime: new Date().toISOString().split('T')[0]
    };
    
    const res = await exportHistoryApi(exportData);
    
    // 创建下载链接
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `聊天记录_${new Date().getTime()}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('聊天记录已导出');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

const attachFile = async () => {
  try {
    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.doc,.docx,.pdf,.txt,.xls,.xlsx';
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const res = await uploadMessageFile(formData);
          if (res.code === 200) {
            attachments.value.push(res.data);
            ElMessage.success(`${file.name} 上传成功`);
          }
        } catch (error) {
          console.error('文件上传失败:', error);
          ElMessage.error(`${file.name} 上传失败`);
        }
      }
    };
    
    input.click();
  } catch (error) {
    console.error('附件上传失败:', error);
    ElMessage.error('附件上传失败');
  }
};

const attachImage = async () => {
  try {
    // 创建图片选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const res = await uploadMessageFile(formData);
          if (res.code === 200) {
            attachments.value.push(res.data);
            ElMessage.success(`${file.name} 上传成功`);
          }
        } catch (error) {
          console.error('图片上传失败:', error);
          ElMessage.error(`${file.name} 上传失败`);
        }
      }
    };
    
    input.click();
  } catch (error) {
    console.error('图片上传失败:', error);
    ElMessage.error('图片上传失败');
  }
};

const getFileIcon = (fileType) => {
  const iconMap = {
    'pdf': 'Document',
    'doc': 'Document',
    'docx': 'Document',
    'xls': 'Document',
    'xlsx': 'Document',
    'zip': 'Folder'
  }
  return iconMap[fileType] || 'Document'
}

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

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  loadAdvisorData();
});
</script>

<style lang="scss" scoped>
.advisor-interaction-page {
  padding: 0;
}

.page-header {
  margin-bottom: 1.5rem;
  
  .page-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .page-desc {
    margin: 0;
    color: #7f8c8d;
    font-size: 0.95rem;
  }
}

.interaction-content {
  .el-card {
    border-radius: 12px;
    border: 1px solid #f1f2f6;
    margin-bottom: 1.5rem;
    
    :deep(.el-card__header) {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f2f6;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .card-title {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #2c3e50;
          
          .el-icon {
            margin-right: 0.5rem;
            color: #667eea;
          }
        }
      }
    }
  }
}

.advisor-detail {
  text-align: center;
  
  .advisor-avatar {
    margin-bottom: 1rem;
  }
  
  .advisor-info {
    h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }
    
    .advisor-title {
      color: #667eea;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    
    .advisor-field,
    .advisor-contact,
    .advisor-office,
    .advisor-office-hours {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.5rem 0;
      color: #5a6c7d;
      font-size: 0.875rem;
      
      .el-icon {
        margin-right: 0.5rem;
        color: #667eea;
      }
    }
  }
  
  .advisor-actions {
    margin-top: 1.5rem;
  }
}

.no-advisor {
  text-align: center;
  padding: 2rem 0;
  
  .no-advisor-tip {
    margin-top: 0.5rem;
    color: #7f8c8d;
    font-size: 0.875rem;
  }
}

.sessions-list {
  .session-item {
    display: flex;
    padding: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    &.session-active {
      background-color: #f0f7ff;
      border-color: #667eea;
    }
    
    .session-avatar {
      margin-right: 0.75rem;
    }
    
    .session-content {
      flex: 1;
      min-width: 0;
      
      .session-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;
        
        .session-name {
          font-weight: 500;
          color: #2c3e50;
        }
        
        .session-time {
          font-size: 0.75rem;
          color: #7f8c8d;
        }
      }
      
      .session-preview {
        font-size: 0.875rem;
        color: #7f8c8d;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 0.25rem;
      }
    }
  }
}

.chat-container {
  height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  position: relative;
  
  .quick-replies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    
    .el-tag {
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
      }
    }
  }
  
  .messages-area {
    .message-item {
      display: flex;
      margin-bottom: 1.5rem;
      animation: messageSlideIn 0.3s ease-out;
      
      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      &.message-sent {
        flex-direction: row-reverse;
        
        .message-content {
          align-items: flex-end;
        }
        
        .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          border: none;
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            bottom: -8px;
            right: 20px;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 0;
            border-top: 8px solid #667eea;
          }
          
          .message-time {
            color: rgba(255, 255, 255, 0.9);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
        }
      }
      
      &.message-received {
        .message-bubble {
          background: white;
          border: 1px solid #e8eaed;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 20px;
            width: 0;
            height: 0;
            border-right: 8px solid transparent;
            border-left: 0;
            border-top: 8px solid white;
          }
        }
      }
      
      .message-avatar {
        margin: 0 0.75rem;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 2px solid white;
      }
      
      .message-content {
        display: flex;
        flex-direction: column;
        max-width: 70%;
        
        .message-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          font-size: 0.75rem;
          color: #909399;
          padding: 0 4px;
          
          .message-sender {
            font-weight: 500;
            color: #606266;
            font-size: 0.8rem;
          }
          
          .message-time {
            opacity: 0.7;
            font-size: 0.7rem;
          }
        }
        
        .message-bubble {
          padding: 12px 16px;
          border-radius: 16px;
          margin-bottom: 0.5rem;
          word-wrap: break-word;
          word-break: break-word;
          
          .message-text {
            margin-bottom: 0.25rem;
            line-height: 1.6;
            font-size: 0.95rem;
          }
          
          .message-time {
            font-size: 0.75rem;
            opacity: 0.7;
            margin-top: 4px;
            text-align: right;
          }
        }
        
        .message-attachments {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
          
          .attachment-item {
            display: flex;
            align-items: center;
            padding: 10px 12px;
            background: linear-gradient(to right, #f8f9fa, #ffffff);
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:hover {
              background: linear-gradient(to right, #e8f4ff, #ffffff);
              border-color: #667eea;
              transform: translateX(4px);
              box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
            }
            
            .el-icon {
              margin-right: 8px;
              font-size: 1.2rem;
              color: #667eea;
            }
            
            span {
              flex: 1;
              margin-right: 8px;
              font-size: 0.85rem;
              color: #606266;
            }
          }
        }
      }
    }
  }
  
  .no-session {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  
  .loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
}

.message-input {
  border-top: 1px solid #f1f2f6;
  padding-top: 1rem;
  
  .input-toolbar {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    
    .toolbar-tip {
      font-size: 0.75rem;
      color: #909399;
      margin-left: 8px;
    }
  }
  
  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    
    .attachment-count {
      font-size: 0.875rem;
      color: #7f8c8d;
    }
  }
}

.file-name {
  display: flex;
  align-items: center;
  
  .el-icon {
    margin-right: 0.5rem;
    color: #667eea;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .interaction-content {
    .el-col {
      margin-bottom: 1rem;
    }
  }
  
  .chat-actions {
    display: none;
  }
  
  .message-content {
    max-width: 85% !important;
  }
}
</style>