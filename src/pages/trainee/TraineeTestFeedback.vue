<template>
  <MainLayout :show-sidebar="false">
    <template #content>
      <div class="feedback-main-content">
        <div class="feedback-dashboard-layout-wrapper">
          <div class="feedback-download-bar">
            <!-- <button class="download-pdf-btn" @click="downloadPdf">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="#34495e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="4" y="17" width="16" height="1" rx="2" fill="#34495e"/>
              </svg>
            </button> -->
          </div>
          <div ref="pdfContent" class="feedback-dashboard-layout">
            <h1 class="dashboard-title">{{ $t('feedback_title') }}</h1>

            <div v-if="isLoading" class="loading-indicator">{{ $t('feedback_loading') }}</div>
            <div v-else-if="fetchError" class="error-message">
              <p>{{ $t('feedback_load_fail') }}</p>
              <p>{{ $t('feedback_error') }}: {{ fetchError.message }}</p>
            </div>
            <div v-else-if="!hasData" class="no-data-message">
              <p>{{ $t('feedback_no_data') }}</p>
            </div>
            <div v-else>
              <div class="top-row-grid">
                <section class="dashboard-card summary-card">
                  <h2 class="card-title">{{ $t('feedback_summary_title') }}</h2>
                  <div class="summary-content">
                    <div class="pass-fail-indicator">
                      <p :class="['pass-fail-text', feedbackData.isPassed ? 'pass' : 'fail']">
                        {{ feedbackData.isPassed ? $t('feedback_pass') : $t('feedback_fail') }}
                      </p>
                      <p class="congratulations" v-if="feedbackData.isPassed">{{ $t('feedback_congrats') }}</p>
                      <p class="encouragement" v-else>{{ $t('feedback_try_again') }}</p>
                    </div>
                    <div class="summary-details">
                      <p>
                        {{ $t('feedback_total_correct_rate') }}:
                        <span class="detail-value">{{ feedbackData.totalCorrectRate }}{{ $t('scoreUnit') }}</span>
                      </p>
                      <p>
                        {{ $t('feedback_pass_score') }}:
                        <span class="detail-value">{{ feedbackData.passScore }}{{ $t('scoreUnit') }}</span>
                      </p>
                      <p>
                        {{ $t('feedback_correct_answers') }}:
                        <span class="detail-value">{{ correctQuestions }}</span>
                      </p>
                      <p>
                        {{ $t('feedback_wrong_answers') }}:
                        <span class="detail-value">{{ wrongQuestions }}</span>
                      </p>
                    </div>
                  </div>
                </section>

                <section class="dashboard-card document-accuracy-card">
                  <h2 class="card-title">{{ $t('feedback_document_accuracy') }}</h2>
                  <DocumentAccuracyChart :document-accuracy="feedbackData.documentAccuracy" />
                </section>

                <section class="dashboard-card tag-capacity-card">
                  <h2 class="card-title">{{ $t('feedback_tag_evaluation') }}</h2>
                  <RadarChart :tag-accuracy="processedTagAccuracy" />
                </section>
              </div>

              <section class="dashboard-card my-level-card">
                <h2 class="card-title">{{ $t('feedback_my_level') }}</h2>
                <LineAreaChart
                  :my-score="feedbackData.totalCorrectRate"
                  :all-participant-scores="allParticipantScores"
                  :my-user-id="myUserId"
                />
                <!-- <p class="rank-summary">
                  {{ $t('feedback_rank_prefix') }}
                  <span class="highlight-rank">{{ myRank }}{{ $t('feedback_rank_suffix') }}</span>,
                  {{ $t('feedback_top_prefix') }}
                  <span class="highlight-percent">{{ topPercentage }}%</span>
                  {{ $t('feedback_top_suffix') }}
                </p> -->
              </section>
            </div>
          </div>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
// =========================
// 1. 라이브러리 및 컴포넌트 임포트
// =========================
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
// 레이아웃 및 차트 컴포넌트
import MainLayout from '@/components/layouts/MainLayout.vue'
import RadarChart from '@/components/trainee/feedback/RadarChart.vue'
import LineAreaChart from '@/components/trainee/feedback/LineAreaChart.vue'
import DocumentAccuracyChart from '@/components/trainee/feedback/DocumentAccuracyChart.vue'
import axios from '@/config/axios' // axios 인스턴스

// =========================
// 2. 라우트 및 사용자 정보
// =========================
const route = useRoute() // 현재 라우트 정보
const { t } = useI18n()
const testId = route.params.testId // URL에서 시험 ID 추출
const myUserId = ref(localStorage.getItem('userId')) // LocalStorage에서 사용자 ID 추출

