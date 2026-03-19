<template>
  <div class="error-page">
    <div class="error-box">
      <div class="icon-wrap">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" stroke-width="2" />
          <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>

      <h1>{{ error.statusCode }}</h1>
      <p class="message">{{ message }}</p>

      <div class="actions">
        <button class="btn" @click="goBack">
           {{ $t("goBack") || "Quay lại" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["error"],

  computed: {
    message() {
      if (this.error.statusCode === 404) {
        return this.$t("pageNotFound") ;
      }
      return this.$t("errorOccurred") || "Đã xảy ra lỗi, vui lòng thử lại sau.";
    },
  },

  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push("/");
      }
    },
  },
};
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%);
  font-family: "Inter", system-ui, sans-serif;
}

.error-box {
  background: #fff;
  padding: 3rem 4rem;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
  text-align: center;
  max-width: 420px;
  width: 90%;
  animation: fadeIn 0.5s ease-in-out;
}

.icon-wrap {
  width: 90px;
  height: 90px;
  margin: 0 auto 1rem;
  background: #dbeafe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  animation: bounce 1.8s infinite ease-in-out;
}

.icon {
  width: 50px;
  height: 50px;
}

h1 {
  font-size: 5rem;
  font-weight: 800;
  color: #1d4ed8;
  margin: 0.5rem 0;
}

.message {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
