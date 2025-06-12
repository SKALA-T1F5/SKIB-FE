<template>
  <div v-if="isVisible" class="footer">
    <v-container>
      <v-row>
        <v-col class="text-center">
          <span>&copy; 2024 SKIB. All rights reserved.</span>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)

function handleScroll() {
  const scrollBottom = window.innerHeight + window.scrollY
  const documentHeight = document.documentElement.scrollHeight
  // 1px 정도 차이도 고려하여 여유를 둠
  isVisible.value = scrollBottom >= documentHeight - 1
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.footer {
  background-color: #f8f9fa00;
  color: #6c757d;
  padding: 16px 0;
  width: 100%;
}
</style>
