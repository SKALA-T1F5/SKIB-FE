<!-- components/AILoading.vue -->
<template>
    <v-dialog
      :model-value="show"
      persistent
      width="300"
    >
      <v-card class="d-flex flex-column align-center justify-center pa-5">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <div class="mt-4 text-h6 text-center">AI가 응답 중입니다...</div>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    show: {
      type: Boolean,
      required: true,
    },
  });
  </script>
  