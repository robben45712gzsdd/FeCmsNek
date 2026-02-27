<template>
  <div class="dashboard">
    <a-spin :spinning="loading" :tip="$t('loadingData')">
      <h2 class="user-title">
        {{ $t("user") }} {{ user.username || "Không rõ người dùng" }}
      </h2>

      <!-- Bộ lọc -->
      <div class="filter-section">
        <div class="filter-section-item">
          <h3 class="filter-title">
            {{ $t("filterByProvider") || "Filter by Provider" }}
          </h3>
          <div class="filter-row">
            <a-select
              v-model="selectedCategory"
              style="width: 200px"
              @change="loadData"
            >
              <a-select-option value="-1">{{ $t("all") }}</a-select-option>
              <a-select-option
                v-for="provider in providers"
                :key="provider.providerId"
                :value="provider.providerId"
              >
                {{ provider.providerName }}
              </a-select-option>
            </a-select>
          </div>
        </div>

        <div class="filter-section-item">
          <h3 class="filter-title">
            {{ $t("filterByDate") || "Filter by Date" }}
          </h3>
          <div class="filter-row">
            <a-range-picker
              v-model="dateRange"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              :placeholder="[$t('startDate'), $t('endDate')]"
            />
            <a-button type="default" @click="loadData">
              {{ $t("search") }}
            </a-button>
          </div>
        </div>
      </div>

      <!-- Thống kê -->
      <div class="card-row">
        <div class="stat-card balance">
          <p>{{ $t("totalBalanceUser") }}</p>
          <h3 :class="{ negative: stats.balanceUser < 0 }">
            {{ (stats.balanceUser || 0).toLocaleString() }}
          </h3>
        </div>
        <div class="stat-card profit">
          <p>{{ $t("totalProfitUser") }}</p>
          <h3 :class="{ negative: stats.profitUser < 0 }">
            {{ (stats.profitUser || 0).toLocaleString() }}
          </h3>
        </div>
        <div class="stat-card deposit">
          <p>{{ $t("totalDeposit") }}</p>
          <h3 :class="{ negative: stats.deposit < 0 }">
            {{ (stats.deposit || 0).toLocaleString() }}
          </h3>
        </div>
        <div class="stat-card withdraw">
          <p>{{ $t("totalWithdraw") }}</p>
          <h3 :class="{ negative: stats.withdraw < 0 }">
            {{ (stats.withdraw || 0).toLocaleString() }}
          </h3>
        </div>
        <div class="stat-card total-buy">
          <p>{{ $t("totalBuy") }}</p>
          <h3 :class="{ negative: stats.totalBuy < 0 }">
            {{ (stats.totalBuy || 0).toLocaleString() }}
          </h3>
        </div>
        <div class="stat-card receive-amount">
          <p>{{ $t("receiveAmount") }}</p>
          <h3 :class="{ negative: stats.receiveAmount < 0 }">
            {{ (stats.receiveAmount || 0).toLocaleString() }}
          </h3>
        </div>
      </div>

      <!-- Bảng dữ liệu -->
      <box-table
        :title="$t('providerLog')"
        :columns="columns"
        :data="tableData"
        :loading="tableLoading"
        :page="pagination.currentPage"
        :page-size="pagination.recordPerPage"
        :total="pagination.totalRecord"
        @page-change="handlePageChange"
      />
    </a-spin>
  </div>
</template>

<script>
import { getProviders } from "../../apis/dashboard";
import { getOverviewByUser,getLogProviderByUser } from "../../apis/users";
import BoxTable from "../../components/BoxTable/index.vue";
import moment from "moment";

