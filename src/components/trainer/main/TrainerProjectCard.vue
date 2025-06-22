<template>
  <div class="project-card">
    <div :class="['status-tag', getStatusClass(project.status)]">
      {{ project.status }}
    </div>

    <h3 class="project-title">{{ project.name }}</h3>
    <p class="project-description">{{ project.description }}</p>
    <p class="project-start-date">시작일: {{ project.startDate }}</p>

    <div class="project-footer">
      <div class="project-actions">
        <button class="action-button" @click="$emit('edit', project.id)">수정</button>
        <button class="action-button" @click="$emit('delete', project.id)">삭제</button>
        <button class="action-button manage-button" @click="$emit('manage', project.id)">관리</button>
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

const emit = defineEmits(['edit', 'delete', 'manage'])

// Function to get appropriate class for status tag
const getStatusClass = (status) => {
  switch (status) {
    case '진행 중':
      return 'in-progress'
    case '완료':
      return 'completed'
    case '대기 중':
      return 'pending'
    default:
      return ''
  }
}
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

/* Status Tag (PASS/FAIL equivalent) */
.status-tag {
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-transform: uppercase; /* Match uppercase of PASS/FAIL */
  min-width: 60px;
  text-align: center;
}

.status-tag.in-progress {
  background-color: #007bff; /* Blue for in progress */
}

.status-tag.completed {
  background-color: #28a745; /* Green for completed */
}

.status-tag.pending {
  background-color: #ffc107; /* Yellow/Orange for pending */
  color: #333; /* Darker text for better contrast on yellow */
}

.project-title {
  font-size: 18px; /* Same as test-title */
  font-weight: bold; /* Same as test-title */
  margin-top: 20px; /* Same as test-title */
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