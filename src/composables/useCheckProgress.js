/**
 * 查重任务进度监听 Hook（Vue 3 Composition API）
 * 
 * 使用示例：
 * ```vue
 * <script setup>
 * import { useCheckProgress } from '@/composables/useCheckProgress';
 * 
 * const { connect, disconnect, progress, isConnected } = useCheckProgress();
 * 
 * // 发起查重并连接 WebSocket
 * const startCheck = async (paperId) => {
 *   const result = await api.createCheckTask(paperId);
 *   connect(result.data.id); // 连接到 WebSocket
 * };
 * 
 * // 组件卸载时断开连接
 * onUnmounted(() => {
 *   disconnect();
 * });
 * </script>
 * 
 * <template>
 *   <div v-if="isConnected">
 *     <a-progress :percent="progress.percent" :status="progress.status">
 *       {{ progress.message }}
 *     </a-progress>
 *   </div>
 * </template>
 * ```
 */

import { ref, reactive, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';

export function useCheckProgress() {
  let stompClient = null;
  let sock = null;
  const reconnectTimer = ref(null);
  const heartbeatTimer = ref(null);

  // 响应式进度数据
  const progress = reactive({
    taskId: null,
    paperId: null,
    stage: '',
    percent: 0,
    message: '',
    estimatedRemainingSeconds: 0,
    status: 'active' // active | exception | success
  });

  // 连接状态
  const isConnected = ref(false);
  const isConnecting = ref(false);

  /**
   * 连接 WebSocket（使用 SockJS + STOMP）
   */
  const connect = (taskId) => {
    if (!taskId) {
      console.error('taskId 不能为空');
      return;
    }

    if (stompClient && stompClient.connected) {
      console.log('STOMP 已连接，跳过');
      return;
    }

    isConnecting.value = true;

    try {
      // 1. 创建 SockJS 连接
      sock = new SockJS('/ws');
      
      // 2. 创建 STOMP 客户端
      stompClient = over(sock);

      // 3. 连接成功回调
      stompClient.connect({}, () => {
        console.log('STOMP 连接成功', taskId);
        isConnected.value = true;
        isConnecting.value = false;
        
        // 4. 订阅进度消息
        const destination = `/topic/check-progress/${taskId}`;
        stompClient.subscribe(destination, (frame) => {
          try {
            const data = JSON.parse(frame.body);
            
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
              message.success('查重完成！');
              disconnect();
            } else if (data.stage === 'FAILED') {
              progress.status = 'exception';
              message.error(data.message);
              disconnect();
            }

            console.log('收到进度更新', data);
          } catch (error) {
            console.error('解析 STOMP 消息失败', error);
          }
        });

        console.log('已订阅目的地:', destination);
        startHeartbeat();
      }, (error) => {
        console.error('STOMP 连接失败', error);
        isConnecting.value = false;
        scheduleReconnect(taskId);
      });
    } catch (error) {
      console.error('创建 WebSocket 连接失败', error);
      isConnecting.value = false;
      scheduleReconnect(taskId);
    }
  };

  /**
   * 断开 WebSocket 连接
   */
  const disconnect = () => {
    stopHeartbeat();
    stopReconnect();
    
    if (stompClient) {
      stompClient.disconnect(() => {
        console.log('STOMP 连接已断开');
      });
      stompClient = null;
    }
    
    if (sock) {
      sock.close();
      sock = null;
    }
    
    isConnected.value = false;
  };

  /**
   * 启动重连机制
   */
  const scheduleReconnect = (taskId) => {
    if (reconnectTimer.value) return;

    console.log('5 秒后尝试重连...');
    reconnectTimer.value = setTimeout(() => {
      reconnectTimer.value = null;
      connect(taskId);
    }, 5000);
  };

  /**
   * 停止重连
   */
  const stopReconnect = () => {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value);
      reconnectTimer.value = null;
    }
  };

  /**
   * 启动心跳检测（每 30 秒发送一次 ping）
   */
  const startHeartbeat = () => {
    if (heartbeatTimer.value) return;

    heartbeatTimer.value = setInterval(() => {
      if (stompClient && stompClient.connected) {
        stompClient.send('/app/ping', {}, JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        console.log('发送心跳包');
      }
    }, 30000);
  };

  /**
   * 停止心跳
   */
  const stopHeartbeat = () => {
    if (heartbeatTimer.value) {
      clearInterval(heartbeatTimer.value);
      heartbeatTimer.value = null;
    }
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
    isConnecting
  };
}
