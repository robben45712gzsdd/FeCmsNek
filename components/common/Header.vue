<template>
  <header class="app-header">
    <!-- Bên trái -->
    <div class="header-left">
      <template v-if="isLoggedIn">
        <span class="trigger" @click="$emit('toggle')">
          <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" />
        </span>
      </template>

      <div class="title-star">
        <a-icon type="star" theme="filled" style="font-size: 22px" />
        <div class="page-title">{{ $t(pageTitle) }}</div>
      </div>
    </div>

    <!-- Bên phải -->
    <div class="header-right">
      <!-- Chọn ngôn ngữ -->
      <a-dropdown placement="bottomRight">
        <a class="lang-switch">
          <img
            v-if="currentLang === 'vi'"
            src="https://flagcdn.com/w20/vn.png"
            alt="vi"
          />
          <img
            v-else
            src="https://flagcdn.com/w20/gb.png"
            alt="us"
          />
          <span>{{ currentLang.toUpperCase() }}</span>
          <a-icon type="down" />
        </a>
        <a-menu slot="overlay">
          <a-menu-item key="us" @click="changeLanguage('us')">
            🇬🇧 English
          </a-menu-item>
          <a-menu-item key="vi" @click="changeLanguage('vi')">
            🇻🇳 Tiếng Việt
          </a-menu-item>
        </a-menu>
      </a-dropdown>

      <!-- Logout -->
      <template v-if="isLoggedIn">
        <a-button class="logout-btn" @click="handleLogout">
          <a-icon type="logout" style="font-size: 18px;" />
        </a-button>
      </template>
    </div>
  </header>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Header",
  props: {
    collapsed: { type: Boolean, default: false },
  },
  data() {
    return {
      currentLang: this.$i18n.locale || "us",
    };
  },
  computed: {
    ...mapGetters("auth", ["isLoggedIn", "displayName"]),
    pageTitle() {
      if (!this.$route.name) return "No title";
      const parts = this.$route.name.split("-");
      const lastPart = parts[parts.length - 1];
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    },
  },
  methods: {
    handleLogout() {
      this.$confirm({
        title: this.$t("confirmLogoutTitle") || "Xác nhận đăng xuất",
        content:
          this.$t("confirmLogoutContent") ||
          "Bạn có chắc muốn đăng xuất không?",
        okText: this.$t("yes") || "Có",
        cancelText: this.$t("no") || "Không",
        onOk: () => {
          this.$store.dispatch("auth/logout");
          this.$router.push("/login");
        },
      });
    },
    changeLanguage(lang) {
      this.currentLang = lang;
      this.$i18n.locale = lang;
      localStorage.setItem("selectedLanguage", lang);
    },
  },
  mounted() {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang) {
      const normalizedLang = savedLang === "en" ? "us" : savedLang;
      this.$i18n.locale = normalizedLang;
      this.currentLang = normalizedLang;
    }
  },
};
</script>

<style scoped>
.app-header {
<<<<<<< HEAD
  height: 56px;
  background: rgba(255,255,255,.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 16px rgba(99,102,241,.06);
=======
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  gap: 20px;
  border-radius: 18px;
  box-shadow: 0 2px 6px #2553b91a;
>>>>>>> feature_khuong_dev
}
.header-left {
  display: flex;
  align-items: center;
<<<<<<< HEAD
  gap: 16px;
=======
  gap: 24px;
>>>>>>> feature_khuong_dev
}
.trigger {
  display: flex;
  cursor: pointer;
  align-items: center;
<<<<<<< HEAD
  font-size: 18px;
  color: #64748b;
  width: 32px;
  height: 32px;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}
.trigger:hover {
  background: #f0f4ff;
  color: #6366f1;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-star {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-star .anticon {
  color: #f59e0b;
=======
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-star {
  display: flex;
  align-items: center;
  gap: 8px;
>>>>>>> feature_khuong_dev
}
.page-title {
  font-weight: 700;
  font-size: 16px;
<<<<<<< HEAD
  color: #1e293b;
  letter-spacing: -0.01em;
=======
>>>>>>> feature_khuong_dev
}

/* Dropdown ngôn ngữ */
.lang-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
<<<<<<< HEAD
  color: #475569;
  font-weight: 500;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 10px;
  transition: all 0.2s;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.lang-switch img {
  width: 18px;
  height: 13px;
  border-radius: 2px;
}
.lang-switch:hover {
  color: #6366f1;
  border-color: #c7d2fe;
  background: #f0f4ff;
}

.logout-btn {
  border: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px !important;
  height: 36px !important;
  border-radius: 10px !important;
  color: #64748b !important;
  transition: all 0.2s !important;
  padding: 0 !important;
}
.logout-btn:hover {
  border-color: #fca5a5 !important;
  background: #fef2f2 !important;
  color: #ef4444 !important;
}
=======
  color: #333;
  font-weight: 500;
}
.lang-switch img {
  width: 20px;
  height: 14px;
  border-radius: 2px;
}
.lang-switch:hover {
  color: #2553b9;
}

.logout-btn {
  border: none;
  display: flex;
  align-items: center;
  
}

>>>>>>> feature_khuong_dev
</style>
