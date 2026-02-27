<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá'"
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
      <a-form-model-item label="Ngôn ngữ" prop="languageCode">
        <a-select v-model="form.languageCode">
          <a-select-option value="vi">Tiếng Việt</a-select-option>
          <a-select-option value="en">English</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="Họ tên" prop="name">
        <a-input v-model="form.name" placeholder="Nhập họ tên" />
      </a-form-model-item>

      <a-form-model-item label="Chức vụ / Công ty" prop="businessName">
        <a-input v-model="form.businessName" placeholder="Nhập chức vụ hoặc công ty" />
      </a-form-model-item>

      <a-form-model-item label="Nội dung" prop="content">
        <a-textarea v-model="form.content" :rows="4" placeholder="Nhập nội dung đánh giá" />
      </a-form-model-item>

      <a-form-model-item label="Trạng thái" prop="status">
        <a-select v-model="form.status">
          <a-select-option :value="1">Hiển thị</a-select-option>
          <a-select-option :value="0">Ẩn</a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import { createTestimonial, updateTestimonial } from "../../../../apis/general";

function defaultForm(languageCode) {
  return {
    testimonialId: null,
    languageCode: languageCode || "vi",
    name: "",
    businessName: "",
    content: "",
    status: 1,
  };
}

export default {
  props: {
    languageCode: { type: String, default: "vi" },
  },
  data() {
    return {
      visible: false,
      isEdit: false,
      form: defaultForm(this.languageCode),
      saving: false,
      rules: {
        name: [{ required: true, message: "Nhập họ tên!", trigger: "blur" }],
        content: [{ required: true, message: "Nhập nội dung đánh giá!", trigger: "blur" }],
      },
    };
  },
  methods: {
    openAdd() {
      this.isEdit = false;
      this.form = defaultForm(this.languageCode);
      this.visible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    openEdit(r) {
      this.isEdit = true;
      this.form = {
        testimonialId: r.testimonialId,
        languageCode: this.languageCode,
        name: r.name || "",
        businessName: r.businessName || "",
        content: r.content || "",
        status: r.status ?? 1,
      };
      this.visible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    close() {
      this.visible = false;
      this.$emit("close");
    },
    handleSave() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.saving = true;
        try {
          if (this.isEdit) {
            await updateTestimonial(this.form.languageCode, {
              testimonialId: this.form.testimonialId,
              name: this.form.name,
              businessName: this.form.businessName || "",
              content: this.form.content,
              status: this.form.status,
            });
          } else {
            await createTestimonial(this.form.languageCode, {
              name: this.form.name,
              businessName: this.form.businessName || "",
              content: this.form.content,
              status: this.form.status,
            });
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
