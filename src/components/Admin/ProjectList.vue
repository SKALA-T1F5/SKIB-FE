<template>
  <!-- 전체 프로젝트 목록 페이지 컨테이너 -->
  <div class="project-list-container">
    <!-- 상단 헤더 영역 -->
    <header class="app-header">
      <!-- 로고 (이미지 + 텍스트) -->
      <div class="logo">
        <img src="/icon1.png" class="logo-image" />
        <span>skib</span>
      </div>
      <!-- 메인 네비게이션 메뉴 -->
      <nav class="main-nav">
        <a href="#" class="nav-item" :class="{ active: currentMenu === 'projects' }" @click.prevent="selectMenu('projects')">프로젝트 관리</a>
        <a href="#" class="nav-item" :class="{ active: currentMenu === 'quizzers' }" @click.prevent="selectMenu('quizzers')">출제자 관리</a>
        <a href="#" class="nav-item" :class="{ active: currentMenu === 'learners' }" @click.prevent="selectMenu('learners')">학습자 관리</a>
      </nav>
      <!-- 사용자 관련 메뉴 (언어 선택, 사용자 정보) -->
      <div class="user-menu">
        <span class="language-selector">KOR</span>
        <img src="/person.png" class="person-icon" alt="User Icon" />
        <span class="user-info">
          Doeun Kim
          <span class="user-role">Admin</span>
        </span>
        <span class="dropdown-icon">▼</span>
      </div>
    </header>

    <!-- 메인 컨텐츠 영역 -->
    <main class="main-content" style="display: flex; flex-direction: column;">
      <!-- 프로젝트 목록 컨텐츠 -->
      <div v-if="currentMenu === 'projects'">
        <!-- 페이지 제목 영역 -->
        <div class="page-header">
          <h1>프로젝트 목록</h1>
        </div>
        <!-- 프로젝트 추가 버튼 영역 -->
        <div class="add-button-container">
          <button class="add-project-button" @click="showCreateModal">프로젝트 추가</button>
        </div>
        <!-- 프로젝트 목록을 표시하는 테이블 -->
        <table class="project-table">
          <thead>
            <tr class="table-header">
              <th class="checkbox-column"></th>
              <th>프로젝트명</th>
              <th>프로젝트 설명</th>
              <th>생성 일자</th>
              <th class="actions-column"></th> <!-- 동작(예: 삭제 버튼)을 위한 컬럼 -->
            </tr>
          </thead>
          <tbody>
            <!-- paginatedProjects 배열을 순회하며 현재 페이지의 프로젝트 정보만 표시 -->
            <tr v-for="project in paginatedProjects" :key="project.id">
              <td class="checkbox-column"><input type="checkbox" /></td>
              <td>{{ project.name }}</td>
              <td>{{ project.description }}</td>
              <td>{{ project.createdDate }}</td>
              <td class="actions-column">
                <button class="delete-button" @click="showConfirmDialog(project.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 출제자 목록 컨텐츠 -->
      <div v-if="currentMenu === 'quizzers'" style="flex: 1; display: flex; flex-direction: column;">
        <TrainerList ref="trainerListRef" @confirm-delete-quizzer="handleDeleteQuizzer"/>
        </div>

      <!-- 학습자 목록 컨텐츠 -->
      <div v-if="currentMenu === 'learners'" style="flex: 1; display: flex; flex-direction: column;">
        <TraineeList ref="traineeListRef" @confirm-delete-trainee="handleDeleteTrainee"/>
      </div>
    </main>

    <!-- 페이지네이션 컨트롤 UI -->
    <div class="pagination-controls" v-if="currentMenu === 'projects'">
      <button @click="prevPage" :disabled="currentPage === 1" class="page-button prev-next-button">이전</button>
      <button v-for="page in totalPages" :key="page" @click="goToPage(page)" 
              :class="{ 'active-page': page === currentPage }" class="page-button">
        {{ page }}
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="page-button prev-next-button">다음</button>
    </div>

    <!-- 하단 푸터 영역 -->
    <footer class="app-footer">
      <p>©2025 SKIB Maholan</p>
    </footer>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="confirm-dialog">
        <div class="dialog-content">
          <div class="warning-icon">▲ 경고</div>
          <p class="dialog-text">삭제하시면 복구할 수 없습니다.<br>정말로 삭제하시겠습니까?</p>
        </div>
        <div class="dialog-buttons">
          <button class="confirm-button" @click="confirmDelete">확인</button>
          <button class="cancel-button" @click="cancelDelete">취소</button>
        </div>
      </div>
    </div>

    <!-- 프로젝트 생성 모달 -->
    <div v-if="showCreateProjectModal" class="modal-overlay">
      <div class="create-project-dialog">
        <h2>프로젝트 생성</h2>
        <div class="dialog-form">
          <div class="form-group">
            <!-- 이메일 태그 입력 필드 -->
            <div class="manager-input-container">
              <span v-for="(manager, index) in newProject.managers" :key="index" class="manager-tag">
                {{ manager }}
                <span class="remove-tag" @click="removeManager(index)">×</span>
              </span>
              <input type="text" id="project-manager" :placeholder="newProject.managers.length === 0 ? '이메일 입력 후 Enter' : ''" v-model="currentManagerInput" @keydown.enter.prevent="addManager" />
            </div>
          </div>
          <div class="form-group">
            <input type="text" id="project-name" placeholder="프로젝트명" v-model="newProject.name" />
          </div>
          <div class="form-group">
            <input type="text" id="project-description" placeholder="프로젝트 설명 (50자 이내)" maxlength="100" v-model="newProject.description" />
          </div>
        </div>
        <div class="dialog-buttons">
          <button class="confirm-button" @click="confirmCreate">확인</button>
          <button class="cancel-button" @click="cancelCreate">취소</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import TrainerList from '@/components/Admin/TrainerList.vue'; // TrainerList 컴포넌트 임포트
