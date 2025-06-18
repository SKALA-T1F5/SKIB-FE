<template>
  <teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>테스트 추가</h3>
          <button class="close-button" @click="emit('close')">×</button>
        </div>
        <div class="modal-body">
          <p class="body-description">테스트 초대 링크를 입력하세요.</p>
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

<script setup>
import { ref, watch } from 'vue'
// defineProps, defineEmits는 컴파일러 매크로이므로 import 할 필요가 없습니다.

const props = defineProps({
  isVisible: Boolean,
  invitationLinkError: String,
})

const emit = defineEmits(['close', 'addTest'])

const linkInput = ref('')

// 모달이 열릴 때마다 링크 입력값 초기화
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      linkInput.value = ''
    }
  },
)

const handleAddTest = () => {
  emit('addTest', linkInput.value) // 입력된 링크를 부모 컴포넌트로 전달
}
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
  padding: 20px; /* 기존 25px에서 20px로 줄여서 전체 모달 내부 여백 감소 */
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px; /* 기존 15px에서 10px로 줄여서 섹션 간 간격 감소 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px; /* 기존 10px에서 8px로 줄임 */
  margin-bottom: 0; /* -10px에서 0으로 변경하여 body와의 간격 조정 */
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15em; /* 폰트 사이즈 살짝 줄여서 공간 확보 */
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.4em; /* 폰트 사이즈 살짝 줄임 */
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #666;
}

.modal-body {
  /* flex-direction: column; (기본값) */
  /* gap: 8px; (필요시 추가하여 body 내 요소들 간 간격 조절) */
}

.body-description {
  /* <p> 태그에 새로운 클래스 추가 */
  margin-bottom: 8px; /* 기존 10px에서 8px로 줄임 */
  color: #555;
  font-size: 0.9em; /* 폰트 사이즈 살짝 줄여서 공간 확보 */
}

.invitation-input {
  width: calc(100% - 20px);
  padding: 8px; /* 기존 10px에서 8px로 줄여서 입력 필드 높이 감소 */
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95em; /* 폰트 사이즈 살짝 줄임 */
  outline: none;
  transition: border-color 0.2s;
}

.invitation-input:focus {
  border-color: #007bff;
}

.invitation-input.input-error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 0.8em; /* 폰트 사이즈 살짝 줄임 */
  margin-top: 3px; /* 기존 5px에서 3px로 줄여서 에러 메시지 간격 감소 */
  display: flex;
  align-items: center;
}

.error-icon {
  display: inline-block;
  width: 14px; /* 아이콘 크기 줄임 */
  height: 14px; /* 아이콘 크기 줄임 */
  border-radius: 50%;
  background-color: #f44336;
  color: white;
  text-align: center;
  line-height: 14px; /* 아이콘 크기에 맞춰 line-height 조정 */
  font-size: 10px; /* 아이콘 내부 '!' 크기 줄임 */
  margin-right: 4px; /* 기존 5px에서 4px로 줄임 */
}
.error-icon::before {
  content: '!';
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px; /* 기존 10px에서 8px로 줄임 */
  border-top: 1px solid #eee;
  margin-top: 8px; /* 기존 10px에서 8px로 줄임 */
}

.modal-button {
  background-color: #e0e0e0;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 15px; /* 기존 8px 18px에서 6px 15px로 줄여 버튼 크기 감소 */
  cursor: pointer;
  font-size: 0.95em; /* 폰트 사이즈 살짝 줄임 */
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
