<template>
  <a-modal
    :visible="visible"
    :title="recordId ? 'Cập nhật AI' : 'Tạo AI mới'"
    ok-text="Lưu"
    cancel-text="Hủy"
    :confirm-loading="submitting"
    @ok="handleSubmit"
    @cancel="$emit('close')"
  >
    <a-spin :spinning="loading">
      <a-form-model :model="formModel" layout="vertical">
        <a-form-model-item label="LanguageCode">
          <a-input :value="languageCode" disabled />
        </a-form-model-item>

        <a-form-model-item label="Title" required>
          <a-input
            v-model="formModel.title"
            placeholder="Nhập tiêu đề AI"
            :max-length="255"
          />
        </a-form-model-item>

        <a-form-model-item label="Description">
          <a-textarea
            v-model="formModel.description"
            placeholder="Nhập mô tả"
            :rows="3"
            :max-length="1000"
          />
        </a-form-model-item>

        <a-form-model-item label="DemoUrl">
          <a-input
            v-model="formModel.demoUrl"
            placeholder="Ví dụ: /api/AI/ImageGenerate"
            :max-length="500"
          />
        </a-form-model-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-model-item label="IsDemo">
              <a-select v-model="formModel.isDemo" style="width: 100%">
                <a-select-option :value="1">Có demo</a-select-option>
                <a-select-option :value="0">Không demo</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>

          <a-col :span="12">
            <a-form-model-item label="Status">
              <a-select v-model="formModel.status" style="width: 100%">
                <a-select-option :value="1">Hiện</a-select-option>
                <a-select-option :value="0">Ẩn</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-form-model-item label="Labels">
          <a-select
            v-model="formModel.labelIds"
            mode="multiple"
            style="width: 100%"
            placeholder="Chọn label"
            :loading="labelsLoading"
            allow-clear
          >
            <a-select-option
              v-for="item in labelOptions"
              :key="item.id"
              :value="item.id"
            >
              {{ item.labelName }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { getDetailAI, getListLabelCMS, createAI, updateAI } from "../../../apis/ai";

export default {
  name: "AiEditModal",
  props: {
    visible: { type: Boolean, default: false },
    recordId: { type: [Number, String], default: null },
    languageCode: { type: String, default: "vi" },
  },
  data() {
    return {
      loading: false,
      submitting: false,
      labelsLoading: false,
      labelOptions: [],
      formModel: {
        id: null,
        title: "",
        description: "",
        demoUrl: "",
        isDemo: 0,
        status: 1,
        labelIds: [],
      },
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initData();
      }
    },
    languageCode(newVal, oldVal) {
      if (this.visible && newVal && newVal !== oldVal) {
        this.initData();
      }
    },
  },
  methods: {
    getDefaultFormModel() {
      return {
        id: null,
        title: "",
        description: "",
        demoUrl: "",
        isDemo: 0,
        status: 1,
        labelIds: [],
      };
    },
    async initData() {
      this.loading = true;
      this.labelsLoading = true;
      try {
        const labelsRes = await getListLabelCMS({
          LanguageCode: this.languageCode,
        });
        this.labelOptions = Array.isArray(labelsRes?.data) ? labelsRes.data : [];

        if (!this.recordId) {
          this.formModel = this.getDefaultFormModel();
          return;
        }

        const detailRes = await getDetailAI({
          Id: this.recordId,
          LanguageCode: this.languageCode,
        });
        const detail = detailRes?.data || {};
        this.formModel = {
          id: detail.id || this.recordId,
          title: detail.title || "",
          description: detail.description || "",
          demoUrl: detail.demoUrl || "",
          isDemo: Number(detail.isDemo) === 1 ? 1 : 0,
          status: Number(detail.status) === 1 ? 1 : 0,
          labelIds: Array.isArray(detail.labels)
            ? detail.labels.map((x) => x.id)
            : [],
        };
      } catch (error) {
        this.$message.error(this.recordId ? "Không thể tải dữ liệu AI để chỉnh sửa" : "Không thể tải dữ liệu tạo AI");
      } finally {
        this.loading = false;
        this.labelsLoading = false;
      }
    },
    async handleSubmit() {
      const title = (this.formModel.title || "").trim();
      if (!title) {
        this.$message.warning("Vui lòng nhập Title");
        return;
      }

      this.submitting = true;
      try {
        const body = {
          languageCode: this.languageCode,
          title,
          description: this.formModel.description || "",
          demoUrl: this.formModel.demoUrl || "",
          isDemo: Number(this.formModel.isDemo) === 1,
          status: Number(this.formModel.status),
          labelIds: this.formModel.labelIds || [],
        };

        if (this.recordId) {
          await updateAI({ ...body, id: this.formModel.id || this.recordId });
          this.$message.success("Cập nhật AI thành công");
        } else {
          await createAI(body);
          this.$message.success("Tạo AI thành công");
        }
        this.$emit("updated");
      } catch (error) {
        this.$message.error(this.recordId ? "Cập nhật AI thất bại" : "Tạo AI thất bại");
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