// =========================
// 3. 상태 변수 정의
// =========================
const isLoading = ref(true) // 데이터 로딩 상태
const fetchError = ref(null) // 에러 정보

// 시험 피드백 데이터(정답률, 합격여부, 문서별/태그별 정확도 등)
const feedbackData = ref({
  totalCorrectRate: 0, // 총 정답률(%)
  isPassed: false, // 합격 여부
  documentAccuracy: {}, // 문서별 정답률
  tagAccuracy: {}, // 태그별 정답률
  totalQuestions: 0, // 전체 문항 수
  correctQuestions: 0, // 맞은 문항 수
  wrongQuestions: 0, // 틀린 문항 수
  passScore: 0, // 합격 기준 점수
})

// 전체 응시자 점수 분포(그래프용)
const allParticipantScores = ref([])
const myRank = ref(0) // 내 순위
const totalParticipants = ref(0) // 전체 응시자 수

// =========================
// 4. computed: 화면 표시용 파생 데이터
// =========================
const totalQuestions = computed(() => feedbackData.value.totalQuestions)
const correctQuestions = computed(() => feedbackData.value.correctQuestions)
const wrongQuestions = computed(() => feedbackData.value.wrongQuestions)

// 피드백 데이터가 존재하는지 여부(로딩/에러/데이터 없음 분기용)
const hasData = computed(() => {
  return (
    feedbackData.value.totalCorrectRate > 0 ||
    Object.keys(feedbackData.value.documentAccuracy).length > 0 ||
    Object.keys(feedbackData.value.tagAccuracy).length > 0
  )
})

// 내 순위가 상위 몇 %인지 계산
const topPercentage = computed(() => {
  if (totalParticipants.value <= 1) return 0.0
  // 내 점수보다 낮은 사람 수
  const lowerCount = allParticipantScores.value.filter(p => p.score < feedbackData.value.totalCorrectRate).length
  // 상위 % = (내 점수보다 낮은 사람 수 / 전체 인원) * 100
  const percentage = (lowerCount / totalParticipants.value) * 100
  return parseFloat(percentage.toFixed(1))
})

const processedTagAccuracy = computed(() => {
  const original = feedbackData.value.tagAccuracy
  const translated = {}
  const tagKeyMap = {
    '분석력': 'feedback_tags.analysis',
    '문제해결력': 'feedback_tags.problemSolving',
    '추론력': 'feedback_tags.reasoning',
    '이해력': 'feedback_tags.comprehension',
    '논리력': 'feedback_tags.logic'
  }

  for (const key in original) {
    if (Object.prototype.hasOwnProperty.call(tagKeyMap, key)) {
      const translatedKey = t(tagKeyMap[key])
      translated[translatedKey] = original[key]
    } else {
      translated[key] = original[key]
    }
  }
  return translated
})

const pdfContent = ref(null)

const downloadPdf = () => {
  if (!pdfContent.value) return
  html2pdf()
    .set({
      margin: [0.5, 0.5, 0.5, 0.5], // 상,우,하,좌 (inch) 넉넉하게
      filename: '피드백_결과.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      // width: 800, // A4 기준 강제 지정
    })
    .from(pdfContent.value)
    .save()
}

