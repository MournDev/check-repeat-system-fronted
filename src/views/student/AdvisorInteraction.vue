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
            <div class="advisor-header">
              <div class="advisor-avatar">
                <el-avatar :size="80" :src="getAvatarUrl(advisorInfo.avatar)" :alt="advisorInfo.name">
                  {{ advisorInfo.name?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="advisor-basic-info">
                <h3>{{ advisorInfo.name }}</h3>
                <p class="advisor-title">{{ advisorInfo.title }}</p>
                <p class="advisor-field">
                  <el-icon><School /></el-icon>
                  {{ advisorInfo.researchField }}
                </p>
              </div>
            </div>
            <div class="advisor-details-grid">
              <div class="detail-item">
                <el-icon class="detail-icon"><Message /></el-icon>
                <div class="detail-content">
                  <span class="detail-label">邮箱</span>
                  <span class="detail-value">{{ advisorInfo.email }}</span>
                </div>
              </div>
              <div class="detail-item">
                <el-icon class="detail-icon"><Phone /></el-icon>
                <div class="detail-content">
                  <span class="detail-label">电话</span>
                  <span class="detail-value">{{ advisorInfo.phone }}</span>
                </div>
              </div>
              <div class="detail-item">
                <el-icon class="detail-icon"><OfficeBuilding /></el-icon>
                <div class="detail-content">
                  <span class="detail-label">办公室</span>
                  <span class="detail-value">{{ advisorInfo.office }}</span>
                </div>
              </div>
              <div class="detail-item">
                <el-icon class="detail-icon"><Clock /></el-icon>
                <div class="detail-content">
                  <span class="detail-label">办公时间</span>
                  <span class="detail-value">{{ advisorInfo.officeHours }}</span>
                </div>
              </div>
            </div>
            <div v-if="advisorInfo.bio" class="advisor-bio">
              <h4>导师简介</h4>
              <p>{{ advisorInfo.bio }}</p>
            </div>
            <div class="advisor-actions">
              <el-button type="primary" :icon="ChatDotRound" @click="startNewMessage" class="primary-button">
                发送消息
              </el-button>
              <el-button text :icon="User" @click="viewAdvisorProfile" class="secondary-button">
                查看详情
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
                  <span class="session-time">{{ formatMessageTime(session.lastTime) }}</span>
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
                <el-tag 
                  v-if="currentSession?.unreadCount && currentSession.unreadCount > 0" 
                  type="danger" 
                  size="small" 
                  effect="dark"
                >
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
          <div class="chat-container" ref="chatContainerRef" @scroll="handleMessagesScroll">
            <div v-if="activeSessionId" class="messages-area">
              <!-- 加载提示 -->
              <div v-if="loadingMessages && currentPage > 1" class="loading-more">
                <span>加载中...</span>
              </div>
              
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
                  'message-sent': message.senderId === userStore.userInfo?.userId,
                  'message-received': message.senderId !== userStore.userInfo?.userId
                }"
              >
                <div class="message-avatar">
                  <el-avatar :size="36" :src="getAvatarUrl(message.senderAvatar)" :alt="message.senderName">
                    {{ message.senderName?.charAt(0) }}
                  </el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-info">
                    <span class="message-sender">{{ message.senderName }}</span>
                    <span class="message-time">{{ formatMessageTime(message.sendTime) }}</span>
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
              <el-button text @click="showEmojiPicker = !showEmojiPicker">
                😊
              </el-button>
              <el-button text :icon="Paperclip" @click="attachFile">
                附件
              </el-button>
              <el-button text :icon="Picture" @click="attachImage">
                图片
              </el-button>
              <el-divider direction="vertical" />
              <span class="toolbar-tip">支持表情、附件、图片</span>
            </div>
            
            <!-- 表情选择器 -->
            <div v-if="showEmojiPicker" class="emoji-picker">
              <div class="emoji-grid">
                <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="insertEmoji(emoji)">
                  {{ emoji }}
                </span>
              </div>
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
                class="send-button"
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
              <div class="card-actions">
                <el-input
                  v-model="fileSearch"
                  placeholder="搜索文件"
                  size="small"
                  prefix-icon="Search"
                  style="width: 200px"
                />
                <el-button type="primary" text size="small" @click="uploadFile">
                  上传文件
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="sharedFiles.length === 0" class="no-files">
            <el-empty description="暂无共享文件" :image-size="80" />
          </div>
          <div v-else class="files-grid">
            <div v-for="file in filteredFiles" :key="file.id" class="file-card">
              <div class="file-icon">
                <el-icon :size="48">
                  <component :is="getFileIcon(file.type)" />
                </el-icon>
              </div>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-meta">
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <span class="file-uploader">{{ file.uploader }}</span>
                  <span class="file-time">{{ formatDate(file.uploadTime) }}</span>
                </div>
              </div>
              <div class="file-actions">
                <el-button type="primary" text size="small" @click="previewFile(file)">
                  预览
                </el-button>
                <el-button type="success" text size="small" @click="downloadSharedFileById(file.id)">
                  下载
                </el-button>
              </div>
            </div>
          </div>
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Cookies from 'js-cookie'
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
import { getAvatarUrl } from '@/utils/avatar'
import { useMessageWebSocket } from '@/composables/useMessageWebSocket'

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
const showEmojiPicker = ref(false)
const fileSearch = ref('')
const chatContainerRef = ref(null)
const currentPage = ref(1)
const totalMessages = ref(0)
const hasMoreMessages = ref(true)

// 表情列表
const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐'
]

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

