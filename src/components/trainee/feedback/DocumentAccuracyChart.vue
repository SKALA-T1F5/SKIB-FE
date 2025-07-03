<template>
  <div class="document-accuracy-chart-container">
    <div v-if="Object.keys(documentAccuracy).length === 0" class="no-data">
      {{ $t('feedback_noDocumentAccuracyData') }}
    </div>
    <ul v-else class="chart-list">
      <li v-for="(rate, docName) in documentAccuracy" :key="docName" class="chart-item">
        <div class="item-label-value-group">
          <span class="item-label">{{ docName }}</span>
          <span class="item-value">{{ rate }}%</span>
        </div>
        <div class="bar-container">
          <div class="bar-background"></div>
          <div class="bar-fill" :style="{ width: rate + '%' }"></div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  documentAccuracy: {
    type: Object, // { "문서이름": 정답률(숫자) } 형태
    required: true,
    default: () => ({}),
  },
})
</script>

<style scoped>
.document-accuracy-chart-container {
  width: 100%;
  /* flex-grow를 사용하여 남은 공간을 차지하도록 합니다. */
  flex-grow: 1;
  display: flex; /* 내부 컨텐츠를 정렬하기 위해 flex 사용 */
  flex-direction: column; /* 자식 요소들을 세로로 정렬 */
  justify-content: center; /* 수직 중앙 정렬 (이것은 chart-list가 차지하는 공간 내에서 중앙 정렬을 합니다) */
  align-items: center; /* 수평 중앙 정렬 (chart-list의 너비가 100%이므로 효과가 없을 수 있지만, no-data에 유용) */
  padding: 10px 0;
}

.no-data {
  text-align: center;
  color: #6c757d;
  font-size: 16px;
  padding: 20px;
  width: 100%; /* 너비를 100%로 설정하여 중앙 정렬이 잘 보이도록 */
}

.chart-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px; /* 각 막대 항목 간의 간격 */
  width: 100%; /* 막대 그래프 목록이 컨테이너의 전체 너비를 차지하도록 */
  max-width: 400px; /* 그래프 목록의 최대 너비를 지정하여 중앙 정렬 시 보기 좋게 함 (선택 사항) */
  /* align-self: center; /* chart-list 자체를 부모 컨테이너 내에서 중앙 정렬 */
}

.chart-item {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.item-label-value-group {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}

.item-label {
  font-weight: 600;
  color: #34495e;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  padding-right: 10px;
}

.item-value {
  font-weight: 700;
  color: #1e2251;
  font-size: 18px;
  flex-shrink: 0;
}

.bar-container {
  position: relative;
  width: 100%;
  height: 20px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #e9ecef;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08) inset;
}

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #1e2251;
  border-radius: 8px;
  transition: width 0.8s ease-out;
  z-index: 1;
}
</style>