// =========================
// 5. 피드백 데이터 백엔드에서 불러오기
// =========================
const fetchFeedbackData = async () => {
  isLoading.value = true
  fetchError.value = null

  // 사용자 정보 없을 때 예외 처리
  if (!myUserId.value) {
    console.error('User ID not found in Local Storage. Cannot fetch feedback data.')
    fetchError.value = new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.')
    isLoading.value = false
    return
  }

  try {
    // 여러 API를 병렬로 호출하여 피드백 데이터 수집
    const [totalAccuracyResponse, tagAccuracyResponse, docAccuracyResponse, distributionResponse] =
      await Promise.all([
        axios.get(`/feedback/all`, { params: { userId: myUserId.value, testId: testId } }), // 전체 정답률, 합격여부 등
        axios.get(`/feedback/tag`, { params: { userId: myUserId.value, testId: testId } }), // 태그별 정확도
        axios.get(`/feedback/docs`, { params: { userId: myUserId.value, testId: testId } }), // 문서별 정확도
        axios.get(`/feedback/distribution`, {
          params: { userId: myUserId.value, testId: testId }, // 점수 분포(그래프용)
        }),
      ])

    // 1) 전체 정답률/합격여부/문항수 등 저장 (응답 구조에 맞게 수정)
    const result = totalAccuracyResponse.data.resultData || {}
    feedbackData.value.totalCorrectRate = result.totalScore ?? 0
    feedbackData.value.isPassed = (result.totalScore ?? 0) >= (result.passScore ?? 0)
    feedbackData.value.totalQuestions = (result.correctCount ?? 0) + (result.incorrectCount ?? 0)
    feedbackData.value.correctQuestions = result.correctCount ?? 0
    feedbackData.value.wrongQuestions = result.incorrectCount ?? 0
    feedbackData.value.passScore = result.passScore ?? 0

    // 2) 태그별 정확도 가공 (응답 구조에 맞게 수정)
    // resultData: [{ tagName, accuracyRate, correctCount, totalCount }, ...]
    // console.log('tagAccuracyResponse.data.resultData:', tagAccuracyResponse.data.resultData)
    const tagAccuracyMap = {}
    const requiredTags = ["분석력", "문제해결력", "추론력", "이해력", "논리력"]
    if (Array.isArray(tagAccuracyResponse.data.resultData)) {
      tagAccuracyResponse.data.resultData.forEach((item) => {
        if (item.tagName) {
          tagAccuracyMap[item.tagName] = {
            accuracyRate: Math.max(0, Math.min(100, item.accuracyRate ?? 0)),
            correctCount: item.correctCount ?? 0,
            totalCount: item.totalCount ?? 0,
          }
        }
      })
    }
    // 누락된 태그는 0값으로 추가 (accuracyRate 0~100 보장)
    requiredTags.forEach((tag) => {
      if (!tagAccuracyMap[tag]) {
        tagAccuracyMap[tag] = {
          accuracyRate: 0,
          correctCount: 0,
          totalCount: 0,
        }
      } else {
        tagAccuracyMap[tag].accuracyRate = Math.max(0, Math.min(100, tagAccuracyMap[tag].accuracyRate ?? 0))
      }
    })
    feedbackData.value.tagAccuracy = tagAccuracyMap

    // 3) 문서별 정확도 가공 (ex: {"문서1": 90, "문서2": 70})
    const documentAccuracyMap = {}
    if (Array.isArray(docAccuracyResponse.data.resultData)) {
      docAccuracyResponse.data.resultData.forEach((item) => {
        if (item.documentName && typeof item.accuracyRate === 'number') {
          documentAccuracyMap[item.documentName] = item.accuracyRate
        }
      })
    }
    feedbackData.value.documentAccuracy = documentAccuracyMap

    // 4) 전체 응시자 점수 분포(그래프용 배열 생성)
    // scoreDistribution: [{ minScore, maxScore, userCount, percentage }, ...]
    const scoreDistribution = distributionResponse.data.resultData?.scoreDistribution || []
    const simulatedAllParticipantScores = []
    scoreDistribution.forEach((range) => {
      const averageScore = Math.round((range.minScore + range.maxScore) / 2)
      for (let i = 0; i < (range.userCount || 0); i++) {
        simulatedAllParticipantScores.push({
          userId: `simulated_user_${range.minScore}-${range.maxScore}_${i}`,
          score: averageScore,
        })
      }
    })
    allParticipantScores.value = simulatedAllParticipantScores

    // 5) 내 점수, 전체 응시자 수 저장 
    const myCurrentScore = distributionResponse.data.resultData?.myScore ?? 0
    totalParticipants.value = distributionResponse.data.resultData?.totalUserCount ?? 0
    feedbackData.value.totalCorrectRate = myCurrentScore

    // 6) 내 순위 계산
    calculateRank(myCurrentScore)
  } catch (error) {
    // 에러 발생 시 처리
    console.error('피드백 데이터를 불러오는 데 실패했습니다:', error)
    fetchError.value = error
  } finally {
    isLoading.value = false
  }
}

// =========================
// 6. 내 순위 계산 함수
// =========================
const calculateRank = (myScore) => {
  if (totalParticipants.value === 0) {
    myRank.value = 0
    return
  }
  // 내 점수보다 높은 사람 수 + 1 = 내 순위
  const higherCount = allParticipantScores.value.filter(p => p.score > myScore).length
  myRank.value = higherCount + 1
}

// =========================
// 7. 컴포넌트 마운트 시 데이터 불러오기
// =========================
onMounted(() => {
  fetchFeedbackData()
})
// =========================
// (끝)
// =========================
</script>

<style scoped>
.feedback-main-content {
  flex-grow: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  /* 3. 전체 헤더와 메인 콘텐츠 간의 간격 좁히기 */
  margin-bottom: 15px; /* 기존 30px에서 15px로 더 줄였습니다. */
  text-align: center;
  padding-bottom: 20px;
}

