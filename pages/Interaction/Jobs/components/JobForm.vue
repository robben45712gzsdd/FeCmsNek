<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? 'Chỉnh sửa tin tuyển dụng' : 'Thêm tin tuyển dụng'"
    :width="jdMode === 'editor' ? 960 : 700"
    :confirm-loading="saving"
    ok-text="Lưu"
    cancel-text="Hủy"
    :body-style="{ maxHeight: '80vh', overflowY: 'auto' }"
    @ok="handleSave"
    @cancel="$emit('close')"
  >
    <a-form-model ref="form" :model="form" :rules="rules" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item label="Ngôn ngữ" prop="languageCode">
            <a-select v-model="form.languageCode">
              <a-select-option value="vi">Tiếng Việt</a-select-option>
              <a-select-option value="us">English</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="Danh mục" prop="categoryId">
            <a-select v-model="form.categoryId" placeholder="Chọn danh mục" :loading="loadingCategories" allow-clear>
              <a-select-option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">{{ c.categoryName }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item label="vị trí" prop="position">
            <a-input v-model="form.position" placeholder="VD: Frontend Developer" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="Kinh nghiệm" prop="YearOfExperience">
            <a-input v-model="form.YearOfExperience" placeholder="VD: 2 năm" />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item label="Đại điểm" prop="location">
            <a-input v-model="form.location" placeholder="VD: Hà N�Ti" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="Mức lương" prop="salary">
            <a-input v-model="form.salary" placeholder="VD: 15 - 20 triệu" />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-model-item label="Ngày bắt đầu" prop="startDate">
            <a-date-picker v-model="form.startDate" style="width:100%" format="DD/MM/YYYY" />
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item label="Ngày kết thúc" prop="endDate">
            <a-date-picker v-model="form.endDate" style="width:100%" format="DD/MM/YYYY" />
          </a-form-model-item>
        </a-col>
        <a-col v-if="isEdit" :span="8">
          <a-form-model-item label="Trạng thái" prop="status">
            <a-select v-model="form.status">
              <a-select-option :value="1">Hiển thị</a-select-option>
              <a-select-option :value="0">Ẩn</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>

      <!-- Logo upload -->
      <a-form-model-item label="Logo công ty (tùy chọn)">
        <label class="upload-btn">
          <a-icon type="picture" /> Chọn logo
          <input ref="logoInput" type="file" accept="image/*" class="file-input-hidden" @change="onLogoChange" />
        </label>
        <div v-if="logoPreview" class="preview-wrap">
          <img :src="logoPreview" class="preview-img" />
          <a-button size="small" type="link" style="color:#ff4d4f" @click="clearLogo">Xóa</a-button>
        </div>
      </a-form-model-item>

      <!-- JD Content: mode switch -->
      <a-form-model-item>
        <template #label>
          <div class="content-label-row">
            <span>Mô tả công việc (JD)</span>
            <a-radio-group v-model="jdMode" size="small" button-style="solid" class="mode-switch">
              <a-radio-button value="file"><a-icon type="file-text" /> Upload file</a-radio-button>
              <a-radio-button value="editor"><a-icon type="edit" /> Soạn trực tiếp</a-radio-button>
            </a-radio-group>
          </div>
        </template>

        <!-- MODE: File upload -->
        <div v-if="jdMode === 'file'">
          <a-upload :before-upload="onJdSelect" :show-upload-list="false" accept=".html,.htm">
            <a-button><a-icon type="upload" /> {{ jdFile ? jdFile.name : 'Chọn file JD (HTML)' }}</a-button>
          </a-upload>
          <div v-if="isEdit && form.content && !jdFile" style="margin-top:8px">
            <a-button size="small" type="primary" ghost @click="previewCurrentJd"><a-icon type="eye" /> Xem JD hi�?n tại</a-button>
          </div>
        </div>

        <!-- MODE: Rich text editor -->
        <div v-else>
          <RichTextEditor v-model="jdEditorContent" :height="380" placeholder="Soạn mô tả công việc..." />
          <div v-if="isEdit && form.content && !jdEditorContent" class="hint" style="margin-top:8px">
            <a-icon type="info-circle" style="color:#fa8c16;margin-right:4px;" />
            Tin �'ã có file JD. Soạn Nội dung mới sẽ thay thế file cũ.
          </div>
        </div>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import moment from "moment";
import axios from "axios";
import { createJob, updateJob, getCareerCategoryList } from "../../../../apis/interaction";
import RichTextEditor from "@/components/RichTextEditor/index.vue";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;

function defaultForm(languageCode) {
  return {
    languageCode: languageCode || "vi",
    categoryId: undefined,
    position: "",
    YearOfExperience: "",
    location: "",
    salary: "",
    startDate: null,
    endDate: null,
    status: 1,
    content: null,
    jobId: null,
  };
}

