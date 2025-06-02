<template>
    <div class="tab-navigation-wrapper">
    <!-- 상단 ← Main 버튼 -->
    <div class="main-button" @click="goToMain">
      <v-icon size="x-small" class="mr-1" color="grey lighten-1">mdi-arrow-left</v-icon>
      <span style="font-size: 0.75rem; color: #bdbdbd;">Main</span>
    </div>

  <v-sheet class="tab-bar" rounded="pill" color="#f2f5f9" height="56">
    <v-tabs
      v-model="activeTab"
      bg-color="transparent"
      align-tabs="center"
      class="custom-tabs"
      grow
      height="40"
    >
      <v-tab
        v-for="(tab, index) in tabs"
        :key="index"
        :value="index.toString()"
        class="custom-tab"
        :class="{ 'active-tab': activeTab === index.toString() }"
      >
        {{ tab }}
      </v-tab>
    </v-tabs>
  </v-sheet>
</div>
</template>

<script setup>
 import { computed } from 'vue'
 import { useRouter } from 'vue-router'
 
 const props = defineProps({
   tabs: {
     type: Array,
     required: true,
   },
   modelValue: {
     type: String,
     required: true,
   },
 })
 const emit = defineEmits(['update:modelValue'])
 
 const activeTab = computed({
   get: () => props.modelValue,
   set: (value) => emit('update:modelValue', value),
 })
 
 const router = useRouter()
 
 const goToMain = () => {
   router.push('/trainer')
 }

</script>

<style scoped>
.tab-bar {
  padding: 4px;
  border-radius: 999px;
}

.custom-tabs {
  min-height: 56px;
}

.custom-tab {
  text-transform: none;
  font-weight: 500;
  color: #555;
  border-radius: 999px;
  transition: background-color 0.2s ease;
  height: 48px;
  line-height: 48px;
  padding: 0 24px;
}

.custom-tab.active-tab {
  background-color: #1e1f4b;
  color: white !important;
}
</style>
