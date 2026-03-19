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
        <a-avatar style="background-color: #4dabf7" icon="user" />
        <span v-if="!collapsed" class="brand-title">{{ accountName }}</span>
      </div>
    </div>
    <div class="balance-container">
      <p class="balance" :class="{ collapsed }">
        {{ $t("balance") }}: {{ formattedBalance }}
        <a-icon
          type="sync"
          class="reload-icon"
          :class="{ spinning: isReloading }"
          @click="reloadBalance"
        />
      </p>
    </div>

    <a-menu
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
    this.loadAccountDetail();
  },
  watch: {
    selectedKeys(newVal) {
      this.localSelectedKeys = newVal;
    },
  },
  methods: {
    loadAccountDetail() {
      return getAccountDetail()
        .then((res) => {
          if (res && res.data) {
            this.accountName =
              res.data.displayName || res.data.customerName || "Admin";
            this.balance = res.data.wallet || 0;
          } else {
            this.accountName = "Admin Portal";
          }
        })
        .catch(() => {
          this.accountName = "Admin Portal";
          this.$message.error(this.$t("errorOccurred"));
        });
    },

    reloadBalance() {
      if (this.isReloading) return; 
      this.isReloading = true;

      this.loadAccountDetail().finally(() => {
        
        setTimeout(() => {
          this.isReloading = false;
        }, 2000);
      });
    },

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
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 2px 6px #2553b91a;
}
.logo {
  height: 64px;
  margin: 16px 16px 0px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  transition: all 0.3s ease;
}
.logo.collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
}
.balance {
  padding: 0px 20px 0px 20px;
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.balance.collapsed {
  display: none;
}
.reload-icon {
  cursor: pointer;

  transition: transform 0.3s ease;
}

/* Xoay đúng 5 vòng trong 2s */
.spinning {
  animation: spin 1s linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(600deg); /* 360 * 5 */
  }
}

.brand {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 0 5px;
  font-weight: 700;
  font-size: 18px;
  color: #2553b9;
}
.brand-title {
  color: #2553b9;
}
</style>
