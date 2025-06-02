<template>
    <div class="tab-navigation-wrapper" style="width: 80%;">
    <!-- 상단 ← Main 버튼 -->
    <div class="main-button" @click="goToMain">
      <v-icon size="x-small" class="mr-1" color="grey lighten-1">mdi-arrow-left</v-icon>
      <span style="font-size: 0.75rem; color: #bdbdbd;">Main</span>
    </div>
    <div style="height: 5px"></div>
  <v-sheet class="tab-bar"  color="secondary" height="44px">
    <v-tabs
      v-model="activeTab"
      hide-slider
      align-tabs="center"
      class="custom-tabs"
      grow
      height="44px"
    >
      <v-tab
        v-for="(tab, index) in tabs"
        :key="index"
        :value="index"
        class="custom-tab"
        :class="{ 'active-tab': activeTab === index }"
      >
        {{ tab }}
      </v-tab>
    </v-tabs>
  </v-sheet>
  <div style="height: 12px"></div>
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
     type: Number,
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
  padding: 0px;
  border-radius: 999px;
}

.custom-tabs {
  min-height: 44px;
}

.custom-tab {
  text-transform: none;
  font-weight: 500;
  color: #555;
  border-radius: 999px;
  transition: background-color 0.2s ease;
  height: 44px;
  line-height: 44px;
  padding: 0 24px;
}

.custom-tab.active-tab {
  background-color: #191D5A;
  color: rgb(255, 255, 255) !important;
  border-radius: 99px !important;
}
</style>
