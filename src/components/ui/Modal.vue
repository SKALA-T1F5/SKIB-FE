<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title class="headline">{{ title }}</v-card-title>
      <v-card-text>
        {{ content }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" @click="cancel">취소</v-btn>
        <v-btn color="primary" @click="confirm">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const dialog = ref(false);

const openDialog = () => {
  dialog.value = true;
};

const confirm = () => {
  emit('confirm');
  dialog.value = false;
};

const cancel = () => {
  emit('cancel');
  dialog.value = false;
};

defineExpose({
  openDialog,
});
</script>

<style scoped>
/* style.scss의 .v-dialog 관련 스타일은 전역으로 적용되므로 여기에 별도로 작성하지 않습니다. */
</style>