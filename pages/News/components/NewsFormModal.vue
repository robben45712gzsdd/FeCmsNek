<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? '✏️ Chỉnh sửa tin tức' : '📰 Thêm tin tức'"
    :width="700"
    :confirmLoading="loading"
    @cancel="$emit('close')"
  >
    <a-form layout="vertical" @submit.prevent>
      <a-form-item label="Tiêu đề">
        <a-input v-model="form.title" placeholder="Nhập tiêu đề bài viết" />
      </a-form-item>

      <a-form-item label="Mô tả ngắn">
        <a-input
          v-model="form.description"
          placeholder="Nhập mô tả ngắn gọn"
          maxlength="200"
          show-count
        />
      </a-form-item>

      <a-form-item label="Ảnh thumbnail">
        <div class="thumb-picker">
          <img
            v-if="form.thumbnail"
            :src="form.thumbnail"
            class="preview-thumb"
          />
          <a-input
            v-model="form.thumbnail"
            placeholder="Dán URL ảnh hoặc để trống"
          />
        </div>
      </a-form-item>

      <a-form-item label="Nội dung chi tiết">
        <a-textarea
          v-model="form.content"
          :auto-size="{ minRows: 6, maxRows: 12 }"
          placeholder="Nhập nội dung bài viết (hỗ trợ HTML nhẹ)"
        />
      </a-form-item>
    </a-form>

    <!-- Footer -->
    <template #footer>
      <div class="modal-footer">
        <a-button @click="$emit('close')">Hủy</a-button>
        <a-button @click="previewDraft" icon="eye">Xem trước</a-button>
        <a-button type="primary" @click="save" :loading="loading">
          {{ isEdit ? "Lưu thay đổi" : "Thêm mới" }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    item: Object,
  },
  data() {
    return {
      form: {
        id: null,
        title: "",
        description: "",
        thumbnail: "",
        content: "",
      },
      loading: false,
    };
  },
  computed: {
    isEdit() {
      return !!this.form.id;
    },
  },
  watch: {
    item: {
      handler(val) {
        if (val) this.form = { ...val };
        else
          this.form = {
            id: null,
            title: "",
            description: "",
            thumbnail: "",
            content: "",
          };
      },
      immediate: true,
    },
  },
  methods: {
    save() {
      if (!this.form.title.trim()) {
        this.$message.warning("Vui lòng nhập tiêu đề!");
        return;
      }
      this.loading = true;
      setTimeout(() => {
        this.$emit("saved", { ...this.form });
        this.loading = false;
      }, 500);
    },
    previewDraft() {
      if (!this.form.title && !this.form.content) {
        this.$message.info("Chưa có nội dung để xem trước.");
        return;
      }
      this.$emit("preview", { ...this.form });
    },
  },
};
</script>

<style scoped>
.thumb-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-thumb {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Giao diện input */
:deep(.ant-input),
:deep(.ant-input-textarea) {
  border-radius: 6px;
}

/* Responsive */
@media (max-width: 600px) {
  .modal-footer {
    flex-direction: column;
  }
}
</style>
