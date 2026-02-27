<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2 class="title">Quản lý Game</h2>
      <a-button type="primary" @click="openAdd">+ Thêm game</a-button>
    </div>

    <div class="filter-bar">
      <a-input-search
        v-model="keyword"
        placeholder="Tìm kiếm tên game..."
        style="width: 280px"
        allow-clear
        @search="applySearch"
      />
      <a-select v-model="langCode" style="width: 130px" @change="() => { page = 1; fetchList(); }">
        <a-select-option value="vi">Tiếng Việt</a-select-option>
        <a-select-option value="en">English</a-select-option>
      </a-select>
    </div>

    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      :pagination="pagination"
      row-key="gameId"
      @change="onTableChange"
    >
      <template #bannerUrl="text">
        <div class="video-cell">
          <video v-if="text" :src="toFullUrl(text)" class="game-video" muted />
          <span v-else class="no-img">—</span>
        </div>
      </template>

      <template #logoUrl="text">
        <div class="img-cell logo-cell">
          <img v-if="text" :src="toFullUrl(text)" alt="logo" class="game-img" @error="(e) => (e.target.style.display = 'none')" />
          <span v-else class="no-img">—</span>
        </div>
      </template>

      <template #gameType="val">
        <a-tag color="blue">{{ gameTypeLabel(val) }}</a-tag>
      </template>

      <template #isComming="val">
        <a-tag :color="val === 1 ? 'orange' : 'green'">{{ val === 1 ? 'Sắp ra mắt' : 'Đã ra mắt' }}</a-tag>
      </template>

      <template #status="val">
        <a-tag :color="val === 1 ? 'green' : 'default'">{{ val === 1 ? 'Hiển thị' : 'Ẩn' }}</a-tag>
      </template>

      <template #action="record">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>Hành động <a-icon type="down" /></a>
          <a-menu slot="overlay">
            <a-menu-item @click="openEdit(record)"><a-icon type="edit" /> Chỉnh sửa</a-menu-item>
            <a-menu-item @click="confirmDelete(record)"><a-icon type="delete" style="color:#ff4d4f" /><span style="color:#ff4d4f"> Xóa</span></a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-table>

    <GameForm
      ref="gameForm"
      :language-code="langCode"
      @saved="fetchList"
    />
  </div>
</template>

<script>
import GameForm from "./components/GameForm.vue";
import { getGameList, getGameDetail, deleteGame } from "../../apis/games";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL || "https://ldapiv2.neksolution.com";

export default {
  layout: "adminLayout",
  middleware: "auth",
  components: { GameForm },
  data() {
    return {
      list: [], loading: false, keyword: "", langCode: "vi", page: 1, pageSize: 10, total: 0,
    };
  },
  computed: {
    columns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "Banner", dataIndex: "bannerUrl", key: "bannerUrl", scopedSlots: { customRender: "bannerUrl" }, width: 100 },
        { title: "Logo", dataIndex: "logoUrl", key: "logoUrl", scopedSlots: { customRender: "logoUrl" }, width: 80 },
        { title: "Tên game", dataIndex: "name", key: "name" },
        { title: "Mô tả", dataIndex: "description", key: "description", ellipsis: true },
        { title: "Loại game", dataIndex: "gameType", key: "gameType", scopedSlots: { customRender: "gameType" }, width: 120 },
        { title: "Ra mắt", dataIndex: "isComming", key: "isComming", scopedSlots: { customRender: "isComming" }, width: 130 },
        { title: "Trạng thái", dataIndex: "status", key: "status", scopedSlots: { customRender: "status" }, width: 110 },
        { title: "Hành động", key: "action", scopedSlots: { customRender: "action" }, width: 130 },
      ];
    },
    pagination() {
      return { current: this.page, pageSize: this.pageSize, total: this.total, showSizeChanger: false };
    },
  },
  mounted() { this.fetchList(); },
  methods: {
    toFullUrl(url) {
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    },
    gameTypeLabel(val) {
      const map = { 1: 'Mobile', 2: 'Cả hai', 3: 'Web' };
      return map[val] || `Type ${val}`;
    },
    async fetchList() {
      this.loading = true;
      try {
        const res = await getGameList(this.langCode, this.page, this.pageSize);
        if (res && res.data) {
          const records = res.data.records || [];
          this.total = res.data.totalRecord || 0;
          this.list = records.map((r, i) => ({ ...r, ord: (this.page - 1) * this.pageSize + i + 1 }));
        }
      } catch { this.$message.error("Không thể tải danh sách game!"); }
      finally { this.loading = false; }
    },
    applySearch() { this.page = 1; this.fetchList(); },
    onTableChange(pag) { this.page = pag.current; this.fetchList(); },
    openAdd() { this.$refs.gameForm.openAdd(); },
    async openEdit(record) {
      try {
        const res = await getGameDetail(record.gameId, this.langCode);
        const data = res && res.data ? { ...res.data, gameId: record.gameId } : record;
        this.$refs.gameForm.openEdit(data);
      } catch {
        this.$refs.gameForm.openEdit(record);
      }
    },
    confirmDelete(record) {
      this.$confirm({
        title: "Xác nhận xóa",
        content: `Xóa game "${record.name || record.gameId}"?`,
        okText: "Xóa", okType: "danger", cancelText: "Hủy",
        onOk: async () => {
          try {
            await deleteGame(record.gameId);
            this.$message.success("Đã xóa game!");
            this.fetchList();
          } catch { this.$message.error("Xóa thất bại!"); }
        },
      });
    },
  },
};
</script>

<style scoped>
.page-wrap { padding: 24px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.img-cell { width: 72px; height: 48px; overflow: hidden; border-radius: 6px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; }
.video-cell { width: 90px; height: 56px; overflow: hidden; border-radius: 6px; background: #000; display: flex; align-items: center; justify-content: center; }
.game-video { width: 100%; height: 100%; object-fit: cover; }
.logo-cell { width: 48px; height: 48px; border-radius: 50%; }
.game-img { width: 100%; height: 100%; object-fit: cover; }
.no-img { color: #aaa; font-size: 11px; }
</style>