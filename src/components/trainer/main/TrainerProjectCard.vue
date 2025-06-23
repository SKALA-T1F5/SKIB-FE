<template>
  <div class="project-card">
    <h3 class="project-title">{{ project.name }}</h3>
    <p class="project-description">{{ project.description }}</p>
    <p class="project-start-date">시작일: {{ project.startDate }}</p>

    <div class="project-footer">
      <div class="project-actions">
        <button class="action-button manage-button" @click="$emit('manage', project.id)">
          관리
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

// 트레이너는 프로젝트를 수정하거나 삭제할 수 없으므로 'edit', 'delete' emit 제거
const emit = defineEmits(['manage'])

// Project는 Status 속성을 가지고 있지 않으므로 getStatusClass 함수 제거
// const getStatusClass = (status) => {
//   switch (status) {
//     case '진행 중':
//       return 'in-progress'
//     case '완료':
//       return 'completed'
//     case '대기 중':
//       return 'pending'
//     default:
//       return ''
//   }
// }
</script>

<style scoped>
.project-card {
  background-color: #f8f8f8; /* Same as test-card */
  border: 1px solid #e0e0e0; /* Same as test-card */
  border-radius: 8px; /* Same as test-card */
  padding: 25px; /* Same as test-card */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Same as test-card */
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 280px; /* Same as test-card */
  max-width: 100%;
  height: auto;
  min-height: 220px; /* Adjusted to fit content, similar visual height */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
}

/* Project는 Status 속성을 가지고 있지 않으므로 상태 태그 스타일 제거 */
/*
.status-tag {
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  min-width: 60px;
  text-align: center;
}

.status-tag.in-progress {
  background-color: #007bff;
}

.status-tag.completed {
  background-color: #28a745;
}

.status-tag.pending {
  background-color: #ffc107;
  color: #333;
}
*/

.project-title {
  font-size: 18px; /* Same as test-title */
  font-weight: bold; /* Same as test-title */
  margin-top: 0px; /* Status tag 제거로 인해 margin-top 조정 */
  margin-bottom: 8px; /* Same as test-title */
  color: #333; /* Same as test-title */
}

.project-description {
  font-size: 14px; /* Same as test-description */
  color: #555; /* Same as test-description */
  margin-bottom: 10px; /* Same as test-description */
  flex-grow: 1; /* Allows description to take available space */
}

.project-start-date {
  font-size: 14px; /* Similar to test-score */
  color: #555; /* Similar to test-score */
  margin-bottom: 10px; /* Similar to test-score */
}

.project-footer {
  display: flex; /* Same as test-footer */
  justify-content: space-between; /* Same as test-footer */
  align-items: center; /* Same as test-footer */
  margin-top: auto; /* Same as test-footer */
  flex-wrap: wrap; /* Same as test-footer */
  gap: 8px; /* Same as test-footer */
}

.project-actions {
  display: flex; /* Same as test-actions */
  gap: 8px; /* Same as test-actions */
  flex-wrap: wrap; /* Same as test-actions */
  justify-content: flex-end; /* Same as test-actions */
  margin-left: auto; /* Same as test-actions */
}

.action-button {
  background-color: #e0e0e0; /* Same as test-card action-button */
  color: #555; /* Same as test-card action-button */
  border: 1px solid #ccc; /* Same as test-card action-button */
  border-radius: 4px; /* Same as test-card action-button */
  padding: 6px 12px; /* Same as test-card action-button */
  cursor: pointer; /* Same as test-card action-button */
  font-size: 12px; /* Same as test-card action-button */
  transition: background-color 0.2s ease; /* Same as test-card action-button */
  white-space: nowrap; /* Same as test-card action-button */
}

.action-button:hover {
  background-color: #d0d0d0; /* Same as test-card action-button:hover */
}

/* Specific style for the '관리' (Manage) button, similar to '재응시' */
.action-button.manage-button {
  background-color: #191d5a; /* A primary color, similar to retake-button */
  color: white;
  border-color: #191d5a;
}

.action-button.manage-button:hover {
  background-color: #0c0f3c; /* Darker on hover */
  border-color: #0c0f3c;
}
</style>
