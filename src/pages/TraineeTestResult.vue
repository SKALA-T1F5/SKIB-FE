<template>
  <DefaultLayout>
    <template #sidebar>
      <TraineeTestResultSideBar
        :questions="questionStatus"
        :currentIndex="currentQuestion"
        @select="(index) => currentQuestion = index"
      />
    </template>

    <div class="layout-grid">
      <!-- Header -->
      <div class="question-number">Q{{ currentQuestion + 1 }}.</div>
      <div class="nav-buttons">
        <button @click="goToPrev">◀ 이전</button>
        <button @click="goToNext">다음 ▶</button>
      </div>

      <!-- 문제 내용 -->
      <div class="main-content" v-if="current">
        <div class="question-section">
          <div class="question-text-area">
            <p class="question-text">{{ current.content }}</p>
          </div>

          <div
            class="answer-boxes"
            :class="{
              'objective-type': current.type === 'objective',
              'subjective-type': current.type === 'subjective',
            }"
          >
            <!-- 객관식 -->
            <div v-if="current.type === 'objective'" class="options">
              <div v-for="(opt, index) in current.options" :key="index" class="option-wrapper">
                <div
                  class="option"
                  :class="{
                    correct: index === current.correctAnswer
                  }"
                >
                  <span
                    class="option-circle"
                    :class="{
                      selected: index === current.userAnswer
                    }"
                  ></span>
                  <span class="option-text">{{ optionLabels[index] }} {{ opt }}</span>
                </div>
              </div>
            </div>

            <!-- 주관식 -->
            <div v-else-if="current.type === 'subjective'" class="subjective-answer">
              <div class="option subjective-box">
                <span class="option-text full">
                  <p class="label">나의 응답</p>
                  <p>{{ current.userAnswer }}</p>
                </span>
              </div>
              <div class="option subjective-box">
                <span class="option-text full">
                  <p class="label">예시 답안</p>
                  <p class="reference-answer">{{ current.correctAnswer }}</p>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 풀이/해설 -->
        <div class="solution-section">
          <template v-if="current.type === 'objective'">
            <p class="label">풀이</p>
            <div class="solution-box">
              <p class="text">{{ current.explanation }}</p>
            </div>
          </template>
          <template v-else-if="current.type === 'subjective' && current.gradingCriteria">
            <p class="label">채점 기준</p>
            <ul class="grading-list">
              <li v-for="(item, i) in current.gradingCriteria" :key="i">• {{ item }}</li>
            </ul>
          </template>
        </div>
      </div>

      <!-- 챗봇 -->
      <div class="chat-column">
        <div class="chat-grid">
          <div class="chat-box">
            <div class="chat-message trainee">Trainee Msg</div>
            <div class="chat-message assistant">Trainee Assistance</div>
          </div>
          <div class="chat-input">
            <input placeholder="메시지를 입력하세요." />
            <button class="send-button">➤</button>
          </div>
        </div>
      </div>

      <!-- 나가기 -->
      <div class="exit-button-area">
        <button class="exit-button">나가기</button>
      </div>
      <div class="robot-icon">🤖</div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import axios from 'axios'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import TraineeTestResultSideBar from '@/components/TraineeTestResultSideBar.vue'

const props = defineProps({
  onQuestionsUpdate: Function,
})

const currentQuestion = ref(0)
const questions = ref([])

