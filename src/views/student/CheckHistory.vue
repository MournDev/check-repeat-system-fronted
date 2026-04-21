<template>
  <div class="check-history-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button class="back-button" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回</span>
          </button>
          <h1 class="page-title">查重历史记录</h1>
        </div>
        <div class="header-actions">
          <button class="refresh-button" @click="refreshHistory">
            <el-icon><Refresh /></el-icon>
            <span>刷新</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 论文信息 -->
    <div class="paper-info-card">
      <div class="paper-header">
        <h2 class="paper-title">{{ paperInfo.title }}</h2>
        <div class="paper-stats">
          <div class="stat-item">
            <div class="stat-label">当前相似度</div>
            <div class="stat-value" :class="getCurrentSimilarityClass(paperInfo.currentSimilarity)">{{ paperInfo.currentSimilarity }}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">历史最低</div>
            <div class="stat-value lowest">{{ paperInfo.lowestSimilarity }}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">版本数</div>
            <div class="stat-value">{{ paperInfo.versionCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 相似度趋势图 -->
    <div class="trend-card">
      <div class="card-header">
        <div class="card-title">
          <el-icon><DataLine /></el-icon>
          <span>相似度趋势</span>
        </div>
        <div class="trend-controls">
          <div class="radio-group">
            <label 
              v-for="period in ['7', '30', '90']" 
              :key="period"
              class="radio-button"
              :class="{ active: trendPeriod === period }"
              @click="trendPeriod = period; loadTrendData()"
            >
              近{{ period }}天
            </label>
          </div>
        </div>
      </div>
      
      <div class="trend-chart-container">
        <div class="chart-wrapper">
          <canvas ref="trendChart" width="800" height="400"></canvas>
        </div>
        <div class="trend-summary">
          <div class="summary-item">
            <div class="summary-label">总体趋势</div>
            <div class="summary-value" :class="trendAnalysis.direction">
              {{ getTrendText(trendAnalysis.direction) }}
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">总改进幅度</div>
            <div class="summary-value improvement">
              ↓{{ Math.abs(trendAnalysis.totalImprovement) }}%
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">平均每版改进</div>
            <div class="summary-value">
              {{ trendAnalysis.averageImprovementPerVersion > 0 ? '+' : '' }}{{ trendAnalysis.averageImprovementPerVersion.toFixed(1) }}%
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">最佳版本</div>
            <div class="summary-value best">
              V{{ trendAnalysis.bestVersion }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本历史时间轴 -->
    <div class="history-card">
      <div class="card-header">
        <div class="card-title">
          <el-icon><Timer /></el-icon>
          <span>版本历史</span>
        </div>
        <button class="text-button" @click="toggleCompactView">
          {{ compactView ? '展开详情' : '紧凑显示' }}
        </button>
      </div>
      
      <div class="timeline-container">
        <div class="timeline">
          <div 
            v-for="(record, index) in historyRecords" 
            :key="record.version"
            class="timeline-item"
          >
            <div class="timeline-node" :class="getTimelineType(record.rating)"></div>
            <div class="timeline-line" v-if="index < historyRecords.length - 1"></div>
            <div class="timeline-content">
              <div class="timeline-timestamp">{{ formatDateTime(record.checkTime) }}</div>
              <div class="history-record" :class="{ 'current-version': record.isCurrent }">
                <div class="record-header">
                  <div class="version-info">
                    <span class="version-tag" :class="{ 'current': record.isCurrent }">
                      V{{ record.version }}
                    </span>
                    <span class="similarity-badge" :class="getSimilarityClass(record.similarity)">
                      {{ record.similarity }}%
                    </span>
                    <span class="rating-tag" :class="getRatingType(record.rating)">
                      {{ getRatingText(record.rating) }}
                    </span>
                  </div>
                  <div class="record-actions" v-if="!compactView">
                    <button class="action-button" @click="viewReport(record.reportId)">
                      查看报告
                    </button>
                    <button 
                      class="action-button" 
                      @click="compareWithCurrent(record.version)"
                      v-if="!record.isCurrent"
                    >
                      对比当前
                    </button>
                  </div>
                </div>
                
                <div class="record-content" v-if="!compactView">
                  <div class="changes-description">
                    <el-icon><EditPen /></el-icon>
                    <span>{{ record.changes }}</span>
                  </div>
                  
                  <div class="improvement-info" v-if="record.improvementFromPrevious !== undefined">
                    <span class="improvement-badge" :class="getImprovementClass(record.improvementFromPrevious)">
                      {{ record.improvementFromPrevious > 0 ? '+' : '' }}{{ record.improvementFromPrevious.toFixed(1) }}%
                    </span>
                    <span>相比上一版本</span>
                  </div>
                  
                  <div class="section-changes" v-if="record.sectionChanges">
                    <div class="section-change" v-for="(change, section) in record.sectionChanges" :key="section">
                      <span class="section-name">{{ getSectionName(section) }}:</span>
                      <span class="change-value" :class="getChangeClass(change.change)">
                        {{ change.to }}% ({{ change.change > 0 ? '+' : '' }}{{ change.change.toFixed(1) }}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本对比面板 -->
    <el-drawer
      v-model="showCompareDrawer"
      title="版本对比分析"
      direction="rtl"
      size="60%"
    >
      <div class="compare-content" v-if="compareData">
        <div class="compare-header">
          <div class="version-tags">
            <span class="version-tag old">V{{ compareData.fromVersion }}</span>
            <span class="vs">VS</span>
            <span class="version-tag current">V{{ compareData.toVersion }}</span>
          </div>
          <div class="overall-change" :class="getImprovementClass(compareData.overallChange)">
            总体变化: {{ compareData.overallChange > 0 ? '+' : '' }}{{ compareData.overallChange.toFixed(1) }}%
          </div>
        </div>
        
        <div class="compare-sections">
          <div 
            v-for="section in compareData.sectionComparison" 
            :key="section.name"
            class="section-compare-card"
          >
            <div class="section-header">
              <span class="section-name">{{ section.name }}</span>
              <span class="change-tag" :class="getChangeTagType(section.change)">
                {{ section.change > 0 ? '+' : '' }}{{ section.change.toFixed(1) }}%
              </span>
            </div>
            
            <div class="section-details">
              <div class="similarity-compare">
                <div class="similarity-item">
                  <div class="version-label">V{{ compareData.fromVersion }}</div>
                  <div class="progress-container">
                    <div 
                      class="progress-bar" 
                      :style="{ width: section.from + '%' }"
                      :class="getSimilarityClass(section.from)"
                    ></div>
                  </div>
                  <span class="similarity-value">{{ section.from }}%</span>
                </div>
                <div class="similarity-item">
                  <div class="version-label">V{{ compareData.toVersion }}</div>
                  <div class="progress-container">
                    <div 
                      class="progress-bar" 
                      :style="{ width: section.to + '%' }"
                      :class="getSimilarityClass(section.to)"
                    ></div>
                  </div>
                  <span class="similarity-value">{{ section.to }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 统计分析卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon improvement-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.improvementRate }}%</div>
            <div class="stat-label">改进效率</div>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon average-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.averageSimilarity }}%</div>
            <div class="stat-label">平均相似度</div>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon speed-icon">
            <el-icon><Lightning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.improvementSpeed }}</div>
            <div class="stat-label">改进速度</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Refresh, DataLine, Timer, EditPen, TrendCharts, 
  DataAnalysis, Lightning, ArrowRight, ArrowLeft
} from '@element-plus/icons-vue'
// ECharts 通过 CDN 引入，全局 window.echarts 可用

