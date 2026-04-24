<template>
  <div class="report-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="page-title">查重报告详情</span>
        </template>
        <template #extra>
          <div class="header-actions">
            <el-button :icon="Share" @click="shareReport">分享</el-button>
            <el-dropdown @command="handleExport">
              <el-button :icon="Download">
                导出报告<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pdf">导出PDF</el-dropdown-item>
                  <el-dropdown-item command="doc">导出Word</el-dropdown-item>
                  <el-dropdown-item command="html">导出HTML</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-page-header>
    </div>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="10" animated />
    
    <template v-else>
      <!-- 论文基本信息 -->
      <el-card class="paper-info-card" shadow="never">
        <div class="paper-basic-info">
          <div class="info-icon">
            <el-icon size="24" color="#667eea"><Document /></el-icon>
          </div>
          <div class="info-content">
            <h2 class="paper-title">{{ reportData.paperTitle || '暂无标题' }}</h2>
            <div class="paper-meta">
              <span class="meta-item">
                <el-icon><User /></el-icon>
                作者: {{ reportData.author || '未知' }} ({{ reportData.studentId || '未知学号' }})
              </span>
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                提交时间: {{ formatDateTime(reportData.submitTime) || '暂无' }}
              </span>
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                检测时间: {{ formatDateTime(reportData.checkTime) || '暂无' }}
              </span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Tab导航 -->
      <el-card class="tab-card" shadow="never">
        <el-tabs v-model="activeTab" class="report-tabs">
          <el-tab-pane label="概览" name="overview">
            <div class="overview-content">
              <!-- 总体相似度 -->
              <div class="similarity-overview">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="similarity-card">
                      <div class="similarity-value">
                        <el-progress
                          type="circle"
                          :percentage="Math.round(reportData.totalSimilarity || 0)"
                          :width="120"
                          :stroke-width="10"
                          :color="getSimilarityColor(reportData.totalSimilarity || 0)"
                        />
                        <div class="similarity-text">
                          <div class="percentage">{{ Math.round(reportData.totalSimilarity || 0) }}%</div>
                          <div class="rating">{{ getSimilarityRating(reportData.totalSimilarity || 0) }}</div>
                        </div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="16">
                    <div class="distribution-chart">
                      <h3>相似度分布</h3>
                      <div class="chart-container">
                        <div 
                          v-for="(item, index) in distributionData" 
                          :key="index" 
                          class="distribution-bar"
                        >
                          <div class="bar-label">{{ item.range }}</div>
                          <div class="bar-container">
                            <div 
                              class="bar-fill" 
                              :style="{ 
                                width: item.percentage + '%',
                                backgroundColor: getBarColor(index)
                              }"
                            ></div>
                            <span class="bar-percentage">{{ item.percentage }}%</span>
                          </div>
                        </div>
                        <div v-if="distributionData.length === 0" class="empty-distribution">
                          <el-empty description="暂无相似度分布数据" />
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <!-- 检测统计 -->
              <div class="check-statistics">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">{{ reportData.wordCount || 0 }}</div>
                      <div class="stat-label">总字数</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">{{ reportData.citationCount || 0 }}</div>
                      <div class="stat-label">引用文献</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">{{ reportData.similarSources || 0 }}</div>
                      <div class="stat-label">相似文献</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">{{ (reportData.checkEngines || []).join(' + ') || '暂无数据' }}</div>
                      <div class="stat-label">检测引擎</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="详细分析" name="analysis">
            <div class="analysis-content">
              <!-- 按章节分析 -->
              <el-card class="section-analysis-card" shadow="never">
                <template #header>
                  <div class="card-header">
                    <el-icon><DataAnalysis /></el-icon>
                    <span>按章节相似度分析</span>
                  </div>
                </template>
              
                <div class="sections-list">
                  <div 
                    v-for="(section, key) in (reportData.sections || {})" 
                    :key="key"
                    class="section-item"
                  >
                    <div class="section-info">
                      <div class="section-name">{{ getSectionName(key) }}</div>
                      <div class="section-stats">
                        <span>相似度: {{ section.similarity }}%</span>
                        <span>字数: {{ section.wordCount }}字</span>
                      </div>
                    </div>
                    <div class="section-progress">
                      <el-progress 
                        :percentage="Math.round(section.similarity)"
                        :stroke-width="8"
                        :color="getSimilarityColor(section.similarity)"
                        :show-text="false"
                      />
                      <span class="progress-text">{{ Math.round(section.similarity) }}%</span>
                    </div>
                  </div>
                  <div v-if="Object.keys(reportData.sections || {}).length === 0" class="empty-sections">
                    <el-empty description="暂无章节分析数据" />
                  </div>
                </div>
              </el-card>

              <!-- 关键词分析 -->
              <el-card class="keywords-card" shadow="never" style="margin-top: 20px;">
                <template #header>
                  <div class="card-header">
                    <el-icon><Search /></el-icon>
                    <span>关键词分析</span>
                  </div>
                </template>
              
                <div class="keywords-analysis">
                  <div class="normal-keywords">
                    <span 
                      v-for="keyword in normalKeywords" 
                      :key="keyword"
                      class="keyword-tag"
                    >
                      {{ keyword }}
                    </span>
                  </div>
                  <div class="high-risk-keywords">
                    <div class="risk-label">高风险词汇:</div>
                    <span 
                      v-for="keyword in highRiskKeywords" 
                      :key="keyword"
                      class="keyword-tag risk"
                    >
                      {{ keyword }}
                    </span>
                  </div>
                  <div v-if="normalKeywords.length === 0 && highRiskKeywords.length === 0" class="empty-keywords">
                    <el-empty description="暂无关键词分析数据" />
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="相似文献" name="sources">
            <div class="sources-content">
              <el-card 
                v-for="source in similarSources" 
                :key="source.sourceId"
                class="source-card" 
                shadow="hover"
              >
                <div class="source-header">
                  <h3 class="source-title">{{ source.title }}</h3>
                  <div class="source-actions">
                    <el-tag :type="getSimilarityTagType(source.similarity)">
                      相似度: {{ source.similarity }}%
                    </el-tag>
                    <el-button type="primary" size="small" @click="viewComparison(source)">
                      详细对比
                    </el-button>
                  </div>
                </div>
                <div class="source-meta">
                  <span><el-icon><User /></el-icon> {{ source.author }}</span>
                  <span><el-icon><Document /></el-icon> 学术论文</span>
                </div>
                <div class="matched-paragraphs">
                  <h4>匹配段落:</h4>
                  <div 
                    v-for="(paragraph, index) in source.matchedParagraphs" 
                    :key="index"
                    class="paragraph-item"
                  >
                    <div class="source-text">
                      <strong>原文:</strong> {{ paragraph.sourceText }}
                    </div>
                    <div class="paper-text">
                      <strong>本文:</strong> {{ paragraph.paperText }}
                    </div>
                    <div class="match-similarity">
                      匹配度: {{ paragraph.similarity }}%
                    </div>
                  </div>
                  <div v-if="!source.matchedParagraphs || source.matchedParagraphs.length === 0" class="empty-paragraphs">
                    <el-empty description="暂无匹配段落数据" />
                  </div>
                </div>
              </el-card>
              <div v-if="similarSources.length === 0" class="empty-sources">
                <el-empty description="暂无相似文献数据" />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="修改建议" name="suggestions">
            <div class="suggestions-content">
              <el-alert
                :title="getOverallAssessment(reportData.totalSimilarity || 0)"
                :type="getAssessmentType(reportData.totalSimilarity || 0)"
                show-icon
                :closable="false"
              />
              
              <el-card class="recommendations-card" shadow="never" style="margin-top: 20px;">
                <template #header>
                  <div class="card-header">
                    <el-icon><Lightning /></el-icon>
                    <span>针对性建议</span>
                  </div>
                </template>
              
                <div class="recommendations-list">
                  <div 
                    v-for="(rec, index) in recommendations" 
                    :key="index"
                    class="recommendation-item"
                  >
                    <el-icon color="#667eea"><Check /></el-icon>
                    <span>{{ rec }}</span>
                  </div>
                  <div v-if="recommendations.length === 0" class="empty-recommendations">
                    <el-empty description="暂无修改建议" />
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="历史记录" name="history">
            <div class="history-content">
              <el-timeline>
                <el-timeline-item
                  v-for="(record, index) in historyRecords"
                  :key="index"
                  :timestamp="formatDateTime(record.checkTime)"
                  :type="getTimelineType(record.rating)"
                >
                  <div class="history-item">
                    <div class="version-info">
                      <el-tag type="primary">V{{ record.version }}</el-tag>
                      <span class="similarity-score">{{ record.similarity }}%</span>
                    </div>
                    <div class="change-description">
                      {{ record.changes }}
                    </div>
                    <div class="history-actions">
                      <el-button text size="small" @click="viewHistoricalReport(record.reportId)">
                        查看报告
                      </el-button>
                    </div>
                  </div>
                </el-timeline-item>
                <el-timeline-item v-if="historyRecords.length === 0">
                  <div class="empty-history">
                    <el-empty description="暂无历史记录" />
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 详细对比对话框 -->
      <el-dialog
        v-model="showComparisonDialog"
        :title="`详细对比 - ${selectedSource?.title}`"
        width="90%"
        top="20px"
      >
        <div class="comparison-container">
          <div class="comparison-header">
            <el-tag type="info">
              相似度: {{ selectedSource?.similarity }}%
            </el-tag>
            <el-tag type="success">
              匹配段落数: {{ selectedSource?.matchedParagraphs?.length || 0 }}
            </el-tag>
          </div>
          
          <div class="side-by-side-comparison">
            <div class="comparison-panel">
              <div class="panel-header">
                <h4>我的论文</h4>
              </div>
              <div class="panel-content">
                <div 
                  v-for="(segment, index) in comparisonData?.originalSegments" 
                  :key="index"
                  :class="['text-segment', { 'highlight': segment.isSimilar }]"
                >
                  {{ segment.text }}
                </div>
              </div>
            </div>
            
            <div class="comparison-panel">
              <div class="panel-header">
                <h4>相似来源</h4>
              </div>
              <div class="panel-content">
                <div 
                  v-for="(segment, index) in comparisonData?.sourceSegments" 
                  :key="index"
                  :class="['text-segment', { 'highlight': segment.isSimilar }]"
                >
                  {{ segment.text }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Share, Download, ArrowDown, Document, User, Calendar, 
  Timer, DataAnalysis, Search, Check, Lightning
} from '@element-plus/icons-vue'
import { getPaperReport, exportCheckReport, getSimpleCheckReport } from '@/api/student'
import '@/styles/report-styles.scss'