import TraineeList from '@/components/Admin/TraineeList.vue'; // TraineeList 컴포넌트 임포트

export default {
  name: 'ProjectList', // 컴포넌트 이름 정의
  components: { // 사용할 하위 컴포넌트 등록
    TrainerList, // QuizzerList 대신 TrainerList 사용
    TraineeList // TraineeList 컴포넌트 등록
  },
  data() {
    return {
      allProjects: [], // 전체 프로젝트 목록을 담을 배열
      currentPage: 1,    // 현재 페이지 번호
      itemsPerPage: 8,   // 페이지당 보여줄 항목 수
      showDeleteConfirm: false, // 삭제 확인 모달 표시 여부
      itemToDeleteId: null, // 삭제할 프로젝트의 ID
      showCreateProjectModal: false, // 프로젝트 생성 모달 표시 여부
      newProject: { // 새 프로젝트 데이터
        managers: [], // 담당자를 배열로 변경
        name: '',
        description: ''
      },
      currentManagerInput: '', // 현재 입력 중인 담당자 이메일
      currentMenu: 'projects', // 현재 활성화된 메뉴 ('projects', 'quizzers', 'learners')
      // quizzers: [ ... ] // 출제자 예시 데이터는 QuizzerList.vue로 이동
    };
  },
  computed: {
    // 전체 페이지 수 계산
    totalPages() {
      return Math.ceil(this.allProjects.length / this.itemsPerPage);
    },
    // 현재 페이지에 보여줄 프로젝트 목록 계산
    paginatedProjects() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.allProjects.slice(startIndex, endIndex);
    }
  },
  methods: {
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
    // 예시 프로젝트 데이터 초기화 (실제 사용 시 API 호출 등으로 대체)
    initializeProjects() {
      this.allProjects = [
        { id: 1, name: '차세대 ERP 구축', description: '차세대 ERP 구축 및 운영 프로세스 이전', createdDate: '2025-05-15' },
        { id: 2, name: '모바일 앱 개발', description: '신규 모바일 서비스 앱 개발 프로젝트', createdDate: '2025-06-01' },
        { id: 3, name: '클라우드 마이그레이션', description: '기존 시스템 클라우드 환경으로 이전', createdDate: '2025-06-15' },
        { id: 4, name: '데이터 분석 플랫폼', description: '빅데이터 분석 플랫폼 구축', createdDate: '2025-07-01' },
        { id: 5, name: 'AI 챗봇 개발', description: '고객 지원용 AI 챗봇 개발', createdDate: '2025-07-10' },
        { id: 6, name: '블록체인 시스템 도입', description: '공급망 관리를 위한 블록체인 시스템', createdDate: '2025-08-01' },
        { id: 7, name: '스마트 팩토리 구축', description: '제조 공정 자동화를 위한 스마트 팩토리', createdDate: '2025-08-20' },
        { id: 8, name: '사내 포털 리뉴얼', description: '사용자 경험 개선을 위한 포털 리뉴얼', createdDate: '2025-09-05' },
        { id: 9, name: '데이터 분석 플랫폼', description: '빅데이터 분석 플랫폼 구축', createdDate: '2025-07-01' },
        { id: 10, name: 'AI 챗봇 개발', description: '고객 지원용 AI 챗봇 개발', createdDate: '2025-07-10' },
        { id: 11, name: '블록체인 시스템 도입', description: '공급망 관리를 위한 블록체인 시스템', createdDate: '2025-08-01' },
        { id: 12, name: '스마트 팩토리 구축', description: '제조 공정 자동화를 위한 스마트 팩토리', createdDate: '2025-08-20' },
        { id: 13, name: '사내 포털 리뉴얼', description: '사용자 경험 개선을 위한 포털 리뉴얼', createdDate: '2025-09-05' }
        // 필요에 따라 더 많은 프로젝트 데이터 추가
      ];
    },

    // 메뉴 선택 핸들러
    selectMenu(menu) {
      this.currentMenu = menu;
      // 메뉴 변경 시 필요에 따라 데이터 로드 등 추가 로직 구현
      if (menu === 'projects') {
        // this.initializeProjects(); // 프로젝트 데이터는 created에서 로드하므로 여기서는 필요 없으면 주석 처리
      } else if (menu === 'quizzers') {
        // initializeQuizzers(); // 출제자 데이터 로드 함수 호출 (필요 시 구현)
      } else if (menu === 'learners') {
         // initializeLearners(); // 학습자 데이터 로드 함수 호출 (필요 시 구현)
      }
    },

    // 삭제 확인 모달 표시 (프로젝트/출제자 공용 사용)
    showConfirmDialog(id) {
      // 현재 활성화된 메뉴와 ID를 기반으로 삭제 대상 구분
      if (this.currentMenu === 'projects') {
        this.itemToDeleteId = id; // 삭제할 프로젝트 ID 저장
        this.showDeleteConfirm = true; // 삭제 확인 모달 표시
      } else if (this.currentMenu === 'quizzers') {
        // 출제자 삭제 확인 모달 표시
        this.itemToDeleteId = id; // 삭제할 출제자 ID 저장
        this.showDeleteConfirm = true; // 삭제 확인 모달 표시
      } else if (this.currentMenu === 'learners') {
         // TraineeList 컴포넌트에서 발생시킨 삭제 이벤트를 통해 처리
         console.log('학습자 삭제 요청 받음:', id);
         // 실제 학습자 삭제 로직 (API 호출 또는 데이터 업데이트) 구현 필요
         // 예시: 로컬 학습자 데이터에서 학습자 제거 (필요 시 주석 해제 및 수정)
         // this.trainees = this.trainees.filter(trainee => trainee.id !== this.itemToDeleteId);
      }
    },

    // 삭제 확인 (프로젝트/출제자 공용 사용)
    confirmDelete() {
      // 실제 삭제 로직 구현 (API 호출 등)
      console.log(`${this.currentMenu} 삭제 실행:`, this.itemToDeleteId);

      if (this.currentMenu === 'projects') {
        // 예시: 로컬 프로젝트 데이터에서 프로젝트 제거
        this.allProjects = this.allProjects.filter(project => project.id !== this.itemToDeleteId);
      } else if (this.currentMenu === 'quizzers') {
        // TrainerList 컴포넌트의 deleteQuizzer 메서드 호출
        console.log('출제자 삭제 요청 받음:', this.itemToDeleteId);
        this.$refs.trainerListRef.deleteQuizzer(this.itemToDeleteId);
      } else if (this.currentMenu === 'learners') {
         // TraineeList 컴포넌트의 deleteTrainee 메서드 호출
         console.log('학습자 삭제 요청 받음:', this.itemToDeleteId);
         this.$refs.traineeListRef.deleteTrainee(this.itemToDeleteId);
      }

      // 모달 닫기 및 상태 초기화
      this.itemToDeleteId = null;
      this.showDeleteConfirm = false;
    },

    // 삭제 취소
    cancelDelete() {
      // 모달 닫기 및 상태 초기화
      this.itemToDeleteId = null;
      this.showDeleteConfirm = false;
    },

    // 프로젝트 생성 모달 표시
    showCreateModal() {
      this.showCreateProjectModal = true;
      // 모달 열릴 때 입력 필드 초기화
      this.newProject = { managers: [], name: '', description: '' };
      this.currentManagerInput = '';
    },

    // 프로젝트 생성 확인
    confirmCreate() {
      // TODO: 새 프로젝트 생성 로직 구현 (API 호출 등)
      console.log('새 프로젝트 생성:', this.newProject);

      // 새 프로젝트 객체 생성
      const newProjectData = {
        id: Date.now(), // 고유 ID 생성 (간단 예시)
        name: this.newProject.name,
        description: this.newProject.description,
        createdDate: new Date().toISOString().slice(0, 10), // 현재 날짜 (YYYY-MM-DD 형식)
        // 담당자 정보는 필요에 따라 추가 가공하여 저장
        managers: [...this.newProject.managers] // 담당자 배열 복사
      };

      // 프로젝트 목록에 새 프로젝트 추가
      this.allProjects.push(newProjectData);

      // 입력 필드 및 모달 상태 초기화
      this.newProject = { managers: [], name: '', description: '' };
      this.currentManagerInput = '';
      this.showCreateProjectModal = false;
    },

    // 프로젝트 생성 취소
    cancelCreate() {
      // 입력 필드 및 모달 상태 초기화
      this.newProject = { managers: [], name: '', description: '' };
      this.currentManagerInput = '';
      this.showCreateProjectModal = false;
    },

    // 담당자 이메일 추가
    addManager() {
      const email = this.currentManagerInput.trim();
      if (email && !this.newProject.managers.includes(email)) {
        this.newProject.managers.push(email);
        this.currentManagerInput = ''; // 입력 필드 초기화
      }
    },

    // 담당자 이메일 삭제
    removeManager(index) {
      this.newProject.managers.splice(index, 1);
    },

    // 출제자 삭제 이벤트 핸들러
    handleDeleteQuizzer(quizzerId) {
      console.log('TrainerList에서 삭제 이벤트 수신:', quizzerId);
      // 삭제 확인 모달 표시
      this.itemToDeleteId = quizzerId; // 삭제할 출제자 ID 저장
      this.showDeleteConfirm = true; // 삭제 확인 모달 표시
    },

    // 학습자 삭제 이벤트 핸들러
    handleDeleteTrainee(traineeId) {
      console.log('TraineeList에서 삭제 이벤트 수신:', traineeId);
      // 삭제 확인 모달 표시 (프로젝트/출제자와 동일한 모달 사용)
      this.itemToDeleteId = traineeId; // 삭제할 학습자 ID 저장
      this.showDeleteConfirm = true; // 삭제 확인 모달 표시
    }
  },
  created() {
    // 컴포넌트 생성 시 예시 프로젝트 데이터 로드
    this.initializeProjects(); 
  }
};
</script>

