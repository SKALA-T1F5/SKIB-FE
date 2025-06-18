<template>
  <MainLayout :name="userName" :role="userRole">
    <template #sidebar>
      <TraineeSideBar />
    </template>
    <template #content>
      "Trainee Main Page"
      <router-view />
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import MainLayout from '@/components/layouts/MainLayout.vue'
</script>
