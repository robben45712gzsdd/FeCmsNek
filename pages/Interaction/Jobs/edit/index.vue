<template>
  <div class="job-edit-page">
    <div class="page-top">
      <a-button type="link" class="btn-back" @click="goBack">
        <a-icon type="arrow-left" /> Quay lại
      </a-button>
      <h2 class="page-title">{{ isEdit ? "Chỉnh sửa tin tuyển dụng" : "Thêm tin tuyển dụng" }}</h2>
    </div>

    <a-spin :spinning="loadingDetail">
      <div class="form-card">
        <a-form-model ref="form" :model="form" :rules="rules" layout="vertical">
          <!-- Row 1: Ngôn ngữ + Danh mục -->
          <a-row :gutter="20">
            <a-col :span="8">
              <a-form-model-item label="Ngôn ngữ" prop="languageCode">
                <a-select v-model="form.languageCode" @change="onLanguageChange">
                  <a-select-option value="vi">Tiếng Việt</a-select-option>
                  <a-select-option value="us">English</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="Danh mục" prop="categoryId">
                <a-select v-model="form.categoryId" placeholder="Chọn danh mục" :loading="loadingCategories" allow-clear>
                  <a-select-option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">{{ c.categoryName }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="vị trí *" prop="position">
                <a-input v-model="form.position" placeholder="VD: Frontend Developer" />
              </a-form-model-item>
            </a-col>
          </a-row>

          <!-- Row 2 -->
          <a-row :gutter="20">
            <a-col :span="8">
              <a-form-model-item label="Kinh nghiệm" prop="YearOfExperience">
                <a-input v-model="form.YearOfExperience" placeholder="VD: 2 năm" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="Đại điểm" prop="location">
                <a-input v-model="form.location" placeholder="VD: Hà N�Ti" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="Mức lương" prop="salary">
                <a-input v-model="form.salary" placeholder="VD: 15 - 20 triệu" />
              </a-form-model-item>
            </a-col>
          </a-row>

          <!-- Row 3: Ngày + Trạng thái -->
          <a-row :gutter="20">
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
              <label class="upload-btn">
                <a-icon type="file-text" /> Chọn file JD (HTML)
                <input ref="jdInput" type="file" accept=".html,.htm" class="file-input-hidden" @change="onJdChange" />
              </label>
              <div v-if="jdFileName" class="file-name-tag">
                <a-icon type="file-text" /> {{ jdFileName }}
                <a-button size="small" type="link" style="color:#ff4d4f" @click="clearJd">Xóa</a-button>
              </div>
              <div v-if="isEdit && form.content && !jdFileName" class="file-name-tag existing">
                <a-icon type="file-text" style="color:#2f54eb" />
                <span style="flex:1;font-size:12px;color:#2f54eb;">File JD hi�?n tại</span>
                <a-button size="small" type="link" @click="previewCurrentJd">Xem</a-button>
              </div>
            </div>

            <!-- MODE: Rich text editor -->
            <div v-else>
              <RichTextEditor v-model="jdEditorContent" :height="700" placeholder="Soạn mô tả công việc..." />
              <div v-if="isEdit && form.content && !jdEditorContent" class="hint" style="margin-top:8px">
                <a-icon type="info-circle" style="color:#fa8c16;margin-right:4px;" />
                Tin �'ã có file JD. Soạn Nội dung m�>i sẽ thay thế file cũ.
              </div>
            </div>
          </a-form-model-item>
        </a-form-model>

        <!-- Actions -->
        <div class="form-actions">
          <a-button @click="goBack">Hủy</a-button>
          <a-button type="primary" :loading="saving" @click="handleSave">
            <a-icon type="save" /> {{ isEdit ? "Cập nhật" : "Tạo tin tuyển dụng" }}
          </a-button>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";
import {
  getJobDetailCms,
  createJob,
  updateJob,
  getCareerCategoryList,
} from "../../../../apis/interaction";
import RichTextEditor from "@/components/RichTextEditor/index.vue";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;

