<template>
  <!-- 출제자 목록 컨텐츠 -->
  <div style="flex: 1; display: flex; flex-direction: column;">
    <!-- 페이지 제목 영역 -->
    <div class="page-header">
      <h1>출제자 목록</h1>
      <!-- Add button container removed as per image -->
    </div>
    <!-- 출제자 목록을 표시하는 테이블 -->
    <div style="flex: 1;">
      <table class="trainer-table"> <!-- Apply styles similar to project-table -->
      <thead>
        <tr class="table-header">
          <th class="checkbox-column"></th>
          <th>이름</th>
          <th>이메일</th>
          <th>소속명</th>
          <th>생성 일자</th>
          <th class="actions-column"></th> <!-- 동작(예: 삭제 버튼)을 위한 컬럼 -->
        </tr>
      </thead>
      <tbody>
        <!-- 예시 출제자 데이터 -->
        <tr v-for="quizzer in paginatedQuizzers" :key="quizzer.id">
          <td class="checkbox-column"><input type="checkbox" /></td>
          <td>{{ quizzer.name }}</td>
          <td>{{ quizzer.email }}</td>
          <td>{{ quizzer.department }}</td>
          <td>{{ quizzer.createdDate }}</td>
          <td class="actions-column">
            <button class="delete-button" @click="confirmDelete(quizzer.id)">🗑️</button> <!-- 삭제 버튼 재활용 -->
          </td>
        </tr>
      </tbody>
    </table>
    </div>
    <!-- Pagination controls removed as per image -->
     <!-- 페이지네이션 컨트롤 UI -->
     <div class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1" class="page-button prev-next-button">이전</button>
      <button v-for="page in totalPages" :key="page" @click="goToPage(page)" 
              :class="{ 'active-page': page === currentPage }" class="page-button">
        {{ page }}
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="page-button prev-next-button">다음</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrainerList',
  data() {
    return {
      allQuizzers: [ // 전체 출제자 목록을 담을 배열
        { id: 1, name: '홍길동', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 2, name: '홍길순', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 3, name: '김철수', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 4, name: '이영희', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 5, name: '박보검', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 6, name: '김고은', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 7, name: '마동석', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 8, name: '손흥민', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 9, name: '마동석', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 10, name: '손흥민', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 11, name: '박보검', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 12, name: '김고은', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 13, name: '마동석', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 14, name: '손흥민', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 15, name: '마동석', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
        { id: 16, name: '손흥민', email: 'gildong@gmail.com', department: '글로벌 사업1팀', createdDate: '2025-06-18' },
      ], // 출제자 예시 데이터
      currentPage: 1, // 현재 페이지
      itemsPerPage: 8 // 페이지당 항목 수
    };
  },
  computed: {
    // 전체 페이지 수 계산
    totalPages() {
      return Math.ceil(this.allQuizzers.length / this.itemsPerPage);
    },
    // 현재 페이지에 보여줄 출제자 목록 계산
    paginatedQuizzers() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.allQuizzers.slice(startIndex, endIndex);
    }
  },
  methods: {
    confirmDelete(quizzerId) {
      // 삭제 확인 모달을 띄우는 로직은 부모 컴포넌트에서 처리하도록 이벤트를 발생시킵니다.
      this.$emit('confirm-delete-quizzer', quizzerId);
    },
    deleteQuizzer(quizzerId) {
      // 실제 데이터에서 출제자 삭제
      this.allQuizzers = this.allQuizzers.filter(quizzer => quizzer.id !== quizzerId);
      // 삭제 후 현재 페이지가 빈 페이지가 되면 이전 페이지로 이동
      if (this.paginatedQuizzers.length === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
    },
    // 특정 페이지로 이동
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    // 다음 페이지로 이동
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    // 이전 페이지로 이동
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
  }
};
</script>

<style scoped>
/* Styles similar to ProjectList.vue */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px; /* Add some space from the top */
}

.page-header h1 {
  font-size: 32px;
  color: black; /* Match ProjectList.vue h1 color */
}

/* add-button-container and add-button styles removed as per image */

.trainer-table {
  width: 90%; /* Match ProjectList table width */
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 50px; /* Adjust spacing */
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
}

.trainer-table th,
.trainer-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.trainer-table th {
  background-color: transparent; /* Match ProjectList */
  font-weight: bold;
}

.trainer-table tbody tr:hover {
  background-color: #f9f9f9; /* Match ProjectList selected row color */
}

.checkbox-column {
  width: 5%;
  text-align: center;
}

.actions-column {
  width: 5%;
  text-align: center;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: #666; /* Adjust color if needed */
}

/* Pagination styles if added */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px; /* Adjust spacing */
  margin-bottom: 70px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  background-color: #f9f9f9; /* Match background color from ProjectList pagination */
  padding: 10px 0; /* Add some padding */
  bottom: 60px;
}

.page-button {
  margin: 0 5px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #1C2053; /* Match ProjectList pagination button color */
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9em;
}

.page-button:disabled {
  color: #aaa;
  cursor: not-allowed;
  background-color: #f9f9f9; /* Match ProjectList disabled button background */
}

.page-button.active-page {
  background-color: #1C2053; /* Match ProjectList active button background */
  color: white;
  border-color: #1C2053; /* Match ProjectList active button border */
  font-weight: bold;
}

.prev-next-button {
  font-weight: bold;
}
</style> 