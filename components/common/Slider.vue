<template>
  <a-layout-sider
    :collapsed="collapsed"
    :trigger="null"
    collapsible
    :width="250"
    class="custom-sider"
  >
    <div class="logo" :class="{ collapsed }">
      <div class="brand">
        <a-avatar class="brand-avatar" icon="user" />
        <span v-if="!collapsed" class="brand-title">Admin</span>
      </div>
    </div>
    <!-- <div class="balance-container">
      <p class="balance" :class="{ collapsed }">
        {{ $t("balance") }}: {{ formattedBalance }}
        <a-icon
          type="sync"
          class="reload-icon"
          :class="{ spinning: isReloading }"
          @click="reloadBalance"
        />
      </p>
    </div> -->

    <a-menu
      class="sidebar-menu"
      theme="light"
      mode="inline"
      :selectedKeys="localSelectedKeys"
      @select="onSelect"
    >
      <a-menu-item key="8">
        <nuxt-link to="/case-study-editor">
          <a-icon type="file-text" />
          <span>{{ $t("caseStudyEditor") }}</span>
        </nuxt-link>
      </a-menu-item>
      <a-menu-item key="9">
        <nuxt-link to="/Projects">
          <a-icon type="project" />
          <span>Case Studies</span>
        </nuxt-link>
      </a-menu-item>
      <a-menu-item key="10">
        <nuxt-link to="/Blog">
          <a-icon type="read" />
          <span>Blog</span>
        </nuxt-link>
      </a-menu-item>
      <a-menu-item key="15">
        <nuxt-link to="/Games">
          <a-icon type="thunderbolt" />
          <span>Games</span>
        </nuxt-link>
      </a-menu-item>
      <a-menu-item key="100">
        <nuxt-link to="/ImageUploadTool">
          <a-icon type="picture" />
          <span>Upload Ảnh</span>
        </nuxt-link>
      </a-menu-item>

      <a-sub-menu key="ai-demo">
        <span slot="title"><a-icon type="robot" /><span>AI-Demo</span></span>
        <a-menu-item key="101">
          <nuxt-link to="/Ai">
            <a-icon type="bulb" />
            <span>AI</span>
          </nuxt-link>
        </a-menu-item>
        <a-menu-item key="102">
          <nuxt-link to="/Ai/api-key">
            <a-icon type="key" />
            <span>api-key</span>
          </nuxt-link>
        </a-menu-item>
        <a-menu-item key="103">
          <nuxt-link to="/Ai/label">
            <a-icon type="tags" />
            <span>label</span>
          </nuxt-link>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="general">
        <span slot="title"><a-icon type="appstore" /><span>Chung</span></span>
        <a-menu-item key="16">
          <nuxt-link to="/General/OurLeaders">
            <a-icon type="crown" />
            <span>Lãnh đạo</span>
          </nuxt-link>
        </a-menu-item>
        <a-menu-item key="17">
          <nuxt-link to="/General/Testimonial">
            <a-icon type="star" />
            <span>Testimonial</span>
          </nuxt-link>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="interaction">
        <span slot="title"><a-icon type="mail" /><span>Tương tác</span></span>
        <a-menu-item key="11">
          <nuxt-link to="/Interaction/SendMail">
            <a-icon type="message" />
            <span>Liên hệ</span>
          </nuxt-link>
        </a-menu-item>
        <a-menu-item key="12">
          <nuxt-link to="/Interaction/SubscribeUs">
            <a-icon type="bell" />
            <span>Đăng ký nhận tin</span>
          </nuxt-link>
        </a-menu-item>
        <a-menu-item key="13">
          <nuxt-link to="/Interaction/Career">
            <a-icon type="solution" />
            <span>Đơn ứng tuyển</span>
          </nuxt-link>
        </a-menu-item>
        <a-menu-item key="14">
          <nuxt-link to="/Interaction/Jobs">
            <a-icon type="team" />
            <span>Tuyển dụng</span>
          </nuxt-link>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>

<script>
import { getAccountDetail } from "../../apis/account";