const route = useRoute()
const router = useRouter()

// 响应式数据
const activeTab = ref('overview')
const reportData = ref({})
const loading = ref(false)

// 计算属性数据
const distributionData = ref([])

// 相似文献数据，从 reportData 中获取
const similarSources = computed(() => {
  const sources = reportData.value.similarSources || [];
  // 确保返回的是数组格式
  return Array.isArray(sources) ? sources : [];
});

const normalKeywords = ref([])
const highRiskKeywords = ref([])

const recommendations = ref([])

const historyRecords = ref([])

// 对比功能相关数据
const showComparisonDialog = ref(false)
const selectedSource = ref(null)
const comparisonData = ref(null)

// 方法
const goBack = () => {
  router.back()
}

const viewComparison = (source) => {
  selectedSource.value = source
  // 构建对比数据
  comparisonData.value = {
    originalSegments: source.matchedParagraphs.map(p => ({
      text: p.paperText,
      isSimilar: true
    })),
    sourceSegments: source.matchedParagraphs.map(p => ({
      text: p.sourceText,
      isSimilar: true
    }))
  }
  showComparisonDialog.value = true
}

const shareReport = () => {
  ElMessage.info('分享功能开发中...')
}

const handleExport = (command) => {
  ElMessageBox.confirm(`确定要导出为${command.toUpperCase()}格式吗？`, '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    exportReport(command)
  })
}

