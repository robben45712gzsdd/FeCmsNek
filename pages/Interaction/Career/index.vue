<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2 class="title">Đơn ứng tuyển</h2>
    </div>
    <div class="filter-bar">
      <a-input-search v-model="keyword" placeholder="Tìm kiếm..." style="width:280px" @search="fetchList" allow-clear />
      <a-select v-model="langCode" style="width:130px" @change="() => { page = 1; fetchList(); }">
        <a-select-option value="vi">Tiếng Việt</a-select-option>
        <a-select-option value="en">English</a-select-option>
      </a-select>
    </div>
    <a-table :columns="columns" :data-source="list" :loading="loading" :pagination="pagination" row-key="applicantId" @change="onTableChange">
      <template #cvUrl="text">
        <a v-if="text" :href="toFullUrl(text)" target="_blank"><a-icon type="file-pdf" /> Xem CV</a>
        <span v-else>—</span>
      </template>
      <template #action="record">
        <a-popconfirm title="Xóa đơn ứng tuyển này?" ok-text="Xóa" ok-type="danger" cancel-text="Hủy" @confirm="remove(record)">
          <a-button type="link" style="color:#ff4d4f"><a-icon type="delete" /> Xóa</a-button>
        </a-popconfirm>
      </template>
    </a-table>
  </div>
</template>

<script>
import { getListSendMailCareer, deleteMailCareer } from "../../../apis/interaction";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL || "https://ldapiv2.neksolution.com";

export default {
  layout: "adminLayout",
  middleware: "auth",
  data() {
    return {
      list: [], loading: false, keyword: "", langCode: "vi", page: 1, pageSize: 10, total: 0,
    };
  },
  computed: {
    columns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "Họ tên", dataIndex: "fullName", key: "fullName" },
        { title: "Vị trí", dataIndex: "position", key: "position" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber", width: 130 },
        { title: "Nội dung", dataIndex: "message", key: "message", ellipsis: true },
        { title: "CV", dataIndex: "cvUrl", key: "cvUrl", scopedSlots: { customRender: "cvUrl" }, width: 100 },
        { title: "Hành động", key: "action", scopedSlots: { customRender: "action" }, width: 110 },
      ];
    },
    pagination() { return { current: this.page, pageSize: this.pageSize, total: this.total, showSizeChanger: false }; },
  },
  mounted() { this.fetchList(); },
  methods: {
    toFullUrl(url) {
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    },
    async fetchList() {
      this.loading = true;
      try {
        const res = await getListSendMailCareer({ languageCode: this.langCode, keyWord: this.keyword || undefined, currentPage: this.page, recordPerPage: this.pageSize });
        if (res && res.data) {
          const records = res.data.records || [];
          this.list = records.map((r, i) => ({ ...r, ord: (this.page - 1) * this.pageSize + i + 1 }));
          this.total = res.data.totalRecord || 0;
        } else { this.list = []; this.total = 0; }
      } catch { this.$message.error("Không thể tải dữ liệu!"); }
      finally { this.loading = false; }
    },
    onTableChange(pag) { this.page = pag.current; this.fetchList(); },
    async remove(record) {
      try {
        await deleteMailCareer(record.applicantId);
        this.$message.success("Đã xóa!");
        this.fetchList();
      } catch { this.$message.error("Xóa thất bại!"); }
    },
  },
};
</script>

<style scoped>
.page-wrap { padding: 24px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
</style>