<style scoped>
/* scoped 스타일: 이 컴포넌트 내의 요소에만 스타일 적용 */

/* 전체 페이지 컨테이너 스타일 */
.project-list-container {
  display: flex; /* Flexbox 레이아웃으로 변경 */
  flex-direction: column; /* 자식 요소들을 세로로 배치 */
  min-height: 100vh; /* 최소 높이를 뷰포트 전체 높이로 설정 */
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #f9f9f9;
}

/* 앱 헤더 스타일 */
.app-header {
  display: flex; /* Flexbox 레이아웃 사용 */
  justify-content: space-between; /* 자식 요소들 사이에 공간을 균등하게 배분 */
  align-items: center; /* 자식 요소들을 세로 중앙 정렬 */
  padding: 20px 20px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
}

/* 로고 영역 스타일 */
.logo {
  display: flex;
  align-items: center; /* 로고 이미지와 텍스트를 세로 중앙 정렬 */
  font-size: 24px;
  font-weight: bold;
  color: #000000;
}

/* 로고 이미지 스타일 */
.logo-image {
  height: 30px; /* 이미지 높이 조절 */
  margin-right: 8px; /* 이미지와 텍스트 사이 간격 */
}

/* 메인 네비게이션 메뉴 스타일 */
.main-nav {
  display: flex;
  gap: 20px; /* 메뉴 아이템 사이 간격 */
}

