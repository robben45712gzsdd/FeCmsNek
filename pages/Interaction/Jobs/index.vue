<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2 class="title">Tuyển dụng</h2>
      <a-button type="primary" @click="openAdd">+ Thêm tin tuyển dụng</a-button>
    </div>
    <div class="filter-bar">
      <a-input-search v-model="keyword" placeholder="Tìm kiếm vị trí..." style="width:280px" @search="fetchList" allow-clear />
      <a-select v-model="langCode" style="width:130px" @change="() => { page = 1; fetchList(); }">
        <a-select-option value="vi">Tiếng Việt</a-select-option>
        <a-select-option value="us">English</a-select-option>
      </a-select>
    </div>
    <a-table :columns="columns" :data-source="list" :loading="loading" :pagination="pagination" row-key="jobId" @change="onTableChange">
      <template #logoUrl="text">
        <div class="img-cell">
          <img v-if="text" :src="toFullUrl(text)" alt="logo" class="post-img" @error="(e) => e.target.style.display='none'" />
          <span v-else class="no-img">—</span>
        </div>
      </template>
      <template #status="val">
        <a-tag :color="val === 1 ? 'green' : 'red'">{{ val === 1 ? 'Hiển thị' : 'Ẩn' }}</a-tag>
      </template>
      <template #action="record">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>Hành động <a-icon type="down" /></a>
          <a-menu slot="overlay">
            <a-menu-item @click="openEdit(record)"><a-icon type="edit" /> Chỉnh sửa</a-menu-item>
            <a-menu-item @click="openPreview(record)"><a-icon type="file-text" /> Xem JD</a-menu-item>
            <a-menu-item @click="confirmDelete(record)"><a-icon type="delete" style="color:#ff4d4f" /><span style="color:#ff4d4f"> Xóa</span></a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-table>

    <JobForm
      :visible="showForm"
      :is-edit="isEdit"
      :record="selectedRecord"
      :language-code="langCode"
      @close="showForm = false"
      @saved="fetchList"
    />

    <a-modal
      :visible="!!previewHtml"
      title="Xem JD"
      width="860px"
      :footer="null"
      :body-style="{ padding: 0 }"
      @cancel="previewHtml = null"
    >
      <iframe
        v-if="previewHtml"
        :srcdoc="previewHtml"
        style="width:100%;height:75vh;border:none;"
      />
    </a-modal>
  </div>
</template>

<script>
import axios from "axios";
import JobForm from "./components/JobForm.vue";
import { getJobCms, getJobDetailCms, deleteJob } from "../../../apis/interaction";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;

export default {
  layout: "adminLayout",
  middleware: "auth",
  components: { JobForm },
  data() {
    return {
      list: [], loading: false, keyword: "", langCode: "vi", page: 1, pageSize: 10, total: 0,
      showForm: false, isEdit: false, selectedRecord: null, previewHtml: null,
    };
  },
  computed: {
    columns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "Logo", dataIndex: "logoUrl", key: "logoUrl", scopedSlots: { customRender: "logoUrl" }, width: 80 },
        { title: "Vị trí", dataIndex: "position", key: "position", ellipsis: true },
        { title: "Địa điểm", dataIndex: "location", key: "location" },
        { title: "Lương", dataIndex: "salary", key: "salary" },
        { title: "Kinh nghiệm", dataIndex: "yearsOfExperience", key: "yearsOfExperience", width: 130 },
        { title: "Ngày", dataIndex: "date", key: "date", width: 100 },
        { title: "Trạng thái", dataIndex: "status", key: "status", scopedSlots: { customRender: "status" }, width: 110 },
        { title: "Hành động", key: "action", scopedSlots: { customRender: "action" }, width: 130 },
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
        const res = await getJobCms({ languageCode: this.langCode, keyWord: this.keyword || undefined, currentPage: this.page, recordPerPage: this.pageSize });
        if (res && res.data) {
          const records = res.data.records || [];
          this.list = records.map((r, i) => ({ ...r, ord: (this.page - 1) * this.pageSize + i + 1 }));
          this.total = res.data.totalRecord || 0;
        } else { this.list = []; this.total = 0; }
      } catch { this.$message.error("Không thể tải dữ liệu!"); }
      finally { this.loading = false; }
    },
    onTableChange(pag) { this.page = pag.current; this.fetchList(); },
    openAdd() { this.isEdit = false; this.selectedRecord = null; this.showForm = true; },
    async openEdit(record) {
      try {
        const res = await getJobDetailCms(this.langCode, record.jobId);
        this.selectedRecord = res && res.data ? { ...res.data, jobId: record.jobId } : record;
      } catch { this.selectedRecord = record; }
      this.isEdit = true; this.showForm = true;
    },
    async openPreview(record) {
      try {
        const res = await getJobDetailCms(this.langCode, record.jobId);
        const contentPath = res && res.data ? res.data.content : record.content;
        if (!contentPath) { this.$message.warning("Không có file JD!"); return; }
        const url = this.toFullUrl(contentPath);
        const resp = await axios.get(url, { responseType: "text" });
        let html = resp.data;
        // Inject charset nếu chưa có để đảm bảo UTF-8
        if (!/<meta[^>]+charset/i.test(html)) {
          html = html.replace(/<head[^>]*>/i, (m) => m + '<meta charset="utf-8">');
          if (!/<head/i.test(html)) html = '<meta charset="utf-8">' + html;
        }
        this.previewHtml = html;
      } catch { this.$message.error("Không thể tải file JD!"); }
    },
    confirmDelete(record) {
      this.$confirm({
        title: "Xác nhận xóa",
        content: `Xóa tin tuyển dụng "${record.position}"?`,
        okText: "Xóa", okType: "danger", cancelText: "Hủy",
        onOk: async () => {
          try {
            await deleteJob(record.jobId);
            this.$message.success("Đã xóa!");
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
.img-cell { width: 56px; height: 40px; overflow: hidden; border-radius: 4px; background: #f0f0f0; }
.post-img { width: 100%; height: 100%; object-fit: cover; }
.no-img { color: #aaa; font-size: 11px; display: flex; align-items: center; justify-content: center; height: 100%; }
</style>
