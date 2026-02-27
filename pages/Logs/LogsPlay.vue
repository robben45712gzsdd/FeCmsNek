<template>
  <div class="logs-page">
    <h2 class="title">{{ $t("logsPlay") }}</h2>

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
            <label>{{ $t("providerId") }}:</label>
            <input
              type="text"
              :placeholder="$t('providerId')"
              v-model="filters.provider"
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

        <div class="form-row">
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
            <label>{{ $t("referenceKey") }}:</label>
            <input
              type="text"
              :placeholder="$t('referenceKey')"
              v-model="filters.refKey"
              class="tiny-input"
            />
          </div>
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
      @view-detail="showDetail"
      ><template slot="action" slot-scope="{ record }">
        <a-button type="link" @click="showDetail(record.gameHistoryId)">
          {{ $t("viewDetail") }}
        </a-button>
      </template></LogsTable
    >
    <LogPlayBoardDetailDialog
      :visible="isDetailVisible"
      :gameHistoryId="selectedGameHistoryId"
      @close="isDetailVisible = false"
    />
  </div>
</template>

<script>
import moment from "moment";
import { getLogPlayByCustomer } from "../../apis/logs";
import {
  amountClass,
} from "../../utils/formatHelper";
import BoxFilter from "../../components/BoxFilter/index.vue";
import LogsTable from "../../components/BoxTable/index.vue";
import LogPlayBoardDetailDialog from "../Logs/DetailLogs/LogPlayDetail.vue";

export default {
  name: "LogsPlayPage",
  middleware: "auth",
  layout: "adminLayout",
  components: { BoxFilter, LogsTable, LogPlayBoardDetailDialog },

  data() {
    const end = moment();
    const start = moment().subtract(1, "months");

    return {
      filters: {
        username: "",
        provider: "",
        refKey: "",
        displayName: "",
        dateRange: [start, end],
      },
      columns: [
        { label: "#", key: "index" },
        { label: "username", key: "userName" },
        { label: "displayName", key: "displayName" },
        { label: "providerId", key: "provider" },
        { label: "gameCode", key: "gameCode" },
        { label: "refKey", key: "refKey" },
        {
          label: "playAmount",
          key: "playAmount",
          format: "amount",
          classFn: amountClass,
        },
        { label: "awardAmount", key: "awardAmount", format: "amount" },
        { label: "refundAmount", key: "refundAmount", format: "amount" },
        { label: "othersAmount", key: "othersAmount", format: "amount" },
        { label: "lastAction", key: "lastAction" },
        { label: "createdTime", key: "createdTime", format: "date" },
        { label: "updatedTime", key: "updatedTime", format: "date" },
        {
          label: "action",
          key: "action",
          slot: "action",
        },
      ],
      logs: [],
      totalRecord: 0,
      pageSize: 5,
      currentPage: 1,
      loading: false,
      isDetailVisible: false,
      selectedGameHistoryId: null,
    };
  },

  async mounted() {
    await this.fetchLogs();
  },

  methods: {
    async fetchLogs() {
        this.loading = true;
        const [start, end] = this.filters.dateRange || [];
        const params = {
          StartDate: start ? start.toISOString() : null,
          EndDate: end ? end.toISOString() : null,
          UserName: this.filters.username || null,
          ProviderId: this.filters.provider || null,
          DisplayName: this.filters.displayName || null,
          RefKey: this.filters.refKey || null,
          currentPage: this.currentPage,
          recordPerPage: this.pageSize,
        };
        getLogPlayByCustomer(params)
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
            console.warn("API returned:", res.message);
          }
        })
        .catch((err) => {
          console.error("Error loading logs:", err);
          this.logs = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },

    searchLogs() {
      this.currentPage = 1;
      this.fetchLogs();
    },
    showDetail(gameHistoryId) {
      this.selectedGameHistoryId = gameHistoryId;
      this.isDetailVisible = true;
    },
    resetFilters() {
      const end = moment();
      const start = moment().subtract(1, "months");
      this.filters = {
        username: "",
        provider: "",
        refKey: "",
        displayName: "",
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
.filter-form {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #eef2f6;
}
.button-actions {
  display: flex;
  padding: 20px 20px 20px 0px;
  gap: 20px;
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

.tiny-input,
.date-inputs input {
  height: 36px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d0d7dd;
  background: #fff;
  font-size: 0.95rem;
  width: 220px;
}
</style>
