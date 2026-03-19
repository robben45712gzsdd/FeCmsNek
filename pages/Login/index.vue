<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-left">
        <div class="auth-left-overlay">
          <div class="brand-logo">&#9670;</div>
          <h3 class="brand-title !text-white">NekCMS</h3>
          <p class="brand-desc">Content Management System</p>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-right-inner">
          <div class="welcome-badge">Welcome back</div>
          <h2 class="title">{{ $t("login") }}</h2>
          <p class="subtitle">Đăng nhập và quản lý Hệ thống</p>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label>{{ $t("username") }}</label>
              <div class="input-wrapper">
                <a-icon type="user" class="input-icon" />
                <input
                  v-model="username"
                  type="text"
                  :placeholder="$t('usernamePlaceholder')"
                />
              </div>
            </div>
            <div class="form-group">
              <label>{{ $t("password") }}</label>
              <div class="input-wrapper">
                <a-icon type="lock" class="input-icon" />
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

            <button type="submit" class="btn-login" :disabled="loading">
              <span v-if="loading"><a-icon type="loading" /> {{ $t("loading") }}...</span>
              <span v-else>{{ $t("login") }} &rarr;</span>
            </button>
          </form>
        </div>
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
      if (!this.username || !this.password) {
        this.$message.warning("Vui lòng nhập �'ầy �'ủ thông tin");
        return;
      }
      this.loading = true;
      login({
        userName: this.username,
        password: this.password,
      })
        .then((res) => {
          console.log("Login response:", JSON.stringify(res));
          
          const accessToken = res?.data?.accessToken;
          const refreshToken = res?.data?.refreshToken;

          if (!accessToken) {
            this.$message.error(res?.message || this.$t("loginFail"));
            return;
          }

          this.$store.dispatch("auth/login", {
            accessToken,
            refreshToken,
            displayName: this.username,
          });
          this.$message.success(this.$t("loginSuccess"));
          this.$router.push("/overview");
        })
        .catch((err) => {
          console.error(err);

          const msg = err?.response?.data?.message || this.$t("loginFail");
          this.$message.error(msg);
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
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fef3f2 100%);
  font-family: 'Inter', system-ui, sans-serif;
}

.auth-card {
  display: flex;
  width: 860px;
  max-width: 92%;
  min-height: 500px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.1), 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.auth-left {
  width: 45%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.auth-left::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  top: -80px;
  right: -80px;
}
.auth-left::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  bottom: -60px;
  left: -40px;
}

.auth-left-overlay {
  text-align: center;
  color: #fff;
  position: relative;
  z-index: 1;
}
.brand-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 1px solid rgba(255,255,255,0.25);
}
.brand-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}
.brand-desc {
  font-size: 13px;
  opacity: 0.75;
  letter-spacing: 0.04em;
}

.auth-right {
  width: 55%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.auth-right-inner {
  width: 100%;
  max-width: 340px;
}

.welcome-badge {
  display: inline-block;
  padding: 5px 14px;
  background: linear-gradient(135deg, #eef2ff, #f5f3ff);
  color: #6366f1;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 16px;
  letter-spacing: 0.02em;
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  font-size: 12.5px;
  font-weight: 700;
  color: #475569;
  display: block;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 15px;
  z-index: 1;
}

.input-wrapper input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px 12px 42px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
  background: #f8fafc;
  color: #334155;
}

.input-wrapper input:focus {
  border-color: #6366f1;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.toggle-pass {
  position: absolute;
  right: 14px;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  color: #94a3b8;
  transition: color 0.2s;
}
.toggle-pass:hover { color: #6366f1; }

.btn-login {
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  padding: 13px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 8px;
  font-size: 15px;
  font-family: inherit;
  letter-spacing: 0.01em;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}

.btn-login:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .auth-left { display: none; }
  .auth-right { width: 100%; }
}
</style>
