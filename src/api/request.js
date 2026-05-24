import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import router from '@/router'
import { cache, generateCacheKey } from '@/utils/cache'
import Cookies from 'js-cookie'

let isRefreshing = false
let refreshSubscribers = []

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb)
}

// 通用请求方法
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120000
})

let loadingInstance = null
service.interceptors.request.use(
  (config) => {
    if (!config) {
      config = {}
    }
    
    if (!config.headers) {
      config.headers = {}
    }
    
    if (!config.method) {
      config.method = 'get'
    }
    
    // 处理令牌：从本地存储获取，适配不同环境
    const token = Cookies.get('token') || ''
    if (token) {
      const cleanToken = String(token).trim().replace(/\s+/g, '')
      config.headers[import.meta.env.VITE_JWT_HEADER || 'Authorization'] = `Bearer ${cleanToken}`
    }
    
    // 加载提示（文件上传等大请求不需要）
    if (!config.headers['Content-Type']?.includes('multipart/form-data')) {
      loadingInstance = ElLoading.service({ text: '处理中...', lock: true })
    }
    return config
  },
  (error) => {
    loadingInstance?.close()
    ElMessage.error('请求发送失败')
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    loadingInstance?.close()
    if (response.config?.responseType === 'blob') {
      return response;
    }
    
    const res = response.data;
    if (res.code === 200) {
      return res;
    } else {
      ElMessage.error(res.message || '操作失败');
      return Promise.reject(res);
    }
  },
  (error) => {
    loadingInstance?.close();
    
    if (!error.response) {
      ElMessage.error('网络错误，请检查网络连接');
      return Promise.reject(error);
    }
    
    if (error.config?.responseType === 'blob' && error.response?.status === 401) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result);
          ElMessage.error(errorData.message || '登录已过期');
        } catch (e) {
          ElMessage.error('登录已过期，请重新登录');
        }
      };
      reader.readAsText(error.response.data);
      return Promise.reject(error);
    }
    
    const status = error.response?.status;
    const errorData = error.response?.data;
    
    if (status === 401) {
      if (error.config?._skipLoginRedirect) {
        console.warn('接口返回401但已配置跳过重定向:', error.config.url);
        return Promise.reject(error);
      }
      if (error.config?._retry) {
        Cookies.remove('token');
        Cookies.remove('role');
        router.push('/login');
        ElMessage.error(errorData?.message || '登录已过期，请重新登录');
        return Promise.reject(error);
      }
      const token = Cookies.get('token');
      if (!token) {
        router.push('/login');
        ElMessage.error('登录已过期，请重新登录');
        return Promise.reject(error);
      }
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh-token`,
            null,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data?.code === 200 && res.data?.data?.token) {
            const newToken = res.data.data.token;
            Cookies.set('token', newToken, { expires: 1, secure: import.meta.env.PROD, sameSite: 'strict' });
            onTokenRefreshed(newToken);
            isRefreshing = false;
            error.config.headers.Authorization = `Bearer ${newToken}`;
            error.config._retry = true;
            return service(error.config);
          }
        } catch (refreshError) {
          onTokenRefreshed(null);
        }
        isRefreshing = false;
      }
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken) => {
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            error.config._retry = true;
            resolve(service(error.config));
          } else {
            Cookies.remove('token');
            Cookies.remove('role');
            router.push('/login');
            ElMessage.error('登录已过期，请重新登录');
            resolve(Promise.reject(error));
          }
        });
      });
    } 
    else if (status === 403) {
      ElMessage.error(errorData?.message || '权限不足，无法操作');
    } 
    else if (status === 404) {
      ElMessage.error(errorData?.message || '请求接口不存在');
    } 
    else if (status === 400) {
      ElMessage.error(errorData?.message || '请求参数错误，请检查输入');
    }
    else if (status === 429) {
      ElMessage.error('请求过于频繁，请稍后再试');
    }
    else if (status === 500) {
      ElMessage.error(errorData?.message || '服务器内部错误，请联系管理员');
    }
    else if (status === 502) {
      ElMessage.error('网关错误，请稍后再试');
    }
    else if (status === 503) {
      ElMessage.error('服务暂时不可用，请稍后再试');
    }
    else if (status === 504) {
      ElMessage.error('网关超时，请稍后再试');
    }
    else {
      ElMessage.error(errorData?.message || '请求失败，请重试');
    }
    return Promise.reject(error);
  }
)

export default service
