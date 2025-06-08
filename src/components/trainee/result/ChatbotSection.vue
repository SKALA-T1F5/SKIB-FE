<template>
  <div class="chatbot-section">
    <div class="chatbot-header">
      <svg-icon type="mdi" :path="mdiRobot" class="chatbot-header-icon" />
      <span class="chatbot-header-text">챗봇</span>
    </div>

    <div class="chatbot-messages">
      <div class="message trainee-msg">
        <p>세금계산서 발행 프로세스에 대해 더 알려주세요.</p>
      </div>
      <div class="message bot-msg">
        <p>세금계산서 발행 프로세스는 크게 정발행과 역발행으로 나뉩니다. 정발행은 공급자가 발행하고, 역발행은 공급받는 자가 발행 요청하는 방식입니다. 어떤 부분이 궁금하신가요?</p>
      </div>
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.sender === 'user' ? 'trainee-msg' : 'bot-msg']"
      >
        <p>{{ message.text }}</p>
      </div>
    </div>

    <div class="chatbot-input-area">
      <input
        type="text"
        placeholder="메세지를 입력하세요"
        class="message-input"
        v-model="newMessage"
        @keyup.enter="sendMessage"
      />
      <button class="send-button" @click="sendMessage">
        <svg-icon type="mdi" :path="mdiSend" class="send-icon" />
      </button>
      <div class="chatbot-avatar">
        <svg-icon type="mdi" :path="mdiRobot" class="robot-icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiSend, mdiRobot } from '@mdi/js';

// --- 챗봇 메시지 타입 정의 ---
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}
// --- 챗봇 메시지 타입 정의 끝 ---

// 챗봇 관련 상태
const newMessage = ref<string>(''); // 사용자가 입력할 메시지
const messages = ref<ChatMessage[]>([]); // 챗봇 메시지 목록

// 챗봇 메시지 전송 로직
const sendMessage = async () => {
  if (newMessage.value.trim() === '') {
    return; // 빈 메시지는 전송하지 않음
  }

  // 사용자 메시지 추가
  messages.value.push({
    sender: 'user',
    text: newMessage.value.trim()
  });

  // 입력 필드 초기화
  newMessage.value = '';

  // 메시지 목록의 스크롤을 가장 아래로 이동 (다음 틱에서 DOM 업데이트 후 실행)
  await nextTick();
  const chatMessagesContainer = document.querySelector('.chatbot-messages');
  if (chatMessagesContainer) {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  // 여기에 챗봇 응답 로직 추가 (예: API 호출)
  // 임시 응답: 사용자 메시지를 에코
  setTimeout(async () => {
    messages.value.push({
      sender: 'bot',
      text: `"${messages.value[messages.value.length - 1].text}" 에 대한 답변을 준비 중입니다.`
    });
    // 챗봇 응답 후에도 스크롤 이동
    await nextTick();
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  }, 1000); // 1초 후 챗봇 응답 시뮬레이션
};
</script>

<style scoped>
.chatbot-section {
  grid-area: chatbot;
  width: 380px;
  background-color: #ffffff;
  border-left: 1px solid #e9ecef;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  height: 91%;
  overflow: auto;
  box-sizing: border-box;
}

.chatbot-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.chatbot-header-icon {
  font-size: 28px;
  color: #34495e;
}

.chatbot-header-text {
  font-size: 20px;
  font-weight: 700;
  color: #343a40;
}

.chatbot-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

/* Chatbot messages scrollbar */
.chatbot-messages::-webkit-scrollbar {
  width: 6px;
}
.chatbot-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.chatbot-messages::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 10px;
}
.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: #999;
}


.message {
  padding: 12px 18px;
  border-radius: 18px;
  margin-bottom: 12px;
  max-width: 85%;
  position: relative;
  word-wrap: break-word;
  line-height: 1.6;
  font-size: 15px;
}

.message p {
  margin: 0;
}

.trainee-msg {
  background-color: #daf5cf;
  align-self: flex-end;
  margin-left: auto;
  border-bottom-right-radius: 4px;
  color: #3a5c2d;
}

.bot-msg {
  background-color: #f0f2f5;
  align-self: flex-start;
  margin-right: auto;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  color: #343a40;
}

.chatbot-input-area {
  display: flex;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  position: relative;
  flex-shrink: 0;
}

.message-input {
  flex-grow: 1;
  border: 1px solid #ced4da;
  border-radius: 25px;
  padding: 12px 50px 12px 20px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.message-input:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.send-button {
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  z-index: 10;
}

.send-icon {
  font-size: 26px;
  color: #888;
  transition: color 0.2s;
}

.send-icon:hover {
  color: #343a40;
}

.chatbot-avatar {
  width: 45px;
  height: 45px;
  background-color: #34495e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.robot-icon {
  font-size: 26px;
  color: white;
  width: 1em;
  height: 1em;
}
</style>