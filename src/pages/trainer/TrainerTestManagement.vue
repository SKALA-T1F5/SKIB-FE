<template>
  <AILoading :show="isLoading" />
  <v-container class="trainer-container">
    <TestList v-if="step === 0" @add-exam="addExam" />

    <template v-else-if="step === 1">
      <v-row>
        <v-col cols="12">
          <div class="header-section">
            <h2 class="section-title-main">테스트 생성</h2>
            <p class="section-subtitle">
              Step 1 of 3 : 생성하고자 하는 테스트에 대한 정보를 입력하고 다음 단계로 이동합니다.
            </p>
          </div>
          <v-progress-linear
            :model-value="33"
            height="10"
            color="primary"
            bg-color="primary"
            rounded
          ></v-progress-linear>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <h1 class="text-primary text-center pb-3">어떤 테스트를 생성할까요?</h1>
          <v-card elevation="0">
            <v-card-text style="height: 200px">
              <v-textarea
                v-model="examPrompt"
                placeholder="ex) 문서의 핵심 내용에 대한 이해도 확인을 목표로, 중간 난이도의 테스트를 생성하세요."
                variant="outlined"
                rows="4"
                auto-grow
                clearable
                hide-details
                class="h-100"
              ></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12">
          <div class="d-flex align-end mb-4">
            <v-row>
              <v-col v-for="(prompt, index) in examplePrompts" :key="index" cols="12" sm="6" md="4">
                <v-card
                  elevation="0"
                  height="100%"
                  class="pa-4 d-flex flex-column align-start cursor-pointer"
                  outlined
                  @click="examPrompt = prompt"
                >
                  <v-icon class="mr-4" size="19" style="margin-bottom: 6px; color: grey">
                    mdi-lightbulb-on
                  </v-icon>
                  <div class="font-weight-medium text-medium-emphasis">
                    {{ prompt }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>

      <v-row style="position: absolute; bottom: 16px; width: 100%">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <v-btn
            variant="flat"
            color="gray"
            class="mr-2 force-white"
            @click="prevStep"
            :disabled="isLoading"
            >← 이전단계</v-btn
          >
          <div class="d-flex align-center mr-2" style="gap: 8px">
            <v-btn
              variant="flat"
              color="primary"
              @click="nextStep"
              :disabled="isLoading || !examPrompt.trim()"
              >다음 단계</v-btn
            >
          </div>
        </v-col>
      </v-row>
    </template>

    <template v-else-if="step === 2">
      <v-row>
        <v-col cols="12">
          <div class="header-section">
            <h2 class="section-title-main">테스트 생성</h2>

            <p class="section-subtitle">
              Step 2 of 3 : 테스트를 구성할 문제와 조건을 선택하고 다음 단계로 이동하세요.
            </p>
          </div>
          <v-progress-linear
            :model-value="66"
            height="10"
            color="primary"
            bg-color="primary"
            rounded
          ></v-progress-linear>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="8">
          <v-card elevation="0" height="25%">
            <v-card-text>
              <div class="d-flex align-center pb-2">
                <h4 class="text-h8 mt-1">Exam Goal</h4>
              </div>
              <p>{{ examGoal }}</p>
            </v-card-text>
          </v-card>
          <br />
          <v-card elevation="0" height="70%">
            <v-card-text>
              <div class="d-flex align-center">
                <h4 class="text-h8 mt-1">Document List</h4>
              </div>
              <v-data-table
                :headers="headers"
                :items="revenues"
                item-value="name"
                class="elevation-0"
                hide-default-footer
                disable-pagination
              >
                <template v-slot:item.selected="{ item }">
                  <v-checkbox
                    v-model="item.selected"
                    density="compact"
                    hide-details
                    color="grey"
                  ></v-checkbox>
                </template>
                <template v-slot:item.name="{ item }">
                  <h6 class="text-body-2 text-medium-emphasis font-weight-bold">
                    {{ item.name }}
                  </h6>
                </template>
                <template v-slot:item.keyword="{ item }">
                  <v-chip size="small" color="blue-grey" variant="tonal" rounded="lg">
                    {{ item.keyword }}
                  </v-chip>
                </template>
                <template v-slot:item.sqSet="{ item }">
                  <v-text-field
                    v-model.number="item.sqSet"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="width: 70px"
                  ></v-text-field>
                </template>
                <template v-slot:item.mcSet="{ item }">
                  <v-text-field
                    v-model.number="item.mcSet"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="width: 70px"
                  ></v-text-field>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4">
          <v-card elevation="0" height="100%">
            <v-card-text>
              <div class="d-flex align-center">
                <h4 class="text-h8 mt-1">Exam Setting</h4>
              </div>
              <v-form class="mt-4">
                <v-text-field
                  v-model="selectedDocument.title"
                  label="테스트이름"
                  variant="outlined"
                  rounded="lg"
                ></v-text-field>
                <v-text-field
                  v-model="selectedDocument.examTime"
                  label="시험 시간 (분)"
                  type="number"
                  variant="outlined"
                  rounded="lg"
                ></v-text-field>
                <v-select
                  v-model="selectedDocument.difficulty"
                  :items="['EASY', 'NORMAL', 'HARD']"
                  label="난이도"
                  variant="outlined"
                  rounded="lg"
                ></v-select>
                <div class="d-flex align-center mb-4">
                  <v-text-field
                    v-model.number="selectedDocument.passScore"
                    label="PASS 기준 점수"
                    type="number"
                    variant="outlined"
                    rounded="lg"
                    class="mr-2"
                    style="width: 150px"
                  ></v-text-field>
                  <v-select
                    v-model="selectedDocument.retakeAllowed"
                    :items="[
                      { text: '재응시 허용', value: true },
                      { text: '재응시 불허', value: false },
                    ]"
                    label="재응시 여부"
                    variant="outlined"
                    rounded="lg"
                    class="flex-grow-1"
                    item-title="text"
                  ></v-select>
                </div>
                <div class="total-questions mt-4 mb-4" style="text-align: center">
                  객관식:&nbsp;{{ totalMcqCount }}&nbsp;&nbsp;|&nbsp;&nbsp;주관식:&nbsp;{{
                    totalSaqCount
                  }}&nbsp;&nbsp;|&nbsp;&nbsp;Total:&nbsp;{{ totalMcqCount + totalSaqCount }}
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row style="position: absolute; bottom: 16px; width: 100%">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <v-btn
            variant="flat"
            color="gray"
            class="mr-2 force-white"
            @click="prevStep"
            :disabled="isLoading"
            >← 이전단계</v-btn
          >
          <div class="d-flex align-center mr-2" style="gap: 8px">
            <v-btn variant="flat" color="primary" @click="nextStep" :disabled="isLoading"
              >다음 단계</v-btn
            >
          </div>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AILoading from '@/components/trainer/test/AiLoading.vue'
