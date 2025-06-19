<template>
  <div class="chatbot-section">
    <div class="chatbot-header">
      <svg-icon type="mdi" :path="mdiRobot" class="chatbot-header-icon" />
      <span class="chatbot-header-text">챗봇</span>
    </div>

    <div class="chatbot-messages" ref="messagesContainer">
      <div class="message trainee-msg" v-if="currentQuestionId === 'Q03'">
        <p>PC.10.02 프로세스에서 정발행/역발행 건의 결재 요청 및 승인 절차를 자세히 알려주세요.</p>
      </div>
      <div class="message bot-msg" v-if="currentQuestionId === 'Q03'">
        <p>
          PC.10.02 프로세스는 검수/출장비 기반으로 발생한 정발행/역발행 건을 결재 요청하고, 결재
          승인하는 절차입니다.
        </p>
      </div>
      <div class="message trainee-msg">
        <p>세금계산서 발행 프로세스에 대해 더 알려주세요.</p>
      </div>
      <div class="message bot-msg">
        <p>
          세금계산서 발행 프로세스는 크게 정발행과 역발행으로 나뉩니다. 정발행은 공급자가 발행하고,
          역발행은 공급받는 자가 발행 요청하는 방식입니다. 어떤 부분이 궁금하신가요?
        </p>
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

<script setup>
import { ref, watch, nextTick } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiSend, mdiRobot } from '@mdi/js'

const props = defineProps({
  currentQuestionId: {
    type: String,
    default: null,
  },
})

const newMessage = ref('')
const messages = ref([])
const messagesContainer = ref(null) // 메시지 컨테이너 참조

const sendMessage = async () => {
  if (newMessage.value.trim() === '') {
    return
  }

  messages.value.push({
    sender: 'user',
    text: newMessage.value.trim(),
  })

  newMessage.value = ''

  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }

  // 챗봇 응답 시뮬레이션
  setTimeout(async () => {
    messages.value.push({
      sender: 'bot',
      text: `"${messages.value[messages.value.length - 1].text}" 에 대한 답변을 준비 중입니다.`,
    })
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 1000)
}

// currentQuestionId가 변경될 때마다 챗봇 메시지 초기화 (선택 사항)
watch(
  () => props.currentQuestionId,
  () => {
    messages.value = [] // 문제 변경 시 챗봇 대화 초기화
  },
)
</script>

<style scoped>
.chatbot-section {
  width: 380px; /* 챗봇 영역 너비 고정 */
  background-color: #ffffff;
  border-left: 1px solid #e9ecef;
  border-radius: 12px;
  display: flex;
  flex-direction: column; /* 내부 요소들을 세로로 정렬 */
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0; /* 축소되지 않도록 고정 */
  box-sizing: border-box;
  height: 100%; /* 부모에 대한 100% 높이 설정 */
}

.chatbot-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0; /* 내용이 축소되지 않도록 고정 */
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
  flex-grow: 1; /* 남은 공간을 모두 차지하도록 */
  overflow-y: auto; /* 내용이 넘칠 때 스크롤바 생성 */
  padding-right: 10px; /* 스크롤바 공간 확보 */
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Flexbox 아이템이 내용물에 의해 커지는 것을 방지 */
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
  flex-shrink: 0; /* 내용이 축소되지 않도록 고정 */
}

.message-input {
  flex-grow: 1;
  border: 1px solid #ced4da;
  border-radius: 25px;
  padding: 12px 50px 12px 20px;
  font-size: 15px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
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
