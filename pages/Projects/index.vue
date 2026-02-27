<template>
  <div class="projects-page">
    <h2 class="title">Quản lý Case Studies</h2>

    <a-button type="primary" class="btn-add" @click="openAdd">
      + Thêm Case Study
    </a-button>

    <!-- Bảng dữ liệu -->
    <BoxTable
      :columns="columns"
      :data="projects"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      :total="total"
      @page-change="changePage"
    >
      <!-- Cột ảnh thumbnail -->
      <template #thumbnail="{ record }">
        <div class="img-cell">
          <img
            v-if="record.thumbnailUrl"
            :src="/^https?:\/\//i.test(record.thumbnailUrl) ? record.thumbnailUrl : baseImageUrl.replace(/\/$/, '') + '/' + record.thumbnailUrl.replace(/^\//, '')"
            alt="thumbnail"
            class="project-img"
            @error="onImgError"
          />
          <span v-else class="no-img">Chưa có ảnh</span>
        </div>
      </template>

      <!-- Cột trạng thái -->
      <template #isActive="{ record }">
        <a-tag :color="record.isActive ? 'green' : 'red'">
          {{ record.isActive ? 'Hiển thị' : 'Ẩn' }}
        </a-tag>
      </template>

      <!-- Cột ngày tạo -->
      <template #createdAt="{ record }">
        {{ formatDate(record.createdAt) }}
      </template>

      <!-- Hành động -->
      <template #action="{ record }">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>
            Hành động <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="openEdit(record)">
              <a-icon type="edit" /> Chỉnh sửa
            </a-menu-item>
            <a-menu-item key="2">
              <nuxt-link :to="'/CaseStudyEditor?projectId=' + record.projectId">
                <a-icon type="file-text" /> Mở Editor
              </nuxt-link>
            </a-menu-item>
            <a-menu-item key="3" @click="confirmDelete(record)">
              <a-icon type="delete" style="color: #ff4d4f" />
              <span style="color: #ff4d4f"> Xóa</span>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </BoxTable>

    <!-- Form thêm/sửa -->
    <ProjectForm
      :visible="showForm"
      :isEdit="isEdit"
      :record="selectedRecord"
      @close="showForm = false"
      @saved="fetchProjects"
    />
  </div>
</template>

<script>
import BoxTable from "../../components/BoxTable/index.vue";
import ProjectForm from "./components/ProjectForm.vue";
import { getProjectList, getProjectDetail, deleteProject } from "../../apis/projects";

export default {
  layout: "adminLayout",
  middleware: "auth",
  components: { BoxTable, ProjectForm },
  data() {
    return {
      projects: [],
      loading: false,
      detailLoading: false,
      page: 1,
      pageSize: 10,
      total: 0,
      showForm: false,
      isEdit: false,
      selectedRecord: null,
      baseImageUrl: process.env.NUXT_ENV_FILE_API_URL || "https://ldapiv2.neksolution.com",
    };
  },
  computed: {
    columns() {
      return [
        { key: "ord", label: "#" },
        { key: "thumbnail", label: "Thumbnail", slot: "thumbnail" },
        { key: "projectName", label: "Tên dự án" },
        { key: "titleText", label: "Tiêu đề" },
        { key: "subtitleText", label: "Phụ đề" },
        { key: "createdAt", label: "Ngày tạo", slot: "createdAt" },
        { key: "isActive", label: "Trạng thái", slot: "isActive" },
        { key: "action", label: "Hành động", slot: "action" },
      ];
    },
  },
  mounted() {
    this.fetchProjects();
  },
  methods: {
    async fetchProjects() {
      this.loading = true;
      try {
        const params = {
          languageCode: "vi",
          currentPage: this.page,
          recordPerPage: this.pageSize,
        };
        const res = await getProjectList(params);
        if (res && res.data) {
          const records = res.data.records || res.data.items || res.data.data || [];
          this.projects = records.map((item, idx) => ({
            ...item,
            ord: (this.page - 1) * this.pageSize + idx + 1,
          }));
          this.total = res.data.totalRecord || res.data.total || 0;
        } else {
          this.projects = [];
          this.total = 0;
        }
      } catch (err) {
        this.$message.error("Không thể tải danh sách dự án!");
      } finally {
        this.loading = false;
      }
    },
    changePage(newPage) {
      this.page = newPage;
      this.fetchProjects();
    },
    openAdd() {
      this.isEdit = false;
      this.selectedRecord = null;
      this.showForm = true;
    },
    async openEdit(record) {
      this.detailLoading = true;
      try {
        const res = await getProjectDetail(record.projectId);
        const detail = (res && res.data) ? res.data : record;
        this.isEdit = true;
        this.selectedRecord = detail;
        this.showForm = true;
      } catch {
        this.$message.error("Không thể tải chi tiết dự án!");
      } finally {
        this.detailLoading = false;
      }
    },
    confirmDelete(record) {
      this.$confirm({
        title: "Xác nhận xóa",
        content: `Bạn có chắc chắn muốn xóa dự án "${record.projectName}" không?`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            await deleteProject(record.projectId);
            this.$message.success("Xóa thành công!");
            this.fetchProjects();
          } catch {
            this.$message.error("Xóa thất bại, vui lòng thử lại!");
          }
        },
      });
    },
    formatDate(dateStr) {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    onImgError(e) {
      e.target.style.display = "none";
    },
  },
};
</script>

<style scoped>
.projects-page {
  padding: 24px;
}
.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1e293b;
}
.btn-add {
  margin: 16px 0;
}
.img-cell {
  width: 72px;
  height: 48px;
  overflow: hidden;
  border-radius: 6px;
}
.project-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-img {
  color: #aaa;
  font-style: italic;
  font-size: 12px;
}
</style>
