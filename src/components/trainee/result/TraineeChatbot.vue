<template>
  <div class="chatbot-section">
    <div class="chatbot-header">
      <svg-icon type="mdi" :path="mdiRobot" class="chatbot-header-icon" />
      <span class="chatbot-header-text">{{ $t('chatbotTitle') }}</span>
    </div>

    <div class="chatbot-messages" ref="messagesContainer">
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
        :placeholder="$t('chatbotInputPlaceholder')"
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
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiSend, mdiRobot } from '@mdi/js'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

// =========================
// 1. i18n 인스턴스 사용
// =========================
const { t } = useI18n()

// =========================
// 2. props 정의
// =========================
const props = defineProps({
  currentQuestionId: {
    type: String,
    default: null,
  },
})

// =========================
// 3. 상태 변수 및 ref 선언
// =========================
const newMessage = ref('')
const messages = ref([])
const messagesContainer = ref(null)

// =========================
// 4. 사용자 ID
// =========================
const userId = 'trainee-001'

// =========================
// 5. FastAPI 챗봇 API 함수
// =========================
async function initializeTest(testQuestions) {
  try {
    await axios.post('/api/chat/init', {
      userId,
      testQuestions,
    })
  } catch (e) {
    alert(t('initFail'))
  }
}

async function askWithLanggraph(question, questionId) {
  try {
    const res = await axios.post('/api/chat/ask-graph', {
      userId,
      question,
      id: questionId,
    })
    return res.data.answer
  } catch (e) {
    alert(t('answerFail'))
    return t('noAnswerFallback')
  }
}

async function resetSession() {
  try {
    await axios.post('/api/chat/session/reset', null, { params: { user_id: userId } })
  } catch (e) {
    alert(t('resetFail'))
  }
}

// =========================
// 6. 메시지 전송 함수
// =========================
const sendMessage = async () => {
  if (newMessage.value.trim() === '') {
    return
  }

  messages.value.push({
    sender: 'user',
    text: newMessage.value.trim(),
  })

  const questionText = newMessage.value.trim()
  newMessage.value = ''

  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }

  const answer = await askWithLanggraph(questionText, props.currentQuestionId || 'Q01')
  messages.value.push({
    sender: 'bot',
    text: answer,
  })
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// =========================
// 8. 컴포넌트 마운트/언마운트
// =========================
onMounted(() => {
  messages.value = [
    {
      sender: 'bot',
      text: t('greeting'),
    },
  ]
  initializeTest([])
})

onUnmounted(() => {
  resetSession()
})
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
