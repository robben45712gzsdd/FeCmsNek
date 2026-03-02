<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? 'Chỉnh sửa lãnh đạo' : 'Thêm lãnh đạo'"
    width="600px"
    :confirm-loading="saving"
    ok-text="Lưu"
    cancel-text="Hủy"
    @ok="handleSave"
    @cancel="close"
  >
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 17 }"
    >
      <a-form-model-item label="Họ tên" prop="name">
        <a-input v-model="form.name" placeholder="Nhập họ tên" />
      </a-form-model-item>

      <a-form-model-item label="Chức vụ" prop="position">
        <a-input v-model="form.position" placeholder="Nhập chức vụ" />
      </a-form-model-item>

      <a-form-model-item label="Mô tả" prop="description">
        <a-textarea v-model="form.description" :rows="3" placeholder="Nhập mô tả" />
      </a-form-model-item>

      <a-form-model-item label="Trạng thái" prop="status">
        <a-select v-model="form.status">
          <a-select-option :value="1">Hiển thị</a-select-option>
          <a-select-option :value="0">Ẩn</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="Ảnh">
        <div class="upload-wrap">
          <a-upload :before-upload="onPhotoSelect" :show-upload-list="false" accept="image/*">
            <a-button>
              <a-icon type="upload" />
              {{ photoFile ? photoFile.name : (form.imageUrl ? 'Đổi ảnh' : 'Chọn ảnh') }}
            </a-button>
          </a-upload>
          <div v-if="photoPreview || form.imageUrl" class="img-preview">
            <img :src="photoPreview || toFullUrl(form.imageUrl)" alt="photo" />
          </div>
        </div>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import { createOurLeader, updateOurLeader } from "../../../../apis/general";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;

function defaultForm() {
  return { leaderId: null, name: "", position: "", description: "", status: 1, imageUrl: null };
}

export default {
  data() {
    return {
      visible: false,
      isEdit: false,
      form: defaultForm(),
      saving: false,
      photoFile: null,
      photoPreview: null,
      rules: {
        name: [{ required: true, message: "Nhập họ tên!", trigger: "blur" }],
        position: [{ required: true, message: "Nhập chức vụ!", trigger: "blur" }],
      },
    };
  },
  methods: {
    openAdd() {
      this.isEdit = false;
      this.photoFile = null;
      this.photoPreview = null;
      this.form = defaultForm();
      this.visible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    openEdit(r) {
      this.isEdit = true;
      this.photoFile = null;
      this.photoPreview = null;
      this.form = {
        leaderId: r.leaderId,
        name: r.name || "",
        position: r.position || "",
        description: r.description || "",
        status: r.status ?? 1,
        imageUrl: r.imageUrl || null,
      };
      this.visible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    close() {
      this.visible = false;
      this.$emit("close");
    },
    toFullUrl(url) {
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    },
    onPhotoSelect(file) {
      this.photoFile = file;
      this.photoPreview = URL.createObjectURL(file);
      return false;
    },
    handleSave() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.saving = true;
        try {
          if (this.isEdit) {
            await updateOurLeader({
              leaderId: this.form.leaderId,
              name: this.form.name,
              position: this.form.position,
              description: this.form.description || "",
              status: this.form.status,
            }, this.photoFile || null);
          } else {
            await createOurLeader({
              name: this.form.name,
              position: this.form.position,
              description: this.form.description || "",
              status: this.form.status,
            }, this.photoFile || null);
          }
          this.$message.success("Lưu thành công!");
          this.$emit("saved");
          this.close();
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
.upload-wrap { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.img-preview { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 1px solid #e8e8e8; background: #f5f5f5; }
.img-preview img { width: 100%; height: 100%; object-fit: cover; }
</style>
