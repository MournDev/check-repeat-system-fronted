import { ref, reactive, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

/**
 * 查重任务进度监听 Hook（Vue 3 Composition API）
 * 使用原生 WebSocket 连接后端
 */
export function useCheckProgress() {
  let ws = null;
  let reconnectTimer = null;
  
  // 响应式进度数据
  const progress = reactive({
    taskId: null,
    paperId: null,
    percent: 0,
    message: '',
    similarity: 0,
    riskLevel: '',
    status: 'active' // active | exception | success
  });

  // 连接状态
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const error = ref(null);

  /**
   * 连接 WebSocket 并订阅查重进度
   * @param {string|number} paperId - 论文ID
   * @param {Function} [onMessage] - 收到消息时的回调
   */
  const connect = (paperId, onMessage) => {
    if (!paperId) {
      console.error('paperId 不能为空');
      return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket 已连接，跳过');
      return;
    }

    isConnecting.value = true;
    error.value = null;

    try {
      // 构建 WebSocket URL
      const baseUrl = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080';
      // 将 http 转换为 ws，https 转换为 wss
      const wsUrl = baseUrl.replace('http', 'ws') + `/ws/check-progress/${paperId}`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket 连接成功，开始监听查重进度');
        isConnected.value = true;
        isConnecting.value = false;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // 根据消息类型处理
          if (data.type === 'progress') {
            updateProgress(data);
          } else if (data.type === 'complete') {
            updateProgress(data);
            progress.status = 'success';
            ElMessage.success('查重完成！');
          } else if (data.type === 'error') {
            updateProgress(data);
            progress.status = 'exception';
            ElMessage.error(data.message || '查重失败');
          }
          
          onMessage && onMessage(data);
        } catch (e) {
          console.error('[useCheckProgress] 消息解析失败:', e);
        }
      };

      ws.onerror = (evt) => {
        console.error('[useCheckProgress] WebSocket 错误:', evt);
        error.value = 'WebSocket连接失败';
        isConnected.value = false;
        isConnecting.value = false;
        // 尝试重连
        scheduleReconnect(paperId, onMessage);
      };

      ws.onclose = () => {
        console.log('WebSocket 连接关闭');
        isConnected.value = false;
        isConnecting.value = false;
        // 尝试重连
        scheduleReconnect(paperId, onMessage);
      };
    } catch (err) {
      console.error('创建 WebSocket 连接失败', err);
      isConnecting.value = false;
      error.value = '连接失败: ' + err.message;
    }
  };

  /**
   * 安排重连
   */
  const scheduleReconnect = (paperId, onMessage) => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    
    // 5秒后尝试重连
    reconnectTimer = setTimeout(() => {
      console.log('尝试重新连接 WebSocket');
      connect(paperId, onMessage);
    }, 5000);
  };

  /**
   * 更新进度数据
   */
  const updateProgress = (data) => {
    if (data.paperId) progress.paperId = data.paperId;
    if (data.progress) progress.percent = data.progress;
    if (data.message) progress.message = data.message;
    if (data.similarity) progress.similarity = data.similarity;
    if (data.riskLevel) progress.riskLevel = data.riskLevel;
  };

  /**
   * 断开 WebSocket 连接
   */
  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (ws) {
      ws.close();
      ws = null;
    }
    isConnected.value = false;
  };

  // 组件卸载时自动清理
  onUnmounted(() => {
    disconnect();
  });

  return {
    connect,
    disconnect,
    progress,
    isConnected,
    isConnecting,
    error
  };
}