.nav-item {
  text-decoration: none;
  font-size: 18px;
  color: #333;
  padding: 5px 10px;
}

/* 활성화된 네비게이션 아이템 스타일 */
.nav-item.active {
  font-weight: bold;
  border-bottom: 2px solid #333;
}

/* 사용자 메뉴 영역 스타일 */
.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 언어 선택기 스타일 */
.language-selector {
  border: 1px solid #ccc;
  padding: 5px 8px;
  border-radius: 4px;
}

/* 사용자 정보 표시 영역 스타일 */
.user-info {
  display: flex;
  flex-direction: column; /* 닉네임과 역할을 세로로 배열 */
  align-items: flex-end; /* 오른쪽 정렬 */
}

/* 사용자 역할(Trainee) 텍스트 스타일 */
.user-role {
  font-size: 0.8em;
  color: #666;
}

/* Style for the person icon */
.person-icon {
  height: 30px; /* Adjust size as needed */
  margin-right: 10px; /* Space between icon and user info */
}

/* 메인 컨텐츠 영역 스타일 */
.main-content {
  flex-grow: 1; /* 헤더와 푸터를 제외한 나머지 공간을 모두 차지 */
  padding: 50px;
  padding-top: 10px;
  padding-bottom: 20px;
  background-color: #f9f9f9;
}

