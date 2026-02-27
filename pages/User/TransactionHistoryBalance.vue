<template>
  <div class="user-page">
    <h2 class="title">{{ $t("transactionHistory") }}</h2>

    <!-- Filter -->
    <LogsFilter @search="searchTransactions" @reset="resetFilters">
      <template #fields>
        <div class="form-row">
          <div class="form-group">
            <label>{{ $t("userId") }}:</label>
            <input
              v-model="filters.userId"
              type="text"
              :placeholder="$t('userId')"
              class="tiny-input"
            />
          </div>
          <div class="form-group">
            <label>{{ $t("status") }}:</label>
            <select v-model="filters.status" class="tiny-input">
              <option value="">{{ $t("all") }}</option>
              <option value="1">{{ $t("complete") }}</option>
              <option value="0">{{ $t("error") }}</option>
            </select>
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
              v-model="filters.displayName"
              type="text"
              :placeholder="$t('displayName')"
              class="tiny-input"
            />
          </div>
          <div class="form-group">
            <label>{{ $t("transType") }}:</label>
            <select v-model="filters.transType" class="tiny-input">
              <option value="">{{ $t("all") }}</option>
              <option value="2">{{ $t("deposit") }}</option>
              <option value="3">{{ $t("withdraw") }}</option>
            </select>
          </div>
        </div>
      </template>
    </LogsFilter>

    <!-- Table -->
    <BoxTable
      :columns="columns"
      :data="transactions"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      :total="total"
      @page-change="handlePageChange"
    >
      <template #transType="{ record }"
        ><span>{{
          record.transType === 2 ? $t("deposit") : $t("withdraw")
        }}</span></template
      >
      <template #status="{ record }">
        <span
          class="status"
          :class="record.status === 1 ? 'complete' : 'error'"
        >
          {{ record.status === 1 ? $t("complete") : $t("error") }}
        </span>
      </template>
    </BoxTable>
  </div>
</template>

<script>
import moment from "moment";
import { getListTransaction } from "@/apis/users";
import LogsFilter from "../../components/BoxFilter/index.vue";
import BoxTable from "../../components/BoxTable/index.vue";

export default {
  name: "TransactionPage",
  middleware: "auth",
  layout: "adminLayout",
  components: { LogsFilter, BoxTable },

  data() {
    const end = moment();
    const start = moment().subtract(6, "days");
    return {
      transactions: [],
      loading: false,
      total: 0,
      page: 1,
      pageSize: 10,
      filters: {
        userId: "",
        displayName: "",
        status: "",
        transType: "",
        dateRange: [start, end],
      },
      columns: [
        { label: "ord", key: "ord" },
        { label: "displayName", key: "displayName" },
        { label: "userId", key: "userId" },
        { label: "userName", key: "userName" },
        {
          label: "balanceAmount",
          key: "amount",
          format: "amount",
          classFn: (v) => (v >= 0 ? "positive" : "negative"),
        },
        { label: "transType", key: "transType", slot: "transType" },
        { label: "date", key: "createdTime", format: "date" },
        { label: "status", key: "status", slot: "status" },
      ],
    };
  },

  computed: {
    pagination() {
      return {
        current: this.page,
        pageSize: this.pageSize,
        total: this.total,
      };
    },
  },

  mounted() {
    this.fetchTransactions();
  },

  methods: {
    fetchTransactions() {
      this.loading = true;

      const [start, end] = this.filters.dateRange || [];

      const params = {
        currentPage: this.page,
        recordPerPage: this.pageSize,
        userId: this.filters.userId || "",
        displayName: this.filters.displayName || "",
        StartDate: start ? start.toISOString() : null,
        EndDate: end ? end.toISOString() : null,
        status: this.filters.status ? Number(this.filters.status) : null,
        Type: this.filters.transType ? Number(this.filters.transType) : null,
      };

      getListTransaction(params)
        .then((res) => {
          if (res.responseCode === 1) {
            const records = res.data.records || [];
            this.transactions = records.map((r, index) => ({
              ord: (this.page - 1) * this.pageSize + index + 1,
              ...r,
            }));
            this.total = res.data.totalRecord || 0;
          } else {
            this.$message.error(res.message || "Failed to fetch data");
          }
        })
        .catch((error) => {
          console.error("fetchTransactions error:", error);
          this.$message.error("Error fetching transactions");
        })
        .finally(() => {
          this.loading = false;
        });
    },

    handlePageChange(page) {
      this.page = page;
      this.fetchTransactions();
    },

    searchTransactions() {
      this.page = 1;
      this.fetchTransactions();
    },

    resetFilters() {
      const end = moment();
      const start = moment().subtract(7, "days");
      this.filters = {
        userId: "",
        displayName: "",
        status: "",
        transType: "",
        dateRange: [start, end],
      };
      this.searchTransactions();
    },
  },
};
</script>

<style scoped>
.user-page {
  padding: 1rem;
}

.title {
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 1.125rem;
}

.amount.positive {
  color: #16a34a;
  font-weight: 600;
}
.amount.negative {
  color: #ef4444;
  font-weight: 600;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
}
.status.complete {
  background: #16a34a;
}
.status.error {
  background: #ef4444;
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
