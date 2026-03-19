<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2 class="title">Liên hệ?</h2>
    </div>
    <div class="filter-bar">
      <a-input-search v-model="keyword" placeholder="Tìm kiếm..." style="width:280px" @search="fetchList" allow-clear />
    </div>
    <a-table :columns="columns" :data-source="list" :loading="loading" :pagination="pagination" row-key="mailId" @change="onTableChange">
      <template #action="record">
        <a-popconfirm title="Xóa Liên hệ? này?" ok-text="Xóa" ok-type="danger" cancel-text="Hủy" @confirm="remove(record)">
          <a-button type="link" style="color:#ff4d4f"><a-icon type="delete" /> Xóa</a-button>
        </a-popconfirm>
      </template>
    </a-table>
  </div>
</template>

<script>
import { getListSendMail, deleteSendMail } from "../../../apis/interaction";

export default {
  layout: "adminLayout",
  middleware: "auth",
  data() {
    return {
      list: [], loading: false, keyword: "", page: 1, pageSize: 10, total: 0,
    };
  },
  computed: {
    columns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "Tên", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber", width: 130 },
        { title: "N�Ti dung", dataIndex: "message", key: "message", ellipsis: true },
        { title: "Hành Động", key: "action", scopedSlots: { customRender: "action" }, width: 110 },
      ];
    },
    pagination() { return { current: this.page, pageSize: this.pageSize, total: this.total, showSizeChanger: false }; },
  },
  mounted() { this.fetchList(); },
  methods: {
    async fetchList() {
      this.loading = true;
      try {
        const res = await getListSendMail({ keyWord: this.keyword || undefined, currentPage: this.page, recordPerPage: this.pageSize });
        if (res && res.data) {
          const records = res.data.records || [];
          this.list = records.map((r, i) => ({ ...r, ord: (this.page - 1) * this.pageSize + i + 1 }));
          this.total = res.data.totalRecord || 0;
        } else { this.list = []; this.total = 0; }
      } catch { this.$message.error("Không th�f tải dữ li�?u!"); }
      finally { this.loading = false; }
    },
    onTableChange(pag) { this.page = pag.current; this.fetchList(); },
    async remove(record) {
      try {
        await deleteSendMail(record.mailId);
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