export default {
  layout: "adminLayout",
  middleware: "auth",
  components: { RichTextEditor },
  data() {
    return {
      isEdit: false,
      loadingDetail: false,
      saving: false,
      form: {
        languageCode: "vi",
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
      },
      rules: {
        position: [{ required: true, message: "Nhập vị trí!" }],
        startDate: [{ required: true, message: "Chọn ngày bắt đầu!" }],
        endDate: [{ required: true, message: "Chọn ngày kết thúc!" }],
      },
      jdFile: null,
      jdFileName: null,
      jdMode: "editor",
      jdEditorContent: "",
      logoFile: null,
      logoPreview: null,
      categories: [],
      loadingCategories: false,
    };
  },
  async mounted() {
    const { id, lang } = this.$route.query;
    if (lang) this.form.languageCode = lang;
    this.loadCategories();
    if (id) {
      this.isEdit = true;
      this.form.jobId = id;
      await this.fetchDetail();
    }
  },
  methods: {
    goBack() {
      this.$router.push("/Interaction/Jobs");
    },
    async fetchDetail() {
      if (!this.form.jobId) return;
      this.loadingDetail = true;
      // Reset content
      this.jdEditorContent = "";
      this.jdFile = null;
      this.jdFileName = null;
      this.logoFile = null;
      this.logoPreview = null;
      try {
        const res = await getJobDetailCms(this.form.languageCode, this.form.jobId);
        if (res && res.data) {
          const r = res.data;
          const parseDate = (d) => (d ? moment(d) : null);
          this.form = {
            languageCode: this.form.languageCode,
            jobId: this.form.jobId,
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
          // Fetch Nội dung JD HTML hi�?n tại vào editor
          if (r.content) {
            try {
              const url = this.toFullUrl(r.content);
              const resp = await axios.get(url, { responseType: "text" });
              let html = resp.data || "";
              const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
              this.jdEditorContent = bodyMatch ? bodyMatch[1].trim() : html;
              this.jdMode = "editor";
            } catch {
              this.jdMode = "file";
            }
          }
        }
      } catch {
        this.$message.error("Không th�f tải dữ li�?u tin tuyển dụng!");
      } finally {
        this.loadingDetail = false;
      }
    },
    onLanguageChange() {
      this.loadCategories();
      if (this.isEdit) {
        this.fetchDetail();
      }
    },
    toFullUrl(url) {
      if (!url) return "";
      return /^https?:\/\//i.test(url)
        ? url
        : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
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
    onJdChange(e) {
      const f = e.target.files[0];
      if (!f) return;
      this.jdFile = f;
      this.jdFileName = f.name;
    },
    clearJd() {
      this.jdFile = null;
      this.jdFileName = null;
      if (this.$refs.jdInput) this.$refs.jdInput.value = "";
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
      return new File(
        [blob],
        `${(this.form.position || "jd").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.html`,
        { type: "text/html" }
      );
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

        let finalJdFile = null;
        if (this.jdMode === "editor") {
          finalJdFile = this.editorToFile();
        } else {
          finalJdFile = this.jdFile || null;
        }

        if (!this.isEdit && !finalJdFile) {
          this.$message.warning(
            "Vui lòng tạo Nội dung JD (upload file hoặc soạn trực tiếp)!"
          );
          return;
        }

        this.saving = true;
        try {
          const toISO = (m) =>
            m ? (m.toISOString ? m.toISOString() : m) : undefined;
          if (this.isEdit) {
            await updateJob(
              {
                LanguageCode: this.form.languageCode,
                JobId: this.form.jobId,
                CategoryId: this.form.categoryId,
                position: this.form.position,
                YearOfExperience: this.form.YearOfExperience,
                Location: this.form.location,
                Salary: this.form.salary,
                StartDate: toISO(this.form.startDate),
                EndDate: toISO(this.form.endDate),
                Status: this.form.status,
              },
              finalJdFile
            );
            this.$message.success("Cập nhật thành công!");
          } else {
            await createJob(
              {
                languageCode: this.form.languageCode,
                categoryId: this.form.categoryId,
                position: this.form.position,
                YearOfExperience: this.form.YearOfExperience,
                location: this.form.location,
                salary: this.form.salary,
                startDate: toISO(this.form.startDate),
                endDate: toISO(this.form.endDate),
              },
              finalJdFile
            );
            this.$message.success("Tạo tin tuyển dụng thành công!");
          }
          this.goBack();
        } catch {
          this.$message.error("Có l�-i, vui lòng thử lại!");
        } finally {
          this.saving = false;
        }
      });
    },
  },
};
</script>

<style scoped>
.job-edit-page {
  padding: 0;
  max-width: auto;
  margin: 0 auto;
}
.page-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
.btn-back {
  padding: 0;
  font-size: 14px;
  color: #6366f1;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.form-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(99, 102, 241, 0.06);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}
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
.file-name-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #eef2ff, #f5f3ff);
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
}
.file-name-tag.existing {
  background: #f0f5ff;
  border-color: #adc6ff;
}
.hint {
  font-size: 12px;
  color: #94a3b8;
}
</style>