onMounted(async () => {
  try {
    const response = await axios.get('/api/trainee/test-result')
    questions.value = response.data
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

const current = computed(() => questions.value[currentQuestion.value] || null)

const optionLabels = ['①', '②', '③', '④', '⑤']

const goToPrev = () => {
  currentQuestion.value = Math.max(0, currentQuestion.value - 1)
}

const goToNext = () => {
  currentQuestion.value = Math.min(questions.value.length - 1, currentQuestion.value + 1)
}

// 각 문항의 정오답 여부 표시
const questionStatus = computed(() =>
  questions.value.map((q) => ({ correct: q.isCorrect }))
)

watchEffect(() => {
  if (props.onQuestionsUpdate) {
    props.onQuestionsUpdate({
      questions: questionStatus.value,
      currentIndex: currentQuestion.value,
    })
  }
})
</script>

<style scoped>
/* 전체 그리드 레이아웃 */
.layout-grid {
  display: grid;
  grid-template-areas:
    'question-number nav-buttons'
    'main-content chat-column'
    'exit-button robot-icon';
  grid-template-columns: 70% 30%;
  grid-template-rows: auto 1fr auto;
  gap: 0.5rem;
  padding: 1.5rem;
  height: 100%;
  box-sizing: border-box;
}

/* 문제 번호 텍스트 */
.question-number {
  grid-area: question-number;
  font-size: 30px;
  font-weight: bold;
}

/* 이전/다음 버튼 영역 */
.nav-buttons {
  grid-area: nav-buttons;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* 이전/다음 버튼 스타일 */
.nav-buttons button {
  background: #eef2f6;
  color: black;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-weight: bold;
  cursor: pointer;
}

/* 본문(문제+풀이) 전체 영역 */
.main-content {
  grid-area: main-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 1rem;
  overflow: hidden;
}

/* 문제 박스 전체 영역 */
.question-section {
  flex: 4;
  display: flex;
  flex-direction: column;
  background: #eef2f6;
  border-radius: 16px;
  padding: 1.5rem;
  min-height: 0;
  overflow: auto;
}

/* 문제 텍스트 영역 (공통: 객관식/주관식 상단) */
.question-text-area {
  margin-bottom: 1rem;
  padding-right: 8px;
  flex-shrink: 0;
}

/* 객관식/주관식 보기 전체 박스 */
.answer-boxes {
  flex: 4;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 객관식 보기 목록 wrapper */
.options {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  flex: 1;
  height: 100%;
}

/* 객관식 보기 하나의 wrapper */
.option-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

/* 객관식 보기 한 줄 */
.option {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  border: 1px solid #cfd6e1;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

/* 정답에 해당할 경우 강조 */
.option.correct {
  background-color: #c2cbff;
  font-weight: bold;
}

/* 객관식 원형 선택지 */
.option-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #eef2f6;
  margin-right: 12px;
  background-color: white;
}

/* 선택된 보기 원형 */
.option-circle.selected {
  background-color: #A9B6FF;
  border-color: #eef2f6;
}

/* 보기 텍스트 영역 */
.option-text {
  flex: 1;
  font-size: 16px;
  line-height: 1.5;
}

/* 서술형 보기 wrapper (객관식과 동일한 높이 설정) */
.subjective-answer {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  height: 100%;
}

/* 서술형 박스 하나 */
.subjective-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: white;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  min-height: 0;
  height: 100%;
}

/* 서술형 답변 영역 내 텍스트 스크롤 가능하도록 */
.option-text.full {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-right: 8px;
  min-height: 0;
}

/* 예시 답안 강조 (파란색 굵은 글씨) */
.reference-answer {
  color: #1c4ed8;
  font-weight: bold;
}

/* 풀이/해설/채점 기준 영역 */
.solution-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #eef2f6;
  border-radius: 16px;
  padding: 1.5rem;
  min-height: 0;
  overflow-y: auto;
  max-height: 200px;
}

/* 문제 텍스트의 실제 내용 */
.question-text {
  font-size: 18px;
  line-height: 1.5;
}

/* "풀이", "나의 응답" 등의 텍스트 라벨 */
.label {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

/* 챗봇 전체 영역 */
.chat-column {
  grid-area: chat-column;
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* 챗봇 내부 레이아웃 */
.chat-grid {
  display: grid;
  grid-template-rows: 1fr auto;
  background: #f4f6fb;
  border-radius: 16px;
  padding: 1rem;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 240px);
  min-height: 0;
}

/* 챗봇 메시지 출력 영역 */
.chat-box {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  min-height: 0;
  max-height: 100%;
}

/* 챗봇 메시지 하나 */
.chat-message {
  padding: 0.8rem 1rem;
  border-radius: 10px;
  font-size: 14px;
}

/* 학습자 메시지 말풍선 */
.chat-message.trainee {
  align-self: flex-end;
  background-color: #d1d1d1;
}

/* 어시스턴트 메시지 말풍선 */
.chat-message.assistant {
  align-self: flex-start;
  background-color: #d4d4f7;
}

/* 챗봇 입력창 영역 */
.chat-input {
  display: flex;
  gap: 0.5rem;
}

/* 챗봇 입력창 */
.chat-input input {
  flex: 1;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* 전송 버튼 */
.send-button {
  background: #1c2053;
  color: white;
  border-radius: 8px;
  padding: 0.6rem 1rem;
}

/* 하단 나가기 버튼 위치 */
.exit-button-area {
  grid-area: exit-button;
}

/* 나가기 버튼 스타일 */
.exit-button {
  background: #1c2053;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-weight: bold;
}

/* 우측 하단 로봇 이모지 */
.robot-icon {
  grid-area: robot-icon;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  font-size: 28px;
}
</style>