// 过滤文件列表
const filteredFiles = computed(() => {
  if (!fileSearch.value) {
    return sharedFiles.value
  }
  return sharedFiles.value.filter(file => 
    file.name.toLowerCase().includes(fileSearch.value.toLowerCase())
  )
})

// 方法：从会话成员中提取对方（非当前用户）的头像
const getSessionAvatar = (session) => {
  if (!session || !session.members) return undefined
  
  // 找到不是当前用户的成员（即导师/联系人）
  const otherMember = session.members.find(member => member.userId !== userStore.userInfo?.userId)
  
  // 如果有其他成员，返回其头像；否则返回第一个成员的头像
  const avatar = otherMember ? otherMember.avatar : session.members[0]?.avatar
  
  // 使用导入的 getAvatarUrl 函数处理头像 URL
  return getAvatarUrl(avatar)
}

// 方法
const loadAdvisorData = async () => {
  try {
    // 获取导师信息
    const advisorRes = await getAdvisorInteractionInfo();
    if (advisorRes.code === 200 && advisorRes.data) {
      advisorInfo.value = advisorRes.data;
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
    
    // 获取共享文件（单独处理错误，不影响整体页面）
    if (activeSessionId.value) {
      try {
        const filesRes = await getSharedFiles(activeSessionId.value);
        if (filesRes.code === 200) {
          sharedFiles.value = filesRes.data;
        }
      } catch (error) {
        console.warn('获取共享文件失败:', error);
        // 共享文件获取失败不影响页面整体功能
      }
    }
  } catch (error) {
    console.error('加载导师数据失败:', error);
    ElMessage.error('加载数据失败：' + (error.message || '未知错误'));
  }
};

const loadMessages = async (sessionId, isPrepend = false) => {
  loadingMessages.value = true;
  
  let scrollHeightBefore = 0;
  if (isPrepend && chatContainerRef.value) {
    scrollHeightBefore = chatContainerRef.value.scrollHeight;
  }
  
  try {
    const res = await getMessages({
      sessionId,
      pageNum: isPrepend ? currentPage.value + 1 : 1,
      pageSize: 20
    });
    if (res.code === 200) {
      const newMessages = res.data.records || [];
      totalMessages.value = res.data.total || 0;
      
      if (isPrepend) {
        currentMessages.value = [...currentMessages.value, ...newMessages];
        currentPage.value++;
      } else {
        currentMessages.value = newMessages;
        currentPage.value = 1;
      }
      
      hasMoreMessages.value = currentMessages.value.length < totalMessages.value;
      
      if (!isPrepend) {
        // 标记消息为已读 - 这会自动更新 unreadCount
        try {
          const readRes = await markMessagesAsRead({
            sessionId
          });
          if (readRes.code === 200) {
            // 手动更新当前会话的未读数
            const sessionIndex = messageSessions.value.findIndex(s => s.id === sessionId);
            if (sessionIndex !== -1) {
              messageSessions.value[sessionIndex].unreadCount = 0;
            }
          }
        } catch (error) {
          console.warn('标记消息已读失败:', error);
        }
        // 滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
      } else {
        // 加载更多时保持滚动位置
        nextTick(() => {
          if (chatContainerRef.value) {
            chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight - scrollHeightBefore;
          }
        });
      }
    }
  } catch (error) {
    console.error('加载消息失败:', error);
    ElMessage.error('加载消息失败');
  } finally {
    loadingMessages.value = false;
  }
};

const switchSession = (sessionId) => {
  activeSessionId.value = sessionId;
  currentPage.value = 1;
  hasMoreMessages.value = true;
  loadMessages(sessionId);
  // 切换会话时，同时更新该会话的未读数
  const sessionIndex = messageSessions.value.findIndex(s => s.id === sessionId);
  if (sessionIndex !== -1) {
    messageSessions.value[sessionIndex].unreadCount = 0;
  }
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
      // 从会话成员中找到非当前用户的成员（即导师）
      const otherMember = currentSession.value?.members?.find(member => member.userId !== userStore.userInfo?.userId);
      const receiverId = otherMember?.userId;
      
      if (!receiverId) {
        ElMessage.error('无法获取接收者信息');
        return;
      }
      
      const messageData = {
        sessionId: activeSessionId.value,
        receiverId: receiverId,
        content: newMessage.value,
        attachmentIds: attachments.value.map(att => att.id)
      };

      const res = await sendMsgApi(messageData);
      
      if (res.code === 200) {
        // 直接将新消息添加到列表末尾，并添加发送者的头像信息
        const newMsg = res.data;
        // 确保消息包含发送者的头像
        if (!newMsg.senderAvatar) {
          newMsg.senderAvatar = userStore.userInfo?.avatar;
        }
        currentMessages.value.push(newMsg);
        // 刷新会话列表，更新最后消息
        await loadAdvisorData();
        newMessage.value = '';
        attachments.value = [];
        ElMessage.success('消息发送成功');
        // 滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
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

// 插入表情
const insertEmoji = (emoji) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
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

// 格式化消息时间 - 更详细的时间显示
const formatMessageTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const target = new Date(date)
  const diff = now - target
  const oneDay = 24 * 60 * 60 * 1000
  
  // 今天
  if (now.toDateString() === target.toDateString()) {
    return target.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  // 昨天
  else if (diff < oneDay * 2 && diff >= oneDay) {
    return `昨天 ${target.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
  }
  // 本周内
  else if (diff < oneDay * 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${weekdays[target.getDay()]} ${target.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
  }
  // 更早
  else {
    return target.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) + 
           ' ' + target.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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

const scrollToBottom = () => {
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

const handleMessagesScroll = async (e) => {
  const target = e.target;
  if (!target) return;
  
  const isNearTop = target.scrollTop < 50;
  
  if (isNearTop && hasMoreMessages.value && !loadingMessages.value) {
    await loadMessages(activeSessionId.value, true);
  }
}

// 上传文件
const uploadFile = async () => {
  try {
    // 创建文件选择器
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.doc,.docx,.pdf,.txt,.xls,.xlsx,.jpg,.jpeg,.png'
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files)
      for (let file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('sessionId', activeSessionId.value)
        
        try {
          const res = await uploadMessageFile(formData)
          if (res.code === 200) {
            // 刷新共享文件列表
            if (activeSessionId.value) {
              const filesRes = await getSharedFiles(activeSessionId.value)
              if (filesRes.code === 200) {
                sharedFiles.value = filesRes.data
              }
            }
            ElMessage.success(`${file.name} 上传成功`)
          }
        } catch (error) {
          console.error('文件上传失败:', error)
          ElMessage.error(`${file.name} 上传失败`)
        }
      }
    }
    
    input.click()
  } catch (error) {
    console.error('附件上传失败:', error)
    ElMessage.error('附件上传失败')
  }
}

// 预览文件
const previewFile = (file) => {
  // 这里可以添加文件预览逻辑
  ElMessage.info(`预览文件: ${file.name}`)
  // 实际项目中可以根据文件类型打开不同的预览方式
}

// 下载共享文件
const downloadSharedFileById = async (fileId) => {
  try {
    const res = await downloadSharedFile(fileId)
    // 创建下载链接
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `file_${fileId}`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

onMounted(() => {
  loadAdvisorData();
  // 连接WebSocket，监听实时消息
  setTimeout(() => {
    if (userStore.userInfo?.userId) {
      try {
        // WebSocket 连接逻辑
        const { connect: connectWebSocket, isConnected: wsConnected } = useMessageWebSocket()
        const handleNewMessage = (message) => {
          console.log('处理新消息:', message)
          // 如果是当前会话的消息，直接添加到消息列表
          if (message.sessionId === activeSessionId.value) {
            currentMessages.value.push(message)
          }
          // 刷新会话列表，更新未读消息数
          loadAdvisorData()
        }
        
        connectWebSocket(userStore.userInfo.userId, handleNewMessage);
      } catch (error) {
        console.error('WebSocket 连接失败:', error);
        // 不影响页面主功能，仅提示
        ElMessage.warning('实时消息连接失败，不影响其他功能');
      }
    }
  }, 1000); // 延迟 1 秒连接
});
</script>

<style lang="scss" scoped>
.advisor-interaction-page {
  padding: 0;
}

.page-header {
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  
  .page-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
  }
  
  .page-desc {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
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
  padding: 1.5rem 1rem;
  
  .advisor-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f0f0f0;
    
    .advisor-avatar {
      margin-right: 1rem;
      
      .el-avatar {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 2px solid white;
      }
    }
    
    .advisor-basic-info {
      flex: 1;
      
      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #2c3e50;
      }
      
      .advisor-title {
        margin: 0 0 0.5rem 0;
        color: #07C160;
        font-weight: 500;
        font-size: 0.9rem;
      }
      
      .advisor-field {
        margin: 0;
        color: #606266;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        .el-icon {
          color: #07C160;
          font-size: 14px;
        }
      }
    }
  }
  
  .advisor-details-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    
    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      
      .detail-icon {
        color: #07C160;
        font-size: 16px;
        margin-top: 2px;
      }
      
      .detail-content {
        flex: 1;
        
        .detail-label {
          display: block;
          font-size: 0.75rem;
          color: #909399;
          margin-bottom: 2px;
        }
        
        .detail-value {
          display: block;
          font-size: 0.85rem;
          color: #303133;
          word-break: break-all;
        }
      }
    }
  }
  
  .advisor-bio {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    
    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #2c3e50;
    }
    
    p {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.4;
      color: #606266;
    }
  }
  
  .advisor-actions {
    display: flex;
    gap: 0.75rem;
    
    .primary-button {
      flex: 1;
      background: #07C160;
      border-color: #07C160;
      
      &:hover {
        background: #06b355;
        border-color: #06b355;
      }
    }
    
    .secondary-button {
      flex: 1;
      color: #07C160;
      
      &:hover {
        color: #06b355;
      }
    }
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
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    &.session-active {
      background-color: #f0f9eb;
    }
    
    .session-avatar {
      margin-right: 12px;
      flex-shrink: 0;
      position: relative;
      
      .el-avatar {
        width: 40px;
        height: 40px;
        border-radius: 8px;
      }
      
      .session-status {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        background: #07C160;
        border: 2px solid white;
        border-radius: 50%;
      }
    }
    
    .session-content {
      flex: 1;
      min-width: 0;
      
      .session-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        
        .session-name {
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }
        
        .session-time {
          font-size: 11px;
          color: #909399;
          flex-shrink: 0;
          margin-left: 8px;
        }
      }
      
      .session-preview {
        font-size: 13px;
        color: #909399;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
      }
      
      .session-meta {
        position: absolute;
        top: 12px;
        right: 16px;
        
        .el-tag {
          font-size: 10px;
          height: 16px;
          line-height: 16px;
          padding: 0 6px;
          border-radius: 10px;
          background: #ff4d4f;
          color: white;
          font-weight: 500;
        }
      }
    }
  }
}

.chat-container {
  height: 500px;
  overflow-y: auto;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #c3cfe2 #f5f7fa;
  
  .loading-more {
    text-align: center;
    padding: 12px;
    color: #909399;
    font-size: 13px;
  }
  
  .quick-replies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    padding: 12px;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
    border-radius: 12px;
    border: 1px solid #e8ecf1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    
    .el-tag {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-width: 1.5px;
      
      &:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        border-color: #667eea;
      }
    }
  }
  
  .messages-area {
    .message-item {
        display: flex;
        margin-bottom: 1rem;
        animation: fadeIn 0.3s ease-in-out;
      
      &.message-sent {
        flex-direction: row-reverse;
        
        .message-content {
          align-items: flex-end;
          
          .message-info {
            justify-content: flex-end;
          }
        }
        
        .message-bubble {
          background: #07C160;
          color: white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          border: none;
          position: relative;
          max-width: 80%;
          
          &::after {
            content: '';
            position: absolute;
            bottom: 8px;
            right: -8px;
            width: 0;
            height: 0;
            border-left: 8px solid #07C160;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
          }
          
          .message-time {
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }
      
      &.message-received {
        .message-bubble {
          background: white;
          border: 1px solid #e8ecf1;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          position: relative;
          max-width: 80%;
          
          &::after {
            content: '';
            position: absolute;
            bottom: 8px;
            left: -8px;
            width: 0;
            height: 0;
            border-right: 8px solid white;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
          }
        }
      }
      
      .message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin: 0 0.5rem;
        flex-shrink: 0;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        border: 1px solid #e8ecf1;
      }
      
      .message-content {
        display: flex;
        flex-direction: column;
        
        .message-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          font-size: 0.7rem;
          color: #909399;
          padding: 0 4px;
          gap: 8px;
          
          .message-sender {
            font-weight: 500;
            color: #606266;
            font-size: 0.75rem;
          }
          
          .message-time {
            opacity: 0.7;
            color: #909399;
            font-size: 0.65rem;
          }
        }
        
        .message-bubble {
          padding: 8px 12px;
          border-radius: 18px;
          margin-bottom: 4px;
          transition: all 0.2s ease;
          
          .message-text {
            line-height: 1.4;
            font-size: 15px;
            word-break: break-word;
          }
          
          .message-time {
            font-size: 11px;
            opacity: 0.6;
            text-align: right;
            margin-top: 2px;
          }
        }
        
        .message-attachments {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 6px;
          
          .attachment-item {
            display: flex;
            align-items: center;
            padding: 8px 10px;
            background: white;
            border: 1px solid #e8ecf1;
            border-radius: 8px;
            transition: all 0.2s ease;
            cursor: pointer;
            
            &:hover {
              border-color: #07C160;
              box-shadow: 0 1px 4px rgba(7, 193, 96, 0.15);
            }
            
            .el-icon {
              margin-right: 6px;
              font-size: 14px;
              color: #07C160;
            }
            
            span {
              flex: 1;
              margin-right: 0.5rem;
              font-size: 13px;
              color: #303133;
            }
          }
        }
      }
    }
    
    .message-time-divider {
      text-align: center;
      margin: 12px 0;
      font-size: 11px;
      color: #909399;
      background: rgba(0, 0, 0, 0.05);
      padding: 2px 12px;
      border-radius: 10px;
      align-self: center;
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
  border-top: 1px solid #e8ecf1;
  padding-top: 0.5rem;
  padding-bottom: 1rem;
  background: white;
  border-radius: 0 0 12px 12px;
  
  .input-toolbar {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    
    .toolbar-tip {
      font-size: 0.75rem;
      color: #909399;
      margin-left: 8px;
    }
  }
  
  .emoji-picker {
    background: white;
    border: 1px solid #e8ecf1;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 8px;
      
      .emoji-item {
        font-size: 20px;
        cursor: pointer;
        text-align: center;
        padding: 4px;
        border-radius: 4px;
        
        &:hover {
          background: #f0f0f0;
        }
      }
    }
  }
  
  :deep(.el-textarea__inner) {
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s ease;
    font-size: 15px;
    line-height: 1.4;
    
    &:focus {
      border-color: #07C160;
      box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.1);
    }
  }
  
  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    
    .input-info {
      .attachment-count {
        font-size: 0.875rem;
        color: #606266;
        display: flex;
        align-items: center;
        gap: 4px;
        
        .el-icon {
          color: #07C160;
        }
      }
    }
    
    .send-button {
      background: #07C160;
      border-color: #07C160;
      
      &:hover {
        background: #06b355;
        border-color: #06b355;
      }
      
      &:disabled {
        background: #f0f9eb;
        border-color: #c2e7b0;
        color: #a7d28b;
      }
    }
  }
}

.file-name {
  display: flex;
  align-items: center;
  
  .el-icon {
    margin-right: 0.5rem;
    color: #07C160;
  }
}

.files-card {
  .card-header {
    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .no-files {
    padding: 2rem 0;
    text-align: center;
  }
  
  .files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 1rem;
  }
  
  .file-card {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #07C160;
    }
    
    .file-icon {
      text-align: center;
      margin-bottom: 12px;
      
      .el-icon {
        color: #07C160;
      }
    }
    
    .file-info {
      margin-bottom: 12px;
      
      .file-name {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .file-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 12px;
        color: #909399;
        
        .file-size,
        .file-uploader,
        .file-time {
          padding: 2px 6px;
          background: #f8f9fa;
          border-radius: 4px;
        }
      }
    }
    
    .file-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
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
  
  .chat-container {
    height: 400px;
    padding: 1rem;
  }
  
  .advisor-detail {
    padding: 1rem;
    
    .advisor-header {
      flex-direction: column;
      text-align: center;
      
      .advisor-avatar {
        margin-right: 0;
        margin-bottom: 1rem;
      }
    }
    
    .advisor-actions {
      flex-direction: column;
    }
  }
  
  .message-input {
    padding: 0.5rem;
    
    .input-toolbar {
      flex-wrap: wrap;
      
      .el-button {
        font-size: 12px;
      }
    }
    
    :deep(.el-textarea__inner) {
      font-size: 14px;
    }
  }
  
  .sessions-list {
    .session-item {
      padding: 10px 12px;
      
      .session-avatar {
        margin-right: 8px;
        
        .el-avatar {
          width: 36px;
          height: 36px;
        }
      }
      
      .session-content {
        .session-header {
          .session-name {
            font-size: 13px;
          }
          
          .session-time {
            font-size: 10px;
          }
        }
        
        .session-preview {
          font-size: 12px;
        }
      }
    }
  }
  
  .files-card {
    :deep(.el-table) {
      font-size: 12px;
      
      :deep(.el-table__cell) {
        padding: 8px;
      }
    }
  }
}

// 小屏幕设备
@media (max-width: 480px) {
  .chat-container {
    height: 350px;
  }
  
  .page-header {
    padding: 16px;
    
    .page-title {
      font-size: 1.5rem;
    }
  }
  
  .message-input {
    .input-actions {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      
      .input-info {
        text-align: center;
      }
    }
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 滚动条美化
.chat-container::-webkit-scrollbar {
  width: 6px;
}

// 消息动画
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

.chat-container::-webkit-scrollbar-track {
  background: #f1f3f4;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
</style>