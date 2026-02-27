<template>
  <div class="logs-page">
    <h2 class="title">{{ $t("logsError") }}</h2>

    <BoxFilter @search="searchLogs" @reset="resetFilters">
      <template #fields>
        <div class="form-row">
          <div class="form-group">
            <label>{{ $t("username") }}:</label>
            <input
              type="text"
              :placeholder="$t('username')"
              v-model="filters.username"
              class="tiny-input"
            />
          </div>

          <div class="form-group">
            <label>{{ $t("displayName") }}:</label>
            <input
              type="text"
              :placeholder="$t('displayName')"
              v-model="filters.displayName"
              class="tiny-input"
            />
          </div>

          <div class="form-group">
            <label>{{ $t("dateRange") }}:</label>
            <a-range-picker
              v-model="filters.dateRange"
              format="YYYY-MM-DD"
              :allowClear="false"
            />
          </div>
        </div>
        <div class="form-group">
          <label>{{ $t("errorCode") }}:</label>
          <select v-model="filters.errorCode" class="tiny-input">
            <option value="0">{{ $t("all") }}</option>
            <option value="1">{{ $t("error") }}</option>
          </select>
        </div>
      </template>
    </BoxFilter>

    <LogsTable
      :columns="columns"
      :data="logs"
      :loading="loading"
      :page="currentPage"
      :page-size="pageSize"
      :total="totalRecord"
      @page-change="onChangePage"
      ><template #action="{ record }">
        <a-button type="link" @click="openDetailDialog(record)">
          {{ $t("viewDetail") }}
        </a-button>
      </template></LogsTable
    >
    <LogsErrorDetailDialog
      :visible="showDialog"
      :id="selectedId"
      @close="showDialog = false"
    />
  </div>
</template>

<script>
import moment from "moment";
import { getListLogErrorBoard } from "../../apis/logs";
import { amountClass } from "../../utils/formatHelper";
import BoxFilter from "../../components/BoxFilter/index.vue";
import LogsTable from "../../components/BoxTable/index.vue";
import LogsErrorDetailDialog from "../../pages/Logs/DetailLogs/LogErrorDetail.vue";

export default {
  name: "LogsErrorPage",
  middleware: "auth",
  layout: "adminLayout",
  components: { BoxFilter, LogsTable, LogsErrorDetailDialog },

  data() {
    const end = moment();
    const start = moment().subtract(1, "months");
    return {
      filters: {
        username: "",
        displayName: "",
        errorCode: "0",
        dateRange: [start, end],
      },
      columns: [
        { label: "#", key: "index" },
        { label: "userName", key: "userName" },
        { label: "userId", key: "userId" },
        { label: "displayName", key: "displayName" },
        { label: "transactionId", key: "transactionId" },
        {
          label: "totalAmount",
          key: "totalAmount",
          format: "amount",
          classFn: amountClass,
        },
        { label: "errorCode", key: "errorCode" },
        { label: "description", key: "description" },
        { label: "note", key: "note" },
        { label: "date", key: "date", format: "date" },
        {
          label: "action",
          key: "action",
          slot: "action",
        },
      ],
      logs: [],
      totalRecord: 0,
      pageSize: 10,
      currentPage: 1,
      loading: false,
      showDialog: false,
      selectedId: null,
    };
  },

  async mounted() {
    await this.fetchLogs();
  },

  methods: {
    fetchLogs() {
      this.loading = true;

      const [start, end] = this.filters.dateRange || [];
      const params = {
        UserId: null,
        UserName: this.filters.username || null,
        DisplayName: this.filters.displayName || null,
        ErrorCode: Number(this.filters.errorCode),
        StartDate: start ? start.toISOString() : null,
        EndDate: end ? end.toISOString() : null,
        currentPage: this.currentPage,
        recordPerPage: this.pageSize,
      };

      getListLogErrorBoard(params)
        .then((res) => {
          if (res.responseCode === 1) {
            this.logs = (res.data.records || []).map((r, i) => ({
              index: (this.currentPage - 1) * this.pageSize + i + 1,
              ...r,
            }));
            this.totalRecord = res.data.totalRecord || 0;
          } else {
            this.logs = [];
            this.totalRecord = 0;
            this.$message.warning(res.message || "Không có dữ liệu phù hợp!");
          }
        })
        .catch((err) => {
          this.logs = [];
          this.totalRecord = 0;
          this.$message.error(err?.message || "Lỗi khi tải dữ liệu!");
        })
        .finally(() => {
          this.loading = false;
        });
    },

    searchLogs() {
      this.currentPage = 1;
      this.fetchLogs();
    },
    openDetailDialog(record) {
      this.selectedId = record.id;
      this.showDialog = true;
    },

    resetFilters() {
      const end = moment();
      const start = moment().subtract(1, "months");
      this.filters = {
        username: "",
        displayName: "",
        errorCode: "0",
        dateRange: [start, end],
      };
      this.currentPage = 1;
      this.fetchLogs();
    },

    onChangePage(page) {
      this.currentPage = page;
      this.fetchLogs();
    },
  },
};
</script>

<style scoped>
.logs-page {
  padding: 1rem;
  color: #111827;
}
.title {
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 1.125rem;
}
.form-row {
  display: flex;
  gap: 2.75rem;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  min-width: 160px;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}
.tiny-input {
  height: 36px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d0d7dd;
  background: #fff;
  font-size: 0.95rem;
  width: 220px;
}
</style>
