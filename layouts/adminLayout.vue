<template>
  <div style="padding-left: 20px; padding-right: 20px; padding-top: 20px; background: #F0F5F9; min-height: calc(100vh - 20px)">
    <a-layout style="min-height: calc(100vh - 20px)">
      <!-- Sidebar -->
      <Sider :collapsed="collapsed" :selectedKeys="selectedKeys"  />
      <!-- Main -->
      <a-layout>
        <div style="padding-left: 20px">
          <Header :collapsed="collapsed" @toggle="collapsed = !collapsed" />
        </div>
        <div class="scrollable-content" style="padding-left: 20px">
          <a-layout-content
            :style="{
              margin: '14px 0px 0 0px',
              padding: '24px',
              background: '#fff',
              minHeight: '680px',
              borderRadius: '18px',
            }"
          >
            <nuxt  />
          </a-layout-content>
        </div>
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
  computed: {}
};
</script>

<style scoped>
.scrollable-content {
  max-height: calc(100vh - 20px);
  overflow-y: auto;
}
</style>