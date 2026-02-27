<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? 'Chỉnh sửa bài viết' : 'Thêm bài viết'"
    :confirm-loading="loading"
    width="680px"
    ok-text="Lưu"
    cancel-text="Hủy"
    @ok="handleSubmit"
    @cancel="$emit('close')"
  >
    <a-form layout="vertical">
      <!-- Ngôn ngữ + Tiêu đề -->
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="Ngôn ngữ">
            <a-select v-model="form.languageCode" style="width:100%">
              <a-select-option value="vi">Tiếng Việt</a-select-option>
              <a-select-option value="en">English</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="16">
          <a-form-item label="Tiêu đề *">
            <a-input v-model="form.title" placeholder="Nhập tiêu đề..." />
            <div v-if="errors.title" class="err">{{ errors.title }}</div>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Loại bài / Nổi bật -->
      <a-row :gutter="16">
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

      <!-- File HTML nội dung -->
      <a-form-item label="Nội dung — file HTML">
        <label class="upload-btn">
          <a-icon type="file-text" /> Chọn file HTML
          <input ref="contentInput" type="file" accept=".html,.htm" class="file-input-hidden" @change="onContentChange" />
        </label>
        <div v-if="contentFileName" class="file-name-tag">
          <a-icon type="file-text" /> {{ contentFileName }}
          <a-button size="small" type="link" style="color:#ff4d4f" @click="clearContent">Xóa</a-button>
        </div>
        <!-- File HTML hiện tại (khi edit, chưa chọn file mới) -->
        <div v-if="contentPreviewUrl && !contentFileName" class="file-name-tag" style="background:#f0f5ff;border-color:#adc6ff;">
          <a-icon type="file-text" style="color:#2f54eb" />
          <span style="flex:1;font-size:12px;color:#2f54eb;">File HTML hiện tại</span>
          <a-button size="small" type="link" @click="showContentPreview = true">👁 Xem</a-button>
          <a-button size="small" type="link" :href="contentPreviewUrl" target="_blank">🔗 Mở tab</a-button>
        </div>
        <div class="hint">
          <a-icon type="info-circle" style="color:#6366f1;margin-right:4px;" />
          Dùng <nuxt-link to="/CaseStudyEditor" target="_blank">Case Study Editor</nuxt-link> để xuất HTML rồi upload.
        </div>
      </a-form-item>
    </a-form>

    <!-- Modal preview nội dung HTML -->
    <a-modal
      :visible="showContentPreview"
      title="Xem nội dung HTML"
      width="900px"
      :footer="null"
      @cancel="showContentPreview = false"
    >
      <iframe
        v-if="showContentPreview"
        :src="contentPreviewUrl"
        style="width:100%;height:70vh;border:none;border-radius:6px;"
      />
    </a-modal>
  </a-modal>
</template>

<script>
import { createPost, updatePost } from "../../../apis/blog";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL || "https://ldapiv2.neksolution.com";
const toFull = (url) => !url ? null : /^https?:\/\//i.test(url) ? url : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");

export default {
  name: "BlogForm",
  props: {
    visible: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false },
    record: { type: Object, default: null },
    languageCode: { type: String, default: "vi" },
  },
  data() {
    return {
      loading: false,
      errors: {},
      form: this.defaultForm(),
      imageFile: null,
      imagePreview: null,
      contentFile: null,
      contentFileName: null,
      contentPreviewUrl: null,
      showContentPreview: false,
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.errors = {};
        this.clearImage();
        this.clearContent();
        if (this.isEdit && this.record) {
          this.form = {
            postId: this.record.postId,
            languageCode: this.languageCode,
            title: this.record.title || "",
            postType: this.record.postType || 1,
            isFeatured: this.record.isFeatured || 0,
            status: this.record.status !== undefined ? this.record.status : 1,
          };
          this.imagePreview = toFull(this.record.imageUrl) || null;
          this.contentPreviewUrl = toFull(this.record.content) || null;
        } else {
          this.form = this.defaultForm();
          this.form.languageCode = this.languageCode;
        }
      }
    },
  },
  methods: {
    defaultForm() {
      return { languageCode: this.languageCode || "vi", title: "", postType: 1, isFeatured: 0, status: 1 };
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
    validate() {
      this.errors = {};
      if (!this.form.title || !this.form.title.trim()) this.errors.title = "Vui lòng nhập tiêu đề";
      return Object.keys(this.errors).length === 0;
    },
    async handleSubmit() {
      if (!this.validate()) return;
      this.loading = true;
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
            this.contentFile || null,
            this.imageFile || null
          );
          if (res && (res.responseCode === 200 || res.responseCode === 1)) {
            this.$message.success("Cập nhật thành công!");
          } else {
            this.$message.error(res?.message || "Cập nhật thất bại!");
            return;
          }
        } else {
          const res = await createPost(
            {
              languageCode: this.form.languageCode,
              title: this.form.title,
              postType: this.form.postType,
              isFeatured: this.form.isFeatured,
            },
            this.contentFile || null,
            this.imageFile || null
          );
          if (res && (res.responseCode === 200 || res.responseCode === 1)) {
            this.$message.success("Thêm bài viết thành công!");
          } else {
            this.$message.error(res?.message || "Thêm thất bại!");
            return;
          }
        }
        this.$emit("saved");
        this.$emit("close");
      } catch {
        this.$message.error("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: 1px dashed #6366f1;
  border-radius: 8px;
  cursor: pointer;
  color: #6366f1;
  font-size: 13px;
  transition: background 0.2s;
}
.upload-btn:hover { background: #f5f3ff; }
.file-input-hidden { display: none; }
.preview-wrap { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.preview-img { width: 80px; height: 56px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; }
.file-name-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
}
.hint { margin-top: 6px; font-size: 12px; color: #94a3b8; }
.err { color: #ff4d4f; font-size: 12px; margin-top: 2px; }
</style>
