<template>
  <v-tabs v-model="activeTab">
    <v-tab :value="0">프로젝트 메인</v-tab>
    <v-tab :value="1">문서 관리</v-tab>
    <v-tab :value="2">문제 관리</v-tab>
    <v-tab :value="3">훈련생 관리</v-tab>
    <v-tab :value="4">시험 관리</v-tab>
  </v-tabs>
  <v-window v-model="activeTab">
    <v-window-item :value="0"></v-window-item>
    <v-window-item :value="1"></v-window-item>
    <v-window-item :value="2"></v-window-item>
    <v-window-item :value="3"></v-window-item>
    <v-window-item :value="4"></v-window-item>
  </v-window>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Number
})

const emit = defineEmits(['update:modelValue'])

// activeTab은 부모의 값을 기반으로 작동
const activeTab = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>


<style scoped></style>