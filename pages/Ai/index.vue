<template>
  <div class="ai-page">
    <div class="page-header">
      <h2 class="title">Danh sách AI</h2>
      <a-button type="primary" icon="plus" @click="onCreate">
        Thêm AI
      </a-button>
    </div>

    <a-card class="filter-card" :bordered="false">
      <a-row :gutter="12">
        <a-col :xs="24" :sm="16" :md="12" :lg="10">
          <label class="field-label">KeyWord</label>
          <a-input
            v-model="filters.KeyWord"
            placeholder="Nhập từ khóa tìm kiếm..."
            allow-clear
            @pressEnter="onSearch"
          />
        </a-col>
      </a-row>

      <a-row :gutter="12" class="actions-row">
        <a-col :xs="24" :sm="8" :md="12" :lg="8" class="actions-col">
          <a-button type="primary" icon="search" @click="onSearch">
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
      :pagination="pagination"
      row-key="id"
      @change="onTableChange"
    >
      <template #demo="val">
        <span>{{ Number(val) === 1 ? "Có demo" : "Không có demo" }}</span>
      </template>

      <template #status="val">
        <a-tag :color="Number(val) === 1 ? 'green' : 'red'">
          {{ Number(val) === 1 ? "Hiện" : "Ẩn" }}
        </a-tag>
      </template>

      <template #action="record">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>
            Hành động <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item @click="onViewDetail(record)">
              <a-icon type="eye" /> Xem chi tiết
            </a-menu-item>
            <a-menu-item @click="onEdit(record)">
              <a-icon type="edit" /> Sửa
            </a-menu-item>
            <a-menu-item @click="onDelete(record)">
              <a-icon type="delete" style="color: #ff4d4f" />
              <span style="color: #ff4d4f"> Xóa</span>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-table>

    <a-modal
      :visible="detailVisible"
      title="Chi tiết AI"
      :footer="null"
      @cancel="detailVisible = false"
    >
      <a-spin :spinning="detailLoading">
        <div v-if="detailRecord" class="detail-grid">
          <p><strong>ID:</strong> {{ detailRecord.id ?? "-" }}</p>
          <p><strong>TitleId:</strong> {{ detailRecord.titleId ?? "-" }}</p>
          <p><strong>DescriptionId:</strong> {{ detailRecord.descriptionId ?? "-" }}</p>
          <p><strong>Title:</strong> {{ detailRecord.title || "-" }}</p>
          <p><strong>Description:</strong> {{ detailRecord.description || "-" }}</p>
          <p><strong>DemoUrl:</strong> {{ detailRecord.demoUrl || "-" }}</p>
          <p><strong>Demo:</strong> {{ Number(detailRecord.isDemo) === 1 ? "Có demo" : "Không có demo" }}</p>
          <p><strong>Status:</strong> {{ Number(detailRecord.status) === 1 ? "Hiện" : "Ẩn" }}</p>
          <p><strong>CreatedAt:</strong> {{ formatDate(detailRecord.createdAt) }}</p>

          <div class="labels-row">
            <strong>Labels:</strong>
            <div class="labels-wrap">
              <a-tag
                v-for="label in detailRecord.labels || []"
                :key="label.id"
                color="blue"
              >
                {{ label.labelName }}
              </a-tag>
              <span v-if="!detailRecord.labels || detailRecord.labels.length === 0">-</span>
            </div>
          </div>
        </div>
      </a-spin>
    </a-modal>

    <AiEditModal
      :visible="editVisible"
      :record-id="editRecordId"
      :language-code="filters.LanguageCode"
      @close="closeEdit"
      @updated="onUpdated"
    />
  </div>
</template>

<script>
import { getListAICMS, getDetailAI, deleteAI } from "../../apis/ai";
import AiEditModal from "./components/AiEditModal.vue";