import TestList from '@/components/trainer/test/TestList.vue'
import api from '@/config/axios'

const router = useRouter()
const route = useRoute()

const step = ref(0)
const isLoading = ref(false)

const currentProjectId = computed(() => route.params.projectId || localStorage.getItem('projectId'))

const examPrompt = ref('')
const testId = ref(null)
const examplePrompts = ref([
  'UI 컴포넌트 개발 원칙과 활용 방법에 대한 실무 중심의 객관식 시험을 출제해주세요.',
  '프론트엔드 개발 환경 구축에 대한 이해도를 평가하는 시험을 만들어주세요. (난이도 중간, 객관식)',
  '업무 프로세스 흐름과 단계별 책임 이해도를 평가하는 주관식 시험을 만들어주세요. (시험시간 30분)',
])

const headers = [
  { title: '문서명', key: 'name', sortable: false, width: '45%' },
  { title: 'Keyword', key: 'keyword', sortable: false, align: 'center', width: '35%' },
  { title: '객관식', key: 'mcSet', sortable: false, align: 'center', width: '10%' },
  { title: '주관식', key: 'sqSet', sortable: false, align: 'center', width: '10%' },
]
const revenues = ref([])
const examGoal = computed(() => examPrompt.value || '테스트 목표가 정의되지 않았습니다.')
const selectedDocument = ref({
  title: '',
  examTime: 30,
  difficulty: 'NORMAL',
  passScore: 70,
  retakeAllowed: false,
  translationLanguage: '없음',
})

watch(examPrompt, (newPrompt) => {
  if (step.value === 1) {
    selectedDocument.value.title = newPrompt || '새로운 테스트'
  }
})

const totalMcqCount = computed(() => {
  return revenues.value.reduce((sum, doc) => sum + (doc.selected ? doc.mcSet || 0 : 0), 0)
})

const totalSaqCount = computed(() => {
  return revenues.value.reduce((sum, doc) => sum + (doc.selected ? doc.sqSet || 0 : 0), 0)
})

const addExam = () => {
  step.value = 1
  examPrompt.value = ''
  testId.value = null
}