import { getCheckHistory, getSimilarityTrend, comparePaperVersions } from '@/api/student'

const route = useRoute()
const router = useRouter()

// 响应式数据
const paperInfo = ref({
  title: '',
  currentSimilarity: 0,
  lowestSimilarity: 0,
  versionCount: 0
})

const trendPeriod = ref('30')
const compactView = ref(false)
const showCompareDrawer = ref(false)
const trendChart = ref(null)
const chartInstance = ref(null)

const historyRecords = ref([])

const trendAnalysis = ref({
  direction: 'decreasing',
  totalImprovement: -27.1,
  averageImprovementPerVersion: -13.55,
  bestVersion: 3
})

const compareData = ref(null)
const stats = ref({
  improvementRate: 0,
  averageSimilarity: 0,
  improvementSpeed: ''
})

// 计算属性
const getCurrentSimilarityClass = computed(() => (similarity) => {
  if (similarity < 20) return 'excellent'
  if (similarity < 40) return 'good'
  return 'warning'
})

// 方法
const goBack = () => {
  router.back()
}

const refreshHistory = async () => {
  const paperId = route.params.paperId
  
  // 参数验证
  if (!paperId || paperId === 'undefined') {
    ElMessage.error('缺少论文ID参数')
    return
  }
  
  try {
    const res = await getCheckHistory(paperId)
    if (res.code === 200) {
      // 处理历史记录数据
      historyRecords.value = res.data.history || []
      
      // 处理趋势分析数据
      trendAnalysis.value = res.data.trendAnalysis || {
        direction: 'decreasing',
        totalImprovement: 0,
        averageImprovementPerVersion: 0,
        bestVersion: 1
      }
      
      // 处理论文信息
      paperInfo.value = {
        title: res.data.paperInfo?.title || '',
        currentSimilarity: res.data.paperInfo?.currentSimilarity || 0,
        lowestSimilarity: res.data.paperInfo?.lowestSimilarity || 0,
        versionCount: res.data.paperInfo?.versionCount || 0
      }
      
      // 处理统计数据
      stats.value = {
        improvementRate: res.data.statistics?.improvementRate || 0,
        averageSimilarity: res.data.statistics?.averageSimilarity || 0,
        improvementSpeed: res.data.statistics?.improvementSpeed || ''
      }
      
      ElMessage.success('历史记录已刷新')
    } else {
      ElMessage.error(res.message || '获取历史记录失败')
    }
  } catch (error) {
    console.error('刷新历史记录失败:', error)
    ElMessage.error('刷新失败: ' + (error.message || '网络错误'))
  }
}

