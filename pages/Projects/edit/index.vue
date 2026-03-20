<template>
  <div class="project-edit-page">
    <div class="page-top">
      <a-button type="link" class="btn-back" @click="goBack">
        <a-icon type="arrow-left" /> Quay lại
      </a-button>
      <h2 class="page-title">{{ isEdit ? "Chỉnh sửa Case Study" : "Thêm Case Study" }}</h2>
    </div>

    <a-spin :spinning="loadingDetail">
      <div class="form-card">
        <a-form layout="vertical">
          <!-- Ngôn ngữ + Tên dự án -->
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
              <a-form-item label="Tên dự án *">
                <a-input v-model="form.projectName" placeholder="Nhập tên dự án..." size="large" />
                <div v-if="errors.projectName" class="err">{{ errors.projectName }}</div>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- Trạng thái khi edit -->
          <a-form-item v-if="isEdit" label="Trạng thái">
            <a-switch v-model="form.isActive" checked-children="Hiển thị" un-checked-children="Ẩn" />
          </a-form-item>

          <!-- Thumbnail -->
          <a-row :gutter="20">
            <a-col :span="12">
              <a-form-item label="Thumbnail ảnh bìa (tùy chọn)">
                <label class="upload-btn">
                  <a-icon type="upload" /> Chọn ảnh thumbnail
                  <input ref="thumbnailInput" type="file" accept="image/*" class="file-input-hidden" @change="onThumbnailChange" />
                </label>
                <div v-if="thumbnailPreview" class="preview-wrap">
                  <img :src="thumbnailPreview" class="preview-img" />
                  <a-button size="small" type="link" style="color:#ff4d4f" @click="clearThumbnail">Xóa</a-button>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="'Ảnh chính' + (isEdit ? ' (tùy chọn)' : ' *')">
                <label class="upload-btn">
                  <a-icon type="picture" /> Chọn ảnh chính
                  <input ref="imageInput" type="file" accept="image/*" class="file-input-hidden" @change="onImageChange" />
                </label>
                <div v-if="errors.image" class="err">{{ errors.image }}</div>
                <div v-if="imagePreview" class="preview-wrap">
                  <img :src="imagePreview" class="preview-img" />
                  <a-button size="small" type="link" style="color:#ff4d4f" @click="clearImage">Xóa</a-button>
                </div>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- Tags -->
          <a-form-item label="Tags">
            <div class="tag-chips" v-if="selectedTagIds.length">
              <a-tag v-for="id in selectedTagIds" :key="id" closable color="blue" @close="removeTag(id)">
                {{ tagNameById(id) }}
              </a-tag>
            </div>
            <a-select
              placeholder="+ Thêm tag..."
              style="width:100%;margin-top:6px"
              :loading="tagsLoading"
              option-filter-prop="children"
              show-search
              allow-clear
              @change="addTag"
            >
              <a-select-option v-for="tag in availableTags" :key="tag.tagId" :value="tag.tagId">
                {{ tag.tagName }}
              </a-select-option>
            </a-select>
            <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
              <a-button type="dashed" size="small" icon="plus" @click="showNewTagRow = true; showManageTags = false">Tạo tag mới</a-button>
              <a-button type="dashed" size="small" icon="setting" @click="showManageTags = !showManageTags; showNewTagRow = false">Quản lý tags</a-button>
            </div>
            <div v-if="showNewTagRow" style="display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap">
              <a-input v-model="newTagName" placeholder="Tên tag..." size="small" style="flex:1;min-width:100px" @pressEnter="handleCreateTag" />
              <a-select v-model="newTagType" size="small" style="width:160px">
                <a-select-option :value="1">Trí tuệ nhân tạo</a-select-option>
                <a-select-option :value="2">Domain</a-select-option>
                <a-select-option :value="3">Technologies</a-select-option>
              </a-select>
              <a-button type="primary" size="small" :loading="newTagLoading" @click="handleCreateTag">Lưu</a-button>
              <a-button size="small" @click="showNewTagRow = false; newTagName = ''; newTagType = 1">Hủy</a-button>
            </div>
            <div v-if="showManageTags" style="margin-top:8px;border:1px solid #f0f0f0;border-radius:6px;padding:8px;max-height:200px;overflow-y:auto">
              <div v-if="tagsLoading" style="text-align:center;padding:8px"><a-spin size="small" /></div>
              <div v-else-if="!tagOptions.length" style="color:#aaa;font-size:12px;text-align:center">Chưa có tag nào</div>
              <div v-for="tag in tagOptions" :key="tag.tagId" style="display:flex;align-items:center;justify-content:space-between;padding:4px 2px;border-bottom:1px solid #f5f5f5">
                <span style="font-size:13px">{{ tag.tagName }}</span>
                <a-popconfirm :title="`Xóa tag &quot;${tag.tagName}&quot;?`" ok-text="Xóa" ok-type="danger" cancel-text="Hủy" @confirm="handleDeleteTag(tag.tagId)">
                  <a-button type="link" size="small" :loading="deletingTagId === tag.tagId" style="color:#ff4d4f;padding:0 4px" icon="delete" />
                </a-popconfirm>
              </div>
            </div>
          </a-form-item>

          <!-- Nội dung: chọn chế �'�T -->
          <a-form-item>
            <template #label>
              <div class="content-label-row">
                <span>Nội dung Case Study</span>
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
                <input ref="bodyInput" type="file" accept=".html,.htm" class="file-input-hidden" @change="onBodyChange" />
              </label>
              <div v-if="bodyFileName" class="file-name-tag">
                <a-icon type="file-text" /> {{ bodyFileName }}
                <a-button size="small" type="link" style="color:#ff4d4f" @click="clearBody">Xóa</a-button>
              </div>
              <div v-if="bodyPreviewUrl && !bodyFileName" class="file-name-tag existing">
                <a-icon type="file-text" style="color:#2f54eb" />
                <span style="flex:1;font-size:12px;color:#2f54eb;">File HTML hi�?n tại</span>
                <a-button size="small" type="link" :href="bodyPreviewUrl" target="_blank">M�Y tab</a-button>
              </div>
            </div>

            <!-- MODE: Rich text editor -->
            <div v-else>
              <RichTextEditor v-model="editorContent" :height="700" placeholder="Soạn Nội dung case study..." />
              <div v-if="isEdit && bodyPreviewUrl && !editorContent" class="hint" style="margin-top:8px">
                <a-icon type="info-circle" style="color:#fa8c16;margin-right:4px;" />
                Case Study �'ã có file HTML. Soạn Nội dung m�>i sẽ thay thế file cũ.
              </div>
            </div>
          </a-form-item>
        </a-form>

        <!-- Actions -->
        <div class="form-actions">
          <a-button @click="goBack">Hủy</a-button>
          <a-button type="primary" :loading="saving" @click="handleSubmit">
            <a-icon type="save" /> {{ isEdit ? "Cập nhật" : "Tạo Case Study" }}
          </a-button>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import axios from "axios";
