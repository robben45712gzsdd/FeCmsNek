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
            alt="en"
          />
          <span>{{ currentLang.toUpperCase() }}</span>
          <a-icon type="down" />
        </a>
        <a-menu slot="overlay">
          <a-menu-item key="en" @click="changeLanguage('en')">
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
      currentLang: this.$i18n.locale || "en",
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
      this.$i18n.locale = savedLang;
      this.currentLang = savedLang;
    }
  },
};
</script>

<style scoped>
.app-header {
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
}
.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}
.trigger {
  display: flex;
  cursor: pointer;
  align-items: center;
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
}
.page-title {
  font-weight: 700;
  font-size: 16px;
}

/* Dropdown ngôn ngữ */
.lang-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
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

</style>
