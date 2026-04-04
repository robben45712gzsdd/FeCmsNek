<template>
  <h1>Chào mừng bạn đến với trang tổng quan</h1>
</template>
<script>
export default {
  layout: "adminLayout",
  middleware: "auth",
};
</script>

<!-- <template>
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
  padding: 24px;
}
.title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
  color: #1e293b;
  letter-spacing: -0.02em;
}
.filter-section {
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04);
}
.filter-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  margin-bottom: 24px;
}
.negative {
  color: #ef4444 !important;
}

.stat-card {
  padding: 22px 24px;
  border-radius: 16px;
  color: #1e293b;
  background: #fff;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: all 0.2s ease;
}
.stat-card:hover {
  box-shadow: 0 4px 16px rgba(99,102,241,0.08);
  transform: translateY(-2px);
}
.stat-card p {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-card h3 {
  margin: 8px 0 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.deposit {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(99,102,241,0.25);
}
.deposit p { color: rgba(255,255,255,0.8); }
.deposit h3 { color: #fff; }

.withdraw {
  background: linear-gradient(135deg, #64748b, #94a3b8);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(100,116,139,0.2);
}
.withdraw p { color: rgba(255,255,255,0.8); }
.withdraw h3 { color: #fff; }

.balance {
  background: linear-gradient(135deg, #f43f5e, #fb7185);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(244,63,94,0.25);
}
.balance p { color: rgba(255,255,255,0.8); }
.balance h3 { color: #fff; }

.win {
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
  border-color: #bbf7d0;
}
.win h3 { color: #059669; }

.loss {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-color: #e2e8f0;
}
.loss h3 { color: #475569; }

.profit {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #bfdbfe;
}
.profit h3 { color: #2563eb; }
</style>

 -->
