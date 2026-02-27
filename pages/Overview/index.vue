<template>
  <div class="dashboard">
    <h2 class="title">{{ $t("Overview") }}</h2>
    <a-spin :spinning="loading" :tip="$t('loadingData')">
      <div class="filter-section">
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
      <div class="card-row">
        <div class="stat-card deposit">
          <p>{{ $t("totalDeposit") }}</p>
          <h3 :class="{negative:stats.deposit<0}">{{ stats.deposit.toLocaleString() }}</h3>
        </div>
        <div class="stat-card withdraw">
          <p>{{ $t("totalWithdraw") }}</p>
          <h3 :class="{negative:stats.withdraw<0}">{{ stats.withdraw.toLocaleString() }}</h3>
        </div>
        <div class="stat-card balance">
          <p>{{ $t("totalBalanceUser") }}</p>
          <h3 :class="{negative:stats.balance<0}">{{ stats.balance.toLocaleString() }}</h3>
        </div>
      </div>

      <div class="filter-section">
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

      <div class="card-row">
        <div class="stat-card win">
          <p>{{ $t("totalWin") }}</p>
          <h3 :class="{negative:stats.win<0}">{{ stats.win.toLocaleString() }}</h3>
        </div>
        <div class="stat-card loss">
          <p>{{ $t("totalLoss") }}</p>
          <h3 :class="{negative:stats.loss<0}">{{ stats.loss.toLocaleString() }}</h3>
        </div>
        <div class="stat-card profit">
          <p>{{ $t("totalProfitMerchant") }}</p>
          <h3 :class="{negative:stats.profit<0}">{{ stats.profit.toLocaleString() }}</h3>
        </div>
      </div>
    </a-spin>
  </div>
</template>
<script>
import adminLayout from "@/layouts/adminLayout.vue";
import * as overviewAPI  from "../../apis/dashboard";
import moment from "moment";

export default {
  
  layout: "adminLayout",
  middleware: "auth",
  data() {
    return {
      loading: false,
      dateRange: [],
      providers: [],
      selectedCategory: "-1",
      stats: {
        deposit: 0,
        withdraw: 0,
        balance: 0,
        win: 0,
        loss: 0,
        profit: 0,
      },
    };
  },

  async mounted() {
    const now = moment();
    const oneDayAgo = moment().subtract(1, "day");
    this.dateRange = [oneDayAgo, now];
    await this.loadProviders();
    await this.loadData();
  },

  methods: {
    loadProviders() {
      this.loading = true;
      overviewAPI.getProviders({ currentPage: 1, recordPerPage: 50 })
        .then((res) => {
          if (res.responseCode === 1) {
            this.providers = res.data.records || [];
          } else {
            this.providers = [];
            this.$message.warning(res.message || this.$t("error1.loadProviders"));
          }
        })
        .catch(() => {
          this.$message.error(this.$t("error1.loadProviders"));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    loadData() {
      if (!this.dateRange?.length) {
        this.$message.warning(this.$t("warning.selectDateRange"));
        return;
      }

      this.loading = true;
      const [start, end] = this.dateRange;
      const startDate = start.format("YYYY-MM-DDTHH:mm:ss");
      const endDate = end.format("YYYY-MM-DDTHH:mm:ss");
      const providerId =
        this.selectedCategory === "-1" ? -1 : Number(this.selectedCategory);

      overviewAPI.getOverviewSummary({ providerId, startDate, endDate })
        .then((res) => {
          if (res.responseCode === 1 && res.data) {
            const summary = res.data;
            this.stats.deposit = summary.totalDeposit || 0;
            this.stats.withdraw = summary.totalWithDraw || 0;
            this.stats.balance = summary.balanceUser || 0;
            this.stats.win = summary.winUser || 0;
            this.stats.loss = summary.lostUser || 0;
            this.stats.profit = summary.profitMerchant || 0;
          } else {
            this.$message.warning(res.message || this.$t("error1.loadDataFailed"));
          }
        })
        .catch(() => {
          this.$message.error(this.$t("error1.loadDataFailed"));
        })
        .finally(() => {
          this.loading = false;
        });
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
  margin-bottom: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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
.win {
  background: #d0f0ff;
}
.loss {
  background: #e9eff5;
}
.profit {
  background: #e0f7ff;
}
</style>


