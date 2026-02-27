<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? 'Chỉnh sửa Case Study' : 'Thêm Case Study'"
    :confirmLoading="loading"
    width="680px"
    ok-text="Lưu"
    cancel-text="Hủy"
    @cancel="handleClose"
    @ok="handleSubmit"
  >
    <a-form layout="vertical">
      <!-- Ngôn ngữ + Tên dự án -->
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="Ngôn ngữ" required>
            <a-select v-model="form.languageCode" style="width: 100%">
              <a-select-option value="vi">Tiếng Việt</a-select-option>
              <a-select-option value="en">English</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="16">
          <a-form-item label="Tên dự án" required>
            <a-input v-model="form.projectName" placeholder="Nhập tên dự án..." />
            <div v-if="errors.projectName" class="err">{{ errors.projectName }}</div>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Tiêu đề + Phụ đề -->
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Tiêu đề (Title)">
            <a-input v-model="form.titleText" placeholder="Nhập tiêu đề..." />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Phụ đề (Subtitle)">
            <a-input v-model="form.subtitleText" placeholder="Nhập phụ đề..." />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Thumbnail (optional) -->
      <a-form-item label="Thumbnail — ảnh bìa (tùy chọn)">
        <label class="upload-btn">
          <a-icon type="upload" /> Chọn ảnh thumbnail
          <input ref="thumbnailInput" type="file" accept="image/*" class="file-input-hidden" @change="onThumbnailChange" />
        </label>
        <div v-if="thumbnailPreview" class="preview-wrap">
          <img :src="thumbnailPreview" class="preview-img" />
          <a-button size="small" type="link" style="color:#ff4d4f" @click="clearThumbnail">Xóa</a-button>
        </div>
      </a-form-item>

      <!-- Image (required khi tạo mới) -->
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

      <!-- ProjectBody (optional HTML file) -->
      <a-form-item label="Nội dung — file HTML (tùy chọn)">
        <label class="upload-btn">
          <a-icon type="file-text" /> Chọn file HTML
          <input ref="bodyInput" type="file" accept=".html,.htm" class="file-input-hidden" @change="onBodyChange" />
        </label>
        <div v-if="bodyFileName" class="file-name-tag">
          <a-icon type="file-text" /> {{ bodyFileName }}
          <a-button size="small" type="link" style="color:#ff4d4f" @click="clearBody">Xóa</a-button>
        </div>
        <!-- Hiển thị file hiện tại nếu đã có và chưa chọn file mới -->
        <div v-if="bodyPreviewUrl && !bodyFileName" class="file-name-tag" style="background:#f0f5ff;border-color:#adc6ff;">
          <a-icon type="file-text" style="color:#2f54eb" />
          <span style="flex:1;font-size:12px;color:#2f54eb;">File HTML hiện tại</span>
          <a-button size="small" type="link" @click="openBodyPreview">&#128065; Xem</a-button>
          <a-button size="small" type="link" :href="bodyPreviewUrl" target="_blank">&#128279; Mở tab</a-button>
        </div>
        <div class="hint">
          <a-icon type="info-circle" style="color:#6366f1;margin-right:4px;" />
          Dùng <nuxt-link to="/CaseStudyEditor" target="_blank">Case Study Editor</nuxt-link> để xuất HTML rồi upload.
        </div>
      </a-form-item>

      <!-- Modal preview HTML -->
      <a-modal
        :visible="showBodyPreview"
        title="Xem nội dung HTML"
        width="900px"
        :footer="null"
        @cancel="showBodyPreview = false"
      >
        <iframe
          v-if="showBodyPreview"
          :src="bodyPreviewUrl"
          style="width:100%;height:70vh;border:none;border-radius:6px;"
        />
      </a-modal>

      <!-- Trạng thái (chỉ hiển thị khi edit) -->
      <a-form-item v-if="isEdit" label="Trạng thái">
        <a-switch
          v-model="form.isActive"
          checked-children="Hiển thị"
          un-checked-children="Ẩn"
        />
      </a-form-item>

      <!-- Tags / ListTagId -->
      <a-form-item label="Tags">
        <!-- Selected tags as chips -->
        <div class="tag-chips" v-if="selectedTagIds.length">
          <a-tag
            v-for="id in selectedTagIds"
            :key="id"
            closable
            color="blue"
            @close="removeTag(id)"
          >
            {{ tagNameById(id) }}
          </a-tag>
        </div>
        <!-- Dropdown to add tag -->
        <a-select
          placeholder="+ Thêm tag..."
          style="width: 100%; margin-top: 6px"
          :loading="tagsLoading"
          option-filter-prop="children"
          show-search
          allow-clear
          @change="addTag"
        >
          <a-select-option
            v-for="tag in availableTags"
            :key="tag.tagId"
            :value="tag.tagId"
          >
            {{ tag.tagName }}
          </a-select-option>
        </a-select>
        <!-- Tạo tag mới inline -->
        <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
          <a-button type="dashed" size="small" icon="plus" @click="showNewTagRow = true; showManageTags = false">Tạo tag mới</a-button>
          <a-button type="dashed" size="small" icon="setting" @click="showManageTags = !showManageTags; showNewTagRow = false">Quản lý tags</a-button>
        </div>
        <div v-if="showNewTagRow" style="display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap">
          <a-input
            v-model="newTagName"
            placeholder="Tên tag..."
            size="small"
            style="flex:1;min-width:100px"
            @pressEnter="handleCreateTag"
          />
          <a-select v-model="newTagType" size="small" style="width:160px">
            <a-select-option :value="1">Trí tuệ nhân tạo</a-select-option>
            <a-select-option :value="2">Domain</a-select-option>
            <a-select-option :value="3">Technologies</a-select-option>
          </a-select>
          <a-button type="primary" size="small" :loading="newTagLoading" @click="handleCreateTag">Lưu</a-button>
          <a-button size="small" @click="showNewTagRow = false; newTagName = ''; newTagType = 1">Hủy</a-button>
        </div>
        <!-- Panel quản lý tags -->
        <div v-if="showManageTags" style="margin-top:8px;border:1px solid #f0f0f0;border-radius:6px;padding:8px;max-height:200px;overflow-y:auto">
          <div v-if="tagsLoading" style="text-align:center;padding:8px"><a-spin size="small" /></div>
          <div v-else-if="!tagOptions.length" style="color:#aaa;font-size:12px;text-align:center">Chưa có tag nào</div>
          <div
            v-for="tag in tagOptions"
            :key="tag.tagId"
            style="display:flex;align-items:center;justify-content:space-between;padding:4px 2px;border-bottom:1px solid #f5f5f5"
          >
            <span style="font-size:13px">{{ tag.tagName }}</span>
            <a-popconfirm
              :title="`Xóa tag &quot;${tag.tagName}&quot;?`"
              ok-text="Xóa"
              ok-type="danger"
              cancel-text="Hủy"
              @confirm="handleDeleteTag(tag.tagId)"
            >
              <a-button
                type="link"
                size="small"
                :loading="deletingTagId === tag.tagId"
                style="color:#ff4d4f;padding:0 4px"
                icon="delete"
              />
            </a-popconfirm>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { addProject, updateProject, getListTags, getProjectDetail, createTag, deleteTag } from "../../../apis/projects";