const exportReport = async (format) => {
  try {
    // 先获取论文的最新报告ID
    const reportListRes = await getSimpleCheckReport(route.params.paperId);
    if (reportListRes.code === 200 && reportListRes.data && reportListRes.data.length > 0) {
      const latestReport = reportListRes.data[0];
      const response = await exportCheckReport(latestReport.id, format)
      // 处理文件下载
      const blob = new Blob([response])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `查重报告_${reportData.value.paperTitle || '未知'}.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    } else {
      ElMessage.error('未找到该论文的查重报告');
    }
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  }
}

const loadReportData = async () => {
  // 参数校验
  const paperId = route.query.paperId || route.params.paperId;
  const reportId = route.params.id;
  
  if (!paperId || paperId === 'undefined') {
    ElMessage.error('缺少论文 ID 参数');
    router.back();
    return;
  }
  
  loading.value = true;
  try {
    let targetReportId = reportId;
    // 如果没有报告ID，获取最新的报告
    if (!targetReportId) {
      const reportListRes = await getSimpleCheckReport(paperId);
      if (reportListRes.code === 200 && reportListRes.data && reportListRes.data.length > 0) {
        targetReportId = reportListRes.data[0].id;
      } else {
        ElMessage.error('未找到该论文的查重报告');
        router.back();
        return;
      }
    }
    
    // 并行请求报告数据和历史记录
    const [reportRes, historyRes] = await Promise.all([
      getPaperReport(targetReportId),
      getSimpleCheckReport(paperId)
    ]);
    
    // 如果组件已卸载，不更新数据
    if (isUnmounted) return;
    
    if (reportRes.code === 200) {
      // 处理后端返回的 ReportDataDTO 数据结构
      const data = reportRes.data;
      reportData.value = {
        // 基本信息
        paperTitle: data.paperTitle || '暂无标题',
        author: data.author || '未知',
        studentId: data.studentId || '未知学号',
        totalSimilarity: data.totalSimilarity || 0,
        checkTime: data.checkTime || null,
        submitTime: data.submitTime || null,
        
        // 统计信息
        wordCount: data.wordCount || 0,
        citationCount: data.citationCount || 0,
        similarSources: data.similarSources || data.similarSourceCount || 0,
        checkEngines: data.checkEngines || ['本地查重引擎'],
        
        // 章节信息
        sections: data.sections || {},
        
        // 相似来源
        similarSources: data.similarSourceList || data.similarSources || []
      };
    } else {
      ElMessage.error(reportRes.message || '获取报告失败');
      // 重定向回之前的页面
      router.back();
    }
    
    // 处理历史记录数据
    if (historyRes.code === 200 && historyRes.data && historyRes.data.length > 0) {
      // 按时间倒序排序，最新的在前面
      const sortedReports = [...historyRes.data].sort((a, b) => {
        return new Date(b.createTime) - new Date(a.createTime);
      });
      
      // 转换为前端需要的格式
      historyRecords.value = sortedReports.map((report, index) => {
        // 计算版本号（从1开始）
        const version = sortedReports.length - index;
        // 根据查重率计算评级
        let rating = 'excellent';
        if (report.checkRate >= 30) {
          rating = 'danger';
        } else if (report.checkRate >= 15) {
          rating = 'warning';
        } else if (report.checkRate >= 5) {
          rating = 'good';
        }
        
        return {
          version,
          reportId: report.id,
          checkTime: report.createTime,
          similarity: report.checkRate || 0,
          rating,
          changes: `查重报告 #${report.reportNo}`
        };
      });
    }
  } catch (error) {
    ElMessage.error('网络错误：' + error.message);
  } finally {
    if (!isUnmounted) {
      loading.value = false;
    }
  }
};

