<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-left"></div>

      <div class="auth-right">
        <h2 class="title">{{ $t("login") }}</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>{{ $t("username") }}</label>
            <input
              v-model="username"
              type="text"
              :placeholder="$t('usernamePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label>{{ $t("password") }}</label>
            <div class="password-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                :placeholder="$t('passwordPlaceholder')"
              />
              <span class="toggle-pass" @click="showPassword = !showPassword">
                <a-icon :type="showPassword ? 'eye-invisible' : 'eye'" />
              </span>
            </div>
          </div>

          <button type="submit" class="btn" :disabled="loading">
            <span v-if="loading">{{ $t("loading") }}...</span>
            <span v-else>{{ $t("login") }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from "../../apis/auth";

export default {
  layout: "default",
  data() {
    return {
      username: "",
      password: "",
      showPassword: false,
      loading: false,
    };
  },
  methods: {
    handleLogin() {
      this.loading = true;
      login({
        username: this.username,
        password: this.password,
      })
        .then((res) => {
          const { token, displayName } = res.data || res.data.data;
          this.$store.dispatch("auth/login", { token, displayName });
          this.$message.success(this.$t("loginSuccess"));
          this.$router.push("/overview");
        })
        .catch(() => {
          this.$message.error(this.$t("loginFail"));
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>

.auth-wrapper {
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background: #eef2f8;
}

.auth-card {
  display: flex;
  width: 80%;
  height: 460px;
  max-width: 900px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.auth-left {
  width: 50%;
  background-image: url("@/assets/bg-01.jpg");
  background-size: cover;
  background-position: center;
}

.auth-right {
  width: 50%;
  padding: 70px 40px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 26px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  border: none;
  border-bottom: 2px solid #d1d5db;
  padding: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #3b82f6;
}

.btn {
  width: 100%;
  background: #3b82f6;
  color: #fff;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #2563eb;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 100%;
  border: none;
  border-bottom: 2px solid #d1d5db;
  padding: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  padding-right: 40px;
}

.password-wrapper input:focus {
  border-color: #3b82f6;
}

.toggle-pass {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none;
  font-size: 18px;
}
</style>
