<template>
  <div class="paper-review">
    <!-- 子导航 -->
    <el-tabs v-model="activeTab" class="mb-4" @tab-click="handleTabChange">
      <el-tab-pane label="待审核论文" name="/teacher/paper-review/pending" />
      <el-tab-pane label="审核记录" name="/teacher/paper-review/audit-records" />
    </el-tabs>

    <!-- 子路由组件渲染 -->
    <router-view />
  </div>
</template>

<script setup>
import { ElTabs, ElTabPane } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 绑定当前路由路径作为标签页激活状态
const activeTab = route.path

// 监听标签页切换
const handleTabChange = (tab) => {
  // tab参数是一个对象，包含tab实例，需要获取其paneName属性
  const tabName = tab.props.name
  router.push(tabName)
}
</script>

<style scoped>
.paper-review {
  min-height: 100vh;
  background: #f8fafc; /* Slate-50 */
  color: #0f172a; /* Slate-900 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.el-tabs) {
  margin-bottom: 24px;
  
  .el-tabs__header {
    margin-bottom: 24px;
    
    .el-tabs__nav {
      border-bottom: 1px solid #e2e8f0;
      
      .el-tabs__item {
        font-size: 0.875rem;
        font-weight: 500;
        color: #64748b;
        padding: 12px 16px;
        margin-right: 24px;
        transition: all 0.2s ease;
        
        &:hover {
          color: #0f172a;
        }
        
        &.is-active {
          color: #1e40af;
          font-weight: 600;
          
          &::after {
            background-color: #1e40af;
            height: 2px;
          }
        }
      }
    }
  }
  

}
</style>