.feedback-dashboard-layout-wrapper {
  position: relative;
}

.feedback-download-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
}

.download-pdf-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s;
}

.download-pdf-btn:hover {
  background: #f0f0f0;
}

.feedback-dashboard-layout {
  display: grid;
  /* 2. 각 카드 간의 가로 세로 간격 동일하게 조정 */
  gap: 25px; /* 통일된 간격 */
  grid-template-rows: auto auto;
  /* max-width: 800px; */
}

.top-row-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  /* 2. 각 카드 간의 가로 세로 간격 동일하게 조정 */
  gap: 25px; /* 통일된 간격 */
}

.dashboard-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
  /* 1. 종합 평가 헤더 아래 라인의 길이 조정:
     .card-title는 기본적으로 block 레벨 요소이며 width: 100%를 차지합니다.
     따라서 border-bottom은 padding을 제외한 부모 요소의 전체 너비에 그려집니다.
     text-align: center는 텍스트에만 영향을 미치므로, 이 부분은 별도 수정 없이도
     다른 카드들과 동일하게 헤더 아래 라인의 길이가 카드 너비에 맞춰 조정됩니다. */
}

/* 1. 종합 평가 카드 */
.summary-card {
  align-items: center; /* 카드 내용(제목 제외) 중앙 정렬 */
  text-align: center; /* 카드 내 텍스트 중앙 정렬 */
}

.summary-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
}

.pass-fail-indicator {
  margin-bottom: 20px;
}

.pass-fail-text {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 10px;
}

.pass-fail-text.pass {
  color: #28a745;
}

.pass-fail-text.fail {
  color: #dc3545;
}

.congratulations,
.encouragement {
  font-size: 16px;
  color: #6c757d;
  font-weight: 500;
}

.summary-details {
  font-size: 15px;
  color: #495057;
  text-align: left;
  width: 100%;
  max-width: 180px; /* 상세 정보 블록의 최대 너비 */
}

.summary-details p {
  margin-bottom: 8px;
}

.summary-details p:last-child {
  margin-bottom: 0;
}

.summary-details .detail-value {
  font-weight: 600;
  color: #343a40;
  float: right;
}

/* 2. 문서별 정답률 카드 */
.document-accuracy-card {
  justify-content: flex-start; /* 카드 내용 상단 정렬 */
}

/* 3. 문제 Tag별 역량 카드 (Radar Chart) */
.tag-capacity-card {
  justify-content: center; /* 카드 내용 수직 중앙 정렬 */
}

/* 4. 현재 나의 레벨 카드 (Line Area Chart) */
.my-level-card {
  grid-column: 1 / -1;
  padding-bottom: 40px;
}

.my-level-card .rank-summary {
  font-size: 18px;
  color: #495057;
  margin-top: 25px;
  text-align: center;
  font-weight: 500;
}

.my-level-card .highlight-rank {
  font-weight: 700;
  color: #dc3545;
}
.my-level-card .highlight-percent {
  font-weight: 700;
  color: #007bff;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .top-row-grid {
    grid-template-columns: 1fr;
    gap: 25px; /* 통일된 간격 */
  }
}

@media (max-width: 768px) {
  .feedback-main-content {
    padding: 20px;
  }
  .dashboard-title {
    font-size: 28px;
    margin-bottom: 15px; /* 모바일에서도 간격 유지 */
  }
  .dashboard-card {
    padding: 20px;
  }
  .card-title {
    font-size: 20px;
    margin-bottom: 15px;
  }

  /* 종합 평가 */
  .pass-fail-text {
    font-size: 44px;
  }
  .summary-details {
    max-width: none;
  }

  /* 차트 높이 조정 */
  .tag-capacity-card .chart-container-wrapper {
    height: 250px;
  }
  .my-level-card .chart-container-wrapper {
    height: 220px;
  }
  .my-level-card .rank-summary {
    font-size: 16px;
    margin-top: 20px;
  }
}

/* 로딩/에러/데이터 없음 메시지 스타일 */
.loading-indicator,
.error-message,
.no-data-message {
  text-align: center;
  padding: 50px 20px;
  font-size: 18px;
  color: #555;
  background-color: #f8f8f8;
  border-radius: 12px;
  margin-top: 25px; /* 카드 간 간격과 동일하게 유지 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.error-message {
  color: #dc3545;
  background-color: #ffebeb;
  border: 1px solid #dc3545;
}
</style>