const loadTrendData = async () => {
  const paperId = route.params.paperId
  
  // 参数验证
  if (!paperId || paperId === 'undefined') {
    return
  }
  
  try {
    const res = await getSimilarityTrend(paperId, trendPeriod.value)
    if (res.code === 200) {
      renderTrendChart(res.data)
    } else {
      ElMessage.error(res.message || '获取趋势数据失败')
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
    ElMessage.error('加载趋势数据失败: ' + (error.message || '网络错误'))
  }
}

const renderTrendChart = (data) => {
  nextTick(() => {
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }
    
    if (!trendChart.value) return
    
    // 初始化 ECharts 实例
    chartInstance.value = echarts.init(trendChart.value)
    
    // 配置选项
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: {
          color: '#fff',
          fontSize: 13
        },
        formatter: function(params) {
          const param = params[0]
          return `${param.name}<br/>相似度: ${param.value}%`
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.dates,
        axisLine: {
          lineStyle: {
            color: '#e4e7ed'
          }
        },
        axisLabel: {
          color: '#606266'
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#606266',
          formatter: '{value}%'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      series: [{
        name: '相似度',
        type: 'line',
        data: data.similarities,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#409eff'
        },
        itemStyle: {
          color: '#409eff',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        }
      }]
    }
    
    // 设置配置项
    chartInstance.value.setOption(option)
    
    // 响应式调整
    window.addEventListener('resize', () => {
      chartInstance.value?.resize()
    })
  })
}

const toggleCompactView = () => {
  compactView.value = !compactView.value
}

const viewReport = (reportId) => {
  router.push(`/student/plagiarism-report/${reportId}`)
}

const compareWithCurrent = async (version) => {
  const paperId = route.params.paperId
  
  // 参数验证
  if (!paperId || paperId === 'undefined') {
    ElMessage.error('缺少论文ID参数')
    return
  }
  
  try {
    const res = await comparePaperVersions(paperId, [version, paperInfo.value.versionCount])
    
    if (res.code === 200) {
      compareData.value = {
        fromVersion: version,
        toVersion: paperInfo.value.versionCount,
        overallChange: res.data.overallChange || 0,
        sectionComparison: res.data.sectionComparison || []
      }
      showCompareDrawer.value = true
      ElMessage.success('版本对比数据加载成功')
    } else {
      ElMessage.error(res.message || '获取对比数据失败')
    }
  } catch (error) {
    console.error('版本对比失败:', error)
    ElMessage.error('版本对比失败: ' + (error.message || '网络错误'))
  }
}

