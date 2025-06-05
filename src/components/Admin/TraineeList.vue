<template>
  <!-- 학습자 목록 컨텐츠 -->
  <div style="flex: 1;">
    <!-- 페이지 제목 영역 -->
    <div class="page-header">
      <h1>학습자 목록</h1>
    </div>
    <!-- 학습자 추가 버튼 영역 -->
    <div class="add-button-container">
      <button class="add-trainee-button" @click="openAddModal">학습자 추가</button>
    </div>
    <!-- 학습자 목록을 표시하는 테이블 -->
    <table class="trainee-table">
      <thead>
        <tr class="table-header">
          <th class="checkbox-column"></th>
          <th>이름</th>
          <th>이메일</th>
          <th>소속명</th>
          <th>생성 일자</th>
          <th class="actions-column"></th>
        </tr>
      </thead>
      <tbody>
        <!-- 예시 학습자 데이터 -->
        <tr v-for="trainee in paginatedTrainees" :key="trainee.id">
          <td class="checkbox-column"><input type="checkbox" /></td>
          <td>{{ trainee.name }}</td>
          <td>{{ trainee.email }}</td>
          <td>{{ trainee.affiliation }}</td>
          <td>{{ trainee.createdDate }}</td>
          <td class="actions-column">
            <button class="delete-button" @click="confirmDelete(trainee.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 학습자 추가 모달 -->
  <div v-if="showAddModal" class="modal-overlay">
    <div class="create-trainee-dialog">
      <h2>학습자 생성</h2>
      <div class="dialog-form">
        <div class="form-group">
          <!-- 학습자 태그 입력 필드 -->
          <div class="trainee-input-container">
            <span v-for="(trainee, index) in newTraineeData.trainees" :key="index" class="trainee-tag">
              {{ trainee }}
              <span class="remove-tag" @click="removeTrainee(index)">×</span>
            </span>
            <input type="text" id="trainee-input" :placeholder="traineePlaceholder" v-model="currentTraineeInput" @keydown.enter.prevent="addTraineeTag" />
          </div>
        </div>
        <div class="form-group">
          <input type="password" id="trainee-password" placeholder="초기 비밀번호 설정" v-model="newTraineeData.password" />
        </div>
        <div class="form-group">
          <input type="text" id="trainee-affiliation" placeholder="소속명 입력" v-model="newTraineeData.affiliation" />
        </div>
      </div>
      <div class="dialog-buttons">
        <button class="confirm-button" @click="confirmAddTrainee">확인</button>
        <button class="cancel-button" @click="cancelAddTrainee">취소</button>
      </div>
    </div>
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
</template>