export default {
  name: "Sider",
  props: {
    collapsed: { type: Boolean, required: true },
    selectedKeys: { type: Array, default: () => ["1"] },
  },
  data() {
    return {
      localSelectedKeys: this.selectedKeys,
      accountName: "Loading...",
      balance: 0,
      isReloading: false,
    };
  },
  mounted() {
    // this.loadAccountDetail();
  },
  watch: {
    selectedKeys(newVal) {
      this.localSelectedKeys = newVal;
    },
  },
  methods: {
    // loadAccountDetail() {
    //   return getAccountDetail()
    //     .then((res) => {
    //       if (res && res.data) {
    //         this.accountName =
    //           res.data.displayName || res.data.customerName || "Admin";
    //         this.balance = res.data.wallet || 0;
    //       } else {
    //         this.accountName = "Admin Portal";
    //       }
    //     })
    //     .catch(() => {
    //       this.accountName = "Admin Portal";
    //       this.$message.error(this.$t("errorOccurred"));
    //     });
    // },

    // reloadBalance() {
    //   if (this.isReloading) return; 
    //   this.isReloading = true;

    //   this.loadAccountDetail().finally(() => {
        
    //     setTimeout(() => {
    //       this.isReloading = false;
    //     }, 2000);
    //   });
    // },

    onSelect({ key }) {
      this.localSelectedKeys = [key];
      this.$emit("update:selectedKeys", [key]);
    },

    changeLanguage(lang) {
      this.$i18n.locale = lang;
      localStorage.setItem("selectedLanguage", lang);
    },
  },

  computed: {
    formattedBalance() {
      return this.balance.toLocaleString();
    },
  },
};
</script>

<style scoped>
.custom-sider {
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  border-radius: 18px;
  border: 1px solid #e4ebfb;
  box-shadow: 0 10px 30px rgba(37, 83, 185, 0.08);
  overflow: hidden;
}

.logo {
  margin: 14px 14px 8px;
  min-height: 64px;
  display: flex;
  align-items: center;
  transition: all 0.25s ease;
}

.logo.collapsed {
  justify-content: center;
}

.balance-container {
  margin: 0 14px 10px;
}

.balance {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #eef4ff;
  border: 1px solid #d9e6ff;
  font-weight: 500;
  color: #274690;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.balance.collapsed {
  display: none;
}

.reload-icon {
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  color: #2553b9;
  transition: transform 0.25s ease, background-color 0.25s ease;
}

.reload-icon:hover {
  background-color: rgba(37, 83, 185, 0.12);
}

.spinning {
  animation: spin 1s linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(600deg);
  }
}

.brand {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f3f7ff;
  border: 1px solid #dde8ff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
  font-weight: 700;
  color: #1e3f88;
}

.brand-avatar {
  background: linear-gradient(135deg, #4dabf7 0%, #2553b9 100%);
  flex-shrink: 0;
}

.brand-title {
  color: #1f3d80;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-menu {
  padding: 0 10px 12px;
  border-right: none;
  background: transparent;
}

.sidebar-menu /deep/ .ant-menu-item,
.sidebar-menu /deep/ .ant-menu-submenu-title {
  margin: 4px 0;
  height: 42px;
  line-height: 42px;
  border-radius: 10px;
  font-weight: 500;
  color: #35508b;
  transition: all 0.2s ease;
}

.sidebar-menu /deep/ .ant-menu-item a,
.sidebar-menu /deep/ .ant-menu-submenu-title span {
  color: inherit;
}

.sidebar-menu /deep/ .ant-menu-item:hover,
.sidebar-menu /deep/ .ant-menu-submenu-title:hover {
  background: #edf4ff;
  color: #1f4fb5;
}

.sidebar-menu /deep/ .ant-menu-item-selected {
  background: #e3eeff;
  color: #1f4fb5;
  font-weight: 600;
}

.sidebar-menu /deep/ .ant-menu-item-selected::after {
  display: none;
}

.sidebar-menu /deep/ .ant-menu-submenu-open > .ant-menu-submenu-title {
  background: #edf4ff;
  color: #1f4fb5;
}

.sidebar-menu /deep/ .ant-menu-sub .ant-menu-item,
.sidebar-menu /deep/ .ant-menu-sub .ant-menu-submenu-title {
  margin-left: 8px;
  width: calc(100% - 8px);
}

@media (max-width: 992px) {
  .custom-sider {
    border-radius: 14px;
  }

  .logo {
    margin: 12px 12px 6px;
  }

  .balance-container {
    margin: 0 12px 8px;
  }
}
</style>