<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <!-- <h3>어떤 결과를 확인하시겠습니까?</h3> -->
      <h3>{{ $t('resultTypeSelect_title') }}</h3>
      <div class="modal-buttons">
        <!-- <button @click="$emit('select', 'FIRST')">최초 응시 결과</button> -->
        <button @click="$emit('select', 'FIRST')">{{ $t('resultTypeSelect_first') }}</button>
        <!-- <button @click="$emit('select', 'RETRY')">재응시 결과</button> -->
        <button @click="$emit('select', 'RETRY')">{{ $t('resultTypeSelect_retry') }}</button>
      </div>
      <!-- <button class="close-btn" @click="$emit('close')">닫기</button> -->
      <button class="close-btn" @click="$emit('close')">{{ $t('close') }}</button>
    </div>
  </div>
</template>

<script setup>
// 별도 스크립트 필요 없음
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 40px 36px 28px 36px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
  min-width: 400px;
  text-align: center;
}
.modal-content h3 {
  margin-bottom: 32px;
  font-size: 22px;
  font-weight: 700;
}
.modal-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 18px;
}
.modal-buttons button {
  padding: 10px 22px;
  border-radius: 6px;
  border: none;
  background: #191d5a;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 120px;
  flex: 1 1 0;
  box-sizing: border-box;
}
.modal-buttons button:hover {
  background: #0c0f3c;
}
.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
}
.close-btn:hover {
  color: #191d5a;
}
</style> 