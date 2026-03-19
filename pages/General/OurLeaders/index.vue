<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2 class="title">Quản lý Lãnh �'ạo</h2>
      <a-button type="primary" @click="openAdd">+ Thêm lãnh �'ạo</a-button>
    </div>

    <div class="filter-bar">
      <a-input-search
        v-model="keyword"
        placeholder="Tìm kiếm..."
        style="width: 280px"
        allow-clear
        @search="onSearch"
      />
    </div>

    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      :pagination="pagination"
      row-key="leaderId"
      @change="onTableChange"
    >
      <template #imageUrl="text">
        <div class="avatar-cell">
          <img v-if="text" :src="toFullUrl(text)" alt="photo" class="avatar-img" />
          <a-avatar v-else icon="user" />
        </div>
      </template>

      <template #status="val">
        <a-tag :color="val === 1 ? 'green' : 'default'">{{ val === 1 ? 'Hiển thị' : 'Ẩn' }}</a-tag>
      </template>

      <template #action="record">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>Hành Động <a-icon type="down" /></a>
          <a-menu slot="overlay">
            <a-menu-item @click="openEdit(record)"><a-icon type="edit" /> Chỉnh sửa</a-menu-item>
            <a-menu-item @click="confirmDelete(record)">
              <a-icon type="delete" style="color:#ff4d4f" />
              <span style="color:#ff4d4f"> Xóa</span>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-table>

    <OurLeaderForm ref="leaderForm" @saved="fetchList" />
  </div>
</template>

<script>
import OurLeaderForm from "./components/OurLeaderForm.vue";
import { getOurLeaders, getOurLeaderDetail, deleteOurLeader } from "../../../apis/general";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;

export default {
  layout: "adminLayout",
  middleware: "auth",
  components: { OurLeaderForm },
  data() {
    return {
      list: [],
      loading: false,
      keyword: "",
      page: 1,
      pageSize: 10,
      total: 0,
    };
  },
  computed: {
    columns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "Ảnh", dataIndex: "imageUrl", key: "imageUrl", scopedSlots: { customRender: "imageUrl" }, width: 80 },
        { title: "Họ tên", dataIndex: "name", key: "name" },
        { title: "Chức vụ", dataIndex: "position", key: "position" },
        { title: "Trạng thái", dataIndex: "status", key: "status", scopedSlots: { customRender: "status" }, width: 110 },
        { title: "Hành Động", key: "action", scopedSlots: { customRender: "action" }, width: 130 },
      ];
    },
    pagination() {
      return { current: this.page, pageSize: this.pageSize, total: this.total, showSizeChanger: false };
    },
  },
  mounted() {
    this.fetchList();
  },
  methods: {
    toFullUrl(url) {
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    },
    async fetchList() {
      this.loading = true;
      try {
        const res = await getOurLeaders(this.keyword || null, this.page, this.pageSize);
        if (res && res.data) {
          const records = res.data.records || [];
          this.total = res.data.totalRecord || 0;
          this.list = records.map((r, i) => ({ ...r, ord: (this.page - 1) * this.pageSize + i + 1 }));
        }
      } catch {
        this.$message.error("Không th�f tải danh sách lãnh �'ạo!");
      } finally {
        this.loading = false;
      }
    },
    onSearch() {
      this.page = 1;
      this.fetchList();
    },
    onTableChange(pag) {
      this.page = pag.current;
      this.fetchList();
    },
    openAdd() {
      this.$refs.leaderForm.openAdd();
    },
    async openEdit(record) {
      try {
        const res = await getOurLeaderDetail(record.leaderId);
        const data = res && res.data ? { ...res.data, leaderId: record.leaderId } : record;
        this.$refs.leaderForm.openEdit(data);
      } catch {
        this.$refs.leaderForm.openEdit(record);
      }
    },
    confirmDelete(record) {
      this.$confirm({
        title: "Xác nhận xóa",
        content: `Xóa lãnh �'ạo "${record.name}"?`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            await deleteOurLeader(record.leaderId);
            this.$message.success("Đã xóa!");
            this.fetchList();
          } catch {
            this.$message.error("Xóa thất bại!");
          }
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
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.avatar-cell { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
</style>