/* 페이지 헤더 (제목) 영역 스타일 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  width: 90%; /* 테이블과의 정렬을 위해 너비 설정 */
  margin-left: auto; /* 테이블과의 정렬을 위해 추가 */
  margin-right: auto; /* 테이블과의 정렬을 위해 추가 */
  margin-top: 30px; /* 상단 여백 추가 */
}

.page-header h1 {
  font-size: 32px;
  font-weight: bold;
  color: #000000;
}

/* 프로젝트 추가 버튼 컨테이너 스타일 */
.add-button-container {
  width: 90%; /* 테이블과 동일한 너비 */
  margin: auto; /* 가운데 정렬 */
  text-align: right; /* 버튼을 오른쪽으로 정렬 */
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

/* 프로젝트 테이블 전체 스타일 */
.project-table {
  width: 90%;
  border-collapse: collapse; /* 테이블 테두리 한 줄로 합치기 */
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 테이블에 그림자 효과 */
  margin-top: 40px;
  margin-left: auto; /* 테이블 가운데 정렬을 위해 추가 */
  margin-right: auto; /* 테이블 가운데 정렬을 위해 추가 */
  margin-bottom: 20px; /* 페이지네이션과의 간격 */
}

/* 테이블 헤더(th) 및 셀(td) 공통 스타일 */
.project-table th,
.project-table td {
  padding: 12px 15px;
  text-align: left; /* 텍스트 왼쪽 정렬 */
  border-bottom: 1px solid #eee; /* 각 행 아래에 구분선 */
}

/* 테이블 헤더(th) 특정 스타일 */
.project-table th {
  background-color: transparent; /* 헤더 배경 투명하게 */
  font-weight: bold;
}

/* 체크박스 컬럼 스타일 */
.checkbox-column {
  width: 5%;
  text-align: center; /* 체크박스 중앙 정렬 */
}

/* 액션(동작) 컬럼 스타일 */
.actions-column {
  width: 5%;
  text-align: center; /* 버튼 등 중앙 정렬 */
}

/* 삭제 버튼 스타일 */
.delete-button {
  background: none; /* 배경 없음 */
  border: none; /* 테두리 없음 */
  cursor: pointer;
  font-size: 1.2em;
  color: #666;
}

/* 페이지네이션 컨트롤 스타일 */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  /* margin-top: 20px; 테이블과의 간격 */
  margin-bottom: 70px; /* 푸터와의 간격 */
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

/* 앱 푸터 스타일 */
.app-footer {
  text-align: center;
  padding-top: 10px; /* 사용자 지정 padding-top 유지 */
  padding-bottom: 10px; /* 하단에도 padding 추가 (선택 사항) */
  font-size: 0.9em;
  color: #aaa;
  background-color: #f0f0f0;
  border-top: 1px solid #eee;
  /* position, bottom, left, right 속성들은 Flexbox 사용 시 필요 없어짐 */
}

/* Modal Overlay Style */
.modal-overlay {
  position: fixed; /* 화면 전체를 덮도록 고정 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 반투명 검은 배경 */
  display: flex; /* 내용을 가운데 정렬하기 위해 Flexbox 사용 */
  justify-content: center; /* 가로 중앙 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  z-index: 1000; /* 다른 요소들 위에 표시 */
}

/* Confirmation Dialog Style */
.confirm-dialog {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 300px; /* 다이얼로그 너비 */
  text-align: center;
}

/* Dialog Content Style */
.dialog-content {
  margin-bottom: 20px;
  text-align: center; /* 텍스트 가운데 정렬 */
}

/* Warning Icon Style */
.warning-icon {
  color: #ff0000; /* 빨간색 */
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.1em;
}

/* Dialog Text Style */
.dialog-text {
  font-size: 1em;
  line-height: 1.5;
  color: #333;
}

/* Dialog Buttons Container Style */
.dialog-buttons {
  display: flex;
  justify-content: flex-end; /* 프로젝트 생성 모달의 버튼은 오른쪽 정렬 */
  gap: 15px;
  margin-top: 30px; /* 버튼 영역 상단 간격 */
}

/* Style for Delete Confirm Dialog Buttons */
.confirm-dialog .dialog-buttons {
    justify-content: center; /* 삭제 모달의 버튼은 가운데 정렬 */
}

/* Confirm Button Style */
.confirm-button {
  background-color: #1C2053; /* 이미지의 확인 버튼 색상 */
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

/* Cancel Button Style */
.cancel-button {
  background-color: #ccc; /* 이미지의 취소 버튼 색상 (예상) */
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

/* Project Creation Dialog Style */
.create-project-dialog {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 480px; /* 다이얼로그 너비 조정 */
  text-align: left; /* 내용 왼쪽 정렬 */
}

.create-project-dialog h2 {
  text-align: center; /* 제목 중앙 정렬 */
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 1.5em;
  color: #333;
}

.dialog-form .form-group {
  margin-bottom: 20px; /* 입력 필드 그룹 간 간격 */
}

.dialog-form label {
  display: block; /* 레이블을 블록 요소로 만들어 줄바꿈 */
  margin-bottom: 8px; /* 레이블과 입력 필드 사이 간격 */
  font-weight: bold;
  font-size: 0.9em;
  color: #555;
}

.dialog-form input[type="text"] {
  width: 100%; /* 입력 필드 너비 100% */
  padding: 10px;
  border: 1px solid #292F8B;
  border-radius: 4px;
  font-size: 1em;
  box-sizing: border-box; /* 패딩과 테두리를 너비에 포함 */
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end; /* 버튼들을 오른쪽으로 정렬 */
  gap: 15px;
  margin-top: 30px; /* 버튼 영역 상단 간격 */
}

/* Manager Input Specific Styles */
.manager-input-container {
  border: 1px solid #292F8B; /* 이미지의 테두리 색상 */
  border-radius: 4px;
  padding: 5px 10px; /* 내부 여백 */
  display: flex;
  flex-wrap: wrap; /* 태그가 넘칠 경우 다음 줄로 이동 */
  align-items: center; /* 세로 중앙 정렬 */
  min-height: 50px; /* 최소 높이 설정 (입력 필드 높이 고려) */
}

.manager-tag {
  background-color: #e0e0e0; /* 이미지의 태그 배경색 (밝은 회색) */
  color: #333; /* 태그 텍스트 색상 */
  padding: 3px 8px; /* 태그 내부 여백 */
  border-radius: 12px; /* 둥근 모서리 */
  margin-right: 8px; /* 태그 간 간격 */
  margin-bottom: 5px; /* 태그가 여러 줄일 때 하단 간격 */
  display: flex;
  align-items: center;
  font-size: 0.9em;
}

.remove-tag {
  margin-left: 5px; /* X 버튼과 텍스트 사이 간격 */
  cursor: pointer;
  font-weight: bold;
  color: #666; /* X 버튼 색상 */
}

.manager-input-container input[type="text"] {
  flex-grow: 1; /* 남은 공간을 모두 차지하도록 설정 */
  border: none; /* 기본 테두리 제거 */
  outline: none; /* 포커스 시 아웃라인 제거 */
  padding: 0; /* 기본 패딩 제거 */
  margin: 0; /* 기본 마진 제거 */
  min-width: 100px; /* 입력 필드 최소 너비 */
}

</style>