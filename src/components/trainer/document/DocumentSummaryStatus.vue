<template>
  <v-card elevation="0" class="summary-card">
    <v-card-text class="pa-0">
      <div class="summary-box-outer">
        <h4 class="section-title">📄 문서 처리 상태</h4>
        <div v-if="currentProcessingDocument" class="summary-content">
          <p class="summary-title">문서 ID: {{ currentProcessingDocument.documentId }}</p>
          <p class="summary-text">{{ currentProcessingDocument.message }}</p>
        </div>
        <div v-else class="summary-placeholder">
          <v-icon size="24" color="#666" class="mr-2">mdi-timer-sand</v-icon>
          <span class="text-body-2 text-grey-darken-1">문서 처리 상태 대기 중...</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

export default {
  name: 'SummaryStatus',
  data() {
    return {
      stompClient: null,
      // Spring Boot에서 전송하는 SummaryNotification 객체 구조에 맞게 변경
      currentProcessingDocument: null,
    }
  },
  mounted() {
    this.connectWebSocket()
  },
  beforeUnmount() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {
        console.log('📡 WebSocket 연결 해제됨.')
      })
    }
  },
  methods: {
    connectWebSocket() {
      if (this.stompClient && this.stompClient.connected) {
        return
      }

      const socket = new SockJS('http://localhost:8080/ws')
      this.stompClient = Stomp.over(socket)
      this.stompClient.debug = null

      this.stompClient.connect(
        {},
        (frame) => {
          console.log('📡 WebSocket 연결 성공:', frame)
          // Spring Boot가 보내는 /topic/summary 토픽 구독
          this.stompClient.subscribe('/topic/summary', this.handleSummaryNotification)
        },
        (error) => {
          console.error('❌ WebSocket 연결 실패:', error)
          // 연결 실패 시 재연결 시도 (선택 사항)
          // setTimeout(() => this.connectWebSocket(), 5000);
        },
      )
    },
    handleSummaryNotification(message) {
      try {
        // Spring Boot의 SummaryNotification 객체 구조에 맞게 파싱
        const notification = JSON.parse(message.body)
        console.log('📥 수신된 문서 처리 알림:', notification)

        // currentProcessingDocument에 수신된 알림 데이터 할당
        this.currentProcessingDocument = notification

        // "요약이 완료되었습니다." 메시지를 받으면 일정 시간 후 초기화 (선택 사항)
        if (notification.message.includes('완료되었습니다.')) {
          setTimeout(() => {
            this.currentProcessingDocument = null
          }, 5000) // 5초 후 메시지 사라짐
        }
      } catch (e) {
        console.error('❌ 문서 처리 알림 파싱 오류:', e)
      }
    },
  },
}
</script>

<style scoped>
.summary-card {
  width: 100%;
  background: transparent;
  margin-bottom: 32px;
}

.summary-box-outer {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 18px;
  font-family: inherit;
  color: #333;
}

.summary-content {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
}

.summary-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #444;
}

.summary-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #555;
}

.summary-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #888;
  font-style: italic;
  background-color: #f0f0f0;
  border-radius: 6px;
}
</style>
