<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 rounded-lg">
          <v-card-title class="text-center pa-4">
            <h2 class="text-h4 font-weight-bold primary-text">SKIB 트레이너</h2>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <div class="text-subtitle-1 text-center mb-6">계정 정보를 입력하여 로그인하세요</div>
            
            <v-form ref="form" v-model="valid" @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="아이디"
                prepend-inner-icon="mdi-account"
                :rules="usernameRules"
                required
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                label="비밀번호"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                @click:append-inner="showPassword = !showPassword"
                :rules="passwordRules"
                required
                variant="outlined"
                class="mb-6"
              ></v-text-field>
              
              <div class="d-flex align-center justify-space-between mb-6">
                <v-checkbox
                  v-model="rememberMe"
                  label="로그인 상태 유지"
                  hide-details
                  class="mt-0"
                ></v-checkbox>
                
                <a href="#" class="text-decoration-none text-caption accent-text">비밀번호를 잊으셨나요?</a>
              </div>
              
              <v-btn
                block
                color="orange"
                size="large"
                type="submit"
                :loading="loading"
                :disabled="!valid"
                class="mb-4"
              >
                로그인
              </v-btn>
            </v-form>
            
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              {{ errorMessage }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      valid: false,
      loading: false,
      username: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      errorMessage: '',
      
      // 유효성 검사 규칙
      usernameRules: [
        v => !!v || '아이디를 입력해주세요',
        v => v.length >= 4 || '아이디는 최소 4자 이상이어야 합니다'
      ],
      passwordRules: [
        v => !!v || '비밀번호를 입력해주세요',
        v => v.length >= 6 || '비밀번호는 최소 6자 이상이어야 합니다'
      ],
      
      // 임시 계정 정보
      tempCredentials: {
        admin: 'password123'
      }
    };
  },
  methods: {
    async login() {
      if (!this.$refs.form.validate()) return;
      
      this.loading = true;
      this.errorMessage = '';
      
      // 로그인 처리 시뮬레이션 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 임시 계정 정보로 로그인 검증
      if (this.tempCredentials[this.username] === this.password) {
        // 로그인 성공 처리
        localStorage.setItem('isLoggedIn', 'true');
        if (this.rememberMe) {
          localStorage.setItem('username', this.username);
        }
        
        // 로그인 후 리다이렉트 (실제 구현 시 라우터 사용)
        alert('로그인 성공!');
        // this.$router.push('/dashboard'); // 라우터 설정 시 활성화
      } else {
        // 로그인 실패 처리
        this.errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';
      }
      
      this.loading = false;
    }
  },
  mounted() {
    // 저장된 사용자 정보 불러오기
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      this.username = savedUsername;
      this.rememberMe = true;
    }
  }
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.primary-text {
  color: #ff9800;
}

.accent-text {
  color: #ff9800;
}

.v-card {
  border-radius: 16px;
}

.v-btn {
  text-transform: none;
  font-weight: bold;
  letter-spacing: 0.5px;
}
</style>