export default {
  name: "AiDemoPage",
  layout: "adminLayout",
  middleware: "auth",
  components: {
    AiEditModal,
  },
  data() {
    return {
      loading: false,
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
      filters: {
        LanguageCode: "",
        KeyWord: "",
      },
      detailVisible: false,
      detailRecord: null,
      detailLoading: false,
      editVisible: false,
      editRecordId: null,
    };
  },
  computed: {
    columns() {
      return [
        {
          title: "#",
          dataIndex: "ord",
          key: "ord",
          width: 60,
        },
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
          width: 80,
        },
        {
          title: "Title",
          dataIndex: "title",
          key: "title",
          ellipsis: true,
          width: 220,
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
          ellipsis: true,
          width: 320,
        },
        {
          title: "Demo",
          dataIndex: "isDemo",
          key: "demo",
          scopedSlots: { customRender: "demo" },
          width: 130,
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          scopedSlots: { customRender: "status" },
          width: 130,
        },
        {
          title: "Hành động",
          key: "action",
          scopedSlots: { customRender: "action" },
          width: 150,
        },
      ];
    },
    pagination() {
      return {
        current: this.page,
        pageSize: this.pageSize,
        total: this.total,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50"],
        showTotal: (t) => `Tổng ${t} bản ghi`,
      };
    },
  },
  watch: {
    "$i18n.locale": {
      handler(newLocale) {
        const nextLang = this.normalizeLanguageCode(newLocale);
        if (nextLang !== this.filters.LanguageCode) {
          this.filters.LanguageCode = nextLang;
          this.page = 1;
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
      this.filters.LanguageCode = this.normalizeLanguageCode(sourceLang);
    },
    formatDate(value) {
      if (!value) return "-";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      const locale = this.filters.LanguageCode === "en" ? "en-US" : "vi-VN";
      return d.toLocaleString(locale);
    },
    buildParams() {
      return {
        LanguageCode: this.filters.LanguageCode || undefined,
        KeyWord: this.filters.KeyWord || undefined,
        CurrentPage: this.page,
        RecordPerPage: this.pageSize,
      };
    },
    async fetchList() {
      this.loading = true;
      try {
        const res = await getListAICMS(this.buildParams());
        const records = res?.data?.records || [];
        this.total = res?.data?.totalRecord || 0;
        this.list = records.map((item, index) => ({
          ...item,
          ord: (this.page - 1) * this.pageSize + index + 1,
        }));
      } catch (error) {
        this.$message.error("Không thể tải danh sách AI");
      } finally {
        this.loading = false;
      }
    },
    onSearch() {
      this.page = 1;
      this.fetchList();
    },
    onReset() {
      this.filters = {
        LanguageCode: this.normalizeLanguageCode(this.$i18n.locale),
        KeyWord: "",
      };
      this.page = 1;
      this.pageSize = 10;
      this.fetchList();
    },
    onTableChange(pagination) {
      const nextPage = pagination?.current || 1;
      const nextPageSize = pagination?.pageSize || this.pageSize;
      const changedPageSize = nextPageSize !== this.pageSize;

      this.pageSize = nextPageSize;
      this.page = changedPageSize ? 1 : nextPage;
      this.fetchList();
    },
    async onViewDetail(record) {
      this.detailVisible = true;
      this.detailLoading = true;
      try {
        const params = {
          Id: record.id,
          LanguageCode: this.filters.LanguageCode,
        };
        const res = await getDetailAI(params);
        this.detailRecord = res?.data || { ...record };
      } catch (error) {
        this.detailRecord = { ...record };
        this.$message.error("Không thể tải chi tiết AI");
      } finally {
        this.detailLoading = false;
      }
    },
    onEdit(record) {
      this.editRecordId = record.id;
      this.editVisible = true;
    },
    onCreate() {
      this.editRecordId = null;
      this.editVisible = true;
    },
    closeEdit() {
      this.editVisible = false;
      this.editRecordId = null;
    },
    onUpdated() {
      this.closeEdit();
      this.fetchList();
    },
    onDelete(record) {
      this.$confirm({
        title: "Xác nhận xóa",
        content: `Bạn có chắc muốn xóa AI ID ${record.id}?`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            await deleteAI({ id: record.id });
            this.$message.success("Xóa AI thành công");

            if (this.list.length === 1 && this.page > 1) {
              this.page -= 1;
            }
            this.fetchList();
          } catch (error) {
            this.$message.error("Xóa AI thất bại");
          }
        },
      });
    },
  },
};
</script>

<style scoped>
.ai-page {
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

.actions-col {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-row {
  margin-top: 12px;
}

.detail-grid p {
  margin-bottom: 8px;
}

.labels-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.labels-wrap {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

</style>