<script>
export default {
  name: 'TraineeList',
  data() {
    return {
      allTrainees: [
        { id: 1, name: '홍길동', email: 'gildong@gmail.com', affiliation: 'NTQ Solution', createdDate: '2025-05-18' },
        { id: 2, name: '홍길순', email: 'gildong@gmail.com', affiliation: 'VTI', createdDate: '2025-05-18' },
        { id: 3, name: '김철수', email: 'gildong@gmail.com', affiliation: 'FPT', createdDate: '2025-05-18' },
        { id: 4, name: '이영희', email: 'gildong@gmail.com', affiliation: 'CMC', createdDate: '2025-05-18' },
        { id: 5, name: '박보검', email: 'gildong@gmail.com', affiliation: 'VTI', createdDate: '2025-05-18' },
        { id: 6, name: '김고은', email: 'gildong@gmail.com', affiliation: 'Co-well', createdDate: '2025-05-18' },
        { id: 7, name: '마동석', email: 'gildong@gmail.com', affiliation: 'FPT', createdDate: '2025-05-18' },
        { id: 8, name: '손흥민', email: 'gildong@gmail.com', affiliation: 'GMO-Z.com RUNSYSTEM', createdDate: '2025-05-18' },
        { id: 9, name: '마동석', email: 'gildong@gmail.com', affiliation: 'FPT', createdDate: '2025-05-18' },
        { id: 10, name: '손흥민', email: 'gildong@gmail.com', affiliation: 'GMO-Z.com RUNSYSTEM', createdDate: '2025-05-18' },
        { id: 11, name: '박보검', email: 'gildong@gmail.com', affiliation: 'VTI', createdDate: '2025-05-18' },
        { id: 12, name: '김고은', email: 'gildong@gmail.com', affiliation: 'Co-well', createdDate: '2025-05-18' },
        { id: 13, name: '마동석', email: 'gildong@gmail.com', affiliation: 'FPT', createdDate: '2025-05-18' },
        { id: 14, name: '손흥민', email: 'gildong@gmail.com', affiliation: 'GMO-Z.com RUNSYSTEM', createdDate: '2025-05-18' },
        { id: 15, name: '마동석', email: 'gildong@gmail.com', affiliation: 'FPT', createdDate: '2025-05-18' },
        { id: 16, name: '손흥민', email: 'gildong@gmail.com', affiliation: 'GMO-Z.com RUNSYSTEM', createdDate: '2025-05-18' },
      ],
      currentPage: 1,
      itemsPerPage: 7,
      showAddModal: false,
      newTraineeData: {
        trainees: [], // 학습자 이메일 배열
        password: '', // 초기 비밀번호
        affiliation: '', // 소속명
      },
      currentTraineeInput: '', // 현재 입력 중인 학습자 이메일
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.allTrainees.length / this.itemsPerPage);
    },
    paginatedTrainees() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.allTrainees.slice(startIndex, endIndex);
    },
    traineePlaceholder() {
      return this.newTraineeData.trainees.length === 0 ? '이메일 입력 후 Enter' : '';
    }
  },
  methods: {
    confirmDelete(traineeId) {
      this.$emit('confirm-delete-trainee', traineeId);
    },
    deleteTrainee(traineeId) {
      // 실제 데이터에서 학습자 삭제
      this.allTrainees = this.allTrainees.filter(trainee => trainee.id !== traineeId);
      // 삭제 후 현재 페이지가 빈 페이지가 되면 이전 페이지로 이동
      if (this.paginatedTrainees.length === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
    },
    addTraineeTag() {
      const email = this.currentTraineeInput.trim();
      if (email && !this.newTraineeData.trainees.includes(email)) {
        this.newTraineeData.trainees.push(email);
        this.currentTraineeInput = ''; // 입력 필드 초기화
      }
    },
    removeTrainee(index) {
      this.newTraineeData.trainees.splice(index, 1);
    },
    openAddModal() {
      this.showAddModal = true;
    },
    confirmAddTrainee() {
      // TODO: 실제 학습자 추가 로직 구현
      console.log('새 학습자 정보:', this.newTraineeData);
      // 모달 닫기 및 입력 필드 초기화
      this.resetAddModal();
    },
    cancelAddTrainee() {
      // 모달 닫기 및 입력 필드 초기화
      this.resetAddModal();
    },
    resetAddModal() {
      this.showAddModal = false;
      this.newTraineeData = {
        trainees: [],
        password: '',
        affiliation: '',
      };
      this.currentTraineeInput = '';
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

.add-button-container {
  width: 90%;
  margin: auto;
  text-align: right;
}

.add-trainee-button {
  background-color: #1C2053;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}

.trainee-table {
  width: 90%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 40px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
}

.trainee-table th,
.trainee-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.trainee-table th {
  background-color: transparent;
  font-weight: bold;
}

.trainee-table tbody tr:hover {
  background-color: #f9f9f9;
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
  color: #666;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  /* margin-top: 20px; 테이블과의 간격 */
  margin-bottom: 70px; /* ProjectList.vue와 동일한 푸터와의 간격 */
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  background-color: #f9f9f9; /* 메인 컨텐츠 배경색과 동일하게 설정 */
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

/* Modal Overlay Style */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Trainee Creation Dialog Style */
.create-trainee-dialog {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 480px;
  text-align: left;
}

.create-trainee-dialog h2 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 1.5em;
  color: #333;
}

.dialog-form .form-group {
  margin-bottom: 20px;
}

.dialog-form input[type="text"], .dialog-form input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #292F8B;
  border-radius: 4px;
  font-size: 1em;
  box-sizing: border-box;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

/* Confirm Button Style */
.confirm-button {
  background-color: #1C2053;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

/* Cancel Button Style */
.cancel-button {
  background-color: #ccc;
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

/* Trainee Input Specific Styles */
.trainee-input-container {
  border: 1px solid #292F8B;
  border-radius: 4px;
  padding: 5px 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 50px;
}

.trainee-tag {
  background-color: #e0e0e0;
  color: #333;
  padding: 3px 8px;
  border-radius: 12px;
  margin-right: 8px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  font-size: 0.9em;
}

.remove-tag {
  margin-left: 5px;
  cursor: pointer;
  font-weight: bold;
  color: #666;
}

.trainee-input-container input[type="text"] {
  flex-grow: 1;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  min-width: 100px;
}
</style> 