<template>
  <div class="report-similarity-overview">
    <div class="similarity-card">
      <div class="similarity-value">
        <el-progress
          :percentage="similarity"
          :stroke-width="20"
          :color="getSimilarityColor(similarity)"
          :show-text="false"
        />
        <div class="similarity-text">
          <div class="percentage">{{ similarity }}%</div>
          <div class="rating">{{ getSimilarityRating(similarity) }}</div>
        </div>
      </div>
      <div class="similarity-stats">
        <div class="stat-item">
          <div class="stat-value">{{ wordCount }}</div>
          <div class="stat-label">总字数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ similarWords }}</div>
          <div class="stat-label">相似字数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ similarSources }}</div>
          <div class="stat-label">相似来源</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  similarity: {
    type: Number,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  similarWords: {
    type: Number,
    default: 0
  },
  similarSources: {
    type: Number,
    default: 0
  }
})

const getSimilarityColor = (similarity) => {
  if (similarity <= 15) return '#67c23a'
  if (similarity <= 30) return '#e6a23c'
  return '#f56c6c'
}

const getSimilarityRating = (similarity) => {
  if (similarity <= 15) return '优秀'
  if (similarity <= 30) return '良好'
  return '需要修改'
}
</script>

<style scoped>
.report-similarity-overview {
  padding: 20px;
}

.similarity-card {
  text-align: center;
  padding: 32px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
}

.similarity-card:hover {
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.15);
}

.similarity-value {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.similarity-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
}

.rating {
  font-size: 16px;
  color: #64748b;
  margin-top: 4px;
}

.similarity-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 32px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex: 1;
  margin: 0 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

@media (max-width: 768px) {
  .similarity-card {
    padding: 24px;
  }
  
  .similarity-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-item {
    margin: 0;
  }
}
</style>
