<template>
  <div class="admin-shell">
    <a-layout class="admin-layout">
      <!-- Sidebar -->
      <Sider :collapsed="collapsed" :selectedKeys="selectedKeys" />
      <!-- Main -->
      <a-layout class="main-area">
        <Header :collapsed="collapsed" @toggle="collapsed = !collapsed" />
        <a-layout-content class="content-area">
          <nuxt />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
import Header from "../components/common/Header.vue";
import Sider from "../components/common/Slider.vue";

export default {
  components: { Header, Sider },
  data() {
    return {
      collapsed: false,
      selectedKeys: ["1"],
    };
  },
};
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fef3f2 100%);
}
.admin-layout {
  min-height: 100vh;
  background: transparent !important;
}
.main-area {
  background: transparent !important;
  padding: 16px 20px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.content-area {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  min-height: 680px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 16px rgba(99,102,241,.06);
  flex: 1;
}
</style>

