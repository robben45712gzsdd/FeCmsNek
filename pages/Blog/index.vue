<template>
  <div class="blog-page">
    <div class="blog-header">
      <h2 class="title">Quản lý Blog</h2>
      <a-button v-if="activeTab === 'posts'" type="primary" class="btn-add" @click="openAdd">+ Thêm bài viết</a-button>
    </div>

    <a-tabs v-model="activeTab" @change="onTabChange">
      <a-tab-pane key="posts" tab="Bài viết">
        <div class="filter-bar">
          <a-input-search v-model="keyword" placeholder="Tìm kiếm tiêu đề..." style="width: 280px" @search="fetchList" allow-clear />
          <a-select v-model="langCode" style="width: 130px" @change="() => { page = 1; fetchList(); }">
            <a-select-option value="vi">Tiếng Việt</a-select-option>
            <a-select-option value="us">English</a-select-option>
          </a-select>
        </div>
        <a-table :columns="columns" :data-source="list" :loading="loading" :pagination="pagination" row-key="postId" @change="onTableChange">
          <template #imageUrl="text">
            <div class="img-cell">
              <img v-if="text" :src="toFullUrl(text)" alt="thumb" class="post-img" @error="(e) => e.target.style.display='none'" />
              <span v-else class="no-img"></span>
            </div>
          </template>
          <template #isFeatured="val">
            <a-tag :color="val ? 'gold' : 'blue'">{{ val ? 'Nổi bật' : 'Thường' }}</a-tag>
          </template>
          <template #status="val">
            <a-tag :color="val === 1 ? 'green' : 'red'">{{ val === 1 ? 'Hiển thị' : 'Ẩn' }}</a-tag>
          </template>
          <template #createdDate="val">{{ formatDate(val) }}</template>
          <template #action="record">
            <a-dropdown>
              <a class="ant-dropdown-link" @click.prevent>Hành động <a-icon type="down" /></a>
              <a-menu slot="overlay">
                <a-menu-item @click="openEdit(record)"><a-icon type="edit" /> Chỉnh sửa</a-menu-item>
                <a-menu-item @click="openPreview(record)"><a-icon type="eye" /> Xem nội dung</a-menu-item>
                <a-menu-item @click="confirmDelete(record)"><a-icon type="delete" style="color:#ff4d4f" /><span style="color:#ff4d4f"> Xóa</span></a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="generated" tab="Bài AI tạo">
        <div class="filter-bar">
          <a-input-search v-model="genKeyword" placeholder="Tìm kiếm tiêu đề..." style="width: 280px" @search="fetchGenerated" allow-clear />
          <a-select v-model="genLangCode" style="width: 130px" @change="() => { genPage = 1; fetchGenerated(); }">
            <a-select-option value="vi">Tiếng Việt</a-select-option>
            <a-select-option value="us">English</a-select-option>
          </a-select>
          <a-button type="primary" :loading="generatingAI" icon="robot" @click="handleGenerateBlog">Tạo bài AI</a-button>
        </div>
        <a-table :columns="genColumns" :data-source="genList" :loading="genLoading" :pagination="genPagination" row-key="postId" @change="onGenTableChange">
          <template #imageUrl="text">
            <div class="img-cell">
              <img v-if="text" :src="toFullUrl(text)" alt="thumb" class="post-img" @error="(e) => e.target.style.display='none'" />
              <span v-else class="no-img"></span>
            </div>
          </template>
          <template #approvalStatus="val">
            <a-tag :color="val === 1 ? 'green' : val === 2 ? 'red' : 'orange'">
              {{ val === 1 ? 'Đã duyệt' : val === 2 ? 'Từ chối' : 'Chờ duyệt' }}
            </a-tag>
          </template>
          <template #createdDate="val">{{ formatDate(val) }}</template>
          <template #action="record">
            <a-dropdown>
              <a class="ant-dropdown-link" @click.prevent>Hành động <a-icon type="down" /></a>
              <a-menu slot="overlay">
                <a-menu-item @click="openEditGen(record)"><a-icon type="edit" /> Chỉnh sửa</a-menu-item>
                <a-menu-item @click="openPreview(record)"><a-icon type="eye" /> Xem nội dung</a-menu-item>
                <a-menu-item @click="approvePost(record, true)"><a-icon type="check-circle" style="color:#52c41a" /><span style="color:#52c41a"> Duyệt</span></a-menu-item>
                <a-menu-item @click="approvePost(record, false)"><a-icon type="close-circle" style="color:#ff4d4f" /><span style="color:#ff4d4f"> Từ chối</span></a-menu-item>
                <a-menu-item @click="confirmDelete(record)"><a-icon type="delete" style="color:#ff4d4f" /><span style="color:#ff4d4f"> Xóa</span></a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="prompts" tab="Quản lý Prompt AI">
        <div class="filter-bar">
          <a-button type="primary" icon="plus" @click="openPromptModal(false)">Thêm Prompt</a-button>
        </div>
        <a-table :columns="promptColumns" :data-source="promptList" :loading="promptLoading" :pagination="promptPagination" row-key="contentPromptId" @change="onPromptTableChange">
          <template #ord="text, record, index">{{ (promptPage - 1) * promptPageSize + index + 1 }}</template>
          <template #prompt="text">
            <span :title="text">{{ text && text.length > 120 ? text.substring(0, 120) + '...' : text }}</span>
          </template>
          <template #status="val">
            <a-tag :color="val === 1 ? 'green' : 'red'">{{ val === 1 ? 'Hoạt động' : 'Ẩn' }}</a-tag>
          </template>
          <template #action="record">
            <a-space>
              <a-button size="small" type="primary" icon="edit" @click="openPromptModal(true, record)">Sửa</a-button>
              <a-button size="small" type="danger" icon="delete" @click="confirmDeletePrompt(record)">Xóa</a-button>
            </a-space>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- Modal Thêm/Sửa Prompt -->
    <a-modal
      :visible="promptModalVisible"
      :title="promptIsEdit ? 'Chỉnh sửa Prompt' : 'Thêm Prompt mới'"
      :confirm-loading="promptSaving"
      ok-text="Lưu"
      cancel-text="Hủy"
      @ok="handlePromptSubmit"
      @cancel="promptModalVisible = false"
    >
      <a-form layout="vertical">
        <a-form-item label="Nội dung Prompt *">
          <a-textarea v-model="promptForm.prompt" placeholder="Nhập nội dung prompt..." :auto-size="{ minRows: 3, maxRows: 8 }" />
        </a-form-item>
        <a-form-item v-if="promptIsEdit" label="Trạng thái">
          <a-select v-model="promptForm.status" style="width:100%">
            <a-select-option :value="1">Hoạt động</a-select-option>
            <a-select-option :value="0">Ẩn</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>



    <a-modal :visible="!!previewRecord" title="Xem nội dung bài viết" width="900px" :footer="null" @cancel="previewRecord = null">
      <iframe v-if="previewRecord && previewRecord.contentUrl" :src="previewRecord.contentUrl" style="width:100%;height:70vh;border:none;border-radius:6px;" />
      <a-empty v-else description="Chưa có file nội dung" />
    </a-modal>
  </div>
