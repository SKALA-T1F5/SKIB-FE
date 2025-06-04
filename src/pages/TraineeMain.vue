<template>
  <DefaultLayout>
    <template #sidebar>
      <SideBar />
    </template>

    <div class="trainee-main-layout">
      <div class="header-row">
        <h2 class="greeting"><strong>손성민 매니저님</strong>, 반갑습니다!</h2>
        <button class="add-test-button">+ 테스트 추가</button>
      </div>

      <div class="test-grid">
        <div
          class="test-card"
          v-for="(test, index) in testList"
          :key="index"
          :class="test.status.toLowerCase()"
        >
          <div class="card-header">
            <div>
              <h3 class="test-title">{{ test.title }}</h3>
              <p class="project-name">in <strong>{{ test.project }}</strong></p>
            </div>
            <span class="status-tag">{{ test.status }}</span>
          </div>

          <p class="description">{{ test.description }}</p>

          <div class="card-footer">
            <span class="date">{{ test.date }}</span>
            <div class="buttons">
              <button class="btn">채점 결과</button>
              <button class="btn">피드백</button>
              <button
                class="btn retry"
                :class="{ disabled: test.status === 'PASS' }"
              >
                재응시
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import SideBar from '@/components/SideBar.vue'

// 예시 데이터
const testList = [
  {
    title: 'Test A',
    project: '프로젝트 명',
    status: 'PASS',
    description: 'Test A 설명입니다.',
    date: '2024.06.04',
  },
  {
    title: 'Test B',
    project: '프로젝트 명',
    status: 'FAIL',
    description: 'Test B 설명입니다.',
    date: '2024.06.01',
  },
]
</script>

<style scoped>
.trainee-main-layout {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 1.5rem;
  height: 100%;
  background-color: #f9f9f9;
  overflow-y: auto;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting {
  font-size: 1.75rem;
  font-weight: 600;
}

.add-test-button {
  background-color: #1c2053;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.test-card {
  background-color: #eef2f6;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: none;
  transition: transform 0.2s ease;
}

.test-card:hover {
  transform: scale(1.01);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-title {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.project-name {
  font-size: 0.9rem;
  color: #666;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.8rem;
  background-color: #c2cbff;
  color: #1c2053;
}

.test-card.fail .status-tag {
  background-color: #f8caca;
  color: #700000;
}

.description {
  margin: 1rem 0;
  font-size: 0.95rem;
  color: #444;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date {
  font-size: 0.8rem;
  color: #888;
}

.buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  background-color: #dbe0ec;
  color: black;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}

.retry {
  background-color: black;
  color: white;
}

.retry.disabled {
  background-color: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}
</style>
