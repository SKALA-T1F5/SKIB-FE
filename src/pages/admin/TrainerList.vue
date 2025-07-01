<template>
  <!-- 출제자 목록 컨텐츠 -->
  <div style="flex: 1; display: flex; flex-direction: column;">
    <!-- 페이지 제목 영역 -->
    <div class="page-header">
      <h1>출제자 목록</h1>
    </div>
    <!-- 출제자 목록을 표시하는 테이블 -->
    <div style="flex: 1;">
      <table class="trainer-table">
        <thead>
          <tr class="table-header">
            <th class="checkbox-column"></th>
            <th class="name-column">이름</th>
            <th class="email-column">이메일</th>
            <th class="department-column">소속명</th>
            <th class="actions-column"></th>
          </tr>
        </thead>
        <tbody>
          <!-- 예시 출제자 데이터 -->
          <tr v-for="quizzer in paginatedQuizzers" :key="quizzer.id">
            <td class="checkbox-column"><input type="checkbox" /></td>
            <td class="name-column">{{ quizzer.name }}</td>
            <td class="email-column">{{ quizzer.email }}</td>
            <td class="department-column">{{ quizzer.department }}</td>
            <td class="actions-column">
              <button class="delete-button" @click="confirmDelete(quizzer.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
      allQuizzers: [
        { id: 1, name: '홍길동', email: 'gildong@gmail.com', department: '글로벌 사업1팀' },
        { id: 2, name: '홍길순', email: 'gildong@gmail.com', department: '글로벌 사업2팀' },
        { id: 3, name: '김철수', email: 'gildong@gmail.com', department: '글로벌 사업3팀' },
        { id: 4, name: '정대령', email: 'gildong@gmail.com', department: 'SKALA팀' },
        { id: 5, name: '안보람', email: 'gildong@gmail.com', department: 'SKALA팀' },
        { id: 6, name: '김고은', email: 'gildong@gmail.com', department: 'AI혁신팀' },
        { id: 7, name: '마동석', email: 'gildong@gmail.com', department: 'IT기획팀' },
        { id: 8, name: '손흥민', email: 'gildong@gmail.com', department: '글로벌 사업1팀' },
        { id: 9, name: '마동석', email: 'gildong@gmail.com', department: '글로벌 사업2팀' },
        { id: 10, name: '손흥민', email: 'gildong@gmail.com', department: '글로벌 사업1팀' },
        { id: 11, name: '박보검', email: 'gildong@gmail.com', department: '글로벌 사업1팀' },
        { id: 12, name: '김고은', email: 'gildong@gmail.com', department: 'AI혁신팀' },
        { id: 13, name: '마동석', email: 'gildong@gmail.com', department: 'IT기획팀' },
        { id: 14, name: '손흥민', email: 'gildong@gmail.com', department: '글로벌 사업1팀' },
        { id: 15, name: '마동석', email: 'gildong@gmail.com', department: '글로벌 사업3팀' },
        { id: 16, name: '손흥민', email: 'gildong@gmail.com', department: '글로벌 사업1팀' },
      ],
      currentPage: 1,
      itemsPerPage: 8
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.allQuizzers.length / this.itemsPerPage);
    },
    paginatedQuizzers() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.allQuizzers.slice(startIndex, endIndex);
    }
  },
  methods: {
    confirmDelete(quizzerId) {
      this.$emit('confirm-delete-quizzer', quizzerId);
    },
    deleteQuizzer(quizzerId) {
      this.allQuizzers = this.allQuizzers.filter(quizzer => quizzer.id !== quizzerId);
      if (this.paginatedQuizzers.length === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 30px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: bold;
  color: #000000;
}

.trainer-table {
  width: 90%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 50px;
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
  background-color: transparent;
  font-weight: bold;
}

.trainer-table tbody tr:hover {
  background-color: #f9f9f9;
}

.checkbox-column {
  width: 5%;
  text-align: center;
}

.name-column {
  width: 15%;
}

.email-column {
  width: 40%;
}

.department-column {
  width: 35%;
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
  color: #666;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 70px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  background-color: #f9f9f9;
  padding: 10px 0;
  bottom: 60px;
}

.page-button {
  margin: 0 5px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #1C2053;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9em;
}

.page-button:disabled {
  color: #aaa;
  cursor: not-allowed;
  background-color: #f9f9f9;
}

.page-button.active-page {
  background-color: #1C2053;
  color: white;
  border-color: #1C2053;
  font-weight: bold;
}

.prev-next-button {
  font-weight: bold;
}
</style> 