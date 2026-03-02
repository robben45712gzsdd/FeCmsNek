<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? 'Chỉnh sửa tin tuyển dụng' : 'Thêm tin tuyển dụng'"
    width="700px"
    :confirm-loading="saving"
    ok-text="Lưu"
    cancel-text="Hủy"
    @ok="handleSave"
    @cancel="$emit('close')"
  >
    <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
      <a-form-model-item label="Ngôn ngữ" prop="languageCode">
        <a-select v-model="form.languageCode">
          <a-select-option value="vi">Tiếng Việt</a-select-option>
          <a-select-option value="us">English</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="Danh mục" prop="categoryId">
        <a-select v-model="form.categoryId" placeholder="Chọn danh mục" :loading="loadingCategories" allow-clear>
          <a-select-option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">{{ c.categoryName }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="Vị trí" prop="position">
        <a-input v-model="form.position" />
      </a-form-model-item>

      <a-form-model-item label="Kinh nghiệm" prop="yearsOfExperience">
        <a-input v-model="form.yearsOfExperience" placeholder="VD: 2 năm" />
      </a-form-model-item>

      <a-form-model-item label="Địa điểm" prop="location">
        <a-input v-model="form.location" />
      </a-form-model-item>

      <a-form-model-item label="Mức lương" prop="salary">
        <a-input v-model="form.salary" placeholder="VD: 15 - 20 triệu" />
      </a-form-model-item>

      <a-form-model-item label="Ngày bắt đầu" prop="startDate">
        <a-date-picker v-model="form.startDate" style="width:100%" format="DD/MM/YYYY" />
      </a-form-model-item>

      <a-form-model-item label="Ngày kết thúc" prop="endDate">
        <a-date-picker v-model="form.endDate" style="width:100%" format="DD/MM/YYYY" />
      </a-form-model-item>

      <a-form-model-item v-if="isEdit" label="Trạng thái" prop="status">
        <a-select v-model="form.status">
          <a-select-option :value="1">Hiển thị</a-select-option>
          <a-select-option :value="0">Ẩn</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="File JD (HTML)">
        <a-upload :before-upload="onJdSelect" :show-upload-list="false" accept=".html,.htm">
          <a-button><a-icon type="upload" /> {{ jdFile ? jdFile.name : 'Chọn file JD' }}</a-button>
        </a-upload>
        <div v-if="isEdit && form.content && !jdFile" style="margin-top:6px">
          <a-button size="small" @click="previewCurrentJd"><a-icon type="eye" /> Xem JD hiện tại</a-button>
        </div>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import moment from "moment";
import axios from "axios";
import { createJob, updateJob, getCareerCategoryList } from "../../../../apis/interaction";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;

function defaultForm(languageCode) {
  return { languageCode: languageCode || "vi", categoryId: undefined, position: "", yearsOfExperience: "", location: "", salary: "", startDate: null, endDate: null, status: 1, content: null, jobId: null };
}

export default {
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
      categories: [],
      loadingCategories: false,
      rules: {
        categoryId: [{ required: false }],
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
        this.loadCategories();
        if (this.isEdit && this.record) {
          const r = this.record;
          const parseDate = (d) => d ? moment(d) : null;
          this.form = {
            languageCode: this.languageCode,
            jobId: r.jobId,
            categoryId: r.categoryId || undefined,
            position: r.position || "",
            yearsOfExperience: r.yearsOfExperience || "",
            location: r.location || "",
            salary: r.salary || "",
            startDate: parseDate(r.startDate),
            endDate: parseDate(r.endDate),
            status: r.status ?? 1,
            content: r.content || null,
          };
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
        this.categories = (res && res.data) ? res.data : [];
      } catch { this.categories = []; }
      finally { this.loadingCategories = false; }
    },
    onJdSelect(file) { this.jdFile = file; return false; },
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
      } catch { this.$message.error("Không thể tải file JD!"); }
    },
    handleSave() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.saving = true;
        try {
          const toISO = (m) => m ? (m.toISOString ? m.toISOString() : m) : undefined;
          if (this.isEdit) {
            const params = {
              languageCode: this.form.languageCode,
              jobId: this.form.jobId,
              categoryId: this.form.categoryId,
              position: this.form.position,
              yearsOfExperience: this.form.yearsOfExperience,
              location: this.form.location,
              salary: this.form.salary,
              startDate: toISO(this.form.startDate),
              endDate: toISO(this.form.endDate),
              status: this.form.status,
            };
            await updateJob(params, this.jdFile || null);
          } else {
            if (!this.jdFile) { this.$message.warning("Vui lòng chọn file JD!"); this.saving = false; return; }
            const params = {
              languageCode: this.form.languageCode,
              categoryId: this.form.categoryId,
              position: this.form.position,
              yearsOfExperience: this.form.yearsOfExperience,
              location: this.form.location,
              salary: this.form.salary,
              startDate: toISO(this.form.startDate),
              endDate: toISO(this.form.endDate),
            };
            await createJob(params, this.jdFile);
          }
          this.$message.success("Lưu thành công!");
          this.$emit("saved");
          this.$emit("close");
        } catch { this.$message.error("Có lỗi, vui lòng thử lại!"); }
        finally { this.saving = false; }
      });
    },
  },
};
</script>
