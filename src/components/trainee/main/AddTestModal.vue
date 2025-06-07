<template>
  <teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>테스트 추가</h3>
          <button class="close-button" @click="emit('close')">×</button>
        </div>
        <div class="modal-body">
          <p>테스트 초대 링크를 입력하세요.</p>
          <input
            type="text"
            v-model="linkInput"
            placeholder="초대 링크를 입력하세요."
            class="invitation-input"
            :class="{ 'input-error': invitationLinkError }"
          />
          <p v-if="invitationLinkError" class="error-message">
            <span class="error-icon"></span> {{ invitationLinkError }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="modal-button primary" @click="handleAddTest">응시</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
// defineProps, defineEmits는 컴파일러 매크로이므로 import 할 필요가 없습니다.

const props = defineProps<{
  isVisible: boolean;
  invitationLinkError: string;
}>();

const emit = defineEmits(['close', 'addTest']);

const linkInput = ref('');

// 모달이 열릴 때마다 링크 입력값 초기화
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    linkInput.value = '';
  }
});

const handleAddTest = () => {
  emit('addTest', linkInput.value); // 입력된 링크를 부모 컴포넌트로 전달
};
</script>

<style scoped>
/* --- Modal (팝업) 스타일 --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: -10px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #666;
}

.modal-body p {
  margin-bottom: 10px;
  color: #555;
  font-size: 0.95em;
}

.invitation-input {
  width: calc(100% - 20px); /* 패딩 고려 */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  outline: none;
  transition: border-color 0.2s;
}

.invitation-input:focus {
  border-color: #007bff;
}

.invitation-input.input-error {
  border-color: #F44336;
}

.error-message {
  color: #F44336;
  font-size: 0.85em;
  margin-top: 5px;
  display: flex;
  align-items: center;
}

.error-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #F44336;
  color: white;
  text-align: center;
  line-height: 16px;
  font-size: 12px;
  margin-right: 5px;
}
.error-icon::before {
  content: "!";
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.modal-button {
  background-color: #e0e0e0;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 18px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;
}

.modal-button.primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.modal-button:hover {
  background-color: #0056b3;
}
</style>