export default {
  components: { RichTextEditor },
  props: {
    visible: Boolean,
    isEdit: Boolean,
    record: Object,
    languageCode: { type: String, default: "vi" },
  },
  data() {
    return {
      form: defaultForm(this.languageCode),
      saving: false,
      jdFile: null,
      jdMode: "file",
      jdEditorContent: "",
      logoFile: null,
      logoPreview: null,
      categories: [],
      loadingCategories: false,
      rules: {
        position: [{ required: true, message: "Nhập vị trí!" }],
        startDate: [{ required: true, message: "Chọn ngày bắt đầu!" }],
        endDate: [{ required: true, message: "Chọn ngày kết thúc!" }],
      },
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.jdFile = null;
        this.jdEditorContent = "";
        this.jdMode = "file";
        this.clearLogo();
        this.loadCategories();
        if (this.isEdit && this.record) {
          const r = this.record;
          const parseDate = (d) => (d ? moment(d) : null);
          this.form = {
            languageCode: this.languageCode,
            jobId: r.jobId,
            categoryId: r.categoryId || undefined,
            position: r.position || "",
            YearOfExperience: r.YearOfExperience || "",
            location: r.location || "",
            salary: r.salary || "",
            startDate: parseDate(r.startDate),
            endDate: parseDate(r.endDate),
            status: r.status ?? 1,
            content: r.content || null,
          };
          if (r.logoUrl) {
            this.logoPreview = this.toFullUrl(r.logoUrl);
          }
        } else {
          this.form = defaultForm(this.languageCode);
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      }
    },
  },
  methods: {
    toFullUrl(url) {
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    },
    async loadCategories() {
      this.loadingCategories = true;
      try {
        const res = await getCareerCategoryList(this.form.languageCode);
        this.categories = res && res.data ? res.data : [];
      } catch {
        this.categories = [];
      } finally {
        this.loadingCategories = false;
      }
    },
    onJdSelect(file) {
      this.jdFile = file;
      return false;
    },
    onLogoChange(e) {
      const f = e.target.files[0];
      if (!f) return;
      this.logoFile = f;
      this.logoPreview = URL.createObjectURL(f);
    },
    clearLogo() {
      this.logoFile = null;
      this.logoPreview = null;
      if (this.$refs.logoInput) this.$refs.logoInput.value = "";
    },
    /** Convert editor HTML to a File for upload */
    editorToFile() {
      if (!this.jdEditorContent || !this.jdEditorContent.trim()) return null;
      const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.form.position || "Job Description"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.7; color: #334155; padding: 40px 24px; margin: 0 auto; }
    a { color: #6366f1; }
    h1, h2, h3 { color: #0f172a; margin: 24px 0 12px; }
    ul, ol { padding-left: 24px; margin: 8px 0; }
    li { margin-bottom: 4px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    table td, table th { border: 1px solid #e2e8f0; padding: 8px 12px; }
  </style>
</head>
<body>
${this.jdEditorContent}
</body>
</html>`;
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      return new File([blob], `${(this.form.position || "jd").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.html`, { type: "text/html" });
    },
    async previewCurrentJd() {
      if (!this.form.content) return;
      try {
        const url = this.toFullUrl(this.form.content);
        const resp = await axios.get(url, { responseType: "text" });
        let html = resp.data;
        if (!/<meta[^>]+charset/i.test(html)) {
          html = html.replace(/<head[^>]*>/i, (m) => m + '<meta charset="utf-8">');
          if (!/<head/i.test(html)) html = '<meta charset="utf-8">' + html;
        }
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch {
        this.$message.error("Không th�f tải file JD!");
      }
    },
    handleSave() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;

        // Determine JD file
        let finalJdFile = null;
        if (this.jdMode === "editor") {
          finalJdFile = this.editorToFile();
        } else {
          finalJdFile = this.jdFile || null;
        }

        // For new job: need at least some JD content
        if (!this.isEdit && !finalJdFile) {
          this.$message.warning("Vui lòng tạo Nội dung JD (upload file hoặc soạn trực tiếp)!");
          return;
        }

        this.saving = true;
        try {
          const toISO = (m) => (m ? (m.toISOString ? m.toISOString() : m) : undefined);
          if (this.isEdit) {
            const params = {
              languageCode: this.form.languageCode,
              jobId: this.form.jobId,
              categoryId: this.form.categoryId,
              position: this.form.position,
              YearOfExperience: this.form.YearOfExperience,
              location: this.form.location,
              salary: this.form.salary,
              startDate: toISO(this.form.startDate),
              endDate: toISO(this.form.endDate),
              status: this.form.status,
            };
            await updateJob(params, finalJdFile);
          } else {
            const params = {
              languageCode: this.form.languageCode,
              categoryId: this.form.categoryId,
              position: this.form.position,
              YearOfExperience: this.form.YearOfExperience,
              location: this.form.location,
              salary: this.form.salary,
              startDate: toISO(this.form.startDate),
              endDate: toISO(this.form.endDate),
            };
            await createJob(params, finalJdFile);
          }
          this.$message.success("Lưu thành công!");
          this.$emit("saved");
          this.$emit("close");
        } catch {
          this.$message.error("Có lỗi, vui lòng thử lại!");
        } finally {
          this.saving = false;
        }
      });
    },
  },
};
</script>

<style scoped>
.content-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.mode-switch {
  margin-left: auto;
}
.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px dashed #c7d2fe;
  border-radius: 10px;
  cursor: pointer;
  color: #6366f1;
  font-size: 13px;
  font-weight: 600;
  background: #faf5ff;
  transition: all 0.2s;
}
.upload-btn:hover {
  background: #eef2ff;
  border-color: #6366f1;
}
.file-input-hidden {
  display: none;
}
.preview-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.preview-img {
  width: 64px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.hint {
  font-size: 12px;
  color: #94a3b8;
}
</style>
