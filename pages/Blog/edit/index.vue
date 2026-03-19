<template>
  <div class="blog-edit-page">
    <div class="page-top">
      <a-button type="link" class="btn-back" @click="goBack">
        <a-icon type="arrow-left" /> Quay lại
      </a-button>
      <h2 class="page-title">{{ isEdit ? "Chỉnh sửa bài viết" : "Thêm bài viết m�>i" }}</h2>
    </div>

    <a-spin :spinning="loadingDetail">
      <div class="form-card">
        <a-form layout="vertical">
          <!-- Row 1: Ngôn ngữ + Tiêu đề -->
          <a-row :gutter="20">
            <a-col :span="6">
              <a-form-item label="Ngôn ngữ">
                <a-select v-model="form.languageCode" style="width:100%" @change="onLanguageChange">
                  <a-select-option value="vi">Tiếng Việt</a-select-option>
                  <a-select-option value="us">English</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="18">
              <a-form-item label="Tiêu đề *">
                <a-input v-model="form.title" placeholder="Nhập tiêu đề bài viết..." size="large" />
                <div v-if="errors.title" class="err">{{ errors.title }}</div>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- Row 2: Loại bài / Nổi bật / Trạng thái -->
          <a-row :gutter="20">
            <a-col :span="8">
              <a-form-item label="Loại bài viết">
                <a-select v-model="form.postType" style="width:100%">
                  <a-select-option :value="1">Blog</a-select-option>
                  <a-select-option :value="2">Tin tức</a-select-option>
                  <a-select-option :value="3">Thông báo</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="Nổi bật">
                <a-select v-model="form.isFeatured" style="width:100%">
                  <a-select-option :value="0">Thường</a-select-option>
                  <a-select-option :value="1">Nổi bật</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col v-if="isEdit" :span="8">
              <a-form-item label="Trạng thái">
                <a-select v-model="form.status" style="width:100%">
                  <a-select-option :value="1">Hiển thị</a-select-option>
                  <a-select-option :value="0">Ẩn</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- Ảnh thumbnail -->
          <a-form-item label="Ảnh thumbnail (tùy chọn)">
            <label class="upload-btn">
              <a-icon type="picture" /> Chọn ảnh
              <input ref="imageInput" type="file" accept="image/*" class="file-input-hidden" @change="onImageChange" />
            </label>
            <div v-if="imagePreview" class="preview-wrap">
              <img :src="imagePreview" class="preview-img" />
              <a-button size="small" type="link" style="color:#ff4d4f" @click="clearImage">Xóa</a-button>
            </div>
          </a-form-item>

          <!-- Nội dung: chọn chế �'�T -->
          <a-form-item>
            <template #label>
              <div class="content-label-row">
                <span>Nội dung bài viết</span>
                <a-radio-group v-model="contentMode" size="small" button-style="solid" class="mode-switch">
                  <a-radio-button value="file"><a-icon type="file-text" /> Upload file</a-radio-button>
                  <a-radio-button value="editor"><a-icon type="edit" /> Soạn trực tiếp</a-radio-button>
                </a-radio-group>
              </div>
            </template>

            <!-- MODE: File upload -->
            <div v-if="contentMode === 'file'">
              <label class="upload-btn">
                <a-icon type="file-text" /> Chọn file HTML
                <input ref="contentInput" type="file" accept=".html,.htm" class="file-input-hidden" @change="onContentChange" />
              </label>
              <div v-if="contentFileName" class="file-name-tag">
                <a-icon type="file-text" /> {{ contentFileName }}
                <a-button size="small" type="link" style="color:#ff4d4f" @click="clearContent">Xóa</a-button>
              </div>
              <div v-if="contentPreviewUrl && !contentFileName" class="file-name-tag existing">
                <a-icon type="file-text" style="color:#2f54eb" />
                <span style="flex:1;font-size:12px;color:#2f54eb;">File HTML hi�?n tại</span>
                <a-button size="small" type="link" :href="contentPreviewUrl" target="_blank">M�Y tab</a-button>
              </div>
              <div class="hint">
                <a-icon type="info-circle" style="color:#6366f1;margin-right:4px;" />
                Upload file HTML �'ã xuất từ công cụ bên ngoài.
              </div>
            </div>

            <!-- MODE: Rich text editor -->
            <div v-else>
              <RichTextEditor v-model="editorContent" :height="700" placeholder="Soạn Nội dung bài viết..." />
              <div v-if="isEdit && contentPreviewUrl && !editorContent" class="hint" style="margin-top:8px">
                <a-icon type="info-circle" style="color:#fa8c16;margin-right:4px;" />
                Bài viết �'ã có file HTML. Soạn Nội dung m�>i sẽ thay thế file cũ.
              </div>
            </div>
          </a-form-item>
        </a-form>

        <!-- Actions -->
        <div class="form-actions">
          <a-button @click="goBack">Hủy</a-button>
          <a-button type="primary" :loading="saving" @click="handleSubmit">
            <a-icon type="save" /> {{ isEdit ? "Cập nhật" : "Tạo bài viết" }}
          </a-button>
        </div>
      </div>
    </a-spin>

  </div>
</template>

<script>
import axios from "axios";
import { getPostDetail, createPost, updatePost } from "../../../apis/blog";
import RichTextEditor from "@/components/RichTextEditor/index.vue";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;
const toFull = (url) =>
  !url
    ? null
    : /^https?:\/\//i.test(url)
    ? url
    : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");