const loadStatistics = async () => {
  const paperId = route.params.paperId
  
  // 参数验证
  if (!paperId || paperId === 'undefined') {
    return
  }
  
  try {
    // 如果有专门的统计接口，这里调用
    // 暂时使用查重历史接口中的统计数据
    const res = await getCheckHistory(paperId)
    if (res.code === 200 && res.data.statistics) {
      stats.value = res.data.statistics
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const getTimelineType = (rating) => {
  const typeMap = {
    excellent: 'success',
    good: 'primary',
    warning: 'warning',
    danger: 'danger'
  }
  return typeMap[rating] || 'info'
}

const getRatingType = (rating) => {
  const typeMap = {
    excellent: 'success',
    good: 'primary',
    warning: 'warning',
    danger: 'danger'
  }
  return typeMap[rating] || 'info'
}

const getRatingText = (rating) => {
  const textMap = {
    excellent: '优秀',
    good: '良好',
    warning: '一般',
    danger: '需改进'
  }
  return textMap[rating] || '未知'
}

const getSimilarityClass = (similarity) => {
  if (similarity < 20) return 'excellent'
  if (similarity < 40) return 'good'
  if (similarity < 60) return 'warning'
  return 'danger'
}

const getImprovementClass = (improvement) => {
  if (improvement < 0) return 'improved'
  if (improvement > 0) return 'regressed'
  return 'unchanged'
}

const getChangeClass = (change) => {
  if (change < 0) return 'decreased'
  if (change > 0) return 'increased'
  return 'unchanged'
}

const getChangeTagType = (change) => {
  if (change < 0) return 'success'
  if (change > 0) return 'danger'
  return 'info'
}

const getSectionName = (key) => {
  const nameMap = {
    introduction: '引言',
    literature_review: '文献综述',
    methodology: '研究方法',
    results: '实验结果',
    conclusion: '结论'
  }
  return nameMap[key] || key
}

const getTrendText = (direction) => {
  const textMap = {
    decreasing: '持续下降',
    increasing: '持续上升',
    stable: '相对稳定'
  }
  return textMap[direction] || '波动'
}

const getSimilarityColor = (similarity) => {
  if (similarity < 20) return '#67c23a'
  if (similarity < 40) return '#e6a23c'
  return '#f56c6c'
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(async () => {
  await refreshHistory()
  await loadTrendData()
  await loadStatistics()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  window.removeEventListener('resize', () => {
    chartInstance.value?.resize()
  })
})
</script>

<style lang="scss" scoped>
// 全局样式
.check-history-page {
  padding: 24px;
  min-height: 100vh;
  background: #f8fafc; // Slate-50
  color: #0f172a; // Slate-900
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  // 页面头部
  .page-header {
    margin-bottom: 32px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .back-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            border-color: #cbd5e1;
            background: #f8fafc;
            transform: translateY(-1px);
          }
        }
        
        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
      }
      
      .header-actions {
        .refresh-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            border-color: #cbd5e1;
            background: #f8fafc;
            transform: translateY(-1px);
          }
        }
      }
    }
  }

  // 论文信息卡片
  .paper-info-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      border-color: #cbd5e1;
    }
    
    .paper-header {
      .paper-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 20px;
        line-height: 1.3;
      }
      
      .paper-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 20px;
        
        .stat-item {
          .stat-label {
            font-size: 0.75rem;
            color: #64748b;
            margin-bottom: 6px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            
            &.excellent { color: #10b981; }
            &.good { color: #0ea5e9; }
            &.warning { color: #f59e0b; }
            &.lowest { color: #10b981; }
          }
        }
      }
    }
  }

  // 趋势卡片
  .trend-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      border-color: #cbd5e1;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.125rem;
        font-weight: 600;
        color: #0f172a;
        
        .el-icon {
          color: #64748b;
        }
      }
      
      .trend-controls {
        .radio-group {
          display: flex;
          gap: 4px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 4px;
          
          .radio-button {
            padding: 6px 16px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &.active {
              background: white;
              color: #0f172a;
              box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
            }
            
            &:hover:not(.active) {
              color: #334155;
            }
          }
        }
      }
    }
    
    .trend-chart-container {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 24px;
      
      .chart-wrapper {
        background: #f8fafc;
        border-radius: 8px;
        padding: 20px;
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .trend-summary {
        display: flex;
        flex-direction: column;
        gap: 20px;
        
        .summary-item {
          .summary-label {
            font-size: 0.75rem;
            color: #64748b;
            margin-bottom: 6px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .summary-value {
            font-size: 1.25rem;
            font-weight: 700;
            
            &.decreasing { color: #10b981; }
            &.increasing { color: #ef4444; }
            &.stable { color: #94a3b8; }
            &.improvement { color: #10b981; }
            &.best { color: #8b5cf6; }
          }
        }
      }
    }
  }

  // 历史卡片
  .history-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      border-color: #cbd5e1;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.125rem;
        font-weight: 600;
        color: #0f172a;
        
        .el-icon {
          color: #64748b;
        }
      }
      
      .text-button {
        padding: 6px 12px;
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          color: #0f172a;
          background: #f8fafc;
          border-radius: 6px;
        }
      }
    }
    
    .timeline-container {
      .timeline {
        position: relative;
        padding-left: 24px;
        
        &::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e2e8f0;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 32px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .timeline-node {
            position: absolute;
            left: -24px;
            top: 4px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #cbd5e1;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
            
            &.success {
              background: #10b981;
            }
            &.primary {
              background: #0ea5e9;
            }
            &.warning {
              background: #f59e0b;
            }
            &.danger {
              background: #ef4444;
            }
            &.info {
              background: #64748b;
            }
          }
          
          .timeline-line {
            position: absolute;
            left: -23px;
            top: 20px;
            bottom: -32px;
            width: 2px;
            background: #e2e8f0;
          }
          
          .timeline-content {
            .timeline-timestamp {
              font-size: 0.75rem;
              color: #94a3b8;
              margin-bottom: 8px;
              font-weight: 500;
            }
            
            .history-record {
              padding: 20px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              transition: all 0.2s ease;
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
                border-color: #cbd5e1;
              }
              
              &.current-version {
                border-color: #8b5cf6;
                background: rgba(139, 92, 246, 0.05);
              }
              
              .record-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                
                .version-info {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  flex-wrap: wrap;
                  
                  .version-tag {
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background: #e2e8f0;
                    color: #64748b;
                    
                    &.current {
                      background: #8b5cf6;
                      color: white;
                    }
                  }
                  
                  .similarity-badge {
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-weight: 600;
                    font-size: 0.75rem;
                    
                    &.excellent { background: #d1fae5; color: #10b981; }
                    &.good { background: #e0f2fe; color: #0ea5e9; }
                    &.warning { background: #fef3c7; color: #f59e0b; }
                    &.danger { background: #fee2e2; color: #ef4444; }
                  }
                  
                  .rating-tag {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    
                    &.success { background: #d1fae5; color: #10b981; }
                    &.primary { background: #e0f2fe; color: #0ea5e9; }
                    &.warning { background: #fef3c7; color: #f59e0b; }
                    &.danger { background: #fee2e2; color: #ef4444; }
                    &.info { background: #f1f5f9; color: #64748b; }
                  }
                }
                
                .record-actions {
                  display: flex;
                  gap: 8px;
                  
                  .action-button {
                    padding: 6px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    background: white;
                    color: #64748b;
                    font-size: 0.75rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    
                    &:hover {
                      border-color: #cbd5e1;
                      color: #0f172a;
                      transform: translateY(-1px);
                    }
                  }
                }
              }
              
              .record-content {
                .changes-description {
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                  margin-bottom: 16px;
                  color: #475569;
                  line-height: 1.5;
                  font-size: 0.875rem;
                  
                  .el-icon {
                    margin-top: 3px;
                    color: #8b5cf6;
                  }
                }
                
                .improvement-info {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin-bottom: 16px;
                  
                  .improvement-badge {
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-weight: 600;
                    font-size: 0.75rem;
                    
                    &.improved { background: #d1fae5; color: #10b981; }
                    &.regressed { background: #fee2e2; color: #ef4444; }
                    &.unchanged { background: #f1f5f9; color: #64748b; }
                  }
                }
                
                .section-changes {
                  .section-change {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #e2e8f0;
                    
                    &:last-child {
                      border-bottom: none;
                    }
                    
                    .section-name {
                      color: #64748b;
                      font-size: 0.875rem;
                    }
                    
                    .change-value {
                      font-weight: 500;
                      font-size: 0.875rem;
                      
                      &.decreased { color: #10b981; }
                      &.increased { color: #ef4444; }
                      &.unchanged { color: #94a3b8; }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // 对比内容
  .compare-content {
    .compare-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
      
      .version-tags {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .version-tag {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 600;
          
          &.old {
            background: #f1f5f9;
            color: #64748b;
          }
          &.current {
            background: #0ea5e9;
            color: white;
          }
        }
        
        .vs {
          font-weight: 600;
          color: #94a3b8;
        }
      }
      
      .overall-change {
        font-size: 1rem;
        font-weight: 700;
        
        &.improved { color: #10b981; }
        &.regressed { color: #ef4444; }
        &.unchanged { color: #94a3b8; }
      }
    }
    
    .compare-sections {
      .section-compare-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 16px;
        transition: all 0.2s ease;
        
        &:hover {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
          border-color: #cbd5e1;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          
          .section-name {
            font-weight: 600;
            color: #0f172a;
            font-size: 0.875rem;
          }
          
          .change-tag {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            
            &.success { background: #d1fae5; color: #10b981; }
            &.danger { background: #fee2e2; color: #ef4444; }
            &.info { background: #f1f5f9; color: #64748b; }
          }
        }
        
        .similarity-compare {
          .similarity-item {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 12px;
            
            .version-label {
              width: 60px;
              font-size: 0.75rem;
              color: #64748b;
              font-weight: 500;
            }
            
            .progress-container {
              flex: 1;
              height: 8px;
              background: #e2e8f0;
              border-radius: 4px;
              overflow: hidden;
              
              .progress-bar {
                height: 100%;
                border-radius: 4px;
                transition: width 0.3s ease;
                
                &.excellent { background: #10b981; }
                &.good { background: #0ea5e9; }
                &.warning { background: #f59e0b; }
                &.danger { background: #ef4444; }
              }
            }
            
            .similarity-value {
              min-width: 50px;
              font-weight: 600;
              color: #0f172a;
              font-size: 0.875rem;
            }
          }
        }
      }
    }
  }

  // 统计卡片网格
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    
    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        border-color: #cbd5e1;
      }
      
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          
          &.improvement-icon {
            background: #d1fae5;
            color: #10b981;
          }
          &.average-icon {
            background: #e0f2fe;
            color: #0ea5e9;
          }
          &.speed-icon {
            background: #fef3c7;
            color: #f59e0b;
          }
        }
        
        .stat-info {
          .stat-number {
            font-size: 1.75rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.2;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 0.875rem;
            color: #64748b;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .check-history-page {
    .trend-card {
      .trend-chart-container {
        grid-template-columns: 1fr;
        
        .trend-summary {
          flex-direction: row;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 16px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .check-history-page {
    padding: 16px;
    
    .page-header {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        
        .header-actions {
          align-self: stretch;
        }
      }
    }
    
    .paper-info-card {
      padding: 20px;
      
      .paper-stats {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
    
    .trend-card {
      padding: 20px;
      
      .trend-chart-container {
        gap: 16px;
        
        .chart-wrapper {
          padding: 16px;
          min-height: 300px;
        }
      }
    }
    
    .history-card {
      padding: 20px;
      
      .timeline-container {
        .timeline {
          padding-left: 20px;
          
          .timeline-item {
            .timeline-node {
              left: -20px;
            }
            
            .timeline-line {
              left: -19px;
            }
            
            .history-record {
              padding: 16px;
              
              .record-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
                
                .record-actions {
                  align-self: stretch;
                  justify-content: space-between;
                }
              }
            }
          }
        }
      }
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>