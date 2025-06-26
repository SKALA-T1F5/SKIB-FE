<template>
  <v-row>
    <v-col cols="12">
      <div class="header-section">
        <h2 class="section-title-main">테스트 생성</h2>
        <p class="section-subtitle">
          Step 1 of 4 : 생성하고자 하는 테스트에 대한 정보를 입력하고 다음 단계로 이동합니다.
        </p>
      </div>
      <v-progress-linear
        :model-value="25"
        height="10"
        color="#191d5a"
        bg-color="#191d5a"
        rounded
      ></v-progress-linear>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <h1 class="text-center pb-3" style="color: #191d5a">어떤 테스트를 생성할까요?</h1>
      <div class="prompt-input-area">
        <v-textarea
          v-model="internalExamPrompt"
          placeholder="ex) 문서의 핵심 내용에 대한 이해도 확인을 목표로, 중간 난이도의 테스트를 생성하세요."
          variant="outlined"
          rows="4"
          auto-grow
          clearable
          :rules="[(v) => !!v.trim() || '테스트 목표를 입력해주세요.']"
          class="h-100"
        ></v-textarea>
      </div>
    </v-col>

    <v-col cols="12">
      <div class="d-flex align-end mb-4 flex-wrap" style="gap: 16px">
        <v-card
          v-for="(prompt, index) in examplePrompts"
          :key="index"
          elevation="0"
          class="example-prompt-card pa-4 d-flex flex-column align-start cursor-pointer"
          outlined
          @click="internalExamPrompt = prompt"
          max-width="calc(33.333% - 10.666px)"
          min-width="250px"
          flex-grow="1"
        >
          <v-icon class="mr-4" size="19" style="margin-bottom: 6px; color: #191d5a">
            mdi-lightbulb-on
          </v-icon>
          <div class="font-weight-medium text-medium-emphasis">
            {{ prompt }}
          </div>
        </v-card>
      </div>
    </v-col>
  </v-row>

  <v-row class="bottom-fixed-actions">
    <v-col cols="12" class="d-flex justify-space-between align-center px-0">
      <v-btn
        variant="flat"
        color="grey"
        class="force-white"
        @click="emitPrevStep"
        :disabled="isLoading"
        >이전 단계</v-btn
      >
      <v-btn
        variant="flat"
        color="#191d5a"
        @click="sendPromptAndProceed"
        :disabled="isLoading || !internalExamPrompt.trim()"
      >
        다음 단계
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/config/axios' // axios 설정을 가져옵니다.

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// update:loading 이벤트를 통해 부모 컴포넌트의 isLoading 상태를 업데이트합니다.
const emit = defineEmits(['prev-step', 'next-step', 'update:loading'])

const route = useRoute()

const internalExamPrompt = ref('')
const examplePrompts = ref([
  'UI 컴포넌트 개발 원칙과 활용 방법에 대한 실무 중심의 객관식 시험을 출제해주세요.',
  '프론트엔드 개발 환경 구축에 대한 이해도를 평가하는 시험을 만들어주세요. (난이도 중간, 객관식)',
  '업무 프로세스 흐름과 단계별 책임 이해도를 평가하는 주관식 시험을 만들어주세요. (시험시간 30분)',
])

const emitPrevStep = () => {
  emit('prev-step')
}

const sendPromptAndProceed = async () => {
  if (!internalExamPrompt.value.trim()) {
    console.warn('Prompt is empty or contains only whitespace. Cannot proceed to next step.')
    return
  }

  // 요청 시작 시 isLoading을 true로 설정하여 로딩 인디케이터를 표시합니다.
  emit('update:loading', true)

  try {
    const projectId = route.params.projectId || localStorage.getItem('projectId')
    if (!projectId) {
      console.error('Project ID is not available. Cannot create test.')
      alert('프로젝트 ID를 찾을 수 없습니다. 다시 시도해주세요.')
      emit('update:loading', false)
      return
    }

    const parsedProjectId = parseInt(projectId)
    if (isNaN(parsedProjectId)) {
      console.error('Project ID is not a valid number.', projectId)
      alert('유효하지 않은 프로젝트 ID입니다. 다시 시도해주세요.')
      emit('update:loading', false)
      return
    }

    const response = await axios.post('/test/createByLLM', null, {
      params: {
        userInput: internalExamPrompt.value,
        projectId: parsedProjectId,
      },
    })

    console.log('API 응답:', response.data)

    if (response.data.statusCode === 'OK' && response.data.resultData) {
      const resultData = response.data.resultData
      console.log('파싱된 데이터:', resultData)

      const testConfigData = {
        testId: resultData.testId,
        examGoal: resultData.summary,
        selectedDocument: {
          title: resultData.name,
          examTime: resultData.limitedTime,
          difficulty: resultData.difficultyLevel,
          passScore: resultData.passScore,
          retakeAllowed: resultData.isRetake,
        },
        revenues:
          resultData.documentConfigs?.map((doc) => ({
            id: doc.documentId,
            name: doc.documentName,
            keyword: doc.keywords, // keywords 배열 그대로 전달
            mcSet: doc.configuredObjectiveCount,
            sqSet: doc.configuredSubjectiveCount,
            selected: true,
          })) || [],
      }

      emit('next-step', testConfigData)
    } else {
      console.error('API 응답이 실패했거나 데이터가 유효하지 않습니다.', response.data)
      alert('테스트 생성에 실패했습니다. 다시 시도해주세요.')
    }
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error)
    alert(
      '테스트 생성 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.',
    )
  } finally {
    // 요청 완료 시 (성공 또는 실패) isLoading을 false로 설정하여 로딩 인디케이터를 숨깁니다.
    emit('update:loading', false)
  }
}
</script>

<style scoped>
.force-white {
  color: white !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Common header styles */
.header-section {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  margin-bottom: 24px;
}

.section-title-main {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
  margin: 0;
  color: #333;
}

.section-subtitle {
  font-size: 12px;
  color: #a1a1a1;
  font-weight: normal;
  margin-left: 0;
  white-space: nowrap;
  line-height: 1;
  padding-bottom: 2px;
}

.prompt-input-area {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.example-prompt-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: none !important;
  transition: all 0.2s ease-in-out;
  min-height: 130px; /* 모든 예시 프롬프트 박스의 최소 높이를 동일하게 설정 */
  justify-content: flex-start; /* 텍스트가 위에서부터 시작하도록 */
}

.example-prompt-card:hover {
  background-color: #f0f0f0;
  border-color: #aaa !important;
}

/* 하단 고정 버튼을 위한 스타일 */
.bottom-fixed-actions {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: white;
  padding: 16px 0;
  border-top: 1px solid #eee;
  z-index: 100;
  max-width: 1150px;
  left: 0;
  right: 0;
  margin: 0 auto;
}
.bottom-fixed-actions .v-col {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