</template>

<script>
import { getListPost, getPostDetail, deletePost, getPostGenerate, changeApprovalStatus, generateBlog } from "../../apis/blog";
import { getListPromptCms, createPrompt, updatePrompt, deletePrompt, getDetailPrompt } from "../../apis/prompt";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;

export default {
  layout: "adminLayout",
  middleware: "auth",
  data() {
    return {
      activeTab: "posts",
      list: [], loading: false, keyword: "", langCode: "vi", page: 1, pageSize: 10, total: 0,
      genList: [], genLoading: false, genKeyword: "", genLangCode: "vi", genPage: 1, genPageSize: 10, genTotal: 0,
      previewRecord: null,
      generatingAI: false,
      // Prompt management
      promptList: [], promptLoading: false, promptPage: 1, promptPageSize: 10, promptTotal: 0,
      promptModalVisible: false, promptIsEdit: false, promptSaving: false,
      promptForm: { contentPromptId: null, prompt: "", status: 1 },
    };
  },
  computed: {
    columns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "Ảnh", dataIndex: "imageUrl", key: "imageUrl", scopedSlots: { customRender: "imageUrl" }, width: 90 },
        { title: "Tiêu đề", dataIndex: "title", key: "title", ellipsis: true },
        { title: "Nổi bật", dataIndex: "isFeatured", key: "isFeatured", scopedSlots: { customRender: "isFeatured" }, width: 110 },
        { title: "Trạng thái", dataIndex: "status", key: "status", scopedSlots: { customRender: "status" }, width: 120 },
        { title: "Ngày tạo", dataIndex: "createdDate", key: "createdDate", scopedSlots: { customRender: "createdDate" }, width: 120 },
        { title: "Hành động", key: "action", scopedSlots: { customRender: "action" }, width: 130 },
      ];
    },
    genColumns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "Ảnh", dataIndex: "imageUrl", key: "imageUrl", scopedSlots: { customRender: "imageUrl" }, width: 90 },
        { title: "Tiêu đề", dataIndex: "title", key: "title", ellipsis: true },
        { title: "Duyệt", dataIndex: "approvalStatus", key: "approvalStatus", scopedSlots: { customRender: "approvalStatus" }, width: 120 },
        { title: "Ngày tạo", dataIndex: "createdDate", key: "createdDate", scopedSlots: { customRender: "createdDate" }, width: 120 },
        { title: "Hành động", key: "action", scopedSlots: { customRender: "action" }, width: 130 },
      ];
    },
    pagination() { return { current: this.page, pageSize: this.pageSize, total: this.total, showSizeChanger: false }; },
    genPagination() { return { current: this.genPage, pageSize: this.genPageSize, total: this.genTotal, showSizeChanger: false }; },
    promptColumns() {
      return [
        { title: "#", key: "ord", scopedSlots: { customRender: "ord" }, width: 55 },
        { title: "Nội dung Prompt", dataIndex: "prompt", key: "prompt", scopedSlots: { customRender: "prompt" } },
        { title: "Trạng thái", dataIndex: "status", key: "status", scopedSlots: { customRender: "status" }, width: 120 },
        { title: "Hành động", key: "action", scopedSlots: { customRender: "action" }, width: 180 },
      ];
    },
    promptPagination() { return { current: this.promptPage, pageSize: this.promptPageSize, total: this.promptTotal, showSizeChanger: false }; },
  },
  mounted() { this.fetchList(); },
  methods: {
    toFullUrl(url) {
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    },
    onTabChange(tab) {
      if (tab === "generated" && !this.genList.length) this.fetchGenerated();
      if (tab === "prompts" && !this.promptList.length) this.fetchPrompts();
    },
    async fetchList() {
      this.loading = true;
      try {
        const res = await getListPost({ languageCode: this.langCode, keyWord: this.keyword || undefined, currentPage: this.page, recordPerPage: this.pageSize });
        if (res && res.data) {
          const records = res.data.records || res.data.items || res.data.data || [];
          this.list = records.map((r, i) => ({ ...r, ord: (this.page - 1) * this.pageSize + i + 1 }));
          this.total = res.data.totalRecord || res.data.total || 0;
        } else { this.list = []; this.total = 0; }
      } catch { this.$message.error("Không thể tải danh sách!"); }
      finally { this.loading = false; }
    },
    onTableChange(pag) { this.page = pag.current; this.fetchList(); },
    openAdd() {
      this.$router.push({ path: '/Blog/edit', query: { lang: this.langCode } });
    },
    openEdit(record) {
      this.$router.push({ path: '/Blog/edit', query: { id: record.postId, lang: this.langCode } });
    },
    async fetchGenerated() {
      this.genLoading = true;
      try {
        const res = await getPostGenerate({ languageCode: this.genLangCode, keyWord: this.genKeyword || undefined, currentPage: this.genPage, recordPerPage: this.genPageSize });
        if (res && res.data) {
          const records = res.data.records || res.data.items || res.data.data || [];
          this.genList = records.map((r, i) => ({ ...r, ord: (this.genPage - 1) * this.genPageSize + i + 1 }));
          this.genTotal = res.data.totalRecord || res.data.total || 0;
        } else { this.genList = []; this.genTotal = 0; }
      } catch { this.$message.error("Không thể tải danh sách bài AI!"); }
      finally { this.genLoading = false; }
    },
    onGenTableChange(pag) { this.genPage = pag.current; this.fetchGenerated(); },
    openEditGen(record) {
      this.$router.push({ path: '/Blog/edit', query: { id: record.postId, lang: this.genLangCode } });
    },
    async approvePost(record, isAccepted) {
      try {
        const res = await changeApprovalStatus({ postId: record.postId, isAccepted });
        if (res && (res.responseCode === 200 || res.responseCode === 1)) {
          this.$message.success(isAccepted ? "Đã duyệt bài viết!" : "Đã từ chối bài viết!");
          this.fetchGenerated();
        } else { this.$message.error(res?.message || "Thao tác thất bại!"); }
      } catch { this.$message.error("Có lỗi, vui lòng thử lại!"); }
    },
    async openPreview(record) {
      try {
        const lc = this.activeTab === "generated" ? this.genLangCode : this.langCode;
        const res = await getPostDetail(record.postId, lc);
        const d = res && res.data ? res.data : {};
        this.previewRecord = { ...d, contentUrl: this.toFullUrl(d.content) };
      } catch { this.$message.error("Không thể tải nội dung!"); }
    },
    confirmDelete(record) {
      this.$confirm({
        title: "Xác nhận xóa",
        content: `Xóa bài viết "${record.title}"?`,
        okText: "Xóa", okType: "danger", cancelText: "Hủy",
        onOk: async () => {
          try {
            await deletePost(record.postId);
            this.$message.success("Đã xóa!");
            this.activeTab === "generated" ? this.fetchGenerated() : this.fetchList();
          } catch { this.$message.error("Xóa thất bại!"); }
        },
      });
    },
    async handleGenerateBlog() {
      this.generatingAI = true;
      try {
        const res = await generateBlog();
        if (res && (res.responseCode === 200 || res.responseCode === 1)) {
          this.$message.success("Tạo bài AI thành công!");
        } else {
          this.$message.success("Tạo bài AI thành công!");
        }
        this.fetchGenerated();
      } catch { this.$message.error("Tạo bài AI thất bại, vui lòng thử lại!"); }
      finally { this.generatingAI = false; }
    },
    // Prompt management
    async fetchPrompts() {
      this.promptLoading = true;
      try {
        const res = await getListPromptCms({ currentPage: this.promptPage, recordPerPage: this.promptPageSize });
        if (res && res.data) {
          this.promptList = res.data.records || res.data.items || res.data || [];
          this.promptTotal = res.data.totalRecord || res.data.total || 0;
        } else { this.promptList = []; this.promptTotal = 0; }
      } catch { this.$message.error("Không thể tải danh sách prompt!"); }
      finally { this.promptLoading = false; }
    },
    onPromptTableChange(pag) { this.promptPage = pag.current; this.fetchPrompts(); },
    openPromptModal(isEdit, record) {
      this.promptIsEdit = isEdit;
      if (isEdit && record) {
        this.promptForm = {
          contentPromptId: record.contentPromptId,
          prompt: record.prompt || "",
          status: record.status !== undefined ? record.status : 1,
        };
      } else {
        this.promptForm = { contentPromptId: null, prompt: "", status: 1 };
      }
      this.promptModalVisible = true;
    },
    async handlePromptSubmit() {
      if (!this.promptForm.prompt || !this.promptForm.prompt.trim()) {
        this.$message.warning("Vui lòng nhập nội dung prompt!");
        return;
      }
      this.promptSaving = true;
      try {
        let res;
        if (this.promptIsEdit) {
          res = await updatePrompt({
            contentPromptId: this.promptForm.contentPromptId,
            prompt: this.promptForm.prompt.trim(),
            status: this.promptForm.status,
          });
        } else {
          res = await createPrompt({ prompt: this.promptForm.prompt.trim() });
        }
        if (res && (res.responseCode === 200 || res.responseCode === 1)) {
          this.$message.success(this.promptIsEdit ? "Cập nhật prompt thành công!" : "Thêm prompt thành công!");
          this.promptModalVisible = false;
          this.fetchPrompts();
        } else {
          this.$message.error(res?.message || "Thao tác thất bại!");
        }
      } catch { this.$message.error("Có lỗi xảy ra, vui lòng thử lại!"); }
      finally { this.promptSaving = false; }
    },
    confirmDeletePrompt(record) {
      this.$confirm({
        title: "Xác nhận xóa",
        content: `Xóa prompt này?`,
        okText: "Xóa", okType: "danger", cancelText: "Hủy",
        onOk: async () => {
          try {
            const res = await deletePrompt(record.contentPromptId);
            if (res && (res.responseCode === 200 || res.responseCode === 1)) {
              this.$message.success("Đã xóa prompt!");
              this.fetchPrompts();
            } else {
              this.$message.error(res?.message || "Xóa thất bại!");
            }
          } catch { this.$message.error("Xóa prompt thất bại!"); }
        },
      });
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return isNaN(d) ? dateStr : d.toLocaleDateString("vi-VN");
    },
  },
};
</script>

<style scoped>
.blog-page { padding: 0; }
.blog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}
.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.img-cell {
  width: 64px;
  height: 44px;
  overflow: hidden;
  border-radius: 10px;
  background: linear-gradient(135deg, #f0f4ff, #faf5ff);
}
.post-img { width: 100%; height: 100%; object-fit: cover; }
.no-img {
  color: #c7d2fe;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>