import {
  getProjectDetail,
  addProject,
  updateProject,
  getListTags,
  createTag,
  deleteTag,
} from "../../../apis/projects";
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
        projectName: "",
        isActive: true,
        projectId: null,
      },
      // Files
      thumbnailFile: null,
      thumbnailPreview: null,
      imageFile: null,
      imagePreview: null,
      bodyFile: null,
      bodyFileName: null,
      bodyPreviewUrl: null,
      // Editor
      contentMode: "editor",
      editorContent: "",
      // Tags
      selectedTagIds: [],
      tagOptions: [],
      tagsLoading: false,
      showNewTagRow: false,
      newTagName: "",
      newTagType: 1,
      newTagLoading: false,
      showManageTags: false,
      deletingTagId: null,
    };
  },
  computed: {
    availableTags() {
      return this.tagOptions.filter((t) => !this.selectedTagIds.includes(t.tagId));
    },
  },
  async mounted() {
    this.fetchTags();
    const { id, lang } = this.$route.query;
    if (lang) this.form.languageCode = lang;
    if (id) {
      this.isEdit = true;
      this.form.projectId = id;
      await this.fetchDetail();
    }
  },
  methods: {
    goBack() {
      this.$router.push("/Projects");
    },
    async fetchDetail() {
      if (!this.form.projectId) return;
      this.loadingDetail = true;
      // Reset
      this.editorContent = "";
      this.bodyFile = null;
      this.bodyFileName = null;
      this.bodyPreviewUrl = null;
      this.thumbnailFile = null;
      this.thumbnailPreview = null;
      this.imageFile = null;
      this.imagePreview = null;
      try {
        const res = await getProjectDetail(this.form.projectId, this.form.languageCode);
        if (res && res.data) {
          const d = res.data;
          this.form = {
            projectId: d.projectId || this.form.projectId,
            languageCode: this.form.languageCode,
            projectName: d.projectName || "",
            isActive: d.isActive !== undefined ? d.isActive : true,
          };
          // Tags
          const rawTags = d.listTagId || d.tags || [];
          this.selectedTagIds = rawTags
            .map((t) => (typeof t === "object" ? t.tagId ?? t.id : Number(t)))
            .filter(Boolean);
          // Previews
          this.thumbnailPreview = toFull(d.thumbnailUrl) || null;
          this.imagePreview = toFull(d.imageUrl) || null;
          this.bodyPreviewUrl = toFull(d.projectBody) || null;

          // Fetch Nội dung HTML hi�?n tại vào editor
          if (this.bodyPreviewUrl) {
            try {
              const resp = await axios.get(this.bodyPreviewUrl, { responseType: "text" });
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
        this.$message.error("Không th�f tải dữ li�?u Case Study!");
      } finally {
        this.loadingDetail = false;
      }
    },
    onLanguageChange() {
      if (this.isEdit) {
        this.fetchDetail();
      }
    },
    /* �"?�"? Tags �"?�"? */
    tagNameById(id) {
      const tag = this.tagOptions.find((t) => t.tagId === id);
      return tag ? tag.tagName : id;
    },
    addTag(tagId) {
      if (tagId != null && !this.selectedTagIds.includes(tagId)) {
        this.selectedTagIds = [...this.selectedTagIds, tagId];
      }
    },
    removeTag(tagId) {
      this.selectedTagIds = this.selectedTagIds.filter((id) => id !== tagId);
    },
    async fetchTags() {
      this.tagsLoading = true;
      try {
        const res = await getListTags();
        this.tagOptions = res && res.data ? res.data : [];
      } catch {
        this.tagOptions = [];
      } finally {
        this.tagsLoading = false;
      }
    },
    async handleCreateTag() {
      const name = (this.newTagName || "").trim();
      if (!name) return;
      this.newTagLoading = true;
      try {
        const slug = name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const res = await createTag({ tagName: name, tagSlug: slug, tagType: this.newTagType, isActive: true });
        if (res && (res.responseCode === 200 || res.responseCode === 1)) {
          this.$message.success(`Đã tạo tag "${name}"!`);
          this.newTagName = "";
          this.newTagType = 1;
          this.showNewTagRow = false;
          await this.fetchTags();
          const created = this.tagOptions.find((t) => t.tagName === name);
          if (created) this.addTag(created.tagId);
        } else {
          this.$message.error(res?.message || "Tạo tag thất bại!");
        }
      } catch {
        this.$message.error("Có lỗi, vui lòng thử lại!");
      } finally {
        this.newTagLoading = false;
      }
    },
    async handleDeleteTag(tagId) {
      this.deletingTagId = tagId;
      try {
        const res = await deleteTag(tagId);
        if (res && (res.responseCode === 200 || res.responseCode === 1)) {
          this.$message.success("Đã xóa tag!");
          this.selectedTagIds = this.selectedTagIds.filter((id) => id !== tagId);
          await this.fetchTags();
        } else {
          this.$message.error(res?.message || "Xóa tag thất bại!");
        }
      } catch {
        this.$message.error("Có lỗi, vui lòng thử lại!");
      } finally {
        this.deletingTagId = null;
      }
    },
    /* �"?�"? File handlers �"?�"? */
    onThumbnailChange(e) {
      const f = e.target.files[0];
      if (!f) return;
      this.thumbnailFile = f;
      this.thumbnailPreview = URL.createObjectURL(f);
    },
    clearThumbnail() {
      this.thumbnailFile = null;
      this.thumbnailPreview = null;
      if (this.$refs.thumbnailInput) this.$refs.thumbnailInput.value = "";
    },
    onImageChange(e) {
      const f = e.target.files[0];
      if (!f) return;
      this.imageFile = f;
      this.imagePreview = URL.createObjectURL(f);
      this.errors.image = null;
    },
    clearImage() {
      this.imageFile = null;
      this.imagePreview = null;
      if (this.$refs.imageInput) this.$refs.imageInput.value = "";
    },
    onBodyChange(e) {
      const f = e.target.files[0];
      if (!f) return;
      this.bodyFile = f;
      this.bodyFileName = f.name;
    },
    clearBody() {
      this.bodyFile = null;
      this.bodyFileName = null;
      if (this.$refs.bodyInput) this.$refs.bodyInput.value = "";
    },
    /* �"?�"? Editor to File �"?�"? */
    editorToFile() {
      if (!this.editorContent || !this.editorContent.trim()) return null;
      const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.form.projectName || "Case Study"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.7; color: #334155; padding: 40px 24px; max-width: 900px; margin: 0 auto; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
    a { color: #6366f1; }
    h1, h2, h3 { color: #0f172a; margin: 24px 0 12px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    table td, table th { border: 1px solid #e2e8f0; padding: 8px 12px; }
    blockquote { border-left: 3px solid #6366f1; padding-left: 16px; color: #64748b; margin: 16px 0; }
    ul, ol { padding-left: 24px; margin: 8px 0; }
  </style>
</head>
<body>
${this.editorContent}
</body>
</html>`;
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      return new File(
        [blob],
        `${(this.form.projectName || "case-study").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.html`,
        { type: "text/html" }
      );
    },
    /* �"?�"? Validate �"?�"? */
    validate() {
      this.errors = {};
      if (!this.form.projectName || !this.form.projectName.trim())
        this.errors.projectName = "Vui lòng nhập tên dự án";
      if (!this.isEdit && !this.imageFile)
        this.errors.image = "Vui lòng chọn ảnh chính";
      return Object.keys(this.errors).length === 0;
    },
    /* �"?�"? Submit �"?�"? */
    async handleSubmit() {
      if (!this.validate()) return;

      // Determine body file
      let finalBodyFile = null;
      if (this.contentMode === "editor") {
        finalBodyFile = this.editorToFile();
      } else {
        finalBodyFile = this.bodyFile || null;
      }

      this.saving = true;
      try {
        if (this.isEdit) {
          await updateProject(
            {
              projectId: this.form.projectId,
              languageCode: this.form.languageCode || "vi",
              projectName: this.form.projectName || "",
              isActive: this.form.isActive,
              listTagId: this.selectedTagIds,
            },
            this.thumbnailFile || null,
            finalBodyFile,
            this.imageFile || null
          );
          this.$message.success("Cập nhật thành công!");
          this.goBack();
        } else {
          const fd = new FormData();
          fd.append("LanguageCode", this.form.languageCode || "vi");
          fd.append("ProjectName", this.form.projectName || "");
          this.selectedTagIds.forEach((id) => fd.append("ListTagId", id));
          if (this.thumbnailFile) fd.append("Thumbnail", this.thumbnailFile);
          if (this.imageFile) fd.append("image", this.imageFile);
          if (finalBodyFile) fd.append("ProjectBody", finalBodyFile);
          await addProject(fd);
          this.$message.success("Thêm Case Study thành công!");
          this.goBack();
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
.project-edit-page {
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
.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 0 2px;
}
</style>
