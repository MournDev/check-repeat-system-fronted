import { ref, onUnmounted, reactive } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ElMessage } from 'element-plus'

/**
 * 查重进度订阅 Composable
 * 使用 STOMP over SockJS 连接后端 WebSocket
 */
export function useCheckProgress() {
  let stompClient = null
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref(null)
  
  // 响应式进度数据
  const progress = reactive({
    taskId: null,
    paperId: null,
    stage: '',
    percent: 0,
    message: '',
    estimatedRemainingSeconds: 0,
    status: 'active' // active | exception | success
  })

  /**
   * 连接并订阅查重进度
   * @param {string|number} taskId - 任务ID
   * @param {Function} onMessage - 收到消息时的回调，参数为解析后的数据对象
   * @param {Function} [onError] - 连接失败时的回调
   */
  const connect = (taskId, onMessage, onError) => {
    if (!taskId) {
      console.error('taskId 不能为空');
      return;
    }

    isConnecting.value = true
    error.value = null

    const baseUrl = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080'

    stompClient = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP 连接成功', taskId);
        isConnected.value = true
        isConnecting.value = false
        error.value = null

        // 订阅进度消息
        const destination = `/topic/check-progress/${taskId}`;
        stompClient.subscribe(destination, (frame) => {
          try {
            const data = JSON.parse(frame.body)
            
            // 更新进度
            progress.taskId = data.taskId;
            progress.paperId = data.paperId;
            progress.stage = data.stage;
            progress.percent = data.percent;
            progress.message = data.message;
            progress.estimatedRemainingSeconds = data.estimatedRemainingSeconds;

            // 根据阶段设置状态
            if (data.stage === 'COMPLETED') {
              progress.status = 'success';
              ElMessage.success('查重完成！');
              disconnect();
            } else if (data.stage === 'FAILED') {
              progress.status = 'exception';
              ElMessage.error(data.message);
              disconnect();
            }

            console.log('收到进度更新', data);
            onMessage && onMessage(data)
          } catch (e) {
            console.error('[useCheckProgress] 消息解析失败:', e)
          }
        })

        console.log('已订阅目的地:', destination);
      },
      onStompError: (frame) => {
        console.error('[useCheckProgress] STOMP 错误:', frame)
        error.value = frame.headers?.message || 'STOMP连接错误'
        isConnected.value = false
        isConnecting.value = false
        onError && onError(error.value)
      },
      onDisconnect: () => {
        isConnected.value = false
        isConnecting.value = false
      },
      onWebSocketError: (evt) => {
        console.error('[useCheckProgress] WebSocket 错误:', evt)
        error.value = 'WebSocket连接失败'
        isConnected.value = false
        isConnecting.value = false
        onError && onError(error.value)
      }
    })

    stompClient.activate()
  }

  /**
   * 断开连接
   */
  const disconnect = () => {
    if (stompClient && stompClient.active) {
      stompClient.deactivate()
    }
    stompClient = null
    isConnected.value = false
    isConnecting.value = false
  }

  // 组件卸载时自动断开
  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
    progress,
    isConnected,
    isConnecting,
    error
  }
}