export default {
  components: { BoxTable },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      tableLoading: false,
      dateRange: [],
      providers: [],
      selectedCategory: "-1",
      stats: {
        deposit: 0,
        withdraw: 0,
        balanceUser: 0,
        profitUser: 0,
        totalBuy: 0,
        receiveAmount: 0,
      },
      tableData: [],
      pagination: {
        currentPage: 1,
        recordPerPage: 10,
        totalRecord: 0,
      },
      columns: [
        { key: "provider", label: this.$t("provider") },
        { key: "amount", label: this.$t("amount") },
        { key: "balance", label: this.$t("balance") },
        { key: "time", label: this.$t("time") },
        { key: "description", label: this.$t("description") },
      ],
    };
  },

  watch: {
    "user.userId": {
      immediate: true,
      async handler(newVal) {
        if (!newVal) return;
        if (!this.dateRange?.length) {
          const now = moment();
          const oneDayAgo = moment().subtract(1, "day");
          this.dateRange = [oneDayAgo, now];
        }

        await this.loadData();
      },
    },
  },

  async mounted() {
    const now = moment();
    const oneDayAgo = moment().subtract(1, "day");
    this.dateRange = [oneDayAgo, now];
    await this.loadProviders();
  },

  methods: {
    async loadProviders() {
      try {
        this.loading = true;
        const res = await getProviders({ currentPage: 1, recordPerPage: 50 });
        this.providers = res.data.records || [];
      } catch (err) {
        this.$message.error(this.$t("error1.loadProviders"));
      } finally {
        this.loading = false;
      }
    },

    async loadData() {
      try {
        if (!this.dateRange?.length) {
          const now = moment();
          const oneDayAgo = moment().subtract(1, "day");
          this.dateRange = [oneDayAgo, now];
        }

        this.loading = true;
        await this.loadOverview();
        await this.loadLogProvider();
      } catch (err) {
        this.$message.error(this.$t("error1.loadDataFailed"));
      } finally {
        this.loading = false;
      }
    },

    async loadOverview() {
      const [start, end] = this.dateRange;
      const res = await getOverviewByUser({
        userId: this.user.userId,
        startDate: start.format("YYYY-MM-DDTHH:mm:ss"),
        endDate: end.format("YYYY-MM-DDTHH:mm:ss"),
        providerId:
          this.selectedCategory === "-1" ? -1 : Number(this.selectedCategory),
      });
      const overviewUser = res.data || {};
      this.stats = {
        deposit: overviewUser.deposit || 0,
        withdraw: overviewUser.withdraw || 0,
        balanceUser: overviewUser.balanceUser || 0,
        profitUser: overviewUser.profitUser || 0,
        totalBuy: overviewUser.totalBuy || 0,
        receiveAmount: overviewUser.receiveAmount || 0,
      };
    },

    async loadLogProvider() {
      try {
        this.tableLoading = true;
        const [start, end] = this.dateRange;
        const res = await getLogProviderByUser({
          userId: this.user.userId,
          startDate: start.format("YYYY-MM-DDTHH:mm:ss"),
          endDate: end.format("YYYY-MM-DDTHH:mm:ss"),
          providerId:
            this.selectedCategory === "-1" ? -1 : Number(this.selectedCategory),
          currentPage: this.pagination.currentPage,
          recordPerPage: this.pagination.recordPerPage,
        });

        this.tableData = res.data.records || [];
        this.pagination.totalRecord = res.data.totalRecord || 0;
      } catch (err) {
        this.$message.error(this.$t("error1.loadTableFailed"));
      } finally {
        this.tableLoading = false;
      }
    },

    handlePageChange(page) {
      this.pagination.currentPage = page;
      this.loadLogProvider();
    },
  },
};
</script>
<style scoped>
.dashboard {
  padding: 20px;
}
.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}
.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.user-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}
.filter-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.negative {
  color: #ff4d4f;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  color: #000;
  background: #f8f9fa;
}
.stat-card p {
  margin: 0;
  font-size: 14px;
  color: #333;
}
.stat-card h3 {
  margin: 5px 0 0;
  font-size: 22px;
  font-weight: 600;
}
.deposit {
  background: #4dabf7;
  color: #fff;
}
.withdraw {
  background: #a5c0d6;
  color: #fff;
}
.balance {
  background: #ff6b81;
  color: #fff;
}
.profit {
  background: #e0f7ff;
}
.total-buy {
  background: #f6f8ff;
}
.receive-amount {
  background: #e7faf7;
}
</style>