export default {
  layout: "adminLayout",
  middleware: "auth",
  components: { RichTextEditor },
  data() {
    return {
      isEdit: false,
      loadingDetail: false,
      saving: false,
      errors: {},
      form: {
        languageCode: "vi",
        title: "",
        postType: 1,
        isFeatured: 0,
        status: 1,
        postId: null,
      },
      imageFile: null,
      imagePreview: null,
      contentFile: null,
      contentFileName: null,
      contentPreviewUrl: null,
      contentMode: "editor",
      editorContent: "",
    };
  },
  async mounted() {
    const { id, lang, aiContent } = this.$route.query;
    if (lang) this.form.languageCode = lang;
    if (id) {
      this.isEdit = true;
      this.form.postId = id;
      await this.fetchDetail();
    }
    // If navigated with AI content from Blog index modal
    if (aiContent) {
      this.editorContent = aiContent;
      this.contentMode = "editor";
    }
  },
  methods: {
    goBack() {
      this.$router.push("/Blog");
    },
    async fetchDetail() {
      if (!this.form.postId) return;
      this.loadingDetail = true;
      // Reset content
      this.editorContent = "";
      this.contentFile = null;
      this.contentFileName = null;
      this.contentPreviewUrl = null;
      this.imageFile = null;
      this.imagePreview = null;
      try {
        const res = await getPostDetail(this.form.postId, this.form.languageCode);
        if (res && res.data) {
          const d = res.data;
          this.form = {
            postId: this.form.postId,
            languageCode: this.form.languageCode,
            title: d.title || "",
            postType: d.postType || 1,
            isFeatured: d.isFeatured || 0,
            status: d.status !== undefined ? d.status : 1,
          };
          this.imagePreview = toFull(d.imageUrl) || null;
          this.contentPreviewUrl = toFull(d.content) || null;

          // Fetch Nội dung HTML hi�?n tại vào editor
          if (this.contentPreviewUrl) {
            try {
              const resp = await axios.get(this.contentPreviewUrl, { responseType: "text" });
              let html = resp.data || "";
              const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
              this.editorContent = bodyMatch ? bodyMatch[1].trim() : html;
              this.contentMode = "editor";
            } catch {
              this.contentMode = "file";
            }
          }
        }
      } catch {
        this.$message.error("Không th�f tải dữ li�?u bài viết!");
      } finally {
        this.loadingDetail = false;
      }
    },
    onLanguageChange() {
      if (this.isEdit) {
        this.fetchDetail();
      }
    },
    onImageChange(e) {
      const f = e.target.files[0];
      if (!f) return;
      this.imageFile = f;
      this.imagePreview = URL.createObjectURL(f);
    },
    clearImage() {
      this.imageFile = null;
      this.imagePreview = null;
      if (this.$refs.imageInput) this.$refs.imageInput.value = "";
    },
    onContentChange(e) {
      const f = e.target.files[0];
      if (!f) return;
      this.contentFile = f;
      this.contentFileName = f.name;
    },
    clearContent() {
      this.contentFile = null;
      this.contentFileName = null;
      if (this.$refs.contentInput) this.$refs.contentInput.value = "";
    },
    editorToFile() {
      if (!this.editorContent || !this.editorContent.trim()) return null;
      const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.form.title || "Blog Post"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.7; color: #334155; padding: 40px 24px; margin: 0 auto; }
    a { color: #6366f1; }
    h1, h2, h3 { color: #0f172a; margin: 24px 0 12px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    table td, table th { border: 1px solid #e2e8f0; padding: 8px 12px; }
    blockquote { border-left: 3px solid #6366f1; padding-left: 16px; color: #64748b; margin: 16px 0; }
  </style>
</head>
<body>
${this.editorContent}
</body>
</html>`;
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      return new File(
        [blob],
        `${(this.form.title || "post").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.html`,
        { type: "text/html" }
      );
    },
    validate() {
      this.errors = {};
      if (!this.form.title || !this.form.title.trim())
        this.errors.title = "Vui lòng nhập tiêu đề";
      return Object.keys(this.errors).length === 0;
    },
    async handleSubmit() {
      if (!this.validate()) return;
      let finalContentFile = null;
      if (this.contentMode === "editor") {
        finalContentFile = this.editorToFile();
      } else {
        finalContentFile = this.contentFile || null;
      }
      this.saving = true;
      try {
        if (this.isEdit) {
          const res = await updatePost(
            {
              languageCode: this.form.languageCode,
              postId: this.form.postId,
              title: this.form.title,
              postType: this.form.postType,
              isFeatured: this.form.isFeatured,
              status: this.form.status,
            },
            finalContentFile,
            this.imageFile || null
          );
          if (res && (res.responseCode === 200 || res.responseCode === 1)) {
            this.$message.success("Cập nhật thành công!");
            this.goBack();
          } else {
            this.$message.error(res?.message || "Cập nhật thất bại!");
          }
        } else {
          const res = await createPost(
            {
              languageCode: this.form.languageCode,
              title: this.form.title,
              postType: this.form.postType,
              isFeatured: this.form.isFeatured,
            },
            finalContentFile,
            this.imageFile || null
          );
          if (res && (res.responseCode === 200 || res.responseCode === 1)) {
            this.$message.success("Thêm bài viết thành công!");
            this.goBack();
          } else {
            this.$message.error(res?.message || "Thêm thất bại!");
          }
        }
      } catch {
        this.$message.error("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.blog-edit-page {
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
  width: 100px;
  height: 68px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
}
.err {
  color: #ef4444;
  font-size: 12px;
  margin-top: 2px;
}
</style>