const getSimilarityColor = (similarity) => {
  if (similarity < 15) return '#67c23a'
  if (similarity < 30) return '#e6a23c'
  return '#f56c6c'
}

const getSimilarityRating = (similarity) => {
  if (similarity < 15) return '优秀'
  if (similarity < 30) return '良好'
  if (similarity < 50) return '一般'
  return '需改进'
}

const getBarColor = (index) => {
  const colors = ['#67c23a', '#90c657', '#e6a23c', '#f59a4c', '#f56c6c']
  return colors[index] || '#909399'
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

const getSimilarityTagType = (similarity) => {
  if (similarity < 20) return 'success'
  if (similarity < 40) return 'warning'
  return 'danger'
}

const getOverallAssessment = (similarity) => {
  if (similarity < 20) return '该论文原创性较高，与其他文献相似度较低，符合学术规范要求。'
  if (similarity < 40) return '该论文存在一定程度相似性，建议仔细检查引用标注和表述方式。'
  return '该论文相似度较高，可能存在抄袭风险，请重点关注并认真修改。'
}

const getAssessmentType = (similarity) => {
  if (similarity < 20) return 'success'
  if (similarity < 40) return 'warning'
  return 'error'
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

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const viewHistoricalReport = (reportId) => {
  ElMessage.info(`查看历史报告: ${reportId}`)
}

// 标记组件是否已卸载
let isUnmounted = false

// 生命周期
onMounted(() => {
  loadReportData()
})

onUnmounted(() => {
  isUnmounted = true
})
</script>

<style lang="scss" scoped>
// 现代配色方案
$primary-color: #3b82f6;
$primary-dark: #2563eb;
$secondary-color: #8b5cf6;
$success-color: #10b981;
$warning-color: #f59e0b;
$danger-color: #ef4444;
$info-color: #64748b;
$light-bg: #f8fafc;
$card-bg: #ffffff;
$text-primary: #1e293b;
$text-secondary: #64748b;
$border-color: #e2e8f0;

.plagiarism-report-page {
  padding: 20px;
  background-color: $light-bg;
  min-height: 100vh;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .page-header {
    margin-bottom: 24px;
    
    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: $text-primary;
      margin-bottom: 8px;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
      
      .el-button {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 8px;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
        }
      }
    }
  }

  .paper-info-card {
    margin-bottom: 24px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    
    &:hover {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      transform: translateY(-4px);
    }
    
    .paper-basic-info {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 24px;
      
      .info-icon {
        padding: 20px;
        background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
        border-radius: 16px;
        color: white;
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        animation: pulse 2s infinite;
        
        @keyframes pulse {
          0% {
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
          }
          100% {
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
          }
        }
      }
      
      .info-content {
        flex: 1;
        
        .paper-title {
          margin: 0 0 16px 0;
          font-size: 24px;
          font-weight: 700;
          color: $text-primary;
          line-height: 1.4;
          animation: slideInLeft 0.6s ease-out;
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        }
        
        .paper-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          animation: slideInUp 0.8s ease-out;
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: $text-secondary;
            font-size: 14px;
            
            .el-icon {
              color: $primary-color;
            }
          }
        }
      }
    }
  }

  .tab-card {
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    
    :deep(.el-tabs__content) {
      padding: 24px 0;
    }
    
    :deep(.el-tabs__header) {
      margin-bottom: 0;
      padding: 0 24px;
      background-color: $card-bg;
      border-bottom: 1px solid $border-color;
      
      .el-tabs__item {
        color: $text-secondary;
        font-size: 16px;
        font-weight: 500;
        padding: 16px 24px;
        margin-right: 16px;
        transition: all 0.3s ease;
        
        &:hover {
          color: $primary-color;
        }
        
        &.is-active {
          color: $primary-color;
          font-weight: 600;
        }
      }
      
      .el-tabs__active-bar {
        background-color: $primary-color;
        height: 3px;
        border-radius: 2px;
      }
    }
  }

  // 概览Tab样式
  .overview-content {
    .similarity-overview {
      margin-bottom: 32px;
      
      .similarity-card {
        text-align: center;
        padding: 32px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
        transition: all 0.3s ease;
        
        &:hover {
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.15);
        }
        
        .similarity-value {
          position: relative;
          display: inline-block;
          
          .similarity-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            
            .percentage {
              font-size: 32px;
              font-weight: 700;
              color: $text-primary;
            }
            
            .rating {
              font-size: 16px;
              color: $text-secondary;
              margin-top: 4px;
            }
          }
        }
      }
      
      .distribution-chart {
        padding: 28px;
        background: $card-bg;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        
        h3 {
          margin: 0 0 20px 0;
          color: $text-primary;
          font-size: 18px;
          font-weight: 600;
        }
        
        .chart-container {
          .distribution-bar {
            margin-bottom: 16px;
            
            .bar-label {
              font-size: 14px;
              color: $text-secondary;
              margin-bottom: 8px;
            }
            
            .bar-container {
              display: flex;
              align-items: center;
              gap: 16px;
              
              .bar-fill {
                height: 28px;
                border-radius: 14px;
                transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              
              .bar-percentage {
                min-width: 50px;
                font-size: 14px;
                font-weight: 600;
                color: $text-primary;
              }
            }
          }
        }
      }
    }
    
    .check-statistics {
      .stat-item {
        text-align: center;
        padding: 24px;
        background: $card-bg;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid $border-color;
        
        &:hover {
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
          transform: translateY(-4px);
          border-color: $primary-color;
        }
        
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: $primary-color;
          margin-bottom: 8px;
          animation: countUp 1s ease-out;
          
          @keyframes countUp {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        }
        
        .stat-label {
          font-size: 14px;
          color: $text-secondary;
          font-weight: 500;
        }
      }
    }
  }

  // 分析Tab样式
  .analysis-content {
    .section-analysis-card {
      margin-bottom: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      
      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        color: $text-primary;
        padding: 20px 24px;
        background: $light-bg;
        border-bottom: 1px solid $border-color;
        font-size: 16px;
      }
      
      .sections-list {
        padding: 24px;
        
        .section-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          margin-bottom: 16px;
          background: $light-bg;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid $border-color;
          
          &:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            border-color: $primary-color;
          }
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .section-info {
            flex: 1;
            
            .section-name {
              font-weight: 600;
              color: $text-primary;
              margin-bottom: 8px;
              font-size: 16px;
            }
            
            .section-stats {
              display: flex;
              gap: 24px;
              font-size: 14px;
              color: $text-secondary;
            }
          }
          
          .section-progress {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 240px;
            
            .progress-text {
              min-width: 50px;
              font-weight: 600;
              color: $text-primary;
              font-size: 14px;
            }
          }
        }
      }
    }
    
    .keywords-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      
      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        color: $text-primary;
        padding: 20px 24px;
        background: $light-bg;
        border-bottom: 1px solid $border-color;
        font-size: 16px;
      }
      
      .keywords-analysis {
        padding: 24px;
        
        .normal-keywords {
          margin-bottom: 20px;
          
          .keyword-tag {
            display: inline-block;
            padding: 8px 16px;
            margin: 8px;
            background: $light-bg;
            color: $primary-color;
            border-radius: 20px;
            font-size: 14px;
            transition: all 0.3s ease;
            border: 1px solid $border-color;
            
            &:hover {
              background: $primary-color;
              color: white;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
          }
        }
        
        .high-risk-keywords {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          
          .risk-label {
            font-weight: 600;
            color: $danger-color;
            white-space: nowrap;
            margin-top: 8px;
            font-size: 14px;
          }
          
          .keyword-tag.risk {
            background: #fef2f2;
            color: $danger-color;
            padding: 8px 16px;
            margin: 8px;
            border-radius: 20px;
            font-size: 14px;
            transition: all 0.3s ease;
            border: 1px solid #fecaca;
            
            &:hover {
              background: $danger-color;
              color: white;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            }
          }
        }
      }
    }
  }

  // 相似文献Tab样式
  .sources-content {
    .source-card {
      margin-bottom: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      border: 1px solid $border-color;
      
      &:hover {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
        border-color: $primary-color;
      }
      
      .source-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        padding: 20px 24px 0;
        
        .source-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: $text-primary;
          flex: 1;
          margin-right: 20px;
          line-height: 1.4;
        }
      }
      
      .source-meta {
        display: flex;
        gap: 24px;
        margin-bottom: 20px;
        color: $text-secondary;
        font-size: 14px;
        padding: 0 24px;
        
        .el-icon {
          margin-right: 6px;
          color: $primary-color;
        }
      }
      
      .matched-paragraphs {
        padding: 0 24px 24px;
        
        h4 {
          margin: 0 0 16px 0;
          color: $text-primary;
          font-size: 16px;
          font-weight: 600;
        }
        
        .paragraph-item {
          background: $light-bg;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          border-left: 4px solid $primary-color;
          transition: all 0.3s ease;
          
          &:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          }
          
          .source-text, .paper-text {
            margin-bottom: 12px;
            font-size: 14px;
            line-height: 1.6;
            
            strong {
              color: $text-secondary;
              font-weight: 600;
            }
          }
          
          .match-similarity {
            text-align: right;
            font-size: 14px;
            color: $danger-color;
            font-weight: 600;
          }
        }
      }
    }
  }

  // 建议Tab样式
  .suggestions-content {
    .recommendations-card {
      margin-top: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      
      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        color: $text-primary;
        padding: 20px 24px;
        background: $light-bg;
        border-bottom: 1px solid $border-color;
        font-size: 16px;
      }
      
      .recommendations-list {
        padding: 24px;
        
        .recommendation-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 20px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid #dbeafe;
          
          &:hover {
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
            transform: translateX(8px);
          }
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .el-icon {
            margin-top: 4px;
            color: $primary-color;
            font-size: 18px;
          }
          
          span {
            flex: 1;
            color: $text-primary;
            line-height: 1.6;
            font-size: 14px;
          }
        }
      }
    }
  }

  // 历史Tab样式
  .history-content {
    padding: 24px;
    
    .history-item {
      padding: 20px;
      background: $card-bg;
      border-radius: 12px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
      border: 1px solid $border-color;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      
      &:hover {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
        border-color: $primary-color;
      }
      
      .version-info {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 12px;
        
        .similarity-score {
          font-weight: 600;
          color: $text-primary;
          font-size: 16px;
        }
      }
      
      .change-description {
        color: $text-secondary;
        margin-bottom: 16px;
        line-height: 1.6;
        font-size: 14px;
      }
      
      .history-actions {
        .el-button {
          padding: 0;
          color: $primary-color;
          font-weight: 500;
          
          &:hover {
            color: $primary-dark;
            text-decoration: underline;
          }
        }
      }
    }
  }
  
  // 空状态样式
  .empty-distribution,
  .empty-sections,
  .empty-keywords,
  .empty-paragraphs,
  .empty-sources,
  .empty-recommendations,
  .empty-history {
    padding: 40px 20px;
    text-align: center;
    
    :deep(.el-empty__description) {
      color: $text-secondary;
      font-size: 14px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .plagiarism-report-page {
    padding: 16px;
    
    .page-header {
      .page-title {
        font-size: 20px;
      }
      
      .header-actions {
        flex-direction: column;
        gap: 8px;
        
        .el-button {
          width: 100%;
        }
      }
    }
    
    .paper-basic-info {
      flex-direction: column;
      gap: 16px;
      
      .info-content {
        .paper-title {
          font-size: 20px;
        }
        
        .paper-meta {
          flex-direction: column;
          gap: 12px;
          
          .meta-item {
            font-size: 13px;
          }
        }
      }
    }
    
    .similarity-overview {
      .el-row {
        flex-direction: column;
        
        .el-col {
          width: 100%;
          margin-bottom: 24px;
        }
      }
      
      .similarity-card {
        padding: 24px;
      }
      
      .distribution-chart {
        padding: 20px;
      }
    }
    
    .check-statistics {
      .el-row {
        .el-col {
          width: 50%;
          margin-bottom: 16px;
        }
      }
      
      .stat-item {
        padding: 16px;
        
        .stat-value {
          font-size: 24px;
        }
      }
    }
    
    .tab-card {
      :deep(.el-tabs__header) {
        padding: 0 16px;
        
        .el-tabs__item {
          font-size: 14px;
          padding: 12px 16px;
        }
      }
      
      :deep(.el-tabs__content) {
        padding: 16px 0;
      }
    }
    
    .analysis-content {
      .section-analysis-card,
      .keywords-card {
        .card-header {
          padding: 16px 20px;
          font-size: 14px;
        }
        
        .sections-list,
        .keywords-analysis {
          padding: 16px;
        }
      }
      
      .section-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        
        .section-progress {
          width: 100%;
        }
      }
    }
    
    .sources-content {
      .source-card {
        .source-header {
          padding: 16px 20px 0;
          
          .source-title {
            font-size: 16px;
          }
        }
        
        .source-meta {
          padding: 0 20px;
          gap: 16px;
        }
        
        .matched-paragraphs {
          padding: 0 20px 20px;
        }
      }
    }
    
    .suggestions-content {
      .recommendations-card {
        .card-header {
          padding: 16px 20px;
          font-size: 14px;
        }
        
        .recommendations-list {
          padding: 16px;
        }
      }
    }
    
    .history-content {
      padding: 16px;
      
      .history-item {
        padding: 16px;
      }
    }
  }
}

// 滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: $light-bg;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: $border-color;
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: $primary-color;
}
</style>