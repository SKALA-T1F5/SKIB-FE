<template>
  <div class="flex flex-col min-h-screen">
    <Header />

    <main class="flex-grow container mx-auto px-4 py-8 max-w-xl">
      <h2 class="text-2xl font-bold mb-6 text-center">마이페이지</h2>

      <div class="space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-1">이메일</label>
          <input
            type="email"
            v-model="user.email"
            readonly
            class="w-full border border-gray-300 px-4 py-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-1">이름</label>
          <input
            type="text"
            v-model="user.name"
            readonly
            class="w-full border border-gray-300 px-4 py-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-1">소속</label>
          <input
            type="text"
            v-model="user.affiliation"
            readonly
            class="w-full border border-gray-300 px-4 py-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-1">비밀번호 변경 (선택)</label>
          <input
            type="password"
            v-model="newPassword"
            placeholder="새 비밀번호 입력"
            class="w-full border border-gray-300 px-4 py-2 rounded"
          />
        </div>

        <div class="text-center mt-6">
          <button
            @click="handleConfirm"
            class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            확인
          </button>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'
import Header from '@/components/layouts/Header.vue'
import Footer from '@/components/layouts/Footer.vue'

const router = useRouter()

const role = (localStorage.getItem('role') || '').toLowerCase()
const userId = localStorage.getItem('userId')
const apiUrl = `/user/${role}`

const user = ref({
  email: '',
  name: '',
  affiliation: '',
})
const newPassword = ref('')

const fetchUserInfo = async () => {
  try {
    const response = await axios.get(apiUrl, {
      params: { userId },
    })
    const data = response.data
    user.value = {
      email: data.email,
      name: data.name,
      affiliation: data.affiliation,
    }
  } catch (error) {
    console.error('사용자 정보를 불러오는 데 실패했습니다:', error)
    alert('사용자 정보를 불러올 수 없습니다.')
  }
}

const handleConfirm = async () => {
  if (newPassword.value.trim()) {
    try {
      await axios.put(
        `${apiUrl}/password`,
        {
          password: newPassword.value,
        },
        {
          params: { userId },
        },
      )
      alert('비밀번호가 변경되었습니다.')
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      alert('비밀번호 변경 중 오류가 발생했습니다.')
      return
    }
  }

  router.push(`/${role}/main`)
}

onMounted(fetchUserInfo)
</script>

<style scoped>
.container {
  max-width: 640px;
}
</style>
