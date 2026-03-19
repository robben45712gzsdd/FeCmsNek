<template>
  <div class="logs-page">
    <h2 class="title">{{ $t("logsTransaction") }}</h2>

    <BoxFilter
      v-model="filters"
      :showActionType="true"
      @search="searchLogs"
      @reset="resetFilters"
    >
      <template #fields>
        <div class="form-row">
          <div class="form-group">
            <label>{{ $t("userName") }}:</label>
            <input
              type="text"
              v-model="filters.username"
              class="tiny-input"
              :placeholder="$t('userName')"
            />
          </div>
          <div class="form-group">
            <label>{{ $t("referenceKey") }}:</label>
            <input
              type="text"
              v-model="filters.reference"
              class="tiny-input"
              :placeholder="$t('referenceKey')"
            />
          </div>
          <div class="form-group">
            <label>{{ $t("dateRange") }}:</label>
            <a-range-picker
              v-model="filters.dateRange"
              :format="'YYYY-MM-DD'"
              :allowClear="false"
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ $t("displayName") }}:</label>
            <input
              type="text"
              v-model="filters.displayName"
              class="tiny-input"
              :placeholder="$t('displayName')"
            />
          </div>
          <div class="form-group">
            <label>{{ $t("actionType") }}:</label>
            <select v-model="filters.actionType" class="tiny-input">
              <option value="All">{{ $t("all") }}</option>
              <option value="Deposit">{{ $t("deposit") }}</option>
              <option value="Withdraw">{{ $t("withdraw") }}</option>
            </select>
          </div>
        </div>
      </template>
    </BoxFilter>

    <TableLogs
      :columns="columns"
      :data="paginated"
      :loading="loading"
      :page="currentPage"
      :page-size="pageSize"
      :total="totalRecords"
      @page-change="goTo"
    >
      <template #action="{ record }">
        <a-button type="link" @click="openDetailDialog(record)">
          {{ $t("viewDetail") }}
        </a-button>
      </template>
    </TableLogs>

    <LogDepositDetail
      :visible="showDialog"
      :id="selectedId"
      @close="showDialog = false"
    />
  </div>
</template>

<script>
import moment from "moment";
import * as logsAPI from "../../apis/logs";
import BoxFilter from "../../components/BoxFilter/index.vue";
import TableLogs from "../../components/BoxTable/index.vue";
import LogDepositDetail from "./DetailLogs/LogDepositDetail.vue";

export default {
  name: "LogsTransactionPage",
  middleware: "auth",
  layout: "adminLayout",
  components: { BoxFilter, TableLogs, LogDepositDetail },
  data() {
    const end = moment();
    const start = moment().subtract(6, "days");
    return {
      filters: {
        username: "",
        reference: "",
        displayName: "",
        actionType: "All",
        dateRange: [start, end],
      },
      columns: [
        { label: "Id", key: "id" },
        { label: "userName", key: "username" },
        { label: "displayName", key: "displayName" },
        { label: "referenceKey", key: "referenceKey" },
        {
          label: "amount",
          key: "amount",
          format: "amount",
          classFn: (val) => (val < 0 ? "negative" : "positive"),
        },
        { label: "balance", key: "balance", format: "amount" },
        { label: "actionType", key: "actionType" },
        { label: "date", key: "date", format: "date" },
        { label: "action", key: "action", slot: "action" },
      ],
      allLogs: [],
      pageSize: 5,
      currentPage: 1,
      totalRecords: 0,
      loading: false,
      showDialog: false,
      selectedId: null,
    };
  },
  computed: {
    
  
    totalPages() {
      return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
    },
    paginated() {
      return this.allLogs;
    },
  },
  mounted() {
    this.getLogs();
  },
  methods: {
    getLogs() {
      this.loading = true;
      const [start, end] = this.filters.dateRange || [];
      const params = {
        currentPage: this.currentPage,
        recordPerPage: this.pageSize,
        userName: this.filters.username || "",
        refKey: this.filters.reference || "",
        displayName: this.filters.displayName || "",
        actionType:
          this.filters.actionType === "All"
            ? null
            : this.filters.actionType === "Deposit"
            ? 1
            : 2,
        StartDate: start ? start.toISOString() : null,
        EndDate: end ? end.toISOString() : null,
      };

      logsAPI
        .getListLogTransaction(params)
        .then((res) => {
          const records = res?.data?.records || [];
          this.totalRecords = res?.data?.totalRecord || records.length;
          this.allLogs = records.map((r) => ({
            id: r.id,
            username: r.userName,
            displayName: r.displayName,
            referenceKey: r.refKey,
            amount: Number(r.amount),
            balance: Number(r.balance),
            actionType: r.actionType,
            date: r.createdTime,
          }));
        })
        .catch((err) => {
          console.error("Error loading logs:", err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    searchLogs() {
      this.currentPage = 1;
      this.getLogs();
    },
    openDetailDialog(record) {
      this.selectedId = record.id;
      this.showDialog = true;
    },
    resetFilters() {
      const end = moment();
      const start = moment().subtract(7, "days");
      this.filters = {
        username: "",
        reference: "",
        displayName: "",
        actionType: "All",
        dateRange: [start, end],
      };
      this.currentPage = 1;
      this.getLogs();
    },
    goTo(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.getLogs();
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