export default {
  name: "ProjectForm",
  props: {
    visible: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false },
    record: { type: Object, default: null },
  },
  data() {
    return {
      loading: false,
      form: this.defaultForm(),
      errors: {},
      selectedTagIds: [],
      tagOptions: [],
      tagsLoading: false,
      thumbnailFile: null,
      thumbnailPreview: null,
      imageFile: null,
      imagePreview: null,
      bodyFile: null,
      bodyFileName: null,
      bodyPreviewUrl: null,
      showBodyPreview: false,
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
  watch: {
    async visible(val) {
      if (val) {
        this.errors = {};
        this.clearAllFiles();
        // Đảm bảo tagOptions đã load trước khi set selectedTagIds
        if (!this.tagOptions.length) {
          await this.fetchTags();
        }
        if (this.isEdit && this.record) {
          this.form = this.defaultForm(); // reset trước để watcher languageCode không trigger lại
          await this.loadDetail(this.record.projectId, this.record.languageCode || "vi");
        } else {
          this.form = this.defaultForm();
          this.selectedTagIds = [];
        }
      }
    },
    async "form.languageCode"(newLang, oldLang) {
      if (this.isEdit && this.form.projectId && newLang && newLang !== oldLang) {
        await this.loadDetail(this.form.projectId, newLang);
      }
    },
  },
  mounted() {
    this.fetchTags();
  },
  methods: {
    tagNameById(id) {
      const tag = this.tagOptions.find((t) => t.tagId === id);
      return tag ? tag.tagName : id;
    },
    async loadDetail(projectId, languageCode) {
      this.loading = true;
      try {
        const res = await getProjectDetail(projectId, languageCode);
        const d = (res && res.data) ? res.data : {};
        console.log("[loadDetail] raw data:", d);
        this.form = {
          projectId: d.projectId || projectId,
          projectName: d.projectName || "",
          titleText: d.titleText || "",
          subtitleText: d.subtitleText || "",
          projectBody: d.projectBody || "",
          isActive: d.isActive !== undefined ? d.isActive : true,
          languageCode: languageCode,
        };
        const rawTags = d.listTagId || d.tags || [];
        this.selectedTagIds = rawTags
          .map((t) => (typeof t === "object" ? t.tagId ?? t.id : Number(t)))
          .filter(Boolean);
        const fileBase = process.env.NUXT_ENV_FILE_API_URL || "https://ldapiv2.neksolution.com";
        const toFull = (url) => !url ? null : /^https?:\/\//i.test(url) ? url : fileBase.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
        this.thumbnailPreview = toFull(d.thumbnailUrl) || null;
        this.imagePreview = toFull(d.imageUrl) || null;
        this.bodyPreviewUrl = toFull(d.projectBody) || null;
        this.thumbnailFile = null;
        this.imageFile = null;
      } catch {
        this.$message.error("Không thể tải chi tiết dự án!");
      } finally {
        this.loading = false;
      }
    },
    addTag(tagId) {
      if (tagId != null && !this.selectedTagIds.includes(tagId)) {
        this.selectedTagIds = [...this.selectedTagIds, tagId];
      }
    },
    removeTag(tagId) {
      this.selectedTagIds = this.selectedTagIds.filter((id) => id !== tagId);
    },
    defaultForm() {
      return { projectName: "", titleText: "", subtitleText: "", projectBody: "", isActive: true, languageCode: "vi" };
    },
    async fetchTags() {
      this.tagsLoading = true;
      try {
        const res = await getListTags();
        this.tagOptions = (res && res.data) ? res.data : [];
      } catch {
        this.tagOptions = [];
      } finally {
        this.tagsLoading = false;
      }
    },
    /* ── file handlers ── */
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
    openBodyPreview() {
      this.showBodyPreview = true;
    },
    async handleDeleteTag(tagId) {
      this.deletingTagId = tagId;
      try {
        const res = await deleteTag(tagId);
        if (res && (res.responseCode === 200 || res.responseCode === 1)) {
          this.$message.success("Đã xóa tag!");
          // bỏ khỏi selected nếu có
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
    async handleCreateTag() {
      const name = (this.newTagName || "").trim();
      if (!name) return;
      this.newTagLoading = true;
      try {
        const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const res = await createTag({ tagName: name, tagSlug: slug, tagType: this.newTagType, isActive: true });
        if (res && (res.responseCode === 200 || res.responseCode === 1)) {
          this.$message.success(`Đã tạo tag "${name}"!`);
          this.newTagName = "";
          this.newTagType = 1;
          this.showNewTagRow = false;
          await this.fetchTags();
          // auto-select tag vừa tạo
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
    clearAllFiles() {
      this.clearThumbnail();
      this.clearImage();
      this.clearBody();
    },
    /* ── validation ── */
    validate() {
      this.errors = {};
      if (!this.form.projectName || !this.form.projectName.trim())
        this.errors.projectName = "Vui lòng nhập tên dự án";
      if (!this.isEdit && !this.imageFile)
        this.errors.image = "Vui lòng chọn ảnh chính";
      return Object.keys(this.errors).length === 0;
    },
    /* ── build FormData for create ── */
    buildFormData() {
      const fd = new FormData();
      fd.append("LanguageCode", this.form.languageCode || "vi");
      fd.append("ProjectName", this.form.projectName || "");
      fd.append("TitleText", this.form.titleText || "");
      fd.append("SubtitleText", this.form.subtitleText || "");
      this.selectedTagIds.forEach((id) => fd.append("ListTagId", id));
      if (this.thumbnailFile) fd.append("Thumbnail", this.thumbnailFile);
      if (this.imageFile) fd.append("image", this.imageFile);
      if (this.bodyFile) fd.append("ProjectBody", this.bodyFile);
      return fd;
    },
    /* ── submit ── */
    async handleSubmit() {
      if (!this.validate()) return;
      this.loading = true;
      try {
        if (this.isEdit) {
          await updateProject(
            {
              projectId: this.form.projectId,
              languageCode: this.form.languageCode || "vi",
              projectName: this.form.projectName || "",
              titleText: this.form.titleText || "",
              subtitleText: this.form.subtitleText || "",
              isActive: this.form.isActive,
            },
            this.thumbnailFile || null,
            this.bodyFile || null,
            this.imageFile || null
          );
          this.$message.success("Cập nhật thành công!");
        } else {
          await addProject(this.buildFormData());
          this.$message.success("Thêm mới thành công!");
        }
        this.$emit("saved");
        this.$emit("close");
      } catch {
        this.$message.error("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
        this.loading = false;
      }
    },
    handleClose() {
      this.$emit("close");
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
  border-radius: 6px;
  color: #6366f1;
  background: #f5f3ff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}
.upload-btn:hover {
  background: #ede9fe;
  border-color: #4f46e5;
  color: #4f46e5;
}
.file-input-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}
.file-input {
  display: block;
  width: 100%;
  padding: 6px 0;
  font-size: 13px;
  cursor: pointer;
  background: #fff !important;
  color: #333 !important;
}
.preview-wrap {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.preview-img {
  width: 120px;
  height: 72px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}
.file-name-tag {
  margin-top: 6px;
  padding: 4px 10px;
  background: #f0f4ff;
  border-radius: 4px;
  font-size: 13px;
  color: #4b5563;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.hint {
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
}
.err {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}
.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 0 2px;
}
</style>
