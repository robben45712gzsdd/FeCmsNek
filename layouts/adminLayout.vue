<template>
  <div style="padding: 20px; background: #F0F5F9; min-height: 100vh">
    <a-layout style="min-height: 100vh">
      <!-- Sidebar -->
      <Sider :collapsed="collapsed" :selectedKeys="selectedKeys"  />
      <!-- Main -->
      <a-layout>
        <div style="padding-left: 20px">
          <Header :collapsed="collapsed" @toggle="collapsed = !collapsed" />
        </div>
        <div style="padding-left: 20px">
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