const nextStep = async () => {
  if (step.value === 1) {
    if (!examPrompt.value.trim()) {
      alert('테스트 생성을 위한 프롬프트를 입력해주세요.')
      return
    }

    isLoading.value = true
    try {
      const projectId = currentProjectId.value
      if (!projectId) {
        console.error('projectId를 찾을 수 없습니다. 테스트를 생성할 수 없습니다.')
        alert('프로젝트 ID를 찾을 수 없습니다. 다시 시도해주세요.')
        return
      }

      const response = await api.post('/test/createTest', {
        testName: examPrompt.value,
        projectId: parseInt(projectId),
      })

      if (response.data.statusCode === 'OK') {
        const createdTestId = response.data.resultData?.testId
        if (createdTestId) {
          testId.value = createdTestId
          step.value = 2
          await fetchRevenues()
        } else {
          console.error('Test ID가 응답에 포함되어 있지 않습니다:', response.data)
          alert('시험 생성에 실패했습니다: Test ID 누락.')
        }
      } else {
        console.error('시험 생성 실패:', response.data.statusCode, response.data.message)
        alert(`시험 생성에 실패했습니다: ${response.data.message || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('시험 생성 중 오류 발생:', error)
      alert('시험 생성 중 오류가 발생했습니다.')
    } finally {
      isLoading.value = false
    }
  } else if (step.value === 2) {
    isLoading.value = true
    try {
      const selectedDocs = revenues.value.filter(
        (doc) => doc.selected && (doc.mcSet > 0 || doc.sqSet > 0),
      )
      if (selectedDocs.length === 0) {
        alert('문서를 선택하고 생성할 문제 수를 설정해주세요.')
        isLoading.value = false
        return
      }

      const updateTestResponse = await api.post('/test/updateTest', {
        testId: testId.value,
        testName: selectedDocument.value.title,
        limitedTime: selectedDocument.value.examTime,
        difficulty: selectedDocument.value.difficulty,
        passingScore: selectedDocument.value.passScore,
        retakeable: selectedDocument.value.retakeAllowed,
      })

      if (updateTestResponse.data.statusCode !== 'OK') {
        console.error(
          '테스트 정보 업데이트 실패:',
          updateTestResponse.data.statusCode,
          updateTestResponse.data.message,
        )
        alert('테스트 정보 업데이트에 실패했습니다.')
        return
      }

      for (const doc of selectedDocs) {
        if (doc.mcSet > 0) {
          await api.post('/question/addQuestionToTest', {
            testId: testId.value,
            documentId: doc.id,
            questionType: 'multiple_choice',
            count: doc.mcSet,
          })
        }
        if (doc.sqSet > 0) {
          await api.post('/question/addQuestionToTest', {
            testId: testId.value,
            documentId: doc.id,
            questionType: 'short_answer',
            count: doc.sqSet,
          })
        }
      }
      alert('시험 생성이 완료되었습니다!')
      step.value = 0
    } catch (error) {
      console.error('시험 설정 저장 중 오류 발생:', error)
      alert('시험 설정 저장 중 오류가 발생했습니다.')
    } finally {
      isLoading.value = false
    }
  }
}

const prevStep = () => {
  if (step.value === 1) {
    step.value = 0
  } else if (step.value === 2) {
    step.value = 1
  }
}

const fetchRevenues = async () => {
  isLoading.value = true
  try {
    const projectId = currentProjectId.value
    if (!projectId) {
      console.error('projectId가 없습니다. 문서를 불러올 수 없습니다.')
      revenues.value = []
      return
    }

    const response = await api.get('/document/getAllDocument', {
      params: {
        projectId: parseInt(projectId),
      },
    })

    if (response.data.statusCode === 'OK' && Array.isArray(response.data.resultData?.documents)) {
      revenues.value = response.data.resultData.documents.map((doc) => ({
        id: doc.documentId,
        name: doc.title,
        keyword: doc.keywords || '',
        selected: true,
        mcSet: 3,
        sqSet: 2,
      }))
    } else {
      console.error('문서 목록 가져오기 실패:', response.data.statusCode, response.data.message)
      revenues.value = []
    }
  } catch (error) {
    console.error('문서 목록 가져오기 실패:', error)
    revenues.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {})

watch(currentProjectId, (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    console.log(`projectId 변경 감지: ${oldProjectId} -> ${newProjectId}. 스텝 초기화.`)
    step.value = 0
  }
})
</script>

<style scoped>
.force-white {
  color: white !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Common header styles (TestList.vue와 동일하게 유지) */
.header-section {
  display: flex;
  align-items: flex-end; /* 제목과 부제목의 하단 정렬 */
  gap: 18px; /* 제목과 부제목 사이 간격 */
  margin-bottom: 24px; /* 섹션 하단 여백을 조정하여 v-window-item 레벨에 맞춤 */
}

.section-title-main {
  font-size: 28px;
  font-weight: bold;
  line-height: 1; /* 높이를 정확히 맞춤 */
  margin: 0;
  color: #333; /* 기본 색상 유지 */
}

.section-subtitle {
  font-size: 12px;
  color: #a1a1a1;
  font-weight: normal;
  margin-left: 0; /* gap으로 간격 제어 */
  white-space: nowrap;
  line-height: 1; /* 높이를 정확히 맞춤 */
  padding-bottom: 2px; /* 미세 조정 */
}

.v-card {
  margin-bottom: 16px;
}

.table-like-content {
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.table-like-content .v-list-item {
  border-bottom: 1px solid #eeeeee;
}

.table-like-content .v-list-item:last-child {
  border-bottom: none;
}

.table-like-content .v-list-item > div {
  padding: 8px 0;
}

.table-like-content .v-list-item h6 {
  font-size: 0.875rem;
}

.table-like-content .v-text-field {
  font-size: 0.875rem;
}
</style>
