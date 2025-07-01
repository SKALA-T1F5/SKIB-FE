<template>
  <!-- 출제자 목록 컨텐츠 -->
  <div style="flex: 1; display: flex; flex-direction: column;">
    <div style="display: flex; flex-direction: row;">
      <!-- 페이지 제목 영역 -->
      <div class="page-header">
        <h1>출제자 목록</h1>
      </div>
      <!-- 프로젝트 추가 버튼 영역 -->
      <div class="add-button-container">
        <!-- <button class="add-project-button"></button> -->
      </div>
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
            <td class="checkbox-column">
              <!-- <input type="checkbox" /> -->
            </td>
            <td class="name-column">{{ quizzer.name }}</td>
            <td class="email-column">{{ quizzer.email }}</td>
            <td class="department-column">{{ quizzer.department }}</td>
            <td class="actions-column">
              <button class="delete-button" @click="confirmDelete(quizzer.id)">
                <span class="material-icons">delete</span>
                <!-- <span class="material-icons">delete_outline</span> -->
              </button>
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
import api from '@/config/axios'

export default {
  name: 'TrainerList',
  data() {
    return {
      allQuizzers: [],
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
    async deleteQuizzer(quizzerId) {
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        headers['Content-Type'] = 'application/json';
        // DELETE 요청에 body에 id 대신 quizzerId(숫자)만 담아 전송
        await api.delete('/user/delete', {
          headers,
          data: quizzerId
        });
        // 삭제 성공 시 목록 새로고침
        this.fetchTrainers();
      } catch (error) {
        if (error.response) {
          console.error(`출제자 삭제 실패: ${error.response.status} - ${error.response.statusText}`);
        } else {
          console.error('출제자 삭제 실패:', error.message);
        }
        alert('출제자 삭제 중 오류가 발생했습니다.');
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
    async fetchTrainers() {
      try {
        const token = localStorage.getItem('token');
        // console.log('현재 저장된 토큰:', token);
        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const response = await api.get('/user/trainers', { headers });
        if (response.data.statusCode === 'OK' && response.data.resultData && Array.isArray(response.data.resultData.users)) {
          this.allQuizzers = response.data.resultData.users.map(u => ({
            id: u.userId,
            name: u.name ? u.name : (u.email ? u.email.split('@')[0] : ''),
            email: u.email,
            department: u.department || '',
          }));
        } else {
          this.allQuizzers = [];
        }
      } catch (error) {
        if (error.response) {
          console.error(`출제자 목록 불러오기 실패: ${error.response.status} - ${error.response.statusText}`);
          if (error.response.status === 500) {
            console.error('서버 내부 오류입니다. 백엔드 서버를 확인해주세요.');
          }
        } else if (error.request) {
          console.error('출제자 목록 불러오기 실패: 서버에 연결할 수 없습니다.');
        } else {
          console.error('출제자 목록 불러오기 실패:', error.message);
        }
        this.allQuizzers = [];
      }
    }
  },
  created() {
    this.fetchTrainers();
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

/* 프로젝트 추가 버튼 컨테이너 스타일 */
.add-button-container {
    width: 30%;
    /* 테이블과 동일한 너비 */
    margin: auto;
    /* 가운데 정렬 */
    text-align: right;
    /* 버튼을 오른쪽으로 정렬 */
}

/* 프로젝트 추가 버튼 스타일 */
.add-project-button {
    background-color: #1C2053;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
}

.trainer-table {
  width: 90%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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