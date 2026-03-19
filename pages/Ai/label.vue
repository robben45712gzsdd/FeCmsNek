<template>
  <div class="label-page">
    <div class="page-header">
      <h2 class="title">Quản lý Label AI</h2>
      <a-button type="primary" icon="plus" @click="openCreate">
        Thêm label
      </a-button>
    </div>

    <a-card class="filter-card" :bordered="false">
      <a-row :gutter="12">
        <a-col :xs="24" :sm="16" :md="12" :lg="10">
          <label class="field-label">KeyWord</label>
          <a-input
            v-model="keyword"
            placeholder="Nhập từ khóa label..."
            allow-clear
            @pressEnter="fetchList"
          />
        </a-col>
      </a-row>

      <a-row :gutter="12" class="actions-row">
        <a-col :xs="24" :sm="8" :md="12" :lg="8" class="actions-col">
          <a-button type="primary" icon="search" @click="fetchList">
            Tìm kiếm
          </a-button>
          <a-button icon="reload" @click="onReset">Đặt lại</a-button>
        </a-col>
      </a-row>
    </a-card>

    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      :pagination="{ pageSize: 10 }"
      row-key="id"
    >
      <template #ord="text, record, index">
        {{ index + 1 }}
      </template>

      <template #action="record">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>
            Hành Động <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item @click="viewDetail(record)">
              <a-icon type="eye" /> Xem chi tiết
            </a-menu-item>
            <a-menu-item @click="openEdit(record)">
              <a-icon type="edit" /> Sửa
            </a-menu-item>
            <a-menu-item class="danger-item" @click="confirmDelete(record)">
              <a-icon type="delete" /> Xóa
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-table>

    <a-modal
      :visible="detailVisible"
      title="Chi tiết Label"
      :footer="null"
      @cancel="detailVisible = false"
    >
      <a-spin :spinning="detailLoading">
        <div v-if="detailRecord" class="detail-grid">
          <p><strong>ID:</strong> {{ detailRecord.id ?? "-" }}</p>
          <p><strong>NameId:</strong> {{ detailRecord.nameId ?? "-" }}</p>
          <p><strong>LanguageCode:</strong> {{ detailRecord.languageCode || "-" }}</p>
          <p><strong>LabelName:</strong> {{ detailRecord.labelName || "-" }}</p>
        </div>
      </a-spin>
    </a-modal>

    <a-modal
      :visible="formVisible"
      :title="isEdit ? 'Cập nhật Label' : 'Tạo Label m�>i'"
      :confirm-loading="formLoading"
      ok-text="Lưu"
      cancel-text="Hủy"
      @ok="submitForm"
      @cancel="closeForm"
    >
      <a-form-model :model="formModel" layout="vertical">
        <a-form-model-item label="LanguageCode">
          <a-select
            v-model="formModel.languageCode"
            style="width: 100%"
            @change="onFormLanguageChange"
          >
            <a-select-option value="vi">Tiếng Việt (vi)</a-select-option>
            <a-select-option value="en">Tiếng Anh (en)</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="LabelName" required>
          <a-input
            v-model="formModel.labelName"
            placeholder="Nhập tên label"
            :max-length="120"
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import {
  getListLabelCMS,
  getDetailLabel,
  createLabel,
  updateLabel,
  deleteLabel,
} from "../../apis/ai";

