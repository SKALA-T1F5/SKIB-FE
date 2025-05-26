<template>
  <div class="document-management">
    <div class="upload-status">
      <p v-if="uploading">Uploading...</p>
      <p v-if="uploadComplete">Upload Complete</p>
    </div>
    <div class="upload-controls">
      <button @click="uploadDocument">Upload Document</button>
    </div>
  </div>
</template>

<style>
  .document-management {
    background: white;
    color: #ff5e4e;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
  }
  .upload-controls {
    margin-top: 10px;
  }
</style>

<script>
  export default {
    data() {
      return {
        uploading: false,
        uploadComplete: false,
      };
    },
    methods: {
      // 임시 코드
      uploadDocument() {
        this.uploading = true;
        setTimeout(() => {
          this.uploading = false;
          this.uploadComplete = true;
        }, 3000);
      },
    },
  };
</script>