export default {
  name: "AiLabelPage",
  layout: "adminLayout",
  middleware: "auth",
  data() {
    return {
      loading: false,
      list: [],
      keyword: "",
      langCode: "vi",
      detailVisible: false,
      detailLoading: false,
      detailRecord: null,
      formVisible: false,
      formLoading: false,
      isEdit: false,
      formModel: {
        id: null,
        languageCode: "vi",
        labelName: "",
      },
    };
  },
  computed: {
    columns() {
      return [
        {
          title: "#",
          key: "ord",
          scopedSlots: { customRender: "ord" },
          width: 60,
        },
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
          width: 100,
        },
        {
          title: "NameId",
          dataIndex: "nameId",
          key: "nameId",
          width: 120,
        },
        {
          title: "LabelName",
          dataIndex: "labelName",
          key: "labelName",
        },
        {
          title: "Hành Động",
          key: "action",
          scopedSlots: { customRender: "action" },
          width: 150,
        },
      ];
    },
  },
  watch: {
    "$i18n.locale": {
      handler(newLocale) {
        const nextLang = this.normalizeLanguageCode(newLocale);
        if (nextLang !== this.langCode) {
          this.langCode = nextLang;
          this.fetchList();
        }
      },
    },
  },
  mounted() {
    this.syncLanguageFromSystem();
    this.fetchList();
  },
  methods: {
    normalizeLanguageCode(locale) {
      if (!locale) return "vi";
      const normalized = String(locale).toLowerCase();
      if (normalized === "us") return "en";
      return normalized === "en" ? "en" : "vi";
    },
    syncLanguageFromSystem() {
      const savedLang = localStorage.getItem("selectedLanguage");
      const sourceLang = this.$i18n.locale || savedLang || "vi";
      this.langCode = this.normalizeLanguageCode(sourceLang);
    },
    async fetchList() {
      this.loading = true;
      try {
        const params = {
          LanguageCode: this.langCode,
          KeyWord: this.keyword || undefined,
        };
        const res = await getListLabelCMS(params);
        this.list = Array.isArray(res?.data) ? res.data : [];
      } catch (error) {
        this.$message.error("Không th�f tải danh sách label");
      } finally {
        this.loading = false;
      }
    },
    onReset() {
      this.keyword = "";
      this.fetchList();
    },
    async viewDetail(record) {
      this.detailVisible = true;
      this.detailLoading = true;
      this.detailRecord = null;
      try {
        const params = {
          Id: record.id,
          LanguageCode: this.langCode,
        };
        const res = await getDetailLabel(params);
        this.detailRecord = res?.data || { ...record };
      } catch (error) {
        this.detailRecord = { ...record, languageCode: this.langCode };
        this.$message.error("Không th�f tải chi tiết label");
      } finally {
        this.detailLoading = false;
      }
    },
    openCreate() {
      this.isEdit = false;
      this.formModel = {
        id: null,
        languageCode: this.langCode,
        labelName: "",
      };
      this.formVisible = true;
    },
    async openEdit(record) {
      this.isEdit = true;
      this.formVisible = true;
      this.formLoading = true;
      try {
        const params = {
          Id: record.id,
          LanguageCode: this.langCode,
        };
        const res = await getDetailLabel(params);
        const detail = res?.data || {};
        this.formModel = {
          id: detail.id || record.id,
          languageCode: this.langCode,
          labelName: detail.labelName || record.labelName || "",
        };
      } catch (error) {
        this.formModel = {
          id: record.id,
          languageCode: this.langCode,
          labelName: record.labelName || "",
        };
        this.$message.error("Không th�f tải dữ li�?u label");
      } finally {
        this.formLoading = false;
      }
    },
    async onFormLanguageChange(languageCode) {
      if (!this.isEdit || !this.formModel.id) return;

      this.formLoading = true;
      try {
        const params = {
          Id: this.formModel.id,
          LanguageCode: languageCode,
        };
        const res = await getDetailLabel(params);
        const detail = res?.data || {};
        this.formModel = {
          id: this.formModel.id,
          languageCode,
          labelName: detail.labelName || "",
        };
      } catch (error) {
        this.formModel = {
          ...this.formModel,
          languageCode,
          labelName: "",
        };
        this.$message.warning("Chưa có dữ li�?u cho ngôn ngữ này, bạn có th�f nhập m�>i");
      } finally {
        this.formLoading = false;
      }
    },
    closeForm() {
      this.formVisible = false;
      this.formLoading = false;
    },
    confirmDelete(record) {
      this.$confirm({
        title: "Xác nhận xóa label",
        content: `Bạn có chắc muốn xóa label \"${record.labelName || record.id}\"?`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: () => this.handleDelete(record),
      });
    },
    async handleDelete(record) {
      try {
        const body = {
          id: record.id,
          languageCode: this.langCode,
        };
        await deleteLabel(body);
        this.$message.success("Xóa label thành công");
        this.fetchList();
      } catch (error) {
        this.$message.error("Xóa label thất bại");
      }
    },
    async submitForm() {
      const labelName = (this.formModel.labelName || "").trim();
      if (!labelName) {
        this.$message.warning("Vui lòng nhập LabelName");
        return;
      }

      this.formLoading = true;
      try {
        if (this.isEdit) {
          const body = {
            id: this.formModel.id,
            languageCode: this.formModel.languageCode,
            labelName,
          };
          await updateLabel(body);
          this.$message.success("Cập nhật label thành công");
        } else {
          const body = {
            languageCode: this.formModel.languageCode,
            labelName,
          };
          await createLabel(body);
          this.$message.success("Tạo label thành công");
        }
        this.formVisible = false;
        this.fetchList();
      } catch (error) {
        this.$message.error(this.isEdit ? "Cập nhật label thất bại" : "Tạo label thất bại");
      } finally {
        this.formLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.label-page {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 10px;
}

.field-label {
  display: inline-block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.actions-row {
  margin-top: 12px;
}

.actions-col {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-grid p {
  margin-bottom: 8px;
}

.danger-item {
  color: #d4380d;
}